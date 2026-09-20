-- Optional, versioned studio configuration. Existing invitations remain unchanged.
alter table public.weddings add column if not exists design jsonb;
alter table public.weddings add constraint weddings_design_object
  check (design is null or (jsonb_typeof(design) = 'object' and coalesce(design -> 'version' = '1'::jsonb, false)));
grant update (design) on public.weddings to authenticated;

-- Keep the existing wedding-folder RLS policies for video and image uploads.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'video/mp4', 'video/webm']
where id = 'wedding-media';
