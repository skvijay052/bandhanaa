-- WhatsApp-style message replies for Bandhanaa chat.
-- Run this once in the Supabase SQL editor before using reply-to-message in production.

alter table public.messages
  add column if not exists reply_to_id bigint;

-- Keep the reply target when possible, but allow the original message to be removed safely.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'messages_reply_to_id_fkey'
      and conrelid = 'public.messages'::regclass
  ) then
    alter table public.messages
      add constraint messages_reply_to_id_fkey
      foreign key (reply_to_id)
      references public.messages(id)
      on delete set null;
  end if;
end
$$;

create index if not exists messages_reply_to_id_idx
  on public.messages (reply_to_id)
  where reply_to_id is not null;

-- A reply must point to another message in the same accepted-interest conversation.
create or replace function public.validate_message_reply_target()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reply_to_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.messages original
    where original.id = new.reply_to_id
      and original.interest_liker_id = new.interest_liker_id
      and original.interest_liked_id = new.interest_liked_id
  ) then
    raise exception 'Reply target must belong to the same conversation'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists messages_validate_reply_target on public.messages;
create trigger messages_validate_reply_target
before insert on public.messages
for each row
execute function public.validate_message_reply_target();

comment on column public.messages.reply_to_id is
  'Optional message id this message is replying to.';
