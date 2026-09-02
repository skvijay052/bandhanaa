create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text check (char_length(display_name) between 2 and 60),
  avatar_url text,
  gender text,
  age integer check (age between 18 and 100),
  birth_date date,
  weight text,
  profession text,
  company text,
  city text,
  state text,
  country text,
  religion text,
  education text,
  height text,
  mother_tongue text,
  marital_status text,
  bio text check (char_length(bio) <= 500),
  photos text[] not null default '{}',
  lifestyle jsonb not null default '[]'::jsonb,
  family jsonb not null default '[]'::jsonb,
  partner_preferences jsonb not null default '[]'::jsonb,
  horoscope jsonb not null default '[]'::jsonb,
  visibility_details jsonb not null default '{"Profile Photo":true,"Basic Details":true,"Lifestyle":true,"Family Details":true,"Horoscope":false,"Contact Information":false}'::jsonb,
  profile_visibility text not null default 'everyone' check (profile_visibility in ('everyone','connections','private')),
  profile_completion integer not null default 0 check (profile_completion between 0 and 100),
  compatibility integer not null default 85 check (compatibility between 0 and 100),
  is_discoverable boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- After applying this base schema, also run
-- supabase/registration-verification-lifecycle.sql. It adds the authoritative
-- email-verification lifecycle and replaces discovery/interaction policies.

alter table public.profiles add column if not exists age integer check (age between 18 and 100);
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists weight text;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists profession text;
alter table public.profiles add column if not exists company text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists religion text;
alter table public.profiles add column if not exists education text;
alter table public.profiles add column if not exists height text;
alter table public.profiles add column if not exists mother_tongue text;
alter table public.profiles add column if not exists marital_status text;
alter table public.profiles add column if not exists bio text check (char_length(bio) <= 500);
alter table public.profiles add column if not exists photos text[] not null default '{}';
alter table public.profiles add column if not exists lifestyle jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists family jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists partner_preferences jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists horoscope jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists visibility_details jsonb not null default '{"Profile Photo":true,"Basic Details":true,"Lifestyle":true,"Family Details":true,"Horoscope":false,"Contact Information":false}'::jsonb;
alter table public.profiles add column if not exists profile_visibility text not null default 'everyone' check (profile_visibility in ('everyone','connections','private'));
alter table public.profiles add column if not exists profile_completion integer not null default 0 check (profile_completion between 0 and 100);
alter table public.profiles add column if not exists compatibility integer not null default 85 check (compatibility between 0 and 100);
alter table public.profiles add column if not exists is_discoverable boolean not null default true;
alter table public.profiles add column if not exists last_seen_at timestamptz;

-- Normalize legacy combined locations such as "Bengaluru, Karnataka" while
-- preserving already normalized Country / State / City values.
update public.profiles
set
  state = coalesce(state, nullif(trim(split_part(city, ',', 2)), '')),
  city = case
    when position(',' in coalesce(city, '')) > 0 then nullif(trim(split_part(city, ',', 1)), '')
    else city
  end,
  country = coalesce(country, 'India')
where city is not null or country is null;

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon;
grant select, update on table public.profiles to authenticated;
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Authenticated users can discover profiles" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select using ((select auth.uid()) = id);
create policy "Authenticated users can discover profiles" on public.profiles for select to authenticated using (is_discoverable = true);
create policy "Users can update their own profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Public profile photo storage. Users may only write inside their own UUID folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Public can view profile photos" on storage.objects;
drop policy if exists "Users can upload their profile photos" on storage.objects;
drop policy if exists "Users can update their profile photos" on storage.objects;
drop policy if exists "Users can delete their profile photos" on storage.objects;
create policy "Public can view profile photos" on storage.objects for select using (bucket_id = 'profile-photos');
create policy "Users can upload their profile photos" on storage.objects for insert to authenticated with check (
  bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Users can update their profile photos" on storage.objects for update to authenticated using (
  bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
) with check (
  bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Users can delete their profile photos" on storage.objects for delete to authenticated using (
  bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id,email,display_name,avatar_url,gender,age,city,state,country,bio)
  values (
    new.id,new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'gender',
    date_part('year', age(nullif(new.raw_user_meta_data ->> 'birth_date','')::date))::integer,
    coalesce(
      new.raw_user_meta_data ->> 'city',
      nullif(trim(split_part(new.raw_user_meta_data ->> 'current_location', ',', 1)), '')
    ),
    coalesce(
      new.raw_user_meta_data ->> 'state',
      nullif(trim(split_part(new.raw_user_meta_data ->> 'current_location', ',', 2)), '')
    ),
    coalesce(new.raw_user_meta_data ->> 'country', 'India'),
    new.raw_user_meta_data ->> 'about'
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Backfill profiles and gender for users created before this trigger/schema version.
insert into public.profiles (id,email,display_name,avatar_url,gender,age,city,state,country)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email,'@',1)),
  u.raw_user_meta_data ->> 'avatar_url',
  u.raw_user_meta_data ->> 'gender',
  date_part('year', age(nullif(u.raw_user_meta_data ->> 'birth_date','')::date))::integer,
  coalesce(
    u.raw_user_meta_data ->> 'city',
    nullif(trim(split_part(u.raw_user_meta_data ->> 'current_location', ',', 1)), '')
  ),
  coalesce(
    u.raw_user_meta_data ->> 'state',
    nullif(trim(split_part(u.raw_user_meta_data ->> 'current_location', ',', 2)), '')
  ),
  coalesce(u.raw_user_meta_data ->> 'country', 'India')
from auth.users u
on conflict (id) do update set
  email = coalesce(public.profiles.email, excluded.email),
  display_name = coalesce(public.profiles.display_name, excluded.display_name),
  avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
  gender = coalesce(public.profiles.gender, excluded.gender),
  age = coalesce(public.profiles.age, excluded.age),
  city = coalesce(public.profiles.city, excluded.city),
  state = coalesce(public.profiles.state, excluded.state),
  country = coalesce(public.profiles.country, excluded.country),
  is_discoverable = true;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=timezone('utc',now());return new;end; $$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

create table if not exists public.profile_likes (
  liker_id uuid not null references auth.users(id) on delete cascade,
  liked_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  responded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (liker_id, liked_id),
  check (liker_id <> liked_id)
);
alter table public.profile_likes add column if not exists status text not null default 'pending' check (status in ('pending','accepted','declined'));
alter table public.profile_likes add column if not exists responded_at timestamptz;
alter table public.profile_likes enable row level security;
revoke all on table public.profile_likes from anon;
grant select, insert, update, delete on table public.profile_likes to authenticated;
drop policy if exists "Users can read their likes" on public.profile_likes;
drop policy if exists "Users can create likes" on public.profile_likes;
drop policy if exists "Users can remove likes" on public.profile_likes;
drop policy if exists "Recipients can respond to likes" on public.profile_likes;
create policy "Users can read their likes" on public.profile_likes for select using (
  (select auth.uid()) = liker_id or (select auth.uid()) = liked_id
);
create policy "Users can create likes" on public.profile_likes for insert with check ((select auth.uid()) = liker_id and status = 'pending');
create policy "Users can remove likes" on public.profile_likes for delete using ((select auth.uid()) = liker_id or (select auth.uid()) = liked_id);
create policy "Recipients can respond to likes" on public.profile_likes for update
using ((select auth.uid()) = liked_id)
with check ((select auth.uid()) = liked_id and status in ('accepted','declined'));

create or replace function public.get_recommended_profiles(result_limit integer default 24)
returns table (
  id uuid, display_name text, avatar_url text, age integer, profession text,
  city text, bio text, match_score integer, created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select u.raw_user_meta_data as metadata,
      lower(trim(coalesce(vp.gender, u.raw_user_meta_data ->> 'gender',''))) as gender
    from auth.users u
    left join public.profiles vp on vp.id = u.id
    where u.id = (select auth.uid())
  )
  select
    p.id, p.display_name, p.avatar_url, p.age, p.profession, p.city, p.bio,
    least(99, p.compatibility
      + case when lower(coalesce(p.city,'')) like '%' || lower(coalesce(v.metadata #>> '{preferences,location}','')) || '%' and coalesce(v.metadata #>> '{preferences,location}','') <> '' then 7 else 0 end
      + case when p.age between coalesce(nullif(v.metadata #>> '{preferences,age_min}','')::integer,18) and coalesce(nullif(v.metadata #>> '{preferences,age_max}','')::integer,100) then 7 else 0 end
    )::integer as match_score,
    p.created_at
  from public.profiles p
  left join auth.users candidate_user on candidate_user.id = p.id
  cross join viewer v
  where p.id <> (select auth.uid())
    and p.is_discoverable = true
    and case
      when v.gender in ('woman','female') then lower(trim(coalesce(p.gender, candidate_user.raw_user_meta_data ->> 'gender',''))) in ('man','male')
      when v.gender in ('man','male') then lower(trim(coalesce(p.gender, candidate_user.raw_user_meta_data ->> 'gender',''))) in ('woman','female')
      else false
    end
  order by match_score desc, p.created_at desc
  limit greatest(1, least(result_limit, 50));
$$;
revoke execute on function public.get_recommended_profiles(integer) from public, anon;
grant execute on function public.get_recommended_profiles(integer) to authenticated;

-- Private messaging. Every message belongs to an accepted interest.
create table if not exists public.messages (
  id bigint generated by default as identity primary key,
  interest_liker_id uuid not null,
  interest_liked_id uuid not null,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint messages_accepted_interest_fkey foreign key (interest_liker_id, interest_liked_id)
    references public.profile_likes(liker_id, liked_id) on delete cascade,
  check (sender_id = interest_liker_id or sender_id = interest_liked_id)
);
create index if not exists messages_interest_created_idx on public.messages (interest_liker_id, interest_liked_id, created_at);
create index if not exists messages_recipient_unread_idx on public.messages (interest_liker_id, interest_liked_id, read_at) where read_at is null;
alter table public.messages enable row level security;
revoke all on table public.messages from anon, authenticated;
grant select, insert on table public.messages to authenticated;
grant update (read_at) on table public.messages to authenticated;
grant usage, select on sequence public.messages_id_seq to authenticated;
drop policy if exists "Accepted matches can read messages" on public.messages;
drop policy if exists "Accepted matches can send messages" on public.messages;
drop policy if exists "Recipients can mark messages read" on public.messages;
create policy "Accepted matches can read messages" on public.messages for select to authenticated using (
  ((select auth.uid()) = interest_liker_id or (select auth.uid()) = interest_liked_id)
  and exists (select 1 from public.profile_likes likes where likes.liker_id = messages.interest_liker_id and likes.liked_id = messages.interest_liked_id and likes.status = 'accepted')
);
create policy "Accepted matches can send messages" on public.messages for insert to authenticated with check (
  (select auth.uid()) = sender_id
  and ((select auth.uid()) = interest_liker_id or (select auth.uid()) = interest_liked_id)
  and exists (select 1 from public.profile_likes likes where likes.liker_id = messages.interest_liker_id and likes.liked_id = messages.interest_liked_id and likes.status = 'accepted')
);
create policy "Recipients can mark messages read" on public.messages for update to authenticated
using ((select auth.uid()) <> sender_id and ((select auth.uid()) = interest_liker_id or (select auth.uid()) = interest_liked_id))
with check ((select auth.uid()) <> sender_id and ((select auth.uid()) = interest_liker_id or (select auth.uid()) = interest_liked_id));

drop policy if exists "Matched users can read each other" on public.profiles;
create policy "Matched users can read each other" on public.profiles for select to authenticated using (
  exists (select 1 from public.profile_likes likes where likes.status = 'accepted' and ((likes.liker_id = (select auth.uid()) and likes.liked_id = profiles.id) or (likes.liked_id = (select auth.uid()) and likes.liker_id = profiles.id)))
);

do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.profile_likes;
exception when duplicate_object then null;
end $$;

create table if not exists public.user_privacy_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_visibility text not null default 'everyone' check (profile_visibility in ('everyone','matches','private')),
  last_seen_visibility text not null default 'matches' check (last_seen_visibility in ('everyone','matches','nobody')),
  read_receipts boolean not null default true,
  show_online_status boolean not null default true,
  hide_age boolean not null default false,
  two_step_verification boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.user_privacy_settings enable row level security;
grant select, insert, update on table public.user_privacy_settings to authenticated;
drop policy if exists "Users manage their privacy settings" on public.user_privacy_settings;
create policy "Users manage their privacy settings" on public.user_privacy_settings for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.blocked_users (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.blocked_users enable row level security;
grant select, insert, delete on table public.blocked_users to authenticated;
drop policy if exists "Users manage their blocked members" on public.blocked_users;
create policy "Users manage their blocked members" on public.blocked_users for all to authenticated using ((select auth.uid()) = blocker_id) with check ((select auth.uid()) = blocker_id);

create table if not exists public.member_reports (
  id bigint generated by default as identity primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('inappropriate_photos','abusive_behavior','fake_profile','scam_or_fraud','other')),
  details text check (char_length(details) <= 1000),
  status text not null default 'submitted' check (status in ('submitted','reviewing','resolved','dismissed')),
  created_at timestamptz not null default timezone('utc', now()),
  check (reporter_id <> reported_id)
);
alter table public.member_reports enable row level security;
grant select, insert on table public.member_reports to authenticated;
grant usage, select on sequence public.member_reports_id_seq to authenticated;
drop policy if exists "Users submit and view their reports" on public.member_reports;
drop policy if exists "Users submit member reports" on public.member_reports;
create policy "Users submit and view their reports" on public.member_reports for select to authenticated using ((select auth.uid()) = reporter_id);
create policy "Users submit member reports" on public.member_reports for insert to authenticated with check ((select auth.uid()) = reporter_id);

-- Database-backed notifications are installed by running
-- supabase/notifications.sql after this schema in the Supabase SQL Editor.

-- Private profile shortlists are installed by running
-- supabase/profile-shortlists.sql after this schema in the Supabase SQL Editor.
