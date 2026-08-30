-- Run this file in the Supabase SQL Editor for the same project referenced by
-- NEXT_PUBLIC_SUPABASE_URL. It is safe to run more than once.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profile-photos',
  'profile-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view profile photos" on storage.objects;
drop policy if exists "Users can upload their profile photos" on storage.objects;
drop policy if exists "Users can update their profile photos" on storage.objects;
drop policy if exists "Users can delete their profile photos" on storage.objects;

create policy "Public can view profile photos"
on storage.objects for select
using (bucket_id = 'profile-photos');

create policy "Users can upload their profile photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can update their profile photos"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can delete their profile photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Verification: this should return one row with id = profile-photos.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'profile-photos';
