"""End-to-end checks against a running local app. Requires Python Playwright + Chrome.
Run: python3 tests/studio_browser.py http://127.0.0.1:8081
No authenticated writes or real RSVPs are performed.
"""
import sys, re
from urllib.parse import urlparse
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8081'
sys.dont_write_bytecode = True
if '--stationery' in sys.argv:
    from wedding_visual import run
    run(base)
    sys.exit(0)
if '--save' in sys.argv:
    import asyncio
    from studio_save_browser import run
    asyncio.run(run())
    sys.exit(0)
if '--canvas' in sys.argv:
    from studio_canvas_browser import run
    run(base)
    sys.exit(0)
if '--baseline' in sys.argv:
    from studio_visual import capture
    capture(base, 'before')
    sys.exit(0)
if '--visual' in sys.argv:
    from studio_visual import capture
    capture(base, 'after')
    sys.exit(0)
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    context = browser.new_context(viewport={"width":1440,"height":1000}, reduced_motion='reduce')
    page = context.new_page()
    errors, api_calls = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: api_calls.append(r.url) if 'supabase' in (urlparse(r.url).hostname or '') else None)
    page.goto(base+'/templates', wait_until='domcontentloaded')
    expect(page.locator('[data-ready=true]')).to_be_visible(timeout=30000)
    expect(page.get_by_role('heading',name='Your love story. Your kind of beautiful.')).to_be_visible()
    expect(page.get_by_role('button',name=re.compile('^Preview '))).to_have_count(21)
    page.get_by_role('button',name='Cultural',exact=True).click()
    expect(page.get_by_role('button',name=re.compile('^Preview '))).to_have_count(2)
    page.get_by_role('button',name='All designs',exact=True).click()
    page.get_by_role('textbox',name='Search designs').fill('moon')
    expect(page.get_by_role('button',name=re.compile('^Preview '))).to_have_count(1)
    page.get_by_role('button',name='Clear search').click()
    page.get_by_role('button',name='Compare Rose',exact=True).click()
    page.get_by_role('button',name='Compare Olive',exact=True).click()
    page.get_by_role('button',name='Compare',exact=True).click()
    expect(page.locator('dialog iframe')).to_have_count(2)
    page.keyboard.press('Escape')
    expect(page.locator('dialog')).to_have_count(0)
    page.get_by_role('button',name='Clear comparison').click()
    page.get_by_role('button',name='Preview Rose',exact=True).click()
    frame = page.frame_locator('iframe[title="Rose live preview"]')
    expect(frame.get_by_role('heading',level=1)).to_contain_text('Amelia')
    expect(page.locator('.preview-skeleton')).to_have_count(0)
    box = page.locator('dialog').bounding_box()
    assert box['y'] >= 0 and box['y'] + box['height'] <= 1001, box
    page.screenshot(path='/tmp/rovty-preview-desktop.png')
    page.get_by_role('button',name='Mobile preview',exact=True).click()
    expect(frame.locator('body')).to_have_css('width','375px')
    page.screenshot(path='/tmp/rovty-preview-mobile.png')
    # Preview RSVP remains local and never calls the public RPC.
    frame.get_by_role('textbox',name='Your name').fill('Preview Guest')
    frame.get_by_label('Joyfully accepts').check()
    frame.get_by_role('button',name='Send response').click()
    expect(frame.get_by_role('status')).to_contain_text('No response was sent')
    page.get_by_role('button',name='Make it yours').click()
    canvas = page.frame_locator('iframe[title="Wedding website preview"]')
    expect(page.get_by_text('Your story starts here.',exact=True)).to_be_visible()
    page.get_by_label('Partner one',exact=True).fill('Nila')
    expect(canvas.get_by_role('heading',level=1)).to_contain_text('Nila')
    # The iframe document identity stays intact while editing.
    frame_handle = page.locator('iframe').element_handle().content_frame()
    frame_handle.evaluate('document.body.dataset.testIdentity = "same-document"')
    page.get_by_label('Your welcome note').fill('Our own words, kept in every design.')
    assert frame_handle.evaluate('document.body.dataset.testIdentity') == 'same-document'
    page.get_by_role('button',name='Style',exact=True).click()
    page.get_by_role('button',name='Apply Olive & ivory palette').click()
    expect(canvas.locator('main')).to_have_css('--site-primary','#59634e')
    page.get_by_role('button',name='Timeless romance',exact=False).click()
    expect(canvas.locator('h1')).to_have_css('font-family',re.compile('Cormorant Garamond'))
    page.screenshot(path='/tmp/rovty-editor-desktop.png')
    page.get_by_role('button',name='Sections',exact=True).click()
    page.get_by_role('checkbox',name='Show Countdown',exact=True).uncheck()
    expect(canvas.get_by_role('timer')).to_have_count(0)
    page.get_by_role('button',name='Our story Click to customize',exact=True).click()
    page.get_by_label('Your words',exact=True).fill('We met under a summer sky.')
    expect(canvas.get_by_text('We met under a summer sky.',exact=True)).to_have_count(1)
    page.get_by_role('button',name='Designs',exact=True).click()
    page.get_by_role('button',name='Switch to Moon & Stars',exact=True).click()
    expect(canvas.get_by_role('heading',level=1)).to_contain_text('Nila')
    expect(canvas.get_by_text('We met under a summer sky.',exact=True)).to_have_count(1)
    expect(canvas.get_by_role('timer')).to_have_count(0)
    page.get_by_role('button',name='Undo',exact=True).click()
    expect(canvas.locator('.hero-classic')).to_have_count(1)
    page.get_by_role('button',name='Redo',exact=True).click()
    expect(canvas.locator('.hero-moon-stars')).to_have_count(1)
    # Media upload stays local in an anonymous draft.
    page.get_by_role('button',name='Photos',exact=True).click()
    page.locator('input[type=file]').first.set_input_files(str(Path('src/assets/studio-celebration.webp').resolve()))
    expect(page.locator('.editor-photo-preview img')).to_have_attribute('src',re.compile('^blob:'))
    page.get_by_label('Photo position · top to bottom').fill('25')
    expect(canvas.locator('main')).to_have_css('--photo-position','50% 25%')
    page.get_by_role('button',name='Preview & publish',exact=True).click()
    expect(page.get_by_role('link',name='Sign in to publish',exact=False)).to_have_attribute('href','/auth')
    page.get_by_role('button',name='Back to editing',exact=True).click()
    # Restore the browser draft, including dates and hidden sections.
    expect(page.get_by_role('status')).to_contain_text('Draft saved on this device')
    page.reload(wait_until="domcontentloaded")
    expect(page.locator("[data-ready=true]")).to_be_visible(timeout=30000)
    page.get_by_role('button',name='Continue your draft',exact=False).click()
    page.get_by_role('button',name='Content',exact=True).click()
    expect(page.get_by_label('Partner one',exact=True)).to_have_value('Nila')
    canvas = page.frame_locator('iframe[title="Wedding website preview"]')
    expect(canvas.get_by_text('We met under a summer sky.',exact=True)).to_have_count(1)
    # Real narrow viewport, independently laid out editor.
    page.set_viewport_size({'width':390,'height':844})
    expect(page.get_by_role('button',name='Edit your website',exact=True)).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path='/tmp/rovty-editor-phone.png')
    page.get_by_role('button',name='Live preview',exact=True).click()
    expect(canvas.locator('body')).to_have_css('width','375px')
    page.screenshot(path='/tmp/rovty-editor-phone-preview.png')
    # Exercise every template at an actual phone width.
    page.get_by_role('button',name='Edit your website',exact=True).click()
    page.get_by_role('button',name='Designs',exact=True).click()
    for name in ['Rose', 'Lotus', 'Olive', 'Cherry Blossom', 'Orchid', 'Jasmine', 'Palm', 'Butterfly', 'Moon & Stars', 'Dove', 'Ring', 'Feather', 'Eucalyptus', 'Sunflower', 'Wheat', 'Candlelight', 'Traditional Oil Lamp', 'Peacock', 'Ocean Waves', 'Tree of Love', 'Greenery Forest']:
        page.get_by_role('button',name=f'Switch to {name}',exact=True).click()
        page.get_by_role('button',name='Live preview',exact=True).click()
        expect(canvas.get_by_role('heading',level=1)).to_contain_text('Nila')
        frame_handle = page.locator('iframe').element_handle().content_frame()
        assert frame_handle.evaluate('document.documentElement.scrollWidth <= innerWidth'),name
        page.get_by_role('button',name='Edit your website',exact=True).click()
    assert not api_calls, f'Anonymous preview unexpectedly called Supabase: {api_calls}'
    assert not errors, f'Browser runtime errors: {errors}'
    print('PASS: discovery, filters, compare, preview RSVP, live editing without reload, palettes, fonts, section visibility, content retention, undo/redo, upload, draft restoration and all 21 mobile themes.')
    context.close()
    browser.close()
