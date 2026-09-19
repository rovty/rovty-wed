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

Deploy: `npx wrangler deploy --config .output/server/wrangler.json` after a
build. Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `TEAM_GRANT_SHARED_SECRET`) via
`wrangler secret put`; `SUPABASE_URL` is a plain var in `wrangler.jsonc`.

## Architecture

- **Routes** (`src/routes/`): `/` product landing (indexable); `/$slug` guest
  invitation (SSR, per-wedding OG tags, `noindex`); `/$slug/seating` guest
  seat lookup; `/$slug/calendar.ics`; `/admin` couple portal (client-only);
  `/auth` sign-in (Google / SSO only, no signup); `/sso` redeems a dashboard
  hand-off token; `/api/team` team invites; `/sitemap.xml`.
- **Templates**: 14 ids in `src/lib/wedding.ts` (`WEDDING_TEMPLATES`,
  `TEMPLATE_META`) + `.theme-*` blocks in `src/styles.css`. Fonts load per
  template via `templateFontsHref()`; only `/admin` and `/` load all of them.
  `src/components/wed-landing/templates.ts` must stay in sync (it throws at
  startup if not).
- **Data**: Supabase (`supabase/migrations/`). Public reads go only through
  security-definer RPCs keyed by `(slug, guest code)`; those RPCs are
  throttled per client (`rpc_attempts`) and RSVP is one-row-per-guest
  (`20260919000000_rsvp_hardening.sql`). Members/roles gate everything else via RLS.
- **Identity**: couples sign in via the Rovty dashboard → `/sso`. `/sso`
  presents `TEAM_GRANT_SHARED_SECRET` to the dashboard's `/api/sso/resolve`.

## Conventions

- Guest codes: 8 chars, CSPRNG (`randCode()` in `admin/utils.ts`).
- All guest-facing images live in `src/assets/*.webp`; never commit multi‑MB PNGs.
- Do not add "whichever wedding is published" helpers — every public route is under `/$slug`.
- Do not force-push or rewrite published history.
