-- A dedicated image for link-preview cards (WhatsApp/Facebook/etc.), kept
-- separate from couple_photo_url: that one is the invitation's own hero
-- photo (often portrait, framed for the page), which crops awkwardly into
-- the wide box every chat app center-crops preview images into. This lets
-- each wedding upload a proper ~1200x630 image just for sharing without
-- disturbing what guests see on the invitation itself. Same storage
-- bucket/policies as the rest of wedding-media (path-keyed on
-- {wedding_id}/..., see 20260904070000_wedding_media.sql) — upload as
-- `{wedding_id}/share.<ext>`, no bucket/policy changes needed. weddings'
-- grant is column-scoped, so — same as floor_plan_url in
-- 20260906000000_admin_portal_v2.sql — this needs its own explicit grant.

alter table public.weddings
  add column share_image_url text;

grant update (share_image_url) on public.weddings to authenticated;
