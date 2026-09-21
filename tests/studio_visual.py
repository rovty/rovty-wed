"""Visual checks with local sample weddings. Never submits guest or account data."""
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

NAMES = ['Lotus','Classic','Editorial','Garden','Noir','Quiet','Poruwa','Bloom','Film','Thali','Shoreline','Deco','Chapel','Nikkah']
SNAPSHOT = '''el => [...el.querySelectorAll('.site-hero, .site-section, h1, h2, .site-hero-photo, .site-gallery-grid, .site-timeline')].map(n => {const s=getComputedStyle(n); return [n.className, ...['display','fontFamily','fontSize','color','backgroundColor','padding','gridTemplateColumns','borderRadius','height','width'].map(k=>s[k])];})'''
READY = '''async () => { await Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,8000))]); await Promise.race([Promise.all([...document.querySelectorAll('img')].map(i => {i.loading='eager';return i.decode().catch(()=>{});})),new Promise(r=>setTimeout(r,3000))]); }'''

def capture(base, phase):
    legacy_css = subprocess.check_output(['git','show','HEAD:src/components/studio/studio.css'],text=True)
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome', headless=True)
        context=browser.new_context(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
        page=context.new_page()
        page.goto(base+'/templates', wait_until='domcontentloaded')
        expect(page.locator('[data-ready=true]')).to_be_visible(timeout=30000)
        for card in page.locator('.template-card').all():
            card.scroll_into_view_if_needed()
        page.evaluate('scrollTo(0,0)')
        page.screenshot(path=f'/tmp/rovty-studio-{phase}-collection.png',full_page=True)
        photo=context.new_page()
        for name in NAMES:
            page.get_by_role('button',name='Preview '+name,exact=True).click()
            frame=page.frame_locator('iframe[title="'+name+' live preview"]')
            expect(frame.locator('.site-hero')).to_be_visible(timeout=30000)
            expect(page.locator('.preview-skeleton')).to_have_count(0)
            # Render the same guest markup in a real viewport for uncropped full-page QA.
            html=frame.locator('html').evaluate('el => ({head:el.querySelector("head").innerHTML,body:el.querySelector("body").innerHTML})')
            await_html=f'<html><head><base href="{base}/">{html["head"]}</head><body>{html["body"]}</body></html>'
            photo.set_content(await_html,wait_until='load')
            photo.locator('body').evaluate(READY)
            for width in [1100,375,320,768,1600]:
                photo.set_viewport_size({'width':width,'height':900})
                photo.evaluate('scrollTo(0,0)')
                photo.locator('.site-hero').evaluate('el => el.getBoundingClientRect()')
                assert photo.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{name} overflow at {width}'
                if width in [1100,375]:
                    device='desktop' if width==1100 else 'mobile'
                    photo.locator('.site-hero').screenshot(path=f'/tmp/rovty-studio-{phase}-{name.lower()}-{device}.png')
                    photo.screenshot(path=f'/tmp/rovty-studio-{phase}-{name.lower()}-{device}-full.png',full_page=True)
                    if name in ['Lotus','Classic']:
                        current=photo.locator('main').evaluate(SNAPSHOT)
                        dest=Path(f'/tmp/rovty-studio-{phase}-{name.lower()}-{device}.json')
                        dest.write_text(json.dumps(current))
                        if phase=='after':
                            # Font network timing must not masquerade as a layout regression.
                            # Compare original and current CSS in the SAME document with loaded fonts.
                            link=photo.locator('link[href*="studio.css"]').get_attribute('href')
                            photo.locator('link[href*="studio.css"]').evaluate('el=>el.remove()')
                            style=photo.add_style_tag(content=legacy_css)
                            original=photo.locator('main').evaluate(SNAPSHOT)
                            assert current==original, f'{name} {device} differs from original CSS'
                            style.evaluate('el=>el.remove()')
                            photo.add_style_tag(url=link)
                # Long real names must wrap within the hero, not get cut off at its edge.
                if name not in ['Lotus','Classic']:
                    spans=photo.locator('h1 > span')
                    originals=spans.all_text_contents()
                    for span in spans.all():
                        span.evaluate('el => el.textContent="Alexandria-Christina"')
                    assert photo.locator('h1').evaluate('el=>el.scrollWidth<=el.clientWidth+1'), f'{name} long names at {width}'
                    for span,text in zip(spans.all(),originals):
                        span.evaluate('(el,text)=>el.textContent=text',text)
            page.keyboard.press('Escape')
            print(f'PASS: {name}, 320 / 375 / 768 / 1100 / 1600px',flush=True)
        browser.close()
        print(f'PASS: {phase} visuals for 14 templates; Lotus and Classic match their original styles.',flush=True)
