"""Studio saves through the real admin components with all account/data traffic mocked."""
import asyncio
import pathlib
import sys
from urllib.parse import urlparse, parse_qs
sys.dont_write_bytecode=True
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[2]/'rovty-dashboard/tests'))
from platform_browser import fixture, WED, WEDDING
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='chrome',headless=True)
        context,page,state=await fixture(browser)
        stored=dict(WEDDING)
        writes=[]
        conflict=False
        async def data(route):
            nonlocal stored
            path=urlparse(parse_qs(urlparse(route.request.url).query)['path'][0]).path
            if not path.endswith('/weddings'):
                return await route.fallback()
            if route.request.method=='PATCH':
                payload=route.request.post_data_json
                writes.append(payload)
                if conflict:
                    return await route.fulfill(content_type='application/json',body='null')
                stored={**stored,**payload}
            return await route.fulfill(json=stored)
        await context.route('**/api/data?**',data)
        await page.goto(WED+'/sso?token=local-only',wait_until='domcontentloaded')
        await expect(page.get_by_role('button',name='Design',exact=True)).to_be_visible(timeout=30000)
        await page.get_by_role('button',name='Design',exact=True).click()
        await page.get_by_role('button',name='Open design studio',exact=True).click()
        await expect(page.get_by_label('Partner one',exact=True)).to_have_attribute('readonly','')
        await expect(page.get_by_label('Partner two',exact=True)).to_have_attribute('readonly','')
        await page.get_by_role('button',name='Elements',exact=True).click()
        await page.locator('.preset-note').click()
        await page.get_by_role('button',name='Select layer Our note',exact=True).click()
        await page.get_by_label('Element text',exact=True).fill('A promise, made ours.')
        await page.get_by_role('button',name='Save to live site',exact=True).click()
        await expect(page.get_by_role('status')).to_contain_text('Your design is saved.')
        assert not {'bride','groom','slug'} & writes[-1].keys()
        custom=next(s for s in writes[-1]['design']['sections'] if s['type']=='canvas')
        assert custom['canvas']['elements'][2]['text']=='A promise, made ours.'
        assert 'mobile' in custom['canvas']['elements'][2]
        assert writes[-1]['design']['version']==1
        await page.reload(wait_until='domcontentloaded')
        await expect(page.get_by_role('button',name='Design',exact=True)).to_be_visible(timeout=30000)
        await page.get_by_role('button',name='Design',exact=True).click()
        await page.get_by_role('button',name='Open design studio',exact=True).click()
        frame=page.frame_locator('iframe[title="Wedding website preview"]')
        await expect(frame.get_by_text('A promise, made ours.',exact=True)).to_have_count(1)
        await page.get_by_role('button',name='Elements',exact=True).click()
        await page.get_by_label('Choose a custom canvas',exact=True).select_option(label='A love note')
        await page.get_by_role('button',name='Select layer Our note',exact=True).click()
        await page.get_by_label('Element text',exact=True).fill('This latest edit must stay safe.')
        conflict=True
        await page.get_by_role('button',name='Save to live site',exact=True).click()
        await expect(page.get_by_role('alert')).to_contain_text('updated in another tab')
        await expect(page.get_by_label('Element text',exact=True)).to_have_value('This latest edit must stay safe.')
        conflict=False
        await page.get_by_role('button',name='Save to live site',exact=True).click()
        await expect(page.get_by_role('status')).to_contain_text('Your design is saved.')
        assert not state['errors'],state['errors']
        await context.close()
        await browser.close()
        print('PASS: locked couple identity, normalized canvas saves, persisted reload, optimistic concurrency conflict and retry. All writes mocked.',flush=True)
