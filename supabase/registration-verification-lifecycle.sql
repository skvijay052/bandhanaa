-- Registration verification lifecycle for Bandhanaa.
-- Run this migration in the Supabase SQL editor before deploying the matching app code.

alter table public.profiles
  add column if not exists registration_status text not null default 'draft'
    check (registration_status in ('draft', 'awaiting_verification', 'active')),
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists is_verified boolean not null default false;

create index if not exists profiles_active_discovery_idx
  on public.profiles (created_at desc)
  where registration_status = 'active'
    and is_verified = true
    and onboarding_completed = true
    and is_discoverable = true;

-- Existing confirmed members remain active. Existing unconfirmed accounts become drafts.
update public.profiles p
set
  is_verified = (u.email_confirmed_at is not null),
  onboarding_completed = case
    when u.email_confirmed_at is not null then true
    else p.onboarding_completed
  end,
  registration_status = case
    when u.email_confirmed_at is not null then 'active'
    else 'awaiting_verification'
  end,
  is_discoverable = case
    when u.email_confirmed_at is not null then p.is_discoverable
    else false
  end
from auth.users u
where u.id = p.id;

create or replace function public.registration_metadata_complete(metadata jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    nullif(trim(metadata ->> 'display_name'), '') is not null
    and nullif(metadata ->> 'birth_date', '') is not null
    and nullif(trim(metadata ->> 'gender'), '') is not null
    and nullif(trim(metadata ->> 'religion'), '') is not null
    and nullif(trim(metadata ->> 'mother_tongue'), '') is not null
    and nullif(trim(metadata ->> 'marital_status'), '') is not null
    and nullif(trim(metadata ->> 'height'), '') is not null
    and nullif(trim(metadata ->> 'city'), '') is not null
    and nullif(trim(metadata #>> '{preferences,age_min}'), '') is not null
    and nullif(trim(metadata #>> '{preferences,age_max}'), '') is not null
    and nullif(trim(metadata #>> '{preferences,education}'), '') is not null
    and nullif(trim(metadata #>> '{preferences,city}'), '') is not null
    and nullif(trim(metadata #>> '{preferences,lifestyle}'), '') is not null;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  completed boolean := public.registration_metadata_complete(new.raw_user_meta_data);
  confirmed boolean := new.email_confirmed_at is not null;
begin
  insert into public.profiles (
    id, email, display_name, avatar_url, gender, age, birth_date, city, state,
    country, religion, height, mother_tongue, marital_status, bio,
    partner_preferences, registration_status, onboarding_completed,
    is_verified, is_discoverable
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'gender',
    date_part('year', age(nullif(new.raw_user_meta_data ->> 'birth_date', '')::date))::integer,
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    coalesce(new.raw_user_meta_data ->> 'city', nullif(trim(split_part(new.raw_user_meta_data ->> 'current_location', ',', 1)), '')),
    coalesce(new.raw_user_meta_data ->> 'state', nullif(trim(split_part(new.raw_user_meta_data ->> 'current_location', ',', 2)), '')),
    coalesce(new.raw_user_meta_data ->> 'country', 'India'),
    new.raw_user_meta_data ->> 'religion',
    new.raw_user_meta_data ->> 'height',
    new.raw_user_meta_data ->> 'mother_tongue',
    new.raw_user_meta_data ->> 'marital_status',
    new.raw_user_meta_data ->> 'about',
    coalesce(new.raw_user_meta_data -> 'preferences', '{}'::jsonb),
    case when confirmed and completed then 'active' when confirmed then 'draft' else 'awaiting_verification' end,
    completed,
    confirmed,
    confirmed and completed
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    gender = excluded.gender,
    age = excluded.age,
    birth_date = excluded.birth_date,
    city = excluded.city,
    state = excluded.state,
    country = excluded.country,
    religion = excluded.religion,
    height = excluded.height,
    mother_tongue = excluded.mother_tongue,
    marital_status = excluded.marital_status,
    partner_preferences = excluded.partner_preferences,
    registration_status = excluded.registration_status,
    onboarding_completed = excluded.onboarding_completed,
    is_verified = excluded.is_verified,
    is_discoverable = excluded.is_discoverable;
  return new;
end;
$$;

create or replace function public.sync_profile_email_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles
    set
      is_verified = true,
      registration_status = case when onboarding_completed then 'active' else 'draft' end,
      is_discoverable = onboarding_completed
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_verified on auth.users;
create trigger on_auth_user_email_verified
after update of email_confirmed_at on auth.users
for each row execute procedure public.sync_profile_email_verification();

create or replace function public.activate_verified_profile()
returns table (registration_status text, onboarding_completed boolean, is_verified boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if not exists (
    select 1 from auth.users
    where id = current_user_id and email_confirmed_at is not null
  ) then
    raise exception 'Email verification required';
  end if;

  update public.profiles p
  set
    is_verified = true,
    registration_status = case when p.onboarding_completed then 'active' else 'draft' end,
    is_discoverable = p.onboarding_completed
  where p.id = current_user_id;

  return query
  select p.registration_status, p.onboarding_completed, p.is_verified
  from public.profiles p
  where p.id = current_user_id;
end;
$$;
revoke execute on function public.activate_verified_profile() from public, anon;
grant execute on function public.activate_verified_profile() to authenticated;

create or replace function public.complete_profile_onboarding()
returns table (registration_status text, onboarding_completed boolean, is_verified boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  confirmed boolean;
begin
  select email_confirmed_at is not null into confirmed
  from auth.users where id = current_user_id;

  update public.profiles p
  set
    onboarding_completed = true,
    is_verified = confirmed,
    registration_status = case when confirmed then 'active' else 'awaiting_verification' end,
    is_discoverable = confirmed
  where p.id = current_user_id
    and nullif(trim(p.display_name), '') is not null
    and p.birth_date is not null
    and nullif(trim(p.gender), '') is not null
    and nullif(trim(p.religion), '') is not null
    and nullif(trim(p.mother_tongue), '') is not null
    and nullif(trim(p.height), '') is not null
    and nullif(trim(p.city), '') is not null
    and nullif(trim(p.education), '') is not null
    and jsonb_array_length(coalesce(p.partner_preferences, '[]'::jsonb)) > 0;

  return query
  select p.registration_status, p.onboarding_completed, p.is_verified
  from public.profiles p where p.id = current_user_id;
end;
$$;
revoke execute on function public.complete_profile_onboarding() from public, anon;
grant execute on function public.complete_profile_onboarding() to authenticated;

-- RLS-safe membership helpers. These are security-definer functions so policies
-- can check registration/match state without recursively evaluating each other.
create or replace function public.is_active_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.id = profile_id
      and p.registration_status = 'active'
      and p.is_verified = true
      and p.onboarding_completed = true
      and u.email_confirmed_at is not null
  );
$$;

create or replace function public.are_profiles_matched(first_id uuid, second_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profile_likes likes
    where likes.status = 'accepted'
      and ((likes.liker_id = first_id and likes.liked_id = second_id)
        or (likes.liker_id = second_id and likes.liked_id = first_id))
  );
$$;

revoke execute on function public.is_active_profile(uuid) from public, anon;
revoke execute on function public.are_profiles_matched(uuid, uuid) from public, anon;
grant execute on function public.is_active_profile(uuid) to authenticated;
grant execute on function public.are_profiles_matched(uuid, uuid) to authenticated;

-- A browser client may edit normal profile fields, but never verification state.
revoke update on table public.profiles from authenticated;
grant update (
  email, display_name, avatar_url, gender, age, birth_date, weight, profession,
  company, city, state, country, religion, education, height, mother_tongue,
  marital_status, bio, photos, lifestyle, family, partner_preferences,
  horoscope, visibility_details, profile_visibility, profile_completion,
  compatibility, last_seen_at, updated_at
) on table public.profiles to authenticated;

drop policy if exists "Authenticated users can discover profiles" on public.profiles;
create policy "Authenticated users can discover active profiles"
on public.profiles for select to authenticated
using (
  registration_status = 'active'
  and is_verified = true
  and onboarding_completed = true
  and is_discoverable = true
);

drop policy if exists "Matched users can read each other" on public.profiles;
create policy "Matched users can read active matches"
on public.profiles for select to authenticated
using (
  registration_status = 'active'
  and is_verified = true
  and onboarding_completed = true
  and public.are_profiles_matched(auth.uid(), profiles.id)
);

drop policy if exists "Users can create likes" on public.profile_likes;
create policy "Active users can create likes"
on public.profile_likes for insert to authenticated
with check (
  auth.uid() = liker_id
  and status = 'pending'
  and public.is_active_profile(auth.uid())
  and public.is_active_profile(liked_id)
);

drop policy if exists "Recipients can respond to likes" on public.profile_likes;
create policy "Active recipients can respond to likes"
on public.profile_likes for update to authenticated
using (auth.uid() = liked_id)
with check (
  auth.uid() = liked_id
  and status in ('accepted', 'declined')
  and public.is_active_profile(auth.uid())
);

drop policy if exists "Users can read their likes" on public.profile_likes;
create policy "Active users can read active likes"
on public.profile_likes for select to authenticated
using (
  (auth.uid() = liker_id or auth.uid() = liked_id)
  and public.is_active_profile(auth.uid())
  and public.is_active_profile(liker_id)
  and public.is_active_profile(liked_id)
);

drop policy if exists "Users manage their shortlist" on public.profile_shortlists;
create policy "Active users manage their shortlist"
on public.profile_shortlists for all to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and public.is_active_profile(auth.uid())
  and public.is_active_profile(profile_id)
);

drop policy if exists "Accepted matches can read messages" on public.messages;
create policy "Active accepted matches can read messages"
on public.messages for select to authenticated
using (
  (auth.uid() = interest_liker_id or auth.uid() = interest_liked_id)
  and public.are_profiles_matched(messages.interest_liker_id, messages.interest_liked_id)
  and public.is_active_profile(auth.uid())
);

drop policy if exists "Accepted matches can send messages" on public.messages;
create policy "Active accepted matches can send messages"
on public.messages for insert to authenticated
with check (
  auth.uid() = sender_id
  and (auth.uid() = interest_liker_id or auth.uid() = interest_liked_id)
  and public.are_profiles_matched(messages.interest_liker_id, messages.interest_liked_id)
  and public.is_active_profile(auth.uid())
);

create or replace function public.get_recommended_profiles(result_limit integer default 24)
returns table (
  id uuid, display_name text, avatar_url text, age integer, profession text,
  city text, bio text, match_score integer, created_at timestamptz
)
language sql stable security definer set search_path = ''
as $$
  with viewer as (
    select u.raw_user_meta_data as metadata,
      lower(trim(coalesce(vp.gender, u.raw_user_meta_data ->> 'gender', ''))) as gender
    from auth.users u
    join public.profiles vp on vp.id = u.id
      and vp.registration_status = 'active'
      and vp.is_verified = true
      and vp.onboarding_completed = true
    where u.id = auth.uid() and u.email_confirmed_at is not null
  )
  select p.id, p.display_name, p.avatar_url, p.age, p.profession, p.city, p.bio,
    least(99, p.compatibility
      + case when lower(coalesce(p.city,'')) like '%' || lower(coalesce(v.metadata #>> '{preferences,location}','')) || '%' and coalesce(v.metadata #>> '{preferences,location}','') <> '' then 7 else 0 end
      + case when p.age between coalesce(nullif(v.metadata #>> '{preferences,age_min}','')::integer,18) and coalesce(nullif(v.metadata #>> '{preferences,age_max}','')::integer,100) then 7 else 0 end
    )::integer as match_score,
    p.created_at
  from public.profiles p
  left join auth.users candidate_user on candidate_user.id = p.id
  cross join viewer v
  where p.id <> auth.uid()
    and p.registration_status = 'active'
    and p.is_verified = true
    and p.onboarding_completed = true
    and p.is_discoverable = true
    and candidate_user.email_confirmed_at is not null
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
