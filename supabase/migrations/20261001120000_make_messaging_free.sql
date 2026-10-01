-- Bandhanaa: messaging is free for all accepted connections.
-- Payment/message-credit infrastructure is intentionally retained for future use,
-- but it must not gate, meter, or advertise outgoing messages.

begin;

-- Keep the existing RPC name for compatibility with deployed clients, but make
-- its server-side message trigger enforce only the normal conversation rules.
create or replace function public.charge_outgoing_message_credit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null
    or new.sender_id <> auth.uid()
    or not public.is_active_profile(auth.uid())
    or not public.are_profiles_matched(new.interest_liker_id, new.interest_liked_id) then
    raise exception 'An active account and accepted connection are required'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.blocked_users b
    where (b.blocker_id = new.interest_liker_id and b.blocked_id = new.interest_liked_id)
       or (b.blocker_id = new.interest_liked_id and b.blocked_id = new.interest_liker_id)
  ) then
    raise exception 'This conversation is unavailable'
      using errcode = '42501';
  end if;

  -- Messaging is free. Do not create message_spend ledger entries and do not
  -- read or mutate the sender's credit balance.
  return new;
end;
$$;

revoke all on function public.charge_outgoing_message_credit() from public, anon, authenticated;

-- Existing clients still call this RPC, so keep it as the compatibility entry
-- point while the trigger above guarantees free messaging at the database layer.
create or replace function public.get_message_credit_summary()
returns table(available_credits integer, requires_credit boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select 0, false
  from auth.users
  where id = auth.uid();
$$;

revoke all on function public.get_message_credit_summary() from public, anon, authenticated;
grant execute on function public.get_message_credit_summary() to authenticated;

notify pgrst, 'reload schema';
commit;
