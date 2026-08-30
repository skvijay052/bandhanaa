-- Allow either participant to cancel a pending request or unfollow an accepted relationship.
drop policy if exists "Users can remove likes" on public.profile_likes;
create policy "Users can remove likes"
on public.profile_likes
for delete
to authenticated
using ((select auth.uid()) = liker_id or (select auth.uid()) = liked_id);
