-- Bandhanaa Razorpay purchases for message credits.
-- Apply after referral-message-credits.sql and message-credits-required-for-all-chats.sql.
-- Safe to apply whether or not the earlier Paytm purchase migration was run.
-- Fixed product pack: INR 10.00 = 10 outgoing-message credits.

begin;

create table if not exists public.message_credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'razorpay',
  order_id text not null unique check (char_length(order_id) between 8 and 64),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  amount_paise integer not null default 1000 check (amount_paise = 1000),
  credits integer not null default 10 check (credits = 10),
  status text not null default 'created'
    check (status in ('created', 'pending', 'paid', 'failed', 'cancelled')),
  payment_mode text,
  provider_result_code text,
  provider_result_message text,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

-- Upgrade a database where the previous Paytm migration was already applied.
alter table public.message_credit_purchases
  add column if not exists razorpay_order_id text;
alter table public.message_credit_purchases
  add column if not exists razorpay_payment_id text;

alter table public.message_credit_purchases
  alter column provider set default 'razorpay';
alter table public.message_credit_purchases
  drop constraint if exists message_credit_purchases_provider_check;
alter table public.message_credit_purchases
  add constraint message_credit_purchases_provider_check
  check (provider in ('razorpay', 'paytm'));

create unique index if not exists message_credit_purchases_razorpay_order_idx
  on public.message_credit_purchases(razorpay_order_id)
  where razorpay_order_id is not null;
create unique index if not exists message_credit_purchases_razorpay_payment_idx
  on public.message_credit_purchases(razorpay_payment_id)
  where razorpay_payment_id is not null;
create index if not exists message_credit_purchases_user_created_idx
  on public.message_credit_purchases(user_id, created_at desc);
create index if not exists message_credit_purchases_status_created_idx
  on public.message_credit_purchases(status, created_at desc);

alter table public.message_credit_purchases enable row level security;
revoke all on public.message_credit_purchases from public, anon, authenticated;
grant select on public.message_credit_purchases to authenticated;

drop policy if exists message_credit_purchases_owner_read on public.message_credit_purchases;
create policy message_credit_purchases_owner_read
  on public.message_credit_purchases
  for select to authenticated
  using (user_id = (select auth.uid()));

alter table public.message_credit_transactions
  add column if not exists purchase_id uuid
  references public.message_credit_purchases(id) on delete set null;

alter table public.message_credit_transactions
  drop constraint if exists message_credit_transactions_transaction_type_check;
alter table public.message_credit_transactions
  drop constraint if exists message_credit_transactions_check;
alter table public.message_credit_transactions
  drop constraint if exists message_credit_transactions_shape_check;

alter table public.message_credit_transactions
  add constraint message_credit_transactions_transaction_type_check
  check (transaction_type in ('referral_reward', 'message_spend', 'payment_purchase'));

alter table public.message_credit_transactions
  add constraint message_credit_transactions_shape_check
  check (
    (transaction_type = 'referral_reward'
      and amount = 10
      and message_id is null
      and purchase_id is null)
    or
    (transaction_type = 'message_spend'
      and amount = -1
      and referral_id is null
      and purchase_id is null)
    or
    (transaction_type = 'payment_purchase'
      and amount = 10
      and referral_id is null
      and message_id is null
      and purchase_id is not null)
  );

create unique index if not exists message_credit_payment_purchase_once_idx
  on public.message_credit_transactions(purchase_id)
  where transaction_type = 'payment_purchase';

-- Only a trusted service-role server can apply a verified Razorpay purchase.
-- Row locks + unique indexes make browser retries and webhooks idempotent.
create or replace function public.finalize_razorpay_message_credit_purchase(
  p_order_id text,
  p_razorpay_payment_id text,
  p_confirmed_amount_paise integer,
  p_payment_mode text default null,
  p_result_code text default null,
  p_result_message text default null,
  p_provider_payload jsonb default '{}'::jsonb
)
returns table(applied boolean, available_credits integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  purchase public.message_credit_purchases%rowtype;
  ledger_id uuid;
  balance integer;
begin
  if nullif(trim(p_order_id), '') is null
     or nullif(trim(p_razorpay_payment_id), '') is null then
    raise exception 'A verified Razorpay order and payment id are required'
      using errcode = '22023';
  end if;

  select * into purchase
  from public.message_credit_purchases
  where provider = 'razorpay' and order_id = p_order_id
  for update;

  if not found then
    raise exception 'Unknown Razorpay message credit purchase' using errcode = 'P0002';
  end if;

  if purchase.razorpay_order_id is distinct from p_order_id
     or purchase.amount_paise <> 1000
     or purchase.credits <> 10
     or p_confirmed_amount_paise <> purchase.amount_paise then
    raise exception 'Verified payment details do not match the credit pack'
      using errcode = '22023';
  end if;

  if purchase.status = 'paid' then
    if purchase.razorpay_payment_id is distinct from p_razorpay_payment_id then
      raise exception 'Purchase is already linked to another Razorpay payment'
        using errcode = '23505';
    end if;

    select coalesce(w.available_credits, 0) into balance
    from public.message_credit_wallets w
    where w.user_id = purchase.user_id;

    return query select false, coalesce(balance, 0);
    return;
  end if;

  if exists (
    select 1 from public.message_credit_purchases p
    where p.razorpay_payment_id = p_razorpay_payment_id and p.id <> purchase.id
  ) then
    raise exception 'Razorpay payment has already been used'
      using errcode = '23505';
  end if;

  update public.message_credit_purchases
  set status = 'paid',
      razorpay_payment_id = p_razorpay_payment_id,
      payment_mode = nullif(trim(p_payment_mode), ''),
      provider_result_code = nullif(trim(p_result_code), ''),
      provider_result_message = nullif(trim(p_result_message), ''),
      provider_payload = coalesce(p_provider_payload, '{}'::jsonb),
      paid_at = coalesce(paid_at, now()),
      updated_at = now()
  where id = purchase.id;

  insert into public.message_credit_transactions(
    user_id,
    amount,
    transaction_type,
    purchase_id,
    description
  ) values (
    purchase.user_id,
    10,
    'payment_purchase',
    purchase.id,
    'Razorpay purchase: 10 message credits'
  )
  on conflict (purchase_id) where transaction_type = 'payment_purchase'
  do nothing
  returning id into ledger_id;

  select coalesce(w.available_credits, 0) into balance
  from public.message_credit_wallets w
  where w.user_id = purchase.user_id;

  return query select ledger_id is not null, coalesce(balance, 0);
end $$;

revoke all on function public.finalize_razorpay_message_credit_purchase(
  text, text, integer, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.finalize_razorpay_message_credit_purchase(
  text, text, integer, text, text, text, jsonb
) to service_role;

-- Remove the old Paytm finalizer if that migration had been applied. Historical
-- rows remain readable, but Bandhanaa no longer creates Paytm purchases.
drop function if exists public.finalize_paytm_message_credit_purchase(
  text, text, integer, text, text, text, jsonb
);

commit;
