-- Secure helper for the Discover mobile Recent Visitors section.
-- Run once in the Supabase SQL Editor after supabase/user-activity.sql.

create or replace function public.get_recent_profile_visitors(result_limit integer default 8)
returns table (
  id uuid,
  display_name text,
  profession text,
  city text,
  state text,
  country text,
  avatar_url text,
  photos text[],
  gender text,
  last_seen_at timestamptz,
  viewed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    recent.id,
    recent.display_name,
    recent.profession,
    recent.city,
    recent.state,
    recent.country,
    recent.avatar_url,
    recent.photos,
    recent.gender,
    recent.last_seen_at,
    recent.viewed_at
  from (
    select distinct on (ua.user_id)
      p.id,
      p.display_name,
      p.profession,
      p.city,
      p.state,
      p.country,
      p.avatar_url,
      p.photos,
      p.gender,
      p.last_seen_at,
      ua.created_at as viewed_at
    from public.user_activity ua
    join public.profiles p on p.id = ua.user_id
    where ua.activity_type = 'profile_viewed'
      and ua.target_user_id = (select auth.uid())
      and ua.user_id <> (select auth.uid())
      and p.is_discoverable = true
    order by ua.user_id, ua.created_at desc
  ) recent
  order by recent.viewed_at desc
  limit greatest(1, least(coalesce(result_limit, 8), 12));
$$;

revoke execute on function public.get_recent_profile_visitors(integer) from public, anon;
grant execute on function public.get_recent_profile_visitors(integer) to authenticated;
