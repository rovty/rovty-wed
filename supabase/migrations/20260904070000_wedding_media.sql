-- Lets the wedding owner/admins upload their own couple photo, venue
-- photo, and background music instead of the bundled placeholder assets,
-- plus a custom Google Maps link instead of the auto-generated search
-- query. Files live in Storage under `{wedding_id}/...` — that folder
-- convention is what the policies below key off of, reusing
-- has_wedding_edit_access() (same function the rest of the schema uses)
-- so "who can upload" always matches "who can edit this wedding" with no
-- separate permission model to keep in sync.

alter table public.weddings
  add column couple_photo_url text,
  add column venue_photo_url text,
  add column maps_url text,
  add column music_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-media',
  'wedding-media',
  true,
  20971520, -- 20MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read (these display on the public invitation page); writes
-- require edit access to whichever wedding the object's folder names.
create policy "Public read wedding media" on storage.objects
  for select to public
  using (bucket_id = 'wedding-media');

create policy "Admins upload their wedding media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wedding-media'
    and public.has_wedding_edit_access((storage.foldername(name))[1]::uuid)
  );

create policy "Admins update their wedding media" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'wedding-media'
    and public.has_wedding_edit_access((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'wedding-media'
    and public.has_wedding_edit_access((storage.foldername(name))[1]::uuid)
  );

create policy "Admins delete their wedding media" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wedding-media'
    and public.has_wedding_edit_access((storage.foldername(name))[1]::uuid)
  );

grant update (couple_photo_url, venue_photo_url, maps_url, music_url)
  on public.weddings to authenticated;
