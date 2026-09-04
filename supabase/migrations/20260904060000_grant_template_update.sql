-- 20260904030000_wedding_members.sql revoked table-wide UPDATE on
-- public.weddings and granted it back column-by-column, listing every
-- column that existed at the time. `template` (added later, in
-- 20260904050000_wedding_template.sql) was never added to that list —
-- Postgres reports a missing column-level UPDATE grant as "permission
-- denied for table weddings", which is exactly the error the Details save
-- button hit as soon as it started sending `template` in its update.
grant update (template) on public.weddings to authenticated;
