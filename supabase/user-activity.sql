-- Run once in the Supabase SQL Editor after the base schema and feature SQL files.
create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in (
    'profile_viewed','profile_updated','profile_photo_updated','partner_preferences_updated',
    'profile_shortlisted','profile_removed_from_shortlist','request_sent','request_received',
    'request_accepted','request_declined','request_cancelled','following_started','unfollowed',
    'message_sent','conversation_started','profile_reported','profile_blocked','profile_unblocked',
    'account_created','email_updated','password_updated'
  )),
  target_user_id uuid references auth.users(id) on delete set null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  source_key text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists user_activity_user_created_idx on public.user_activity (user_id, created_at desc);
create index if not exists user_activity_user_type_created_idx on public.user_activity (user_id, activity_type, created_at desc);
alter table public.user_activity enable row level security;
revoke all on table public.user_activity from anon, authenticated;
grant select on table public.user_activity to authenticated;
drop policy if exists "Users read their own activity" on public.user_activity;
create policy "Users read their own activity" on public.user_activity for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.record_user_activity(
  activity_user_id uuid,
  activity_type_value text,
  activity_target_user_id uuid,
  activity_entity_id uuid,
  activity_metadata jsonb,
  activity_source_key text,
  activity_created_at timestamptz default timezone('utc', now())
) returns void language plpgsql security definer set search_path = '' as $$
declare target_snapshot jsonb := '{}'::jsonb;
begin
  if activity_target_user_id is not null then
    select jsonb_strip_nulls(jsonb_build_object(
      'target_name', p.display_name,
      'target_age', p.age,
      'target_profession', p.profession,
      'target_city', p.city,
      'target_state', p.state,
      'target_avatar', coalesce(p.avatar_url, p.photos[1])
    )) into target_snapshot from public.profiles p where p.id = activity_target_user_id;
  end if;
  insert into public.user_activity (user_id, activity_type, target_user_id, entity_id, metadata, source_key, created_at)
  values (activity_user_id, activity_type_value, activity_target_user_id, activity_entity_id, coalesce(activity_metadata, '{}'::jsonb) || coalesce(target_snapshot, '{}'::jsonb), activity_source_key, activity_created_at)
  on conflict (source_key) do nothing;
exception when others then
  -- Activity history must never roll back the business action that produced it.
  null;
end;
$$;
revoke execute on function public.record_user_activity(uuid,text,uuid,uuid,jsonb,text,timestamptz) from public, anon, authenticated;

create or replace function public.log_profile_view_activity(viewed_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare viewer_id uuid := (select auth.uid());
begin
  if viewer_id is null or viewed_user_id is null or viewer_id = viewed_user_id then return; end if;
  if not exists (select 1 from public.profiles where id = viewed_user_id and is_discoverable = true) then return; end if;
  if exists (
    select 1 from public.user_activity
    where user_id = viewer_id and target_user_id = viewed_user_id
      and activity_type = 'profile_viewed'
      and created_at >= timezone('utc', now()) - interval '30 minutes'
  ) then return; end if;
  perform public.record_user_activity(viewer_id, 'profile_viewed', viewed_user_id, null, '{}'::jsonb, 'profile_viewed:' || viewer_id::text || ':' || viewed_user_id::text || ':' || floor(extract(epoch from now()) / 1800)::text);
end;
$$;
revoke execute on function public.log_profile_view_activity(uuid) from public, anon;
grant execute on function public.log_profile_view_activity(uuid) to authenticated;

create or replace function public.activity_from_profile_change() returns trigger language plpgsql security definer set search_path = '' as $$
declare event_type text;
begin
  if tg_op = 'INSERT' then
    perform public.record_user_activity(new.id, 'account_created', null, new.id, '{}'::jsonb, 'account_created:' || new.id::text, new.created_at);
  else
    if new.photos is distinct from old.photos or new.avatar_url is distinct from old.avatar_url then event_type := 'profile_photo_updated';
    elsif new.partner_preferences is distinct from old.partner_preferences then event_type := 'partner_preferences_updated';
    elsif (to_jsonb(new) - array['updated_at','last_seen_at']) is distinct from (to_jsonb(old) - array['updated_at','last_seen_at']) then event_type := 'profile_updated';
    end if;
    if event_type is not null then
      perform public.record_user_activity(new.id, event_type, null, new.id, '{}'::jsonb, event_type || ':' || new.id::text || ':' || txid_current()::text);
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_create_activity on public.profiles;
create trigger profiles_create_activity after insert or update on public.profiles for each row execute procedure public.activity_from_profile_change();

create or replace function public.activity_from_shortlist() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    perform public.record_user_activity(old.user_id, 'profile_removed_from_shortlist', old.profile_id, null, '{}'::jsonb, 'delete:shortlist:' || old.user_id::text || ':' || old.profile_id::text || ':' || extract(epoch from clock_timestamp())::text, old.created_at);
    return old;
  end if;
  perform public.record_user_activity(new.user_id, 'profile_shortlisted', new.profile_id, null, '{}'::jsonb, 'insert:shortlist:' || new.user_id::text || ':' || new.profile_id::text || ':' || extract(epoch from new.created_at)::text, new.created_at);
  return new;
end;
$$;
drop trigger if exists shortlist_create_activity on public.profile_shortlists;
create trigger shortlist_create_activity after insert or delete on public.profile_shortlists for each row execute procedure public.activity_from_shortlist();

create or replace function public.activity_from_request() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform public.record_user_activity(new.liker_id, 'request_sent', new.liked_id, null, '{}'::jsonb, 'request_sent:' || new.liker_id::text || ':' || new.liked_id::text || ':' || extract(epoch from new.created_at)::text, new.created_at);
    perform public.record_user_activity(new.liked_id, 'request_received', new.liker_id, null, '{}'::jsonb, 'request_received:' || new.liker_id::text || ':' || new.liked_id::text || ':' || extract(epoch from new.created_at)::text, new.created_at);
    return new;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'accepted' then
      perform public.record_user_activity(new.liked_id, 'request_accepted', new.liker_id, null, '{}'::jsonb, 'request_accepted:' || new.liker_id::text || ':' || new.liked_id::text || ':' || txid_current()::text, coalesce(new.responded_at, now()));
      perform public.record_user_activity(new.liker_id, 'following_started', new.liked_id, null, '{}'::jsonb, 'following_started:' || new.liker_id::text || ':' || new.liked_id::text || ':' || txid_current()::text, coalesce(new.responded_at, now()));
    elsif new.status = 'declined' then
      perform public.record_user_activity(new.liked_id, 'request_declined', new.liker_id, null, '{}'::jsonb, 'request_declined:' || new.liker_id::text || ':' || new.liked_id::text || ':' || txid_current()::text, coalesce(new.responded_at, now()));
    end if;
    return new;
  else
    if old.status = 'accepted' then
      perform public.record_user_activity(old.liker_id, 'unfollowed', old.liked_id, null, '{}'::jsonb, 'unfollowed:a:' || old.liker_id::text || ':' || old.liked_id::text || ':' || extract(epoch from clock_timestamp())::text);
      perform public.record_user_activity(old.liked_id, 'unfollowed', old.liker_id, null, '{}'::jsonb, 'unfollowed:b:' || old.liker_id::text || ':' || old.liked_id::text || ':' || extract(epoch from clock_timestamp())::text);
    else
      perform public.record_user_activity(old.liker_id, 'request_cancelled', old.liked_id, null, '{}'::jsonb, 'request_cancelled:' || old.liker_id::text || ':' || old.liked_id::text || ':' || extract(epoch from clock_timestamp())::text);
    end if;
    return old;
  end if;
end;
$$;
drop trigger if exists requests_create_activity on public.profile_likes;
create trigger requests_create_activity after insert or update of status or delete on public.profile_likes for each row execute procedure public.activity_from_request();

create or replace function public.activity_from_message() returns trigger language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if exists (select 1 from public.messages m where m.interest_liker_id = new.interest_liker_id and m.interest_liked_id = new.interest_liked_id and m.id < new.id) then return new; end if;
  target_id := case when new.sender_id = new.interest_liker_id then new.interest_liked_id else new.interest_liker_id end;
  perform public.record_user_activity(new.sender_id, 'conversation_started', target_id, null, '{}'::jsonb, 'conversation_started:' || new.interest_liker_id::text || ':' || new.interest_liked_id::text, new.created_at);
  return new;
end;
$$;
drop trigger if exists messages_create_activity on public.messages;
create trigger messages_create_activity after insert on public.messages for each row execute procedure public.activity_from_message();

create or replace function public.activity_from_block() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    perform public.record_user_activity(old.blocker_id, 'profile_unblocked', old.blocked_id, null, '{}'::jsonb, 'delete:block:' || old.blocker_id::text || ':' || old.blocked_id::text || ':' || extract(epoch from clock_timestamp())::text, old.created_at);
    return old;
  end if;
  perform public.record_user_activity(new.blocker_id, 'profile_blocked', new.blocked_id, null, '{}'::jsonb, 'insert:block:' || new.blocker_id::text || ':' || new.blocked_id::text || ':' || extract(epoch from new.created_at)::text, new.created_at);
  return new;
end;
$$;
drop trigger if exists blocks_create_activity on public.blocked_users;
create trigger blocks_create_activity after insert or delete on public.blocked_users for each row execute procedure public.activity_from_block();

create or replace function public.activity_from_report() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.record_user_activity(new.reporter_id, 'profile_reported', new.reported_id, null, jsonb_build_object('status', new.status), 'profile_reported:' || new.id::text, new.created_at);
  return new;
end;
$$;
drop trigger if exists reports_create_activity on public.member_reports;
create trigger reports_create_activity after insert on public.member_reports for each row execute procedure public.activity_from_report();

create or replace function public.activity_from_auth_update() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email is distinct from old.email then
    perform public.record_user_activity(new.id, 'email_updated', null, null, '{}'::jsonb, 'email_updated:' || new.id::text || ':' || txid_current()::text);
  end if;
  if new.encrypted_password is distinct from old.encrypted_password then
    perform public.record_user_activity(new.id, 'password_updated', null, null, '{}'::jsonb, 'password_updated:' || new.id::text || ':' || txid_current()::text);
  end if;
  return new;
end;
$$;
drop trigger if exists auth_users_create_activity on auth.users;
create trigger auth_users_create_activity after update of email, encrypted_password on auth.users for each row execute procedure public.activity_from_auth_update();
-- Safe, idempotent history backfill from existing authoritative records.
select public.record_user_activity(p.id, 'account_created', null, p.id, '{}'::jsonb, 'account_created:' || p.id::text, p.created_at) from public.profiles p;
select public.record_user_activity(s.user_id, 'profile_shortlisted', s.profile_id, null, '{}'::jsonb, 'backfill:shortlist:' || s.user_id::text || ':' || s.profile_id::text, s.created_at) from public.profile_shortlists s;
select public.record_user_activity(l.liker_id, 'request_sent', l.liked_id, null, '{}'::jsonb, 'backfill:request_sent:' || l.liker_id::text || ':' || l.liked_id::text, l.created_at) from public.profile_likes l;
select public.record_user_activity(l.liker_id, 'following_started', l.liked_id, null, '{}'::jsonb, 'backfill:following:' || l.liker_id::text || ':' || l.liked_id::text, coalesce(l.responded_at, l.created_at)) from public.profile_likes l where l.status = 'accepted';
select public.record_user_activity(b.blocker_id, 'profile_blocked', b.blocked_id, null, '{}'::jsonb, 'backfill:block:' || b.blocker_id::text || ':' || b.blocked_id::text, b.created_at) from public.blocked_users b;
select public.record_user_activity(r.reporter_id, 'profile_reported', r.reported_id, null, jsonb_build_object('status', r.status), 'profile_reported:' || r.id::text, r.created_at) from public.member_reports r;
