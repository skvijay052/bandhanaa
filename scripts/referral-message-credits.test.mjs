// Isolated PostgreSQL integration tests. Requires PGLITE_MODULE_PATH pointing
// to a separately installed @electric-sql/pglite dist/index.js (no app dependency).
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

const { PGlite } = await import(
  pathToFileURL(process.env.PGLITE_MODULE_PATH).href
);
const db = new PGlite();
const migration = await readFile(
  new URL("../supabase/referral-message-credits.sql", import.meta.url),
  "utf8",
);
const profileData = {
  display_name: "Test Member",
  birth_date: "1995-01-01",
  gender: "woman",
  religion: "Hindu",
  mother_tongue: "Tamil",
  marital_status: "Never married",
  height: "165 cm",
  city: "Chennai",
  education: "Degree",
  profession: "Engineer",
};

async function asUser(id, sql, params = []) {
  return db.transaction(async (tx) => {
    await tx.exec("set local role authenticated");
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [
      id,
    ]);
    return tx.query(sql, params);
  });
}
async function account({
  confirmed = true,
  active = true,
  referralCode,
  provider = "email",
  old = false,
} = {}) {
  const id = randomUUID();
  await db.query(
    "insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at) values ($1,$2,$3,$4,$5,$6)",
    [
      id,
      `${id}@example.test`,
      confirmed ? new Date() : null,
      { referral_code: referralCode },
      { provider },
      old ? new Date("2020-01-01") : new Date(),
    ],
  );
  if (confirmed && active) await activate(id);
  return id;
}
async function activate(id) {
  return asUser(
    id,
    "select * from public.complete_verified_registration($1,$2)",
    [profileData, [{ label: "Age Range", value: "25 - 35" }]],
  );
}
async function codeFor(id) {
  return (
    await asUser(id, "select public.get_or_create_referral_code() as code")
  ).rows[0].code;
}
async function balance(id) {
  return (await asUser(id, "select * from public.get_message_credit_summary()"))
    .rows[0].available_credits;
}
async function matched(first, second) {
  await db.query(
    "insert into public.profile_likes(liker_id,liked_id,status) values ($1,$2,'accepted')",
    [first, second],
  );
}
async function meter(id) {
  await db.query(
    "insert into public.message_credit_access(user_id,requires_credit) values ($1,true) on conflict(user_id) do update set requires_credit = true",
    [id],
  );
}
async function send(
  sender,
  first,
  second,
  body = "Hello",
  request = randomUUID(),
  reply = null,
) {
  return asUser(
    sender,
    "select * from public.send_message_with_credits($1,$2,$3,$4,$5)",
    [first, second, body, request, reply],
  );
}
async function rewardedInviter() {
  const inviter = await account();
  const referred = await account({ referralCode: await codeFor(inviter) });
  return { inviter, referred };
}

before(async () => {
  // Only Supabase platform schemas are mocked; all application migrations run unchanged.
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz,
      raw_user_meta_data jsonb default '{}', raw_app_meta_data jsonb default '{}', created_at timestamptz default now());
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth, public to authenticated, anon;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key, bucket_id text, name text);
    create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
    create publication supabase_realtime;
  `);
  for (const name of [
    "schema",
    "profile-shortlists",
    "registration-verification-lifecycle",
    "annual-income-profile",
    "notifications",
    "message-replies",
    "privacy-enforcement",
  ]) {
    await db.exec(
      await readFile(
        new URL(`../supabase/${name}.sql`, import.meta.url),
        "utf8",
      ),
    );
  }
  await db.exec(migration);
});
after(() => db.close());

test("migration can be reapplied without dropping data", async () => {
  const user = await account();
  const code = await codeFor(user);
  await db.exec(migration);
  assert.equal(await codeFor(user), code);
});

test("stable random referral code never contains the auth UUID", async () => {
  const user = await account();
  const code = await codeFor(user);
  assert.match(code, /^BND[A-F0-9]{32}$/);
  assert.equal(await codeFor(user), code);
  assert.notEqual(code.slice(3).toLowerCase(), user.replaceAll("-", ""));
  assert.notEqual(await codeFor(await account()), code);
});

test("registration and email confirmation alone do not reward; activation rewards exactly once", async () => {
  const inviter = await account();
  const referred = await account({
    confirmed: false,
    active: false,
    referralCode: await codeFor(inviter),
  });
  assert.equal(await balance(inviter), 0);
  await db.query("update auth.users set email_confirmed_at=now() where id=$1", [
    referred,
  ]);
  assert.equal(await balance(inviter), 0);
  await activate(referred);
  await activate(referred);
  await db.query("select public.reward_verified_referral($1)", [referred]);
  assert.equal(await balance(inviter), 10);
  assert.equal(
    (
      await db.query(
        "select count(*)::int as count from public.message_credit_transactions where user_id=$1",
        [inviter],
      )
    ).rows[0].count,
    1,
  );
  assert.deepEqual(
    (
      await db.query(
        "select title from public.notifications where user_id=$1 and type='referral_reward'",
        [inviter],
      )
    ).rows,
    [{ title: "You earned 10 message credits" }],
  );
});

test("profile flags cannot bypass unverified auth email", async () => {
  const inviter = await account();
  const referred = await account({
    confirmed: false,
    active: false,
    referralCode: await codeFor(inviter),
  });
  await db.query(
    "insert into public.profiles(id,registration_status,onboarding_completed,is_verified) values($1,'active',true,true)",
    [referred],
  );
  assert.equal(await balance(inviter), 0);
  await assert.rejects(activate(referred), /Email verification required/);
});

test("later user metadata edits cannot claim or reassign referrals", async () => {
  const { inviter, referred } = await rewardedInviter();
  const other = await account();
  const otherCode = await codeFor(other);
  await db.query("update auth.users set raw_user_meta_data=$1 where id=$2", [
    { referral_code: otherCode },
    referred,
  ]);
  await activate(referred);
  const existing = await account();
  await db.query("update auth.users set raw_user_meta_data=$1 where id=$2", [
    { referral_code: otherCode },
    existing,
  ]);
  await activate(existing);
  assert.equal(await balance(inviter), 10);
  assert.equal(await balance(other), 0);
});

test("a sparse profile marked active cannot earn a referral reward", async () => {
  const inviter = await account();
  const referred = await account({
    active: false,
    referralCode: await codeFor(inviter),
  });
  await asUser(
    referred,
    "select * from public.complete_verified_registration('{}','[]')",
  );
  assert.equal(await balance(inviter), 0);
  await activate(referred);
  assert.equal(await balance(inviter), 10);
});

test("invalid codes do not block signup or award credits", async () => {
  const user = await account({ referralCode: "BND<invalid>" });
  assert.equal(
    (
      await db.query(
        "select count(*)::int as count from public.referrals where referred_user_id=$1",
        [user],
      )
    ).rows[0].count,
    0,
  );
});

test("OAuth claims are one-time and restricted to fresh Google accounts", async () => {
  const inviter = await account();
  const code = await codeFor(inviter);
  const google = await account({ provider: "google", active: false });
  assert.equal(
    (
      await asUser(google, "select public.claim_oauth_referral($1) as ok", [
        code,
      ])
    ).rows[0].ok,
    true,
  );
  assert.equal(await balance(inviter), 0);
  const other = await account();
  await asUser(google, "select public.claim_oauth_referral($1)", [
    await codeFor(other),
  ]);
  await activate(google);
  assert.equal(await balance(inviter), 10);
  assert.equal(await balance(other), 0);
  for (const options of [
    { old: true, active: false, provider: "google" },
    { active: false },
    { provider: "google" },
  ]) {
    const user = await account(options);
    assert.equal(
      (
        await asUser(user, "select public.claim_oauth_referral($1) as ok", [
          code,
        ])
      ).rows[0].ok,
      false,
    );
  }
});

test("self-referral is rejected", async () => {
  const user = await account({ provider: "google", active: false });
  assert.equal(
    (
      await asUser(user, "select public.claim_oauth_referral($1) as ok", [
        await codeFor(user),
      ])
    ).rows[0].ok,
    false,
  );
  await assert.rejects(
    db.query(
      "insert into public.referrals(inviter_id,referred_user_id,referral_code) values($1,$1,$2)",
      [user, await codeFor(user)],
    ),
    /check constraint/,
  );
});

test("RLS and grants prevent credit forgery, access changes, manual rewards and reading another wallet", async () => {
  const { inviter, referred } = await rewardedInviter();
  for (const sql of [
    "update public.message_credit_wallets set available_credits=999",
    "insert into public.message_credit_wallets(user_id,available_credits) values(auth.uid(),999)",
    "insert into public.message_credit_access(user_id,requires_credit) values(auth.uid(),false)",
    "insert into public.message_credit_transactions(user_id,amount,transaction_type,description) values(auth.uid(),10,'referral_reward','fake')",
    "delete from public.message_credit_transactions",
    "update public.referrals set rewarded_at=null",
    "update public.referral_codes set code='BND00000000000000000000000000000000'",
    "select public.reward_verified_referral(auth.uid())",
    "update public.profiles set is_verified=true where id=auth.uid()",
  ])
    await assert.rejects(asUser(referred, sql), /permission denied/);
  assert.equal(
    (
      await asUser(
        referred,
        "select * from public.message_credit_wallets where user_id=$1",
        [inviter],
      )
    ).rows.length,
    0,
  );
  assert.equal(
    (
      await asUser(
        referred,
        "select * from public.referral_codes where user_id=$1",
        [inviter],
      )
    ).rows.length,
    0,
  );
});

test("anonymous and forged-sender messages fail", async () => {
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      return tx.query("select public.get_or_create_referral_code()");
    }),
    /permission denied/,
  );
  const first = await account(),
    second = await account();
  await matched(first, second);
  await assert.rejects(
    asUser(
      first,
      "insert into public.messages(interest_liker_id,interest_liked_id,sender_id,body) values($1,$2,$2,'fake')",
      [first, second],
    ),
    /row-level security/,
  );
});

test("existing free chat and replies continue at a zero balance; incoming messages are free", async () => {
  const first = await account(),
    second = await account();
  await matched(first, second);
  const original = (await send(first, first, second)).rows[0];
  await meter(first);
  const reply = (
    await send(second, first, second, "Reply", randomUUID(), original.id)
  ).rows[0];
  assert.equal(reply.reply_to_id, original.id);
  assert.equal(await balance(first), 0);
  assert.equal(await balance(second), 0);
  await asUser(first, "update public.messages set read_at=now() where id=$1", [
    reply.id,
  ]);
  assert.ok(
    (
      await db.query("select read_at from public.messages where id=$1", [
        reply.id,
      ])
    ).rows[0].read_at,
  );
});

test("metered message and retry insert once and charge exactly one", async () => {
  const { inviter, referred } = await rewardedInviter();
  await matched(inviter, referred);
  await meter(inviter);
  const request = randomUUID();
  const sent = (await send(inviter, inviter, referred, "Hello", request))
    .rows[0];
  const retry = (await send(inviter, inviter, referred, "Hello", request))
    .rows[0];
  assert.equal(sent.id, retry.id);
  assert.equal(await balance(inviter), 9);
  await assert.rejects(
    send(inviter, inviter, referred, "Different", request),
    /Request id already used/,
  );
  assert.equal(await balance(inviter), 9);
});

test("direct inserts cannot bypass metering", async () => {
  const { inviter, referred } = await rewardedInviter();
  await matched(inviter, referred);
  await meter(inviter);
  await asUser(
    inviter,
    "insert into public.messages(interest_liker_id,interest_liked_id,sender_id,body) values($1,$2,$1,'Direct')",
    [inviter, referred],
  );
  assert.equal(await balance(inviter), 9);
});

test("failed message/reply validation rolls back credits and notifications", async () => {
  const { inviter, referred } = await rewardedInviter();
  await matched(inviter, referred);
  await meter(inviter);
  const third = await account();
  await matched(inviter, third);
  const foreign = (await send(third, inviter, third)).rows[0];
  await assert.rejects(
    send(inviter, inviter, referred, "Reply", randomUUID(), foreign.id),
    /same conversation/,
  );
  await assert.rejects(
    send(inviter, inviter, referred, " "),
    /check constraint/,
  );
  assert.equal(await balance(inviter), 10);
  assert.equal(
    (
      await db.query(
        "select count(*)::int as count from public.messages where sender_id=$1",
        [inviter],
      )
    ).rows[0].count,
    0,
  );
});

test("unmatched and blocked conversations cannot spend or send", async () => {
  const { inviter, referred } = await rewardedInviter();
  await meter(inviter);
  await assert.rejects(send(inviter, inviter, referred), /row-level security/);
  await matched(inviter, referred);
  await asUser(
    referred,
    "insert into public.blocked_users(blocker_id,blocked_id) values($1,$2)",
    [referred, inviter],
  );
  await assert.rejects(send(inviter, inviter, referred), /unavailable/);
  assert.equal(await balance(inviter), 10);
});

test("a burst cannot spend beyond earned credits; failed sends leave no rows", async () => {
  const { inviter, referred } = await rewardedInviter();
  await matched(inviter, referred);
  await meter(inviter);
  // PGlite serializes backend transactions. This checks overspend/rollback;
  // true simultaneous backend row-lock testing is documented for staging.
  const results = await Promise.allSettled(
    Array.from({ length: 12 }, (_, i) =>
      send(inviter, inviter, referred, `Message ${i}`),
    ),
  );
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    10,
  );
  assert.equal(
    results.filter((result) => result.status === "rejected").length,
    2,
  );
  assert.equal(await balance(inviter), 0);
  assert.equal(
    (
      await db.query(
        "select count(*)::int as count from public.messages where sender_id=$1",
        [inviter],
      )
    ).rows[0].count,
    10,
  );
  assert.equal(
    (
      await db.query(
        "select sum(amount)::int as balance from public.message_credit_transactions where user_id=$1",
        [inviter],
      )
    ).rows[0].balance,
    0,
  );
  assert.equal(
    (
      await db.query(
        "select count(*)::int as count from public.notifications where user_id=$1 and type='message'",
        [referred],
      )
    ).rows[0].count,
    10,
  );
});

test("conversation deletion retains the authoritative spend ledger without a refund", async () => {
  const { inviter, referred } = await rewardedInviter();
  await matched(inviter, referred);
  await meter(inviter);
  await send(inviter, inviter, referred);
  await asUser(
    inviter,
    "delete from public.profile_likes where liker_id=$1 and liked_id=$2",
    [inviter, referred],
  );
  assert.equal(await balance(inviter), 9);
  assert.equal(
    (
      await db.query(
        "select sum(amount)::int as balance from public.message_credit_transactions where user_id=$1",
        [inviter],
      )
    ).rows[0].balance,
    9,
  );
});
