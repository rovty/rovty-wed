# Rovty Wed plan access

Checkout, prices, promotions, orders and staff account assignments live in the shared Rovty Dashboard billing service. Open **Users, plans & payments** from `/admin/manage` to manage them with the same Rovty account.

See [the shared billing guide](../../rovty-dashboard/docs/billing.md) for setup, the exact database targets, Worker secrets, webhook configuration, recovery and validation.

Apply `supabase/migrations/20260924000000_billing_features.sql` to the **Wed data project** after applying the central `0005_billing.sql` migration. Deploy the Wed Worker alongside this migration because its new policies require server-provided plan headers.

Essential includes the standard website, templates, RSVP and guests. Complete adds seating and wedding team access. Studio adds custom canvases. Existing Wed access keeps Studio features. Wedding team permissions remain separate from purchased plans and Rovty staff authority. The original couple identity lock is unchanged.

For the account-loading and first-wedding fix, deploy the updated Wed Worker and apply `supabase/migrations/20260924010000_fix_onboarding_plan_access.sql` to the **Wed data project**, `https://bewmgfluzrypdcgnlxvg.supabase.co`. No dashboard migration is needed. The migration lets a paid owner receive their newly created row while preserving membership checks, plan restrictions and the one-wedding identity lock.

Validate with `npm test`, `npm run build`, `npm run test:worker`, and `python3 tests/platform_database.py`. The Worker test uses the real Cloudflare runtime with mocked upstream responses, covering first-time accounts, existing weddings, creation requests, revoked access and outages. It uses Miniflare from the workspace dashboard's Wrangler installation, so install `rovty-dashboard` dependencies first. The database test uses disposable local PostgreSQL containers and never connects to hosted projects.
