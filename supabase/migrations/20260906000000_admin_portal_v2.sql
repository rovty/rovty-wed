-- Backs the redesigned mobile admin portal:
--   * guests.phone + guests.invited_at — the WhatsApp "Send" screen needs a
--     number to open wa.me with, and a way to know which invitations still
--     need sending (vs. already marked sent) instead of every guest looking
--     unsent forever.
--   * weddings.floor_plan_url — the hall-plan screen positions tables over
--     a photo of the venue's actual floor plan instead of a blank grid.
-- No RLS changes: guests already has a blanket
-- `grant select, insert, update, delete ... to authenticated` (see
-- 20260904000000_multi_tenant.sql) covering any column, including these
-- two. weddings' grant is column-scoped (couple/venue/maps/music from
-- 20260904070000_wedding_media.sql), so floor_plan_url needs the same
-- explicit grant + the same wedding-media storage bucket (already public,
-- already keyed off has_wedding_edit_access() by the `{wedding_id}/...`
-- path prefix, already allows image/jpeg|png|webp) — no bucket/policy
-- changes needed, just upload it as `{wedding_id}/floor_plan.<ext>`.

alter table public.guests
  add column phone text,
  add column invited_at timestamptz;

alter table public.weddings
  add column floor_plan_url text;

grant update (floor_plan_url) on public.weddings to authenticated;
