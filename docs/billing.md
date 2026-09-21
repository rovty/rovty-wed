# Rovty Wed plan access

Checkout, prices, promotions, orders and staff account assignments live in the shared Rovty Dashboard billing service. Open **Users, plans & payments** from `/admin/manage` to manage them with the same Rovty account.

See [the shared billing guide](../../rovty-dashboard/docs/billing.md) for setup, the exact database targets, Worker secrets, webhook configuration, recovery and validation.

Apply `supabase/migrations/20260924000000_billing_features.sql` to the **Wed data project** after applying the central `0005_billing.sql` migration. Deploy the Wed Worker alongside this migration because its new policies require server-provided plan headers.

Essential includes the standard website, templates, RSVP and guests. Complete adds seating and wedding team access. Studio adds custom canvases. Existing Wed access keeps Studio features. Wedding team permissions remain separate from purchased plans and Rovty staff authority. The original couple identity lock is unchanged.
