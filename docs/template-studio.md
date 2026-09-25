# Rovty Wed template studio

## Architecture review and implementation proposal

The TanStack Start / React 19 app has 21 selectable wedding themes and retains all 14 original IDs for saved invitations. Supabase owns wedding details, membership permissions, media, guest codes, RSVP and seating. Public pages resolve one published wedding by slug. The original picker only shows text swatches; the separate marketing builder approximates the guest page. Details save independently with no live canvas. Guest pages share most of their body composition.

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
- With the development server running, `python3 tests/studio_browser.py http://127.0.0.1:8081` uses Python Playwright and Chrome. It covers search/filtering, two-design comparison, modal keyboard dismissal, actual desktop/mobile viewports, local RSVP simulation, live edits without document reloads, fonts, palettes, hidden sections, content retention across templates, undo/redo, local image uploads, draft restoration and all 21 phone layouts. It asserts that no anonymous preview makes Supabase requests.

The browser suite uses sample data only. Authenticated cloud uploads, RLS enforcement, concurrent database writes and live publishing still require staging verification after the migration; no production database or account was modified during local validation.

The editor is a separate lazy bundle. Bundled photos have responsive 480/960-pixel variants, with the largest sample under 180 KB. New uploads are bounded to 1920 pixels and encoded to WebP; video is limited to 20 MB and loads only on request. Unique media paths prevent an unsaved replacement from altering a currently published image. Abandoned draft uploads are not automatically deleted, because they may still be referenced by another editor session; storage retention can be added independently.

## September 2026 collection and canvas editor

The architecture review for this iteration found that the studio already had dependable content separation, isolated live previews, uploads, save/publish and undo history. The main gaps were shared body compositions and the inability to author a section freely. This iteration extends those systems without replacing the account, identity, RSVP or publishing flows.

`collection.css` retains the legacy layout systems. `wedding-themes.ts` defines the new 21-theme collection, and `wedding/themes.css` composes real artwork around guest information. The original Rose and Lotus floral assets and falling petals are retained; plain geometric template ornaments were removed. Legacy invitations with a null `design` retain their original renderer. New theme IDs use the shared studio renderer even when `design` is null.

The **Elements** panel adds custom canvas sections with text, photographs, shapes and link buttons. Couples can begin with a blank canvas, love note, memory board or party poster. Dragging, resizing, rotation, snapping, an optional grid, text editing on the canvas, font selection, image positioning, borders, opacity, layer order, locks, visibility and duplicate/delete actions share the existing undo history. A selected overflowing text box offers a fit action. Plain form controls provide alternatives to pointer gestures.

Keyboard shortcuts work in both the panel document and preview iframe: Cmd/Ctrl+Z, Shift+Z/Y, S, D and C/V for studio layers. Arrow keys nudge a selected object; Shift makes larger adjustments. Shortcuts leave native text fields alone. Copy/paste is internal to the studio, not a system clipboard importer. Editing handles and selection state never appear on the guest website.

### Backward-compatible design data

The existing version 1 JSON structure accepts optional additions. The canvas schema needs no additional migration beyond `weddings.design`. The 21-theme collection separately requires the template constraint migration described below.

- `sections[].type = "canvas"` stores a `canvas` object: desktop/mobile height, background image/color/dimming and an ordered element array.
- Each element has its own ID, type, content, style, desktop `frame` and independent `mobile` frame, plus separate text sizes. Frames use percentages of a fixed-aspect canvas. Typography scales with the canvas width through container query units.
- Optional standard-section `layout` stores text alignment, content width, device visibility and a photo position override. Omitted values retain the template composition and global photo position.
- `canvas.ts` and `validation.ts` normalize all persisted values. Limits are eight custom sections and 24 elements per section; text, dimensions, URLs and font choices are bounded. Other section types, including RSVP and seating, remain singletons. IDs are deduplicated.
- Template changes preserve custom sections, layers, media and both layouts. Template-derived colors/fonts follow the newly selected design; explicit element colors/fonts remain intact. Anonymous session-only image URLs are removed on draft restoration, including canvas images.

### Responsive behavior and performance

Desktop preview is 1100px, tablet is 768px and the phone viewport is 375px. Phone canvas geometry activates at 650px. Fit and 50/75/100/125% zoom scale the surrounding frame without changing the guest viewport or reloading the document. Phones use separate editing and preview views; selecting a section scrolls it into view when the preview becomes visible.

Phone auto-arrangement stacks content while preserving desktop geometry. It refuses layouts that exceed the height limit or would move locked content, so it cannot silently overlap or shrink readable text. Shapes retain their authored positions. Layers and custom sections can also be duplicated or hidden for a screen size. Long names and responsive template layouts are checked at 320, 375, 768, 1100 and 1600px.

The editor remains lazy loaded and uses the existing optimized upload pipeline. Static wedding sections are memoized so canvas gestures do not rerender the rest of the wedding. Canvas images reserve their space before loading. Theme artwork uses optimized local WebP assets; font stylesheets include only the selected template and chosen custom fonts. Animations respect the existing motion setting and reduced-motion preferences.

### Additional verification

With the local test app running at `http://127.0.0.1:5178`:

```sh
python3 tests/studio_browser.py http://127.0.0.1:5178 --canvas
python3 tests/studio_browser.py http://127.0.0.1:5178 --visual
python3 tests/studio_browser.py http://127.0.0.1:5178 --save
```

The canvas suite exercises actual pointer gestures, inline edits, fitting text, locks, layers, shortcuts, undo/redo, image uploads, zoom, independent phone geometry, tablet preview, section overrides, template switching, the public renderer and restored drafts. The visual suite writes full-page captures under `/tmp/rovty-studio-after-*`. It checks every template at five widths, including long names.

The save suite reuses the adjacent dashboard project's mocked account fixture and the Wed test origin. It verifies that custom canvas data survives the authenticated save/reload path, couple identity stays locked, and conflicting saves retain the latest edits. All account and data writes are mocked; live Supabase uploads and deployment still need staging verification. `tests/canvas.test.ts` covers hostile JSON, limits, ID collisions, geometry, snapping, duplication, presets and storage compatibility.

## Twenty-one wedding themes and preview navigation

`src/lib/wedding-themes.ts` is the source of truth for the selectable order, main elements, palettes, motion and base typography. Rose keeps the persisted `classic` ID, followed by Lotus, Olive, Cherry Blossom, Orchid, Jasmine, Palm, Butterfly, Moon & Stars, Dove, Ring, Feather, Eucalyptus, Sunflower, Wheat, Candlelight, Traditional Oil Lamp, Peacock, Ocean Waves, Tree of Love and Greenery Forest.

The other 12 original IDs remain accepted by public reads, draft restoration, fonts, metadata and `getTemplate()`. They remain renderable but are no longer presented as new choices. Existing wedding rows are not renamed or rewritten. Apply `supabase/migrations/20260925000000_wedding_nature_themes.sql` **before deploying** this collection; it only expands the allowed `weddings.template` values. This change does not apply migrations or deploy automatically.

Rose and Lotus use their existing corner florals, blossoms and falling petals. The other themes use their own licensed photographs with soft edges, foliage sway, floating movement, candle glow or ocean drift. Traditional Oil Lamp features a Sri Lankan heritage lamp. Each theme carries its palette, fonts and main element through its cover, opening experience, RSVP, closing note and seating card. Couple and venue photos remain editable in their own sections. New artwork provenance and licenses are documented in `docs/theme-artwork.md` and the guest-facing `/theme-artwork-credits.html` page.

`TemplateHero.tsx` shares semantic guest information. `theme-experiences.ts` defines theme-specific starter section orders and copy, and `experiences.css` gives each unapproved theme its own hero composition, body arrangements, opener and seating treatment. The approved Rose, Lotus and Candlelight heroes are preserved exactly. Examples include Olive’s botanical folio, Orchid’s tall editorial panel, Jasmine’s central garland invitation, Palm’s tropical postcard, Moon & Stars’ centered night sky, Ocean’s panoramic shoreline and Greenery Forest’s immersive woodland setting. Existing customized section content remains untouched when switching themes. Navigation links only to enabled sections and respects desktop/mobile section visibility. “Join our celebration” scrolls to RSVP. Interactive targets are at least 44px high. Default text and primary buttons meet WCAG AA normal-text contrast; long names wrap on narrow displays. Motion off and system reduced-motion preferences suppress animation and falling petals. Collection thumbnails are static.

`PreviewFrame` handles fragment links in its own document because srcdoc iframes otherwise resolve them against the embedding editor URL. It focuses and scrolls to the requested section without navigating or rebuilding the document. Escape closes the modal even when focus is inside the preview. Published pages use native section anchors.

`SeatingExperience` uses the invitation's palette, typography, artwork and motion settings. The place card includes the guest's name, table name/number, tablemates and the uploaded hall plan. Missing plans direct guests to the hosts. Loading, missing personal links, unpublished seating and request errors have explicit states. The return link retains the guest code.

Run `python3 tests/studio_browser.py http://127.0.0.1:5178 --stationery` for all 21 themes at five viewport sizes, artwork loading, touch targets, mouse/keyboard anchor navigation, editor draft retention, section visibility, all opening covers, legacy compatibility, seating states and motion preferences. Screenshots are saved under `/tmp/rovty-stationery-*` and `/tmp/rovty-seating-*`. The fixture under `tests/` is not in the production app. The standard browser suite also checks all 21 choices, comparison, local RSVP, fonts, colors, content, undo/redo and draft restoration. Unit checks cover stable IDs, migration compatibility and default text/button contrast.

The September 25 experience revision was checked across all 21 themes at five viewport widths, including opening covers, old saved IDs, draft retention, seating states and reduced motion. Pixel comparisons confirmed that the approved Rose, Lotus and Candlelight desktop hero captures remained identical.
