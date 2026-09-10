-- Bandhanaa referrals and message credits. Run as the database owner.
-- Prerequisites: schema.sql, registration-verification-lifecycle.sql,
-- notifications.sql, message-replies.sql. See docs/referral-message-credits.md.
begin;

do $$ begin
  if to_regprocedure('public.is_active_profile(uuid)') is null
     or to_regclass('public.notifications') is null
     or not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'messages' and column_name = 'reply_to_id') then
    raise exception 'Apply the registration lifecycle, notifications and message replies migrations first';
  end if;
end $$;

create table if not exists public.referral_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text not null unique check (code ~ '^BND[A-F0-9]{32}$'),
  created_at timestamptz not null default now(),
  unique (user_id, code)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null,
  referred_user_id uuid not null unique references auth.users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'registered' check (status in ('registered', 'rewarded')),
  registered_at timestamptz not null default now(),
  verified_at timestamptz,
  rewarded_at timestamptz,
  foreign key (inviter_id, referral_code) references public.referral_codes(user_id, code) on delete cascade,
  check (inviter_id <> referred_user_id),
  check ((status = 'registered' and verified_at is null and rewarded_at is null)
    or (status = 'rewarded' and verified_at is not null and rewarded_at is not null))
);
create index if not exists referrals_inviter_created_idx on public.referrals(inviter_id, registered_at desc);

create table if not exists public.message_credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available_credits integer not null default 0 check (available_credits >= 0),
  updated_at timestamptz not null default now()
);

-- The existing product has unrestricted messaging for accepted connections.
-- Only a trusted owner/backend may opt an account into metered sending.
-- An absent row means existing free access, never a browser-supplied flag.
create table if not exists public.message_credit_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  requires_credit boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.message_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  transaction_type text not null check (transaction_type in ('referral_reward', 'message_spend')),
  referral_id uuid references public.referrals(id) on delete set null,
  message_id bigint references public.messages(id) on delete set null,
  description text not null,
  created_at timestamptz not null default now(),
  check ((transaction_type = 'referral_reward' and amount = 10 and message_id is null)
    or (transaction_type = 'message_spend' and amount = -1 and referral_id is null))
);
create unique index if not exists message_credit_referral_reward_once_idx
  on public.message_credit_transactions(referral_id) where transaction_type = 'referral_reward';
create unique index if not exists message_credit_message_spend_once_idx
  on public.message_credit_transactions(message_id) where transaction_type = 'message_spend';
create index if not exists message_credit_transactions_user_created_idx
  on public.message_credit_transactions(user_id, created_at desc);

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.message_credit_wallets enable row level security;
alter table public.message_credit_access enable row level security;
alter table public.message_credit_transactions enable row level security;
revoke all on public.referral_codes, public.referrals, public.message_credit_wallets,
  public.message_credit_access, public.message_credit_transactions from public, anon, authenticated;
grant select on public.referral_codes, public.referrals, public.message_credit_wallets,
  public.message_credit_access, public.message_credit_transactions to authenticated;

drop policy if exists referral_codes_owner_read on public.referral_codes;
create policy referral_codes_owner_read on public.referral_codes for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists referrals_owner_read on public.referrals;
create policy referrals_owner_read on public.referrals for select to authenticated using (inviter_id = (select auth.uid()) or referred_user_id = (select auth.uid()));
drop policy if exists credit_wallet_owner_read on public.message_credit_wallets;
create policy credit_wallet_owner_read on public.message_credit_wallets for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists credit_access_owner_read on public.message_credit_access;
create policy credit_access_owner_read on public.message_credit_access for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists credit_transactions_owner_read on public.message_credit_transactions;
create policy credit_transactions_owner_read on public.message_credit_transactions for select to authenticated using (user_id = (select auth.uid()));

-- The ledger is authoritative. A successful ledger insert alone changes the
-- cached balance; duplicate/rejected inserts have no effect. Row locks serialize
-- all rewards and sends for a wallet, including requests in separate sessions.
create or replace function public.apply_message_credit_transaction()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.message_credit_wallets(user_id) values (new.user_id) on conflict do nothing;
  perform 1 from public.message_credit_wallets where user_id = new.user_id for update;
  update public.message_credit_wallets
  set available_credits = available_credits + new.amount, updated_at = now()
  where user_id = new.user_id and available_credits + new.amount >= 0;
  if not found then raise exception 'Insufficient message credits' using errcode = 'P0001'; end if;
  return new;
end $$;
revoke all on function public.apply_message_credit_transaction() from public, anon, authenticated;
drop trigger if exists message_credit_apply_transaction on public.message_credit_transactions;
create trigger message_credit_apply_transaction after insert on public.message_credit_transactions
for each row execute function public.apply_message_credit_transaction();

create or replace function public.get_or_create_referral_code()
returns text language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); result text;
begin
  if uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  -- gen_random_uuid is PostgreSQL's cryptographic UUID generator (122 random bits).
  -- ON CONFLICT returns the original code even when two devices request it at once.
  insert into public.referral_codes(user_id, code)
  values (uid, 'BND' || upper(replace(gen_random_uuid()::text, '-', '')))
  on conflict (user_id) do update set user_id = excluded.user_id
  returning code into result;
  return result;
end $$;
revoke all on function public.get_or_create_referral_code() from public, anon, authenticated;
grant execute on function public.get_or_create_referral_code() to authenticated;

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('like', 'message', 'accepted', 'connection', 'profile_complete', 'referral_reward'));

-- Private: no RPC caller can select a recipient, amount or qualification state.
create or replace function public.reward_verified_referral(referred_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare referral public.referrals%rowtype; transaction_id uuid;
begin
  select * into referral from public.referrals where referred_user_id = referred_id for update;
  if not found or referral.rewarded_at is not null then return; end if;
  if not public.is_active_profile(referred_id) then return; end if;
  -- Older onboarding RPCs can mark a sparse profile active. Reward only a
  -- completed registration, using the required personal fields as well.
  if not exists (select 1 from public.profiles p where p.id = referred_id
    and nullif(trim(p.display_name), '') is not null and p.birth_date is not null
    and nullif(trim(p.gender), '') is not null and nullif(trim(p.religion), '') is not null
    and nullif(trim(p.mother_tongue), '') is not null and nullif(trim(p.marital_status), '') is not null
    and nullif(trim(p.height), '') is not null and nullif(trim(p.city), '') is not null
    and nullif(trim(p.education), '') is not null and nullif(trim(p.profession), '') is not null) then return; end if;
  insert into public.message_credit_transactions(user_id, amount, transaction_type, referral_id, description)
  values (referral.inviter_id, 10, 'referral_reward', referral.id, 'Verified referral: 10 free message credits')
  on conflict do nothing returning id into transaction_id;
  update public.referrals set status = 'rewarded', verified_at = now(), rewarded_at = now() where id = referral.id;
  if transaction_id is not null then
    insert into public.notifications(user_id, type, title, subtitle, href, source_key)
    values (referral.inviter_id, 'referral_reward', 'You earned 10 message credits',
      'Your friend verified their email and completed their profile.', '/messages', 'referral_reward:' || referral.id::text)
    on conflict (source_key) do nothing;
  end if;
end $$;
revoke all on function public.reward_verified_referral(uuid) from public, anon, authenticated;

-- Password attribution is captured ONCE at auth-account creation, before email
-- verification. Later edits to user_metadata cannot create/reassign a referral.
create or replace function public.capture_signup_referral()
returns trigger language plpgsql security definer set search_path = '' as $$
declare candidate text := upper(trim(new.raw_user_meta_data ->> 'referral_code'));
begin
  if candidate ~ '^BND[A-F0-9]{32}$' then
    insert into public.referrals(inviter_id, referred_user_id, referral_code)
    select c.user_id, new.id, c.code from public.referral_codes c
    where c.code = candidate and c.user_id <> new.id
    on conflict (referred_user_id) do nothing;
    perform public.reward_verified_referral(new.id);
  end if;
  return new;
end $$;
revoke all on function public.capture_signup_referral() from public, anon, authenticated;
drop trigger if exists zz_capture_signup_referral on auth.users;
create trigger zz_capture_signup_referral after insert on auth.users
for each row execute function public.capture_signup_referral();

-- OAuth cannot pass our metadata to Auth's INSERT. The callback may claim for
-- its authenticated, just-created Google account only, before onboarding.
create or replace function public.claim_oauth_referral(candidate_code text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); account auth.users%rowtype;
begin
  if uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into account from auth.users where id = uid for update;
  if account.created_at < now() - interval '10 minutes'
    or account.raw_app_meta_data ->> 'provider' is distinct from 'google'
    or exists (select 1 from public.profiles where id = uid and onboarding_completed)
    or candidate_code is null or candidate_code !~ '^BND[A-F0-9]{32}$' then return false; end if;
  insert into public.referrals(inviter_id, referred_user_id, referral_code)
  select c.user_id, uid, c.code from public.referral_codes c
  where c.code = candidate_code and c.user_id <> uid and c.created_at <= account.created_at
  on conflict (referred_user_id) do nothing;
  return exists (select 1 from public.referrals where referred_user_id = uid);
end $$;
revoke all on function public.claim_oauth_referral(text) from public, anon, authenticated;
grant execute on function public.claim_oauth_referral(text) to authenticated;

create or replace function public.check_referral_activation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.reward_verified_referral(new.id);
  return new;
end $$;
revoke all on function public.check_referral_activation() from public, anon, authenticated;
drop trigger if exists referral_profile_activated on public.profiles;
create trigger referral_profile_activated after insert or update of registration_status, onboarding_completed, is_verified,
  display_name, birth_date, gender, religion, mother_tongue, marital_status, height, city, education, profession
on public.profiles for each row execute function public.check_referral_activation();
drop trigger if exists zz_referral_email_verified on auth.users;
create trigger zz_referral_email_verified after update of email_confirmed_at on auth.users
for each row when (new.email_confirmed_at is not null and old.email_confirmed_at is null)
execute function public.check_referral_activation();

create or replace function public.get_message_credit_summary()
returns table(available_credits integer, requires_credit boolean)
language sql stable security definer set search_path = '' as $$
  select coalesce(w.available_credits, 0), coalesce(a.requires_credit, false)
  from auth.users u
  left join public.message_credit_wallets w on w.user_id = u.id
  left join public.message_credit_access a on a.user_id = u.id
  where u.id = auth.uid();
$$;
revoke all on function public.get_message_credit_summary() from public, anon, authenticated;
grant execute on function public.get_message_credit_summary() to authenticated;

alter table public.messages add column if not exists client_request_id uuid;
create unique index if not exists messages_sender_request_once_idx
  on public.messages(sender_id, client_request_id) where client_request_id is not null;

-- Also applies to direct/older-client INSERTs: omitting the RPC cannot avoid
-- metering. Existing message RLS, reply validation and notification triggers run.
create or replace function public.charge_outgoing_message_credit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare metered boolean;
begin
  if auth.uid() is null or new.sender_id <> auth.uid()
    or not public.is_active_profile(auth.uid())
    or not public.are_profiles_matched(new.interest_liker_id, new.interest_liked_id) then
    raise exception 'An active account and accepted connection are required' using errcode = '42501';
  end if;
  if exists (select 1 from public.blocked_users b where
    (b.blocker_id = new.interest_liker_id and b.blocked_id = new.interest_liked_id)
    or (b.blocker_id = new.interest_liked_id and b.blocked_id = new.interest_liker_id)) then
    raise exception 'This conversation is unavailable' using errcode = '42501';
  end if;
  -- Create a stable row so an owner changing access also serializes with sends.
  insert into public.message_credit_access(user_id) values (new.sender_id) on conflict do nothing;
  select requires_credit into metered from public.message_credit_access where user_id = new.sender_id for share;
  if metered then
    insert into public.message_credit_transactions(user_id, amount, transaction_type, message_id, description)
    values (new.sender_id, -1, 'message_spend', new.id, 'One outgoing message');
  end if;
  return new;
end $$;
revoke all on function public.charge_outgoing_message_credit() from public, anon, authenticated;
drop trigger if exists messages_charge_referral_credit on public.messages;
create trigger messages_charge_referral_credit after insert on public.messages
for each row execute function public.charge_outgoing_message_credit();

-- Invoker preserves all existing message RLS. Sender comes from auth.uid();
-- no reward amount, balance, inviter or free/paid switch is accepted.
create or replace function public.send_message_with_credits(
  conversation_liker_id uuid, conversation_liked_id uuid, message_body text,
  request_id uuid, reply_message_id bigint default null
)
returns setof public.messages language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid(); existing public.messages%rowtype;
begin
  if uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if request_id is null then raise exception 'A message request id is required' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text || ':' || request_id::text, 0));
  select * into existing from public.messages where sender_id = uid and client_request_id = request_id;
  if found then
    if existing.interest_liker_id is distinct from conversation_liker_id
      or existing.interest_liked_id is distinct from conversation_liked_id
      or existing.body is distinct from trim(message_body)
      or existing.reply_to_id is distinct from reply_message_id then
      raise exception 'Request id already used for another message' using errcode = '22023';
    end if;
    return next existing;
    return;
  end if;
  return query insert into public.messages(interest_liker_id, interest_liked_id, sender_id, body, reply_to_id, client_request_id)
  values (conversation_liker_id, conversation_liked_id, uid, trim(message_body), reply_message_id, request_id)
  returning *;
end $$;
revoke all on function public.send_message_with_credits(uuid, uuid, text, uuid, bigint) from public, anon, authenticated;
grant execute on function public.send_message_with_credits(uuid, uuid, text, uuid, bigint) to authenticated;

-- Keep older senders compatible, but disallow forging identity ids/timestamps or
-- marking an outgoing message as read at creation. Updates remain read_at only.
revoke insert on public.messages from authenticated;
grant insert(interest_liker_id, interest_liked_id, sender_id, body, reply_to_id, client_request_id) on public.messages to authenticated;

do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'message_credit_wallets') then
      alter publication supabase_realtime add table public.message_credit_wallets;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'message_credit_access') then
      alter publication supabase_realtime add table public.message_credit_access;
    end if;
  end if;
end $$;
notify pgrst, 'reload schema';
commit;
