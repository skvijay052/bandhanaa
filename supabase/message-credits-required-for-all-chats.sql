-- Bandhanaa: require one message credit for every outgoing message.
-- Apply after supabase/referral-message-credits.sql.
--
-- Rules after this migration:
--   * An accepted/mutual connection is still required before messaging.
--   * Every outgoing message costs exactly 1 credit.
--   * Incoming messages are free.
--   * A sender with 0 credits cannot send.
--   * Referral rewards continue to add 10 credits.

begin;

-- Keep the existing access table compatible with clients that still read it,
-- but make credit metering universal for all current accounts.
insert into public.message_credit_access(user_id, requires_credit)
select id, true
from auth.users
on conflict (user_id) do update
set requires_credit = true,
    updated_at = now();

-- New/future clients should always see messaging as credit-metered.
create or replace function public.get_message_credit_summary()
returns table(available_credits integer, requires_credit boolean)
language sql stable security definer set search_path = '' as $$
  select coalesce(w.available_credits, 0), true
  from auth.users u
  left join public.message_credit_wallets w on w.user_id = u.id
  where u.id = auth.uid();
$$;
revoke all on function public.get_message_credit_summary() from public, anon, authenticated;
grant execute on function public.get_message_credit_summary() to authenticated;

-- Charge every successful outgoing message. This trigger also protects direct
-- or older-client inserts, so clients cannot bypass the credit requirement by
-- skipping send_message_with_credits(). The ledger trigger atomically rejects
-- the transaction when the balance would go below zero, rolling back the
-- message insert as well.
create or replace function public.charge_outgoing_message_credit()
returns trigger language plpgsql security definer set search_path = '' as $$
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

  insert into public.message_credit_transactions(
    user_id,
    amount,
    transaction_type,
    message_id,
    description
  ) values (
    new.sender_id,
    -1,
    'message_spend',
    new.id,
    'One outgoing message'
  );

  return new;
end $$;
revoke all on function public.charge_outgoing_message_credit() from public, anon, authenticated;

commit;
