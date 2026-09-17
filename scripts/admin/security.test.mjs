import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createFixtureDatabase } from "./fixtures.mjs";
let f;
before(async () => {
  f = await createFixtureDatabase();
});
after(async () => {
  await f?.db.close();
});
const reason = "Reviewed in isolated integration tests";

test("ordinary members and anonymous requests cannot read or mutate admin records", async () => {
  for (const section of [
    "overview",
    "users",
    "verification",
    "reports",
    "connections",
    "referrals",
    "chat-credits",
    "payments",
    "support",
    "audit",
    "admins",
    "settings",
  ])
    await assert.rejects(f.query(f.member, section), (e) => e.code === "42501");
  await assert.rejects(
    f.mutate(f.member, "admin", {
      target: f.member,
      role: "super_admin",
      active: true,
      reason,
    }),
    (e) => e.code === "42501",
  );
  await assert.rejects(
    f.asUser(
      f.member,
      "insert into public.admin_users(user_id,role) values($1,'super_admin')",
      [f.member],
    ),
    (e) => e.code === "42501",
  );
  await assert.rejects(
    f.db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      await tx.query("select public.admin_query('users')");
    }),
    (e) => e.code === "42501",
  );
});
test("permission matrix is enforced inside every read RPC", async () => {
  const allowed = {
    super_admin: [
      "overview",
      "users",
      "verification",
      "reports",
      "connections",
      "referrals",
      "chat-credits",
      "payments",
      "support",
      "audit",
      "admins",
      "settings",
    ],
    moderator: ["users", "verification", "reports", "connections"],
    support_admin: ["users", "support"],
    finance_admin: ["chat-credits", "payments"],
  };
  for (const [role, sections] of Object.entries(allowed))
    for (const section of allowed.super_admin) {
      if (sections.includes(section)) {
        const r = await f.query(role, section);
        assert.ok(Array.isArray(r.rows), `${role}:${section}`);
      } else
        await assert.rejects(f.query(role, section), (e) => e.code === "42501");
    }
});
test("disabled membership and revoked sessions take effect without refreshing a JWT", async () => {
  const id = await f.account({ role: "moderator" });
  await f.query(id, "users");
  await f.db.query(
    "update public.admin_users set is_active=false where user_id=$1",
    [id],
  );
  await assert.rejects(f.query(id, "users"), (e) => e.code === "42501");
  await f.db.query(
    "update public.admin_users set is_active=true where user_id=$1",
    [id],
  );
  await f.db.query("delete from auth.sessions where user_id=$1", [id]);
  await assert.rejects(f.query(id, "users"), (e) => e.code === "42501");
});
test("support role sees limited user fields and cannot forge a detail tab", async () => {
  const r = await f.query("support_admin", "users", { detail_id: f.member });
  assert.equal(r.member.email_verified, true);
  assert.equal(r.member.religion, undefined);
  assert.equal(r.member.bio, undefined);
  for (const tab of [
    "profile",
    "activity",
    "connections",
    "credits",
    "payments",
    "reports",
  ])
    await assert.rejects(
      f.query("support_admin", "users", { detail_id: f.member, tab }),
      (e) => e.code === "42501",
    );
});
test("pagination, escaped search, and real overview metrics work", async () => {
  for (let i = 0; i < 24; i++) await f.account({ name: `Page Member ${i}` });
  const a = await f.query("super_admin", "users"),
    b = await f.query("super_admin", "users", { page: 2 });
  assert.equal(a.rows.length, 25);
  assert.ok(b.rows.length > 0);
  assert.ok(!a.rows.some((x) => b.rows.some((y) => x.id === y.id)));
  assert.equal((await f.query("super_admin", "users", { q: "%" })).total, 0);
  assert.equal((await f.query("super_admin", "overview")).trend.length, 30);
});
test("adjustment is atomic, idempotent, permission-checked and cannot overdraw", async () => {
  const target = await f.account();
  const payload = { target, amount: 10, request_id: randomUUID(), reason };
  await assert.rejects(
    f.mutate("moderator", "adjust", payload),
    (e) => e.code === "42501",
  );
  await f.mutate("finance_admin", "adjust", payload);
  await f.mutate("finance_admin", "adjust", payload);
  assert.equal(
    (await f.query("finance_admin", "chat-credits", { id: target })).member
      .balance,
    10,
  );
  await assert.rejects(
    f.mutate("finance_admin", "adjust", { ...payload, amount: 11 }),
    (e) => e.code === "23505",
  );
  await assert.rejects(
    f.mutate("finance_admin", "adjust", {
      ...payload,
      amount: -11,
      request_id: randomUUID(),
    }),
  );
  const ledger = await f.query("finance_admin", "chat-credits", { id: target });
  assert.equal(ledger.member.balance, 10);
  assert.equal(ledger.rows.length, 1);
  assert.equal(ledger.rows[0].balance, 10);
  const audits = await f.db.query(
    "select count(*)::int as n from public.admin_audit_logs where metadata->>'member_id'=$1",
    [target],
  );
  assert.equal(audits.rows[0].n, 1);
  await assert.rejects(
    f.mutate("finance_admin", "adjust", {
      ...payload,
      amount: 10001,
      request_id: randomUUID(),
    }),
    (e) => e.code === "22023",
  );
});
test("an audit failure rolls back ledger and wallet mutation", async () => {
  const target = await f.account();
  await f.db.exec(
    "create function public.fail_test_audit() returns trigger language plpgsql as $$begin raise exception 'test audit failure'; end$$; create trigger fail_test_audit before insert on public.admin_audit_logs for each row execute function public.fail_test_audit();",
  );
  try {
    await assert.rejects(
      f.mutate("super_admin", "adjust", {
        target,
        amount: 5,
        request_id: randomUUID(),
        reason,
      }),
    );
  } finally {
    await f.db.exec(
      "drop trigger fail_test_audit on public.admin_audit_logs; drop function public.fail_test_audit();",
    );
  }
  const result = await f.query("super_admin", "chat-credits", { id: target });
  assert.equal(result.member.balance, 0);
  assert.equal(result.rows.length, 0);
});
test("profile review does not change email verification; members cannot set moderation fields", async () => {
  const target = await f.account();
  await assert.rejects(
    f.asUser(
      target,
      "update public.profiles set account_status='active',review_status='verified' where id=$1",
      [target],
    ),
    (e) => e.code === "42501",
  );
  await f.mutate("moderator", "reject", {
    target,
    expected: "pending",
    reason,
  });
  const r = await f.query("moderator", "users", { detail_id: target });
  assert.equal(r.member.verification, "rejected");
  assert.equal(r.member.email_verified, true);
  await assert.rejects(
    f.mutate("moderator", "approve", { target, expected: "pending", reason }),
    (e) => e.code === "40001",
  );
  await f.mutate("moderator", "approve", {
    target,
    expected: "rejected",
    reason,
  });
});
test("suspension prevents direct member writes, activation bypass and discovery; restore works", async () => {
  const target = await f.account();
  await f.mutate("moderator", "suspend", { target, reason });
  await assert.rejects(
    f.asUser(target, "select public.activate_verified_profile()"),
    (e) => e.code === "42501",
  );
  await assert.rejects(
    f.asUser(
      target,
      "insert into public.profile_likes(liker_id,liked_id) values($1,$2)",
      [target, f.other],
    ),
    (e) => e.code === "42501",
  );
  const visible = await f.asUser(
    f.other,
    "select id from public.profiles where id=$1",
    [target],
  );
  assert.equal(visible.rows.length, 0);
  const recommendations = await f.asUser(
    target,
    "select * from public.get_recommended_profiles()",
  );
  assert.equal(recommendations.rows.length, 0);
  await f.mutate("moderator", "restore", { target, reason });
  const active = await f.asUser(
    target,
    "select public.is_active_profile($1) as active",
    [target],
  );
  assert.equal(active.rows[0].active, true);
});
test("report notes stay private and safety transitions reject stale changes", async () => {
  const created = await f.asUser(
    f.member,
    "insert into public.member_reports(reporter_id,reported_id,reason,details) values($1,$2,'other','Test report') returning id",
    [f.member, f.other],
  );
  const id = String(created.rows[0].id);
  await f.mutate("moderator", "report", {
    target: id,
    status: "reviewing",
    expected: "submitted",
    reason,
  });
  await f.mutate("moderator", "report", {
    target: id,
    status: "resolved",
    expected: "reviewing",
    reason,
  });
  await assert.rejects(
    f.mutate("moderator", "report", {
      target: id,
      status: "dismissed",
      expected: "reviewing",
      reason,
    }),
    (e) => e.code === "40001",
  );
  const member = await f.asUser(
    f.member,
    "select * from public.member_reports where id=$1",
    [id],
  );
  assert.equal(member.rows[0].resolution_note, undefined);
  await assert.rejects(
    f.asUser(f.member, "select * from bandhanaa_private.admin_report_details"),
    (e) => e.code === "42501",
  );
  const detail = await f.query("moderator", "reports", { detail_id: id });
  assert.equal(detail.detail.resolution_note, reason);
});
test("support submissions persist without granting members inbox access and can be resolved", async () => {
  const id = (
    await f.asUser(
      f.member,
      "select public.submit_support_request($1,$2) as id",
      ["Account help", "Please help me with my account."],
    )
  ).rows[0].id;
  const repeat = (
    await f.asUser(
      f.member,
      "select public.submit_support_request($1,$2) as id",
      ["Account help", "Please help me with my account."],
    )
  ).rows[0].id;
  assert.equal(id, repeat);
  await assert.rejects(
    f.asUser(f.member, "select * from public.support_requests"),
    (e) => e.code === "42501",
  );
  await f.mutate("support_admin", "support", {
    target: id,
    status: "resolved",
    expected: "open",
    reason,
  });
  assert.equal(
    (await f.query("support_admin", "support", { detail_id: id })).detail
      .status,
    "resolved",
  );
});
test("role management prevents self-demotion and does not permit ordinary role writes", async () => {
  await assert.rejects(
    f.mutate("super_admin", "admin", {
      target: f.roles.super_admin,
      role: "moderator",
      active: true,
      reason,
    }),
    (e) => e.code === "42501",
  );
  const id = await f.account();
  await f.mutate("super_admin", "admin", {
    target: id,
    role: "finance_admin",
    active: true,
    reason,
  });
  await f.query(id, "payments");
  await f.mutate("super_admin", "admin", {
    target: id,
    role: "finance_admin",
    active: false,
    reason,
  });
  await assert.rejects(f.query(id, "payments"), (e) => e.code === "42501");
  await assert.rejects(
    f.asUser(f.roles.super_admin, "delete from public.admin_audit_logs"),
    (e) => e.code === "42501",
  );
  await assert.rejects(
    f.db.query("update public.admin_audit_logs set reason='tampered'"),
    (e) => e.code === "42501",
  );
});
test("existing referral reward remains idempotent after admin migration", async () => {
  const inviter = await f.account();
  const code = (
    await f.asUser(
      inviter,
      "select public.get_or_create_referral_code() as code",
    )
  ).rows[0].code;
  const referred = await f.account({ metadata: { referral_code: code } });
  await f.db.query("select public.reward_verified_referral($1)", [referred]);
  await f.db.query("select public.reward_verified_referral($1)", [referred]);
  const ledger = await f.query("super_admin", "chat-credits", { id: inviter });
  assert.equal(ledger.member.balance, 10);
  assert.equal(ledger.rows.length, 1);
  assert.equal(ledger.rows[0].type, "referral_reward");
  assert.equal(ledger.rows[0].balance, 10);
});
test("existing paid-purchase finalization still grants exactly one pack", async () => {
  const id = await f.account();
  const order = "order_" + randomUUID().replaceAll("-", "");
  const payment = "pay_" + randomUUID().replaceAll("-", "");
  await f.db.query(
    "insert into public.message_credit_purchases(user_id,order_id,razorpay_order_id) values($1,$2,$2)",
    [id, order],
  );
  for (let i = 0; i < 2; i++)
    await f.db.transaction(async (tx) => {
      await tx.exec("set local role service_role");
      await tx.query(
        "select * from public.finalize_razorpay_message_credit_purchase($1,$2,1000,'upi','captured','captured','{}')",
        [order, payment],
      );
    });
  const ledger = await f.query("finance_admin", "chat-credits", { id });
  assert.equal(ledger.member.balance, 10);
  assert.equal(ledger.rows.length, 1);
  const records = await f.query("finance_admin", "payments", { id });
  assert.equal(records.rows[0].status, "paid");
  assert.equal(records.rows[0].provider_payload, undefined);
});
test("message sends still charge exactly once, and suspension blocks existing sessions", async () => {
  const sender = await f.account(),
    recipient = await f.account();
  await f.db.query(
    "insert into public.profile_likes(liker_id,liked_id,status) values($1,$2,'accepted')",
    [sender, recipient],
  );
  await f.mutate("super_admin", "adjust", {
    target: sender,
    amount: 2,
    request_id: randomUUID(),
    reason,
  });
  const request = randomUUID();
  for (let i = 0; i < 2; i++)
    await f.asUser(
      sender,
      "select * from public.send_message_with_credits($1,$2,$3,$4,null)",
      [sender, recipient, "Private test conversation", request],
    );
  assert.equal(
    (await f.query("super_admin", "chat-credits", { id: sender })).member
      .balance,
    1,
  );
  const overview = await f.query("super_admin", "connections");
  assert.ok(!JSON.stringify(overview).includes("Private test conversation"));
  await f.mutate("moderator", "suspend", { target: sender, reason });
  await assert.rejects(
    f.asUser(
      sender,
      "select * from public.send_message_with_credits($1,$2,$3,$4,null)",
      [sender, recipient, "Should fail", randomUUID()],
    ),
    (e) => e.code === "42501",
  );
  assert.equal(
    (await f.query("super_admin", "chat-credits", { id: sender })).member
      .balance,
    1,
  );
});
test("database privilege catalog has no public definer entry points or admin table writes", async () => {
  const unsafe = await f.db
    .query(`select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('admin_identity','admin_query','admin_mutate','submit_support_request')
    and (p.prosecdef or has_function_privilege('anon',p.oid,'EXECUTE'))`);
  assert.equal(unsafe.rows.length, 0);
  const privileges = await f.db.query(
    "select has_table_privilege('authenticated','public.admin_users','INSERT,UPDATE,DELETE') as roles,has_table_privilege('authenticated','public.admin_audit_logs','INSERT,UPDATE,DELETE') as audit",
  );
  assert.equal(privileges.rows[0].roles, false);
  assert.equal(privileges.rows[0].audit, false);
});
test("admin email search uses Auth identity rather than editable profile email", async () => {
  const id = await f.account();
  await f.asUser(
    id,
    "update public.profiles set email='spoofed-admin@example.test' where id=$1",
    [id],
  );
  assert.equal(
    (await f.query("super_admin", "users", { q: "spoofed-admin@example.test" }))
      .total,
    0,
  );
  assert.equal(
    (await f.query("super_admin", "users", { q: `${id}@example.test` })).total,
    1,
  );
  assert.equal(
    (await f.query("support_admin", "users", { detail_id: id })).member.email,
    `${id}@example.test`,
  );
});
test("registration trend reconciles to registrations in the default date window", async () => {
  for (const hour of [0, 12, 23]) {
    const id = await f.account();
    await f.db.query(
      "update public.profiles set created_at=(((now() at time zone 'UTC')::date-1)::timestamp+make_interval(hours=>$2)) at time zone 'UTC' where id=$1",
      [id, hour],
    );
  }
  const original = (await f.db.query("show timezone")).rows[0].TimeZone;
  try {
    for (const zone of ["UTC", "Asia/Kolkata", "America/New_York"]) {
      await f.db.query("select set_config('TimeZone',$1,false)", [zone]);
      const r = await f.query("super_admin", "overview");
      assert.equal(
        r.trend.reduce((n, p) => n + p.count, 0),
        r.metrics.new_registrations,
        zone,
      );
      const grouped = (
        await f.db.query(
          "select (created_at at time zone 'UTC')::date::text as date,count(*)::integer as count from public.profiles group by 1",
        )
      ).rows;
      for (const point of r.trend)
        assert.equal(
          point.count,
          grouped.find((p) => p.date === point.date)?.count ?? 0,
          `${zone}: ${point.date}`,
        );
    }
  } finally {
    await f.db.query("select set_config('TimeZone',$1,false)", [original]);
  }
});
test("first-admin bootstrap is explicit, audited and refuses a second run", async () => {
  const { readFile } = await import("node:fs/promises");
  const isolated = await createFixtureDatabase({ seedAdmins: false });
  try {
    const source = await readFile(
      new URL("../../supabase/bootstrap-first-admin.sql", import.meta.url),
      "utf8",
    );
    await assert.rejects(isolated.db.exec(source));
    await isolated.db.exec("rollback");
    const sql = source.replace(
      "REPLACE_WITH_EXISTING_CONFIRMED_USER_UUID",
      isolated.member,
    );
    await isolated.db.exec(sql);
    assert.equal(
      (
        await isolated.db.query(
          "select count(*)::int n from public.admin_users",
        )
      ).rows[0].n,
      1,
    );
    assert.equal(
      (
        await isolated.db.query(
          "select count(*)::int n from public.admin_audit_logs",
        )
      ).rows[0].n,
      1,
    );
    await assert.rejects(isolated.db.exec(sql), /Bootstrap refused/);
    await isolated.db.exec("rollback");
  } finally {
    await isolated.db.close();
  }
});
