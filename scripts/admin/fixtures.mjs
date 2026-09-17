// Isolated test database only. Never connects to a hosted Supabase project.
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
export async function createFixtureDatabase({ seedAdmins = true } = {}) {
  if (!process.env.PGLITE_MODULE_PATH)
    throw new Error(
      "Set PGLITE_MODULE_PATH to an external @electric-sql/pglite dist/index.js",
    );
  const { PGlite } = await import(
    pathToFileURL(process.env.PGLITE_MODULE_PATH).href
  );
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,encrypted_password text,
      raw_user_meta_data jsonb default '{}',raw_app_meta_data jsonb default '{}',created_at timestamptz default now());
    create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth,public to authenticated,anon;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key,bucket_id text,name text);
    create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
    create publication supabase_realtime;
  `);
  const base = new URL("../../supabase/", import.meta.url);
  for (const name of [
    "schema",
    "profile-shortlists",
    "registration-verification-lifecycle",
    "annual-income-profile",
    "profile-online-status",
    "profile-location-fields",
    "fix-profile-policy-recursion",
    "notifications",
    "message-replies",
    "privacy-enforcement",
    "user-activity",
    "recent-profile-visitors",
    "referral-message-credits",
    "message-credits-required-for-all-chats",
    "razorpay-message-credit-purchases",
  ]) {
    try {
      await db.exec(await readFile(new URL(name + ".sql", base), "utf8"));
    } catch (error) {
      throw new Error(`Base migration ${name}: ${error.message}`, {
        cause: error,
      });
    }
  }
  await db.exec(
    await readFile(
      new URL("migrations/20260917174100_admin_dashboard.sql", base),
      "utf8",
    ),
  );
  const sessions = new Map();
  const profile = {
    display_name: "Test Member",
    birth_date: "1994-01-01",
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
      await tx.query(
        "select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",
        [
          id,
          JSON.stringify({
            sub: id,
            session_id: sessions.get(id),
            role: "authenticated",
          }),
        ],
      );
      return tx.query(sql, params);
    });
  }
  async function account({
    role,
    name = "Test Member",
    active = true,
    confirmed = true,
    metadata = {},
  } = {}) {
    const id = randomUUID(),
      session = randomUUID();
    await db.query(
      "insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values($1,$2,$3,$4)",
      [id, `${id}@example.test`, confirmed ? new Date() : null, metadata],
    );
    await db.query("insert into auth.sessions(id,user_id) values($1,$2)", [
      session,
      id,
    ]);
    sessions.set(id, session);
    if (active && confirmed)
      await asUser(id, "select public.complete_verified_registration($1,$2)", [
        { ...profile, display_name: name },
        [{ label: "Age Range", value: "25 - 35" }],
      ]);
    if (role)
      await db.query(
        "insert into public.admin_users(user_id,role) values($1,$2)",
        [id, role],
      );
    return id;
  }
  const roles = {};
  for (const role of seedAdmins
    ? ["super_admin", "moderator", "support_admin", "finance_admin"]
    : [])
    roles[role] = await account({
      role,
      name:
        role === "super_admin" ? "Operations Admin" : role.replaceAll("_", " "),
    });
  const member = await account({ name: "Example Member" }),
    other = await account({ name: "Sample Member" });
  async function query(role, section, filters = {}) {
    const r = await asUser(
      roles[role] ?? role,
      "select public.admin_query($1,$2) as data",
      [section, filters],
    );
    return r.rows[0].data;
  }
  async function mutate(role, action, payload) {
    const r = await asUser(
      roles[role] ?? role,
      "select public.admin_mutate($1,$2) as data",
      [action, payload],
    );
    return r.rows[0].data;
  }
  return { db, account, asUser, query, mutate, roles, member, other, sessions };
}
