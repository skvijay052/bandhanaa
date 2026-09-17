// Local integration-test adapter. Only binds loopback; never use as a deployment backend.
// Exercises the actual application SQL via PGlite, with disposable synthetic accounts.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { createFixtureDatabase } from "./fixtures.mjs";
const f = await createFixtureDatabase();
const names = [
  "Aditi Sharma",
  "Arjun Menon",
  "Kavya Ramesh",
  "Vikram Rao",
  "Meera Iyer",
  "Rohan Nair",
  "Divya Krishnan",
  "Aditya Kumar",
  "Nandini Raj",
  "Sanjay Prakash",
];
for (let i = 0; i < 32; i++) {
  const id = await f.account({ name: names[i % names.length] });
  await f.db.query(
    "update public.profiles set email=$2,city=$3,created_at=now()-make_interval(days=>$4),last_seen_at=now()-make_interval(hours=>$5),profile_completion=$6 where id=$1",
    [
      id,
      `member${i + 1}@example.test`,
      ["Chennai", "Bengaluru", "Coimbatore"][i % 3],
      i % 25,
      i * 2,
      75 + (i % 26),
    ],
  );
  if (i % 4 === 0)
    await f.mutate("moderator", "approve", {
      target: id,
      expected: "pending",
      reason: "Synthetic profile review for local browser verification",
    });
}
await f.mutate("super_admin", "adjust", {
  target: f.member,
  amount: 15,
  request_id: randomUUID(),
  reason: "Synthetic opening balance for local browser verification",
});
await f.asUser(
  f.member,
  "insert into public.member_reports(reporter_id,reported_id,reason,details) values($1,$2,'fake_profile','Synthetic report for local review testing.')",
  [f.member, f.other],
);
await f.asUser(
  f.member,
  "select public.submit_support_request('Profile assistance','Synthetic support request for browser verification.')",
);
await f.db.query(
  "insert into public.profile_likes(liker_id,liked_id,status) values($1,$2,'pending')",
  [f.member, f.other],
);
const userInfo = async (id) => {
  const r = await f.db.query("select * from auth.users where id=$1", [id]);
  const u = r.rows[0];
  return {
    ...u,
    aud: "authenticated",
    role: "authenticated",
    user_metadata: u.raw_user_meta_data,
    app_metadata: { provider: "email", providers: ["email"] },
    identities: [],
    confirmed_at: u.email_confirmed_at,
  };
};
const tokens = new Map();
function token(id) {
  const payload = {
    sub: id,
    role: "authenticated",
    aud: "authenticated",
    session_id: f.sessions.get(id),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const jwt =
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ) +
    "." +
    Buffer.from(JSON.stringify(payload)).toString("base64url") +
    ".local-test-signature";
  tokens.set(jwt, id);
  return jwt;
}
createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "authorization,apikey,content-type,x-client-info",
  );
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  try {
    const url = new URL(req.url, "http://127.0.0.1:54329");
    let body = "";
    for await (const chunk of req) body += chunk;
    if (body.length > 100000) throw new Error("Payload too large");
    const payload = body ? JSON.parse(body) : {};
    const id = tokens.get(
      (req.headers.authorization ?? "").replace(/^Bearer /, ""),
    );
    if (url.pathname === "/auth/v1/token") {
      const role = String(payload.email ?? "").split("@")[0];
      const uid = f.roles[role] ?? (role === "member" ? f.member : null);
      if (!uid || payload.password !== "local-test-only") {
        res.writeHead(400);
        return res.end(
          JSON.stringify({
            error: "invalid_grant",
            error_description: "Invalid local test credentials",
          }),
        );
      }
      return res.end(
        JSON.stringify({
          access_token: token(uid),
          refresh_token: randomUUID(),
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: "bearer",
          user: await userInfo(uid),
        }),
      );
    }
    if (!id) {
      res.writeHead(401);
      return res.end(
        JSON.stringify({
          code: "42501",
          message: "Local fixture authentication required",
        }),
      );
    }
    if (url.pathname === "/auth/v1/user")
      return res.end(JSON.stringify(await userInfo(id)));
    if (url.pathname === "/auth/v1/logout") {
      tokens.delete((req.headers.authorization ?? "").replace(/^Bearer /, ""));
      res.writeHead(204);
      return res.end();
    }
    const rpc = url.pathname.split("/rest/v1/rpc/")[1];
    const rpcCalls = {
      admin_identity: ["select public.admin_identity() as result", []],
      admin_query: [
        "select public.admin_query($1,$2) as result",
        [payload.p_section, payload.p_filters],
      ],
      admin_mutate: [
        "select public.admin_mutate($1,$2) as result",
        [payload.p_action, payload.p_payload],
      ],
      submit_support_request: [
        "select public.submit_support_request($1,$2) as result",
        [payload.p_subject, payload.p_body],
      ],
    };
    if (rpc && rpcCalls[rpc]) {
      const [sql, args] = rpcCalls[rpc];
      const r = await f.asUser(id, sql, args);
      return res.end(JSON.stringify(r.rows[0].result));
    }
    if (url.pathname === "/rest/v1/profiles") {
      const select = url.searchParams.get("select") || "*";
      const fields = select.split(",");
      const allowed = [
        "id",
        "account_status",
        "registration_status",
        "onboarding_completed",
        "is_verified",
      ];
      if (!fields.every((x) => allowed.includes(x)))
        throw new Error("Fixture profile projection not supported");
      const r = await f.asUser(
        id,
        `select ${fields.join(",")} from public.profiles where id=$1`,
        [id],
      );
      return res.end(JSON.stringify(r.rows[0] ?? null));
    }
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Unknown test adapter endpoint" }));
  } catch (error) {
    res.writeHead(error.code === "42501" ? 403 : 400);
    res.end(
      JSON.stringify({
        code: error.code ?? "TEST_ERROR",
        message: error.message,
      }),
    );
  }
}).listen(54329, "127.0.0.1", () =>
  console.log(
    "Local test adapter listening on 127.0.0.1:54329. Fixture emails: super_admin@example.test, moderator@example.test, support_admin@example.test, finance_admin@example.test, member@example.test. Test password: local-test-only.",
  ),
);
