-- Run this file once in the Supabase SQL Editor.
-- Shortlists are private bookmarks and do not create follow/interest requests.

create table if not exists public.profile_shortlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, profile_id),
  check (user_id <> profile_id)
);

create index if not exists profile_shortlists_user_created_idx
  on public.profile_shortlists (user_id, created_at desc);

alter table public.profile_shortlists enable row level security;
revoke all on table public.profile_shortlists from anon;
grant select, insert, delete on table public.profile_shortlists to authenticated;

drop policy if exists "Users manage their shortlist" on public.profile_shortlists;
create policy "Users manage their shortlist"
  on public.profile_shortlists for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
