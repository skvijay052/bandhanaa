# Referral and message credit rollout

Inspected source baseline: `aa032014018ffda9b0814be57ebbeb672d8063d3` on `main`.

## Owner action before merging the application changes

Run **`supabase/referral-message-credits.sql`** in the Supabase SQL editor as the database owner. It is transactional and can be reapplied. Existing prerequisites are `schema.sql`, `profile-shortlists.sql`, `registration-verification-lifecycle.sql`, `notifications.sql`, and `message-replies.sql`. Keep the already-applied `annual-income-profile.sql` and privacy migrations; do not rerun older migrations over newer replacements. The new migration checks essential prerequisites and does not replace the existing registration or message RLS functions.

Apply the new SQL **before merging/releasing the application code**: the new sender calls `send_message_with_credits`. Old app versions continue to work after the migration because direct message inserts retain their existing permissions and run the same atomic credit trigger. There is no client fallback around the new RPC. No production SQL or Netlify deployment is run by this change, and Netlify configuration is unchanged.

Set the existing `NEXT_PUBLIC_SITE_URL` to the canonical public Bandhanaa origin if it is not already configured. Referral links fall back to the current browser origin. Supabase email confirmation must be enabled; when email confirmation is disabled, Supabase itself treats newly registered addresses as confirmed and cannot prove mailbox ownership.

## Chat access policy

The inspected app has **free outgoing messages for accepted connections**, with no implemented subscription entitlement or paid-message allowance. This change preserves that behavior. It does not impose a new paywall on existing or newly registered members.

Referral rewards are earned immediately when eligible and shown in Messages. They are spent only for accounts whose **owner-controlled** `message_credit_access.requires_credit` is true. An absent row/false preserves existing free access. Clients can read their own setting but cannot change it. When a future subscription/allowance system is added, its trusted backend should maintain this setting.

To enable credit-required outgoing messages for an intended account, the owner can run:

```sql
insert into public.message_credit_access (user_id, requires_credit)
values ('REPLACE_WITH_THE_ACCOUNT_UUID'::uuid, true)
on conflict (user_id) do update
set requires_credit = excluded.requires_credit, updated_at = now();
```

Use `false` to restore free access. This is separate from applying the migration; it is a deliberate product-policy decision. There is no credit purchase, initial grant, expiry, daily allowance or payment integration in this change. An account in credit-required mode with zero credits cannot send until it earns credits or the owner changes its access. Incoming messages always cost zero. Referral credits do not bypass an accepted relationship or a block.

## Referral flow

1. A Discover referral card opens the sharing modal. The authenticated RPC creates/returns one stable code (`BND` plus a cryptographically random UUID represented as 32 uppercase hexadecimal characters: 122 random bits). The public URL contains this independent code, never the auth UUID.
2. On `/register?ref=...`, the first valid-format invitation is remembered in a 30-day, same-site cookie. It is only an attribution hint. Malformed input is ignored. A browser that disables cookies can use the code while remaining on the original registration URL, but cannot retain it across visits.
3. Password signup passes the code in signup metadata. An `auth.users` **INSERT-only** trigger resolves the code to its owner and records one attribution. Resends and subsequent user-metadata edits cannot change it. Nothing is awarded for a URL visit, account creation, or email confirmation alone. Attribution survives verification on another device because it is already in the database.
4. For Google registration, the server callback reads the cookie after exchanging the authenticated OAuth session. Its RPC accepts only a Google account created within the last 10 minutes, before onboarding, and a code that existed before that account. Existing members cannot claim an invitation retroactively. This initial OAuth callback must occur in the browser retaining the cookie; blocked/cleared cookies or a delayed callback may prevent attribution.
5. Auth/profile triggers check confirmed Auth email, active registration, onboarding completion, verified profile, and required personal fields (name, birth date, gender, religion, mother tongue, marital status, height, city, education, profession). A sparse profile marked active by an older onboarding RPC is insufficient. Completing the missing fields reevaluates eligibility.
6. One transaction inserts a `+10` ledger entry, updates the wallet, marks the referral rewarded and creates the notification **“You earned 10 message credits”**. Repeated verification/profile updates cannot reward twice. The notification appears in the existing list and as a dismissible toast, including the latest unread reward when the member returns.

## Message transactions and security

- `referral_codes`, `referrals`, `message_credit_wallets`, `message_credit_access`, and `message_credit_transactions` have RLS. Browser roles have no write grants or write policies. Each member reads only their own code, wallet/access/ledger, and their involved referrals.
- The database derives sender/current account from `auth.uid()` and inviter from the stored code. No public reward RPC accepts an inviter, amount or balance. Internal trigger/reward functions have execution revoked from PUBLIC, anon and authenticated, and fixed empty search paths. See [Supabase function security guidance](https://supabase.com/docs/guides/database/functions#security-definer-vs-invoker).
- A foreign key ties a referral code to its actual owner. A unique referred-account constraint prevents multiple inviters. A check prevents self-referral. A unique reward-ledger index and locked referral row make rewards idempotent.
- `send_message_with_credits` is **security invoker**: existing message RLS and accepted-relationship rules still run. The database also blocks messages in either direction when a block exists. Replies use the existing same-conversation validation trigger. Read receipts and existing message/notification realtime publication and sound subscriptions are retained.
- The RPC serializes retries by authenticated sender/request UUID. An identical retry returns the already-inserted message; changing its conversation, body or reply with the same request ID is rejected. The browser retains its request ID while retrying an unchanged draft in the current session.
- Every outgoing insert, including one from an older/direct API client, runs the debit trigger. It reads the server-controlled access row under a lock. For a metered sender it inserts a `-1` transaction; that ledger insertion locks/updates the wallet and rejects a negative result. Message, balance, ledger and existing notification writes commit or roll back together. Incoming/read-receipt operations do not debit.
- No client can set a message's identity ID, creation time, outgoing read status, or credit mode during insertion. Direct legacy inserts remain supported but lack the RPC's retry deduplication unless they supply a unique `client_request_id`.
- The ledger is authoritative; the wallet is its cached sum. Conversation/message deletion retains spend entries (nullable source reference) and does not refund credits. Account deletion removes that account's private wallet/ledger; surviving inviters retain their audit amounts with a nullable referral reference. Owners must not edit wallet balances directly.
- No service-role key, custom public reward endpoint, external service or new production dependency is added. This prevents account-level duplicate/self claims; it does not detect one person creating multiple independently verified accounts. Existing Auth abuse controls remain necessary for that separate concern.

## UI and platform behavior

- Banners span the profile grid after **10, 20, 30, 40…** displayed profiles, following the repeated “every 10” requirement. This deliberately differs from the sample showing only 10 and 30. Banners never count toward the existing desktop batch size of 20 or alter its loading sentinel.
- The existing mobile page had curated carousels and visitors but no rendered main filtered profile grid. Those sections remain intact. A compact grid using the existing pink `ProfileCard` is appended below them, uses the already-computed filters and loads in batches of 20. Its referral cards also appear every 10 profiles. Existing desktop cards, filters, insights, both visitor/preference popups, slider, match styling, shortlist and relationship state code are retained.
- The modal uses a portal and native modal `<dialog>` top layer, with an accessible heading/description, focus containment, focus restoration, close button, Escape and outside-click dismissal. It becomes a bottom sheet on mobile. No modal library is installed.
- Copy Link uses the clipboard API. If browser clipboard access fails, it focuses/selects the visible link for manual copying. WhatsApp and X open their encoded share composers; Facebook uses its URL sharer without an app ID or fabricated prefilled post text. These direct-click anchors avoid awaiting a popup.
- **Instagram does not support a normal URL-prefilled web share composer.** Its action reserves a tab from the click, copies the invitation, then opens Instagram. The user must paste it into a message. If popups or clipboard access are blocked, the modal gives manual-copy/open instructions. Website/app handoff depends on the device; app launching is not guaranteed.
- `navigator.share()` is exposed when supported, allowing installed sharing apps through the native share sheet. It requires a supported secure-context browser and a user gesture. Cancellation is silent; other failures fall back to copying. No social action automatically posts or sends the invitation.

## Validation

The isolated test uses actual application SQL migrations on embedded PostgreSQL (PGlite); only Supabase Auth/Storage platform schemas are mocked. Install PGlite separately from the app and run:

```bash
npm install --prefix /tmp/bandhanaa-sql-test @electric-sql/pglite
PGLITE_MODULE_PATH=/tmp/bandhanaa-sql-test/node_modules/@electric-sql/pglite/dist/index.js \
  node --test scripts/referral-message-credits.test.mjs
npx tsc --noEmit
npm run build
```

Use the normal Supabase public environment variables for a real build. The workspace production build was validated with a non-production placeholder URL/key, so it does not validate a live Auth connection. No browser QA, production SQL execution, real email delivery or social-app launching is claimed.

The tests cover repeat migration, stable codes, delayed activation, sparse/inactive profiles, metadata tampering, invalid/self/duplicate claims, fresh/old OAuth users, denied writes and RPC access, RLS isolation, free chat, incoming messages, replies/read receipts, metered sends and retry idempotency, direct-insert enforcement, bad-reply rollback, blocks, exhaustion, notification rollback and audit retention.

PGlite serializes backend transactions; its concurrent request burst verifies exhaustion/rollback but **does not simulate two independently running PostgreSQL backends**. Before production metering, use two staging SQL sessions with the same metered sender who has one credit left. In session A, begin a transaction, `set local role authenticated`, set `request.jwt.claim.sub` to that sender, call `send_message_with_credits` with a fresh UUID and leave the transaction open. In session B do the same with a different request UUID. B must wait; after A commits, B must fail with `Insufficient message credits`. Repeat with the same UUID: B must return A's message with no second debit. Never manufacture this test balance by editing a wallet; use a real test referral and spend nine credits first.

Reconcile wallet and ledger totals (expect no rows):

```sql
select w.user_id, w.available_credits, coalesce(sum(t.amount), 0) as ledger_balance
from public.message_credit_wallets w
left join public.message_credit_transactions t on t.user_id = w.user_id
group by w.user_id, w.available_credits
having w.available_credits <> coalesce(sum(t.amount), 0);
```

## File inventory

Created:

- `supabase/referral-message-credits.sql`
- `lib/referrals.ts`
- `components/referrals/ReferralBanner.tsx`
- `components/referrals/ReferralShareModal.tsx`
- `components/referrals/ReferralRewardToast.tsx`
- `components/messages/MessageCreditBalance.tsx`
- `scripts/referral-message-credits.test.mjs`
- `docs/referral-message-credits.md`

Modified:

- `components/discover/DiscoverClient.tsx`
- `components/discover/DiscoverDesktopExperience.tsx`
- `components/discover/MobileDiscoverExperience.tsx`
- `components/auth/RegisterForm.tsx`
- `components/auth/GoogleButton.tsx`
- `app/auth/callback/route.ts`
- `components/messages/MessagesClient.tsx`
- `components/layout/AppSidebar.tsx`
- `components/notifications/NotificationRow.tsx`
- `data/notifications.ts`
