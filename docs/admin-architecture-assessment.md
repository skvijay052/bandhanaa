# Admin architecture assessment

Inspected 2026-09-17 against `main` commit `c3c126fbec3c253425f9cf2ec5e9d0f2cbe265f8` and the connected Bandhanaa database schema, policies, functions and triggers. No production data was changed during inspection.

## EXISTING

- Root `app/` App Router, TypeScript, Tailwind 4, React, Lucide icons. Member pages assemble their own navigation; the root layout does not wrap children in a member sidebar. Global member styles and DOM enhancers require an admin boundary.
- Supabase SSR cookie client in `lib/supabase/server.ts`; browser client in `client.ts`; service-role client in `admin.ts` is currently used for payments. `proxy.ts` refreshes sessions and enforces member email/onboarding requirements. There is no administrator authorization.
- `profiles` is tied to `auth.users`. `is_verified` means **email verified**, not a moderation decision. Registration has draft/awaiting_verification/active states; no suspension or profile-review state.
- `profile_likes` stores pending/accepted/declined requests; `messages` is private to accepted connections; `blocked_users` and `member_reports` implement safety. Report states are submitted/reviewing/resolved/dismissed, with bigint report IDs.
- `referral_codes` and `referrals` implement registered/rewarded attribution. Qualification checks confirmed email, active completed registration and required profile fields. Rewards are an idempotent +10 ledger entry.
- `message_credit_wallets`, `message_credit_transactions`, and `message_credit_access` already exist. The live outgoing-message trigger charges every send; older referral migration comments about optional metering are obsolete. Preserve the live all-chats policy.
- `message_credit_purchases` supports Razorpay and historical Paytm records. Existing server verification/webhooks finalize fixed INR 10 / 10-credit purchases. There is no refund implementation or refund ledger.
- `app/api/contact/route.ts` sends authenticated Contact Us submissions through Brevo; no support request table exists. `user_activity` is member activity, not an administrator audit trail.
- The inspected baseline maintains SQL as ordered standalone scripts under `supabase/`, without a CLI migration directory/config. The new admin migration is CLI-named in `supabase/migrations/`; setup documents how to apply it after the existing baseline. Public member tables have RLS. No admin membership, admin audit, or platform-settings model exists.

## REUSE

Reuse the existing session, server client, logo, icon dependency, profile/relationship/report/referral/payment data and ledger trigger. Admin reads use curated, permission-checked database RPCs; no copies of production domain tables, browser service key, or private message browsing.

## EXTEND

- Add protected account moderation and profile-review fields to `profiles`, keeping email verification and onboarding semantics intact. Completed profiles enter a separate operations review queue; existing completed profiles are marked pending, never assumed approved.
- Add report assignment/resolution metadata while preserving the actual report states and reasons.
- Add an idempotent admin-adjustment transaction type and post-transaction balance to the existing ledger; use its serialized wallet trigger and audit in the same transaction.
- Persist submissions from the existing contact endpoint in `support_requests`, with email delivery state, operational status and internal notes. Keep the current member form and Brevo delivery.
- Add suspension enforcement to member RLS, active-profile/privacy functions and relevant write triggers. Add an isolated proxy branch for admin session refresh and a member suspension response. These are necessary shared security changes, not member UI redesigns.

## CREATE

Isolated `/admin` layout, routes, components, styles, queries and server actions; `admin_users`, append-only `admin_audit_logs`, private permission/RPC helpers; role management and a trusted one-time bootstrap script. Settings reports operational capabilities and non-secret configuration without inventing settings that the product does not support.

## DO NOT TOUCH

Do not redesign or restructure Discover, Matches, Requests, Messages, Shortlist, Profile, Settings, Login or Register. Do not change referral qualification/reward amounts, payment verification, credit pricing, messaging metering, relationship behavior, member components or auth semantics. No new refund endpoint, fraud scoring, private chat browser, or fabricated metrics.

## DATABASE CHANGES REQUIRED

- New `admin_users`, `admin_audit_logs`, `support_requests` with constraints, RLS and explicit grants. No member role-write grants; audit INSERT is internal only, with no ordinary UPDATE/DELETE path.
- Protected `profiles.account_status`, `review_status`, `review_submitted_at`, `reviewed_at`; private report details for assignment, notes and resolution dates. Reviewer identity and decision history live in the audit log.
- Ledger `admin_request_id`, `balance_after`; extend type/shape constraints and add a unique adjustment request index. Preserve original referral/payment/spend shapes and uniqueness.
- Queue/date indexes; private authorization, read and atomic mutation functions with fixed search paths; narrowly granted invoker RPC entry points. Check active membership and role inside the database for every admin request.
- Restrictive suspension policies and guards supplement existing member access policies; members cannot alter moderation fields. Preserve ordinary active-member behavior.
- Transactional bootstrap procedure verifies an intentionally supplied existing confirmed user UUID and refuses to run once an administrator exists.

## SECURITY IMPACT

Admin authorization is independent of member authentication. A verified Supabase session is required, then active database membership and per-operation role checks. The sidebar is only presentation. Server pages and actions repeat authorization; RPCs independently reject direct unauthorized calls. Role mutations serialize, prevent self-lockout and preserve an active super admin. Sensitive writes, ledger updates and audit inserts succeed or roll back together. Search/pagination/IDs/amounts/reasons are validated; credit amounts are only accepted from authorized admin operations within server-enforced limits. Internal notes, credentials, provider payloads and private chat text are not returned through member APIs. No first administrator is automatically selected.

Implementation and database verification will be done in an isolated local database. Applying the reviewed migration to the live project is a separate rollout step; do not use production member records as test fixtures.
