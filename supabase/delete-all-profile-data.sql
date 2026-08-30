-- DANGER: This permanently deletes all application profile data.
-- Run this file manually in the Supabase SQL Editor only after taking a backup.
--
-- This keeps:
--   * public tables, functions, policies, and triggers
--   * Supabase Auth users in auth.users
--   * the profile-photos Storage bucket and its stored files
--
-- Existing Auth users will no longer have a public.profiles row after this runs.
-- The new-user trigger creates profiles only for newly registered users.

begin;

-- Delete dependent records before their profile records.
delete from public.notifications;
delete from public.profile_shortlists;
delete from public.messages;
delete from public.profile_likes;
delete from public.blocked_users;
delete from public.member_reports;
delete from public.user_privacy_settings;
delete from public.profiles;

commit;

-- Verify that every application profile table is empty.
select 'profiles' as table_name, count(*) as remaining_rows from public.profiles
union all
select 'notifications', count(*) from public.notifications
union all
select 'profile_shortlists', count(*) from public.profile_shortlists
union all
select 'profile_likes', count(*) from public.profile_likes
union all
select 'messages', count(*) from public.messages
union all
select 'blocked_users', count(*) from public.blocked_users
union all
select 'member_reports', count(*) from public.member_reports
union all
select 'user_privacy_settings', count(*) from public.user_privacy_settings;
