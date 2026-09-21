# Rovty Wed — agent notes

Rovty Wed is the wedding invitation, RSVP, guest and seating product at
`wed.rovty.com`. It was originally scaffolded with Lovable; it is now
maintained directly in this repo. The `@lovable.dev/vite-tanstack-config`
Vite preset is still used for the TanStack Start + Nitro (Cloudflare) build.

## Commands

```bash
npm install
cp .env.example .env     # this project's Supabase values + shared secrets
npm run dev              # TanStack Start dev server
npm run typecheck        # tsc --noEmit
npm run build            # typecheck + vite build → .output/ (Nitro, Cloudflare)
npm run lint             # eslint (prettier rules included)
npm run format           # prettier --write .
npx wrangler dev --config .output/server/wrangler.json   # serve the built Worker locally
```

Deploy: `npm run deploy` validates production configuration before building.
Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `WED_WORKER_SECRET`) via
`wrangler secret put`; `SUPABASE_URL` is a plain var in `wrangler.jsonc`.

## Architecture

- **Routes** (`src/routes/`): `/` product landing (indexable); `/$slug` guest
  invitation (SSR, per-wedding OG tags, `noindex`); `/$slug/seating` guest
  seat lookup; `/$slug/calendar.ics`; `/admin` couple portal (client-only);
  `/auth` sign-in (Google / SSO only, no signup); `/sso` redeems a dashboard
  hand-off token; `/api/team` team invites; `/sitemap.xml`; `/templates` public collection and design studio.
- **Templates**: 14 ids in `src/lib/wedding.ts` (`WEDDING_TEMPLATES`,
  `TEMPLATE_META`) + `.theme-*` blocks in `src/styles.css`. Fonts load per
  template via `templateFontsHref()`; studio previews load fonts on demand.
  `src/components/wed-landing/templates.ts` must stay in sync (it throws at
  startup if not).
- **Data**: Supabase (`supabase/migrations/`). Public reads go only through
  security-definer RPCs keyed by `(slug, guest code)`; those RPCs are
  throttled per client (`rpc_attempts`) and RSVP is one-row-per-guest
  (`20260919000000_rsvp_hardening.sql`). Members/roles gate everything else via RLS.
- **Identity**: couples sign in via the Rovty dashboard → `/sso`. The Worker
  presents `WED_WORKER_SECRET`, links the permanent platform UUID, and binds
  each product session to its central session. `/api/data` checks central
  session/access on every private request; original wedding RLS still applies.
  `/api/session` checks or revokes platform authorization. `/api/manage` and
  `/api/team` require central authorization plus their existing role checks.
  See `../rovty-dashboard/docs/platform-identity.md` before rollout. Staging
  uses `npm run build:staging` and distinct projects/configuration/secrets.

## Conventions

- Guest codes: 8 chars, CSPRNG (`randCode()` in `admin/utils.ts`).
- All guest-facing images live in `src/assets/*.webp`; never commit multi‑MB PNGs.
- Do not add "whichever wedding is published" helpers — every public route is under `/$slug`.
- Do not force-push or rewrite published history.

## Design studio

`src/lib/studio/` owns the versioned schema, catalog and optimized uploads.
`src/components/studio/` contains discovery, editor panels and the renderer shared
by previews and public websites. Nullable `weddings.design` opts into the new
renderer; null retains existing invitations. Apply
`20260920000000_wedding_design.sql` before deploying studio saves.
See `docs/template-studio.md` for architecture, rollout and validation commands.
