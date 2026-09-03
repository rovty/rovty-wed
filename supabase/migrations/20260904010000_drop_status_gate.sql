-- product_access (in the dashboard's Supabase project) is now the single
-- source of truth for whether someone can use Rovty Wed at all — see
-- rovty-dashboard/worker/index.ts's SSO hand-off. Arriving at /admin here
-- already implies an active product_access row (the dashboard only mints an
-- SSO token for one), so this table no longer needs its own independent
-- "is this wedding allowed to publish" flag.
alter table public.weddings drop column if exists status;
