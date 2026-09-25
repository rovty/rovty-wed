"""Stationery layout and motion checks using only local sample weddings."""
import re
from playwright.sync_api import sync_playwright, expect

NAMES = ['Rose', 'Lotus', 'Olive', 'Cherry Blossom', 'Orchid', 'Jasmine', 'Palm', 'Butterfly', 'Moon & Stars', 'Dove', 'Ring', 'Feather', 'Eucalyptus', 'Sunflower', 'Wheat', 'Candlelight', 'Traditional Oil Lamp', 'Peacock', 'Ocean Waves', 'Tree of Love', 'Greenery Forest']
IDS = dict(zip(NAMES, ['classic', 'lotus', 'olive', 'cherry-blossom', 'orchid', 'jasmine', 'palm', 'butterfly', 'moon-stars', 'dove', 'rings', 'feather', 'eucalyptus', 'sunflower', 'wheat', 'candlelight', 'oil-lamp', 'peacock', 'ocean', 'tree-of-love', 'forest']))


def run(base):
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(base + '/templates', wait_until='domcontentloaded')
        expect(page.locator('[data-ready=true]')).to_be_visible(timeout=30000)
        photo = context.new_page()
        for name in NAMES:
            page.get_by_role('button', name='Preview ' + name, exact=True).click()
            frame = page.frame_locator('iframe[title="' + name + ' live preview"]')
            expect(frame.locator('.site-hero')).to_be_visible(timeout=30000)
            expect(page.locator('.preview-skeleton')).to_have_count(0)
            # Clicking and keyboard activation must scroll the existing srcdoc, never reload it.
            handle = page.locator('iframe').element_handle().content_frame()
            handle.evaluate('document.body.dataset.navigationIdentity = "same-document"')
            frame.locator('.invitation-rsvp').click()
            expect(frame.locator('#rsvp')).to_be_in_viewport()
            assert handle.evaluate('document.body.dataset.navigationIdentity') == 'same-document'
            assert handle.url == 'about:srcdoc', f'{name}: preview navigated to {handle.url}'
            expect(frame.locator('.studio-shell')).to_have_count(0)
            frame.locator('.invitation-nav a[href="#section-venue"]').click()
            expect(frame.locator('#section-venue')).to_be_in_viewport()
            frame.locator('.invitation-rsvp').press('Enter')
            expect(frame.locator('#rsvp')).to_be_in_viewport()
            assert handle.evaluate('document.body.dataset.navigationIdentity') == 'same-document'
            handle.evaluate('scrollTo({top:0,behavior:"instant"})')
            html = frame.locator('html').evaluate('el => ({head:el.querySelector("head").innerHTML, body:el.querySelector("body").innerHTML})')
            photo.set_content(f'<html><head><base href="{base}/">{html["head"]}</head><body>{html["body"]}</body></html>', wait_until='load')
            photo.evaluate('async () => {await document.fonts.ready; await Promise.all([...document.images].map(i=>{i.loading="eager";return i.decode().catch(()=>{});}));}')
            for width in [320, 389, 768, 1100, 1600]:
                photo.set_viewport_size({'width': width, 'height': 950})
                assert photo.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{name}: overflow at {width}'
                assert photo.locator('h1').evaluate('el => el.scrollWidth <= el.clientWidth + 1'), f'{name}: title overflow at {width}'
                spans = photo.locator('h1 > span')
                originals = spans.all_text_contents()
                for span in spans.all():
                    span.evaluate('el => el.textContent="Alexandria-Christina"')
                assert photo.locator('h1').evaluate('el => el.scrollWidth <= el.clientWidth + 1'), f'{name}: long names at {width}'
                for span, text in zip(spans.all(), originals):
                    span.evaluate('(el, text) => el.textContent=text', text)
                expect(photo.locator(".site-hero .wedding-atmosphere")).to_have_count(1)
                assert photo.locator(".wedding-atmosphere img").evaluate_all("els => els.length > 0 && els.every(i => i.complete && i.naturalWidth > 0)"), f"{name}: artwork missing"
                # Reject masks/arches on template photos and shape ornaments throughout the invitation.
                assert photo.locator('.site-hero .template-ornament, .site-hero .site-symbol').count() == 0
                assert photo.locator('.site-hero img, .site-section img').evaluate_all('els => els.every(el => getComputedStyle(el).borderRadius === "0px" && getComputedStyle(el).clipPath === "none")'), f'{name}: shaped photograph at {width}'
                assert photo.locator('.invitation-nav a, .invitation-actions a').evaluate_all('els => els.filter(el=>el.getClientRects().length).every(el => el.getBoundingClientRect().height >= 44)'), f'{name}: small touch target at {width}'
                if width in [389, 1100]:
                    photo.locator('.site-hero').screenshot(path=f'/tmp/rovty-stationery-{name.lower()}-{width}.png')
                    photo.screenshot(path=f'/tmp/rovty-stationery-{name.lower()}-{width}-full.png', full_page=True)
            page.keyboard.press('Escape')
            expect(page.locator('dialog')).to_have_count(0)
            print(f'PASS: {name} invitation at five widths', flush=True)

        # The same anchor behavior must work during editing without losing the draft.
        page.get_by_role('button', name='Preview Olive', exact=True).click()
        page.get_by_role('button', name='Make it yours', exact=True).click()
        page.get_by_label('Partner one', exact=True).fill('Sofia')
        editor = page.frame_locator('iframe[title="Wedding website preview"]')
        editor_handle = page.locator('iframe').element_handle().content_frame()
        editor_handle.evaluate('document.body.dataset.navigationIdentity = "editor-document"')
        editor.locator('.invitation-rsvp').click()
        expect(editor.locator('#rsvp')).to_be_in_viewport()
        assert editor_handle.evaluate('document.body.dataset.navigationIdentity') == 'editor-document'
        expect(editor.locator('h1')).to_contain_text('Sofia')
        expect(page.get_by_label('Partner one', exact=True)).to_have_value('Sofia')
        page.goto(base + '/templates', wait_until='domcontentloaded')
        expect(page.locator('[data-ready=true]')).to_be_visible(timeout=30000)
        print('PASS: mouse/keyboard section navigation stays inside all previews and preserves editor drafts', flush=True)

        # Import a dev-only fixture into a separate hydrated document. No public RPCs or writes.
        seat = context.new_page()
        seat.on('pageerror', lambda e: errors.append(str(e)))
        seat.goto(base + '/templates', wait_until='domcontentloaded')
        expect(seat.locator('[data-ready=true]')).to_be_visible(timeout=30000)
        seat.evaluate('async () => {window.fixture = await import("/tests/wedding-visual-fixture.tsx");}')

        def render(**props):
            seat.evaluate('props => window.fixture.renderFixture(props)', props)
            expect(seat.locator('main')).to_be_visible()

        for name in NAMES:
            render(template=IDS[name])
            expect(seat.locator('.seating-table-number')).to_have_text('04')
            expect(seat.get_by_text('The Rose Garden', exact=True)).to_be_visible()
            expect(seat.locator('.seating-return')).to_have_attribute('href', '/amelia-and-james?code=DEMO1234')
            seat.evaluate('async () => {await document.fonts.ready; await Promise.all([...document.images].map(i=>{i.loading="eager";return i.decode().catch(()=>{});}));}')
            for width in [320, 389, 768, 1100]:
                seat.set_viewport_size({'width': width, 'height': 950})
                assert seat.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{name}: seating overflow at {width}'
                if name in ['Olive', 'Rose', 'Lotus', 'Moon & Stars', 'Traditional Oil Lamp', 'Greenery Forest'] and width in [389, 1100]:
                    seat.screenshot(path=f'/tmp/rovty-seating-{name.lower()}-{width}.png', full_page=True)
        render(floorPlan=False)
        expect(seat.locator('.seating-map-marker')).to_have_count(0)
        expect(seat.get_by_text('Our hosts will be happy to show you the way.', exact=False)).to_be_visible()
        for status in ['loading', 'missing', 'unavailable', 'error']:
            render(status=status)
            expect(seat.get_by_role('status')).to_be_visible()
            expect(seat.locator('.seating-table-number')).to_have_count(0)
        render(custom=True)
        expect(seat.locator('main')).to_have_css('--wedding-accent', '#795551')
        expect(seat.locator('h1')).to_have_css('font-family', re.compile('Cormorant Garamond'))
        print('PASS: seating layouts, table names, personal links, custom style and all empty states', flush=True)

        render(invitation=True, hidden=['rsvp', 'venue'])
        expect(seat.locator('.invitation-rsvp')).to_have_count(0)
        expect(seat.locator('.invitation-hero a[href="#section-venue"]')).to_have_count(0)
        render(invitation=True, rsvpVisibility='desktop')
        seat.set_viewport_size({'width':389,'height':950})
        expect(seat.locator('.invitation-rsvp')).to_be_hidden()
        seat.set_viewport_size({'width':1100,'height':950})
        expect(seat.locator('.invitation-rsvp')).to_be_visible()

        # All collection covers must open to the same invitation without a navigation.
        for name in NAMES:
            render(template=IDS[name], invitation=True, publicView=True, motion='none')
            expect(seat.locator('.invite-opener')).to_be_visible()
            seat.locator('.invite-opener button').first.click()
            expect(seat.locator('.invite-opener')).to_have_count(0)
            expect(seat.locator('.site-hero')).to_be_visible()
            assert seat.evaluate('getComputedStyle(document.body).overflow') != 'hidden'
        # Retired saved IDs retain their renderer, fonts and catalog defaults.
        for template in ['poruwa','thali','chapel','nikkah','noir','editorial','quiet','garden','shoreline','deco','film','bloom']:
            render(template=template, invitation=True, motion='none')
            expect(seat.locator('h1')).to_contain_text('Amelia')
        render(template='oil-lamp', legacy=True, motion='none')
        expect(seat.locator('.themed-opener')).to_be_visible()
        seat.locator('.invite-opener button').first.click()
        expect(seat.locator('.hero-oil-lamp')).to_be_visible()
        print('PASS: all 21 opening covers, legacy saved designs and new themes without design JSON', flush=True)

        # Test actual motion in both the preview iframe and a full-page invitation.
        seat.emulate_media(reduced_motion='no-preference')
        render(invitation=True, motion='expressive')
        expect(seat.locator('.invitation-title')).to_have_css('animation-name', 'wedding-arrive')
        expect(seat.locator('.theme-scene-image')).to_have_css('animation-name', 'theme-sway')
        target = seat.locator('[data-wedding-reveal="waiting"]').first
        expect(target).to_have_count(1)
        target.evaluate('el => el.scrollIntoView()')
        expect(seat.locator('[data-wedding-reveal="visible"]').first).to_be_visible()
        seat.emulate_media(reduced_motion='reduce')
        expect(seat.locator('[data-wedding-reveal="waiting"]')).to_have_count(0)
        expect(seat.locator('.theme-scene-image')).to_have_css('animation-name', 'none')
        seat.emulate_media(reduced_motion='no-preference')
        render(invitation=True, motion='none')
        expect(seat.locator('.theme-scene-image')).to_have_css('animation-name', 'none')
        expect(seat.locator('[data-wedding-reveal="waiting"]')).to_have_count(0)
        page.emulate_media(reduced_motion='no-preference')
        page.get_by_role('button', name='Preview Olive', exact=True).click()
        frame = page.frame_locator('iframe[title="Olive live preview"]')
        target = frame.locator('[data-wedding-reveal="waiting"]').first
        expect(target).to_have_count(1)
        target.evaluate('el => el.scrollIntoView()')
        expect(frame.locator('[data-wedding-reveal="visible"]').first).to_be_visible()
        for template in ['classic', 'lotus']:
            render(template=template, invitation=True, motion='gentle')
            expect(seat.locator('.theme-particles .animate-petal').first).to_be_visible()
            seat.emulate_media(reduced_motion='reduce')
            expect(seat.locator('.theme-particles')).to_be_hidden()
            seat.emulate_media(reduced_motion='no-preference')
            render(template=template, invitation=True, motion='none')
            expect(seat.locator('.theme-particles')).to_be_hidden()
        assert not errors, errors
        print('PASS: full-page and iframe scroll reveals, expressive motion, live reduced-motion changes and motion off', flush=True)
        browser.close()
