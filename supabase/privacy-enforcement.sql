-- Enforce the choices saved by Settings & Privacy.
-- Run after fix-profile-policy-recursion.sql.

create or replace function public.can_view_profile(viewer_id uuid, subject_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select viewer_id = subject_id or exists (
    select 1 from public.profiles p
    left join public.user_privacy_settings s on s.user_id = p.id
    where p.id = subject_id
      and p.registration_status = 'active' and p.is_verified = true
      and p.onboarding_completed = true and p.is_discoverable = true
      and not exists (
        select 1 from public.blocked_users b
        where (b.blocker_id = viewer_id and b.blocked_id = subject_id)
           or (b.blocker_id = subject_id and b.blocked_id = viewer_id)
      )
      and (
        coalesce(s.profile_visibility, 'everyone') = 'everyone'
        or (coalesce(s.profile_visibility, 'everyone') = 'matches'
          and public.are_profiles_matched(viewer_id, subject_id))
      )
  );
$$;
revoke execute on function public.can_view_profile(uuid, uuid) from public, anon;
grant execute on function public.can_view_profile(uuid, uuid) to authenticated;

create or replace function public.get_profile_privacy(profile_ids uuid[])
returns table (user_id uuid, show_age boolean, show_last_seen boolean)
language sql stable security definer set search_path = ''
as $$
  select p.id,
    case when p.id = (select auth.uid()) then true else not coalesce(s.hide_age, false) end,
    case when p.id = (select auth.uid()) then true
      else coalesce(s.show_online_status, true) and (
        coalesce(s.last_seen_visibility, 'matches') = 'everyone'
        or (coalesce(s.last_seen_visibility, 'matches') = 'matches'
          and public.are_profiles_matched((select auth.uid()), p.id))
      )
    end
  from public.profiles p
  left join public.user_privacy_settings s on s.user_id = p.id
  where p.id = any(profile_ids)
    and public.can_view_profile((select auth.uid()), p.id);
$$;
revoke execute on function public.get_profile_privacy(uuid[]) from public, anon;
grant execute on function public.get_profile_privacy(uuid[]) to authenticated;

drop policy if exists "Authenticated users can discover profiles" on public.profiles;
drop policy if exists "Authenticated users can discover active profiles" on public.profiles;
drop policy if exists "Matched users can read each other" on public.profiles;
drop policy if exists "Matched users can read active matches" on public.profiles;
drop policy if exists "Users read privacy-visible active profiles" on public.profiles;
create policy "Users read privacy-visible active profiles"
on public.profiles for select to authenticated
using (public.can_view_profile((select auth.uid()), profiles.id));

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
      and vp.registration_status = 'active' and vp.is_verified = true
      and vp.onboarding_completed = true
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  )
  select p.id, p.display_name, p.avatar_url, p.age, p.profession, p.city, p.bio,
    least(99, p.compatibility
      + case when lower(coalesce(p.city,'')) like '%' || lower(coalesce(v.metadata #>> '{preferences,location}','')) || '%' and coalesce(v.metadata #>> '{preferences,location}','') <> '' then 7 else 0 end
      + case when p.age between coalesce(nullif(v.metadata #>> '{preferences,age_min}','')::integer,18) and coalesce(nullif(v.metadata #>> '{preferences,age_max}','')::integer,100) then 7 else 0 end
    )::integer as match_score, p.created_at
  from public.profiles p
  left join auth.users candidate_user on candidate_user.id = p.id
  cross join viewer v
  where p.id <> (select auth.uid())
    and public.can_view_profile((select auth.uid()), p.id)
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
