-- Bandhanaa Paytm purchases for message credits.
-- Apply after referral-message-credits.sql and message-credits-required-for-all-chats.sql.
-- Fixed product pack: INR 10.00 = 10 outgoing-message credits.

begin;

create table if not exists public.message_credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'paytm' check (provider = 'paytm'),
  order_id text not null unique check (char_length(order_id) between 8 and 64),
  paytm_txn_id text unique,
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

-- Expand the existing ledger so a verified Paytm purchase can award credits.
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

-- Only the trusted server/service-role may finalize a purchase. The browser can
-- never choose a credit amount. The row lock and unique indexes make retries,
-- Paytm callbacks and webhooks idempotent.
create or replace function public.finalize_paytm_message_credit_purchase(
  p_order_id text,
  p_paytm_txn_id text,
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
     or nullif(trim(p_paytm_txn_id), '') is null then
    raise exception 'A verified Paytm order and transaction id are required'
      using errcode = '22023';
  end if;

  select * into purchase
  from public.message_credit_purchases
  where order_id = p_order_id
  for update;

  if not found then
    raise exception 'Unknown message credit purchase' using errcode = 'P0002';
  end if;

  if purchase.amount_paise <> 1000 or purchase.credits <> 10
     or p_confirmed_amount_paise <> purchase.amount_paise then
    raise exception 'Verified payment amount does not match the credit pack'
      using errcode = '22023';
  end if;

  if purchase.status = 'paid' then
    if purchase.paytm_txn_id is distinct from p_paytm_txn_id then
      raise exception 'Purchase is already linked to another Paytm transaction'
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
    where p.paytm_txn_id = p_paytm_txn_id and p.id <> purchase.id
  ) then
    raise exception 'Paytm transaction has already been used'
      using errcode = '23505';
  end if;

  update public.message_credit_purchases
  set status = 'paid',
      paytm_txn_id = p_paytm_txn_id,
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
    'Paytm purchase: 10 message credits'
  )
  on conflict (purchase_id) where transaction_type = 'payment_purchase'
  do nothing
  returning id into ledger_id;

  select coalesce(w.available_credits, 0) into balance
  from public.message_credit_wallets w
  where w.user_id = purchase.user_id;

  return query select ledger_id is not null, coalesce(balance, 0);
end $$;

revoke all on function public.finalize_paytm_message_credit_purchase(
  text, text, integer, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.finalize_paytm_message_credit_purchase(
  text, text, integer, text, text, text, jsonb
) to service_role;

commit;
