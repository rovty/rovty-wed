# Rovty Wed template studio

## Architecture review and implementation proposal

The existing TanStack Start / React 19 app has 14 stable template IDs, CSS themes, per-template opening animations and hero layouts. Supabase owns wedding details, membership permissions, media, guest codes, RSVP and seating. Public pages resolve one published wedding by slug. The original picker only shows text swatches; the separate marketing builder approximates the guest page. Details save independently with no live canvas. Guest pages share most of their body composition.

1. **Template system:** retain all IDs and existing invitations. Add a typed catalog of compositions, curated categories, palettes and suggested section orders. The full renderer is shared by live previews and saved studio designs.
2. **Design system:** ivory studio surfaces, ink typography, olive actions, thin dividers and generous spacing. Guest websites inherit their own visual system. No UI controls leak into a published invitation.
3. **Data:** optional versioned `weddings.design` JSONB stores presentation and additional content. Canonical couple/date/venue fields remain in their existing columns. JSON is normalized on read; null or unsupported versions use the existing renderer.
4. **Components:** discovery, modal preview/comparison, isolated preview frame, editor panels and wedding renderer are separate modules. Secure RSVP, calendars, music, openers and guest seating remain shared services/components.
5. **Customization:** immediate local state, bounded undo/redo, explicit server save, optimistic concurrency, palettes and typography via CSS custom properties, section registry, safe URLs and bounded media uploads. Template switches retain all section content.
6. **Editor UX:** discover → preview/compare → customize → review → save/publish. Anonymous visitors retain a local draft and can bring it into the authenticated editor. Saving a published wedding explicitly updates its live site; the existing publish switch remains authoritative.
7. **Responsive strategy:** actual iframe viewports, with scaling applied outside the document. Desktop is a panel and canvas; mobile uses edit/preview modes and a horizontal panel navigation. Published layouts rearrange intentionally at narrow widths.
8. **Performance:** lazy editor import, one selected template font stylesheet, image dimensions/aspect ratios, lazy below-fold media, bounded WebP uploads, no autoplay video, reduced-motion support and no iframe reloads on ordinary edits.

## Rollout

Apply `supabase/migrations/20260920000000_wedding_design.sql` before deploying. It adds a nullable column and column-level update grant under the existing RLS rules; it does not alter guest access. Existing invitations retain their renderer until a studio design is saved. No migration is applied automatically by this change.

The public `/templates` studio runs without an account. Anonymous image previews are session-local; cloud uploads and publishing use the existing authenticated wedding account. The guestbook section uses the secure RSVP message channel rather than introducing an anonymous public message board. Video accepts MP4/WebM with an explicit upload limit. Template changes reset palette/font overrides to the new designer defaults while preserving wedding and section content; undo restores the previous design.

## Validation

- `npm test`: normalizes untrusted JSON, rejects unsafe URLs/CSS values, bounds settings and preserves hidden content/order.
- `npm run typecheck`, `npm run lint`, `npm run build`: TypeScript, repository conventions and the Cloudflare production bundle.
- With the development server running, `python3 tests/studio_browser.py http://127.0.0.1:8081` uses Python Playwright and Chrome. It covers search/filtering, two-design comparison, modal keyboard dismissal, actual desktop/mobile viewports, local RSVP simulation, live edits without document reloads, fonts, palettes, hidden sections, content retention across templates, undo/redo, local image uploads, draft restoration and all 14 phone layouts. It asserts that no anonymous preview makes Supabase requests.

The browser suite uses sample data only. Authenticated cloud uploads, RLS enforcement, concurrent database writes and live publishing still require staging verification after the migration; no production database or account was modified during local validation.

The editor is a separate lazy bundle. Bundled photos have responsive 480/960-pixel variants, with the largest sample under 180 KB. New uploads are bounded to 1920 pixels and encoded to WebP; video is limited to 20 MB and loads only on request. Unique media paths prevent an unsaved replacement from altering a currently published image. Abandoned draft uploads are not automatically deleted, because they may still be referenced by another editor session; storage retention can be added independently.
