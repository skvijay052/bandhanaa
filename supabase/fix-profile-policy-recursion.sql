-- Hotfix for: infinite recursion detected in policy for relation "profiles"
-- Run this once in the Supabase SQL Editor after registration-verification-lifecycle.sql.

create or replace function public.is_active_profile(profile_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
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
language sql stable security definer set search_path = ''
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

drop policy if exists "Matched users can read active matches" on public.profiles;
create policy "Matched users can read active matches"
on public.profiles for select to authenticated
using (
  registration_status = 'active'
  and is_verified = true
  and onboarding_completed = true
  and public.are_profiles_matched(auth.uid(), profiles.id)
);

drop policy if exists "Active users can create likes" on public.profile_likes;
create policy "Active users can create likes"
on public.profile_likes for insert to authenticated
with check (
  auth.uid() = liker_id and status = 'pending'
  and public.is_active_profile(auth.uid())
  and public.is_active_profile(liked_id)
);

drop policy if exists "Active recipients can respond to likes" on public.profile_likes;
create policy "Active recipients can respond to likes"
on public.profile_likes for update to authenticated
using (auth.uid() = liked_id)
with check (
  auth.uid() = liked_id
  and status in ('accepted', 'declined')
  and public.is_active_profile(auth.uid())
);

drop policy if exists "Active users can read active likes" on public.profile_likes;
create policy "Active users can read active likes"
on public.profile_likes for select to authenticated
using (
  (auth.uid() = liker_id or auth.uid() = liked_id)
  and public.is_active_profile(auth.uid())
  and public.is_active_profile(liker_id)
  and public.is_active_profile(liked_id)
);

drop policy if exists "Active users manage their shortlist" on public.profile_shortlists;
create policy "Active users manage their shortlist"
on public.profile_shortlists for all to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and public.is_active_profile(auth.uid())
  and public.is_active_profile(profile_id)
);

drop policy if exists "Active accepted matches can read messages" on public.messages;
create policy "Active accepted matches can read messages"
on public.messages for select to authenticated
using (
  (auth.uid() = interest_liker_id or auth.uid() = interest_liked_id)
  and public.are_profiles_matched(interest_liker_id, interest_liked_id)
  and public.is_active_profile(auth.uid())
);

drop policy if exists "Active accepted matches can send messages" on public.messages;
create policy "Active accepted matches can send messages"
on public.messages for insert to authenticated
with check (
  auth.uid() = sender_id
  and (auth.uid() = interest_liker_id or auth.uid() = interest_liked_id)
  and public.are_profiles_matched(interest_liker_id, interest_liked_id)
  and public.is_active_profile(auth.uid())
);
