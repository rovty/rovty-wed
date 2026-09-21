"""Run with the local app origins from dashboard/docs/platform-navigation.md.
All account, wedding, contact and chat traffic is mocked; no messages leave the test.
"""
import asyncio
import json
import pathlib
import sys
from urllib.parse import urlparse, parse_qs
sys.dont_write_bytecode = True
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / 'rovty-dashboard/tests'))
from platform_browser import fixture, WED, SITE, DASH, WEDDING
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='chrome', headless=True)
        for width in [1440, 390]:
            context, page, state = await fixture(browser, width=width)
            support = {'sessions': 0, 'sent': [], 'rows': [], 'offline': False, 'delivery': True, 'patches': []}
            async def assist(r):
                path = urlparse(r.request.url).path
                if path.endswith('/session'):
                    if support['offline']:
                        return await r.fulfill(status=503, json={'error': 'Offline'})
                    support['sessions'] += 1
                    support['rows'] = []
                    return await r.fulfill(status=201, json={'token': f'chat-{support["sessions"]}', 'agent': 'Rovty'})
                if path.endswith('/message'):
                    data = r.request.post_data_json
                    support['sent'].append(data)
                    row = {'id': data.get('retryId', len(support['rows']) + 1), 'sender': 'visitor', 'agent': None, 'body': data['body'], 'at': '2026-09-21T00:00:00Z', 'delivered': support['delivery']}
                    support['rows'] = [m for m in support['rows'] if m['id'] != row['id']] + [row]
                    return await r.fulfill(status=201, json={'message': row, 'delivered': support['delivery']})
                after = int(parse_qs(urlparse(r.request.url).query).get('after', [0])[0])
                return await r.fulfill(json={'messages': [m for m in support['rows'] if m['id'] > after], 'status': 'open'})
            await context.route('**/api/assist/**', assist)
            await context.route('**/api/contact', lambda r: r.abort())
            async def wedding(r):
                if r.request.method == 'PATCH':
                    data = r.request.post_data_json
                    support['patches'].append(data)
                    return await r.fulfill(json={**WEDDING, **data})
                return await r.fulfill(json=WEDDING)
            await context.route('**/rest/v1/weddings?**', wedding)
            # An unrelated previous chat must not receive the correction request.
            await context.add_init_script(f"if(location.origin === '{SITE}' && !localStorage.getItem('test-chat-seeded')) {{ localStorage.setItem('rovty-assist-session', JSON.stringify({{token:'old-chat',name:'Earlier visitor',agent:'Rovty'}})); localStorage.setItem('test-chat-seeded','1'); }}")
            await page.goto(f'{DASH}/open/wed', wait_until='domcontentloaded')
            await expect(page.get_by_role('button', name='Design', exact=True)).to_be_visible(timeout=30000)
            await page.get_by_role('button', name='Design', exact=True).click()
            await expect(page.get_by_label('Bride', exact=True)).to_have_attribute('readonly', '')
            await expect(page.get_by_label('Groom', exact=True)).to_have_attribute('readonly', '')
            await expect(page.get_by_role('button', name='Edit', exact=True)).to_have_count(0)
            await page.get_by_role('button', name='Save changes', exact=True).click()
            await expect(page.get_by_text('Saved.', exact=True)).to_be_visible()
            assert not {'bride', 'groom', 'slug'} & support['patches'][-1].keys()
            await page.evaluate('''localStorage.setItem('rovty-wed-studio-v1', JSON.stringify({wedding: {bride:'Different',groom:'Couple',date:'2030-06-10T10:00:00Z',template:'editorial',description:'Imported welcome'},design:{version:1,sections:[]}}))''')
            await page.get_by_role('button', name='Open design studio', exact=True).click()
            await page.get_by_role('button', name='Bring in your draft', exact=False).click()
            await expect(page.get_by_label('Partner one', exact=True)).to_have_value('Alex')
            await expect(page.get_by_label('Partner two', exact=True)).to_have_value('Sam')
            await expect(page.get_by_label('Your welcome note')).to_have_value('Imported welcome')
            await page.get_by_role('button', name='Save to live site', exact=True).click()
            await expect(page.get_by_role('status')).to_contain_text('Your design is saved.')
            assert not {'bride', 'groom', 'slug'} & support['patches'][-1].keys()
            await expect(page.get_by_label('Partner one', exact=True)).to_have_attribute('readonly', '')
            await expect(page.get_by_label('Partner two', exact=True)).to_have_attribute('readonly', '')
            await page.get_by_label('Your welcome note').fill('Unsaved changes remain in this tab.')
            await page.screenshot(path=f'/tmp/rovty-identity-{width}.png')
            async with context.expect_page() as popup:
                await page.get_by_role('link', name='Request a change', exact=False).click()
            chat = await popup.value
            await expect(chat.get_by_role('dialog', name='Rovty Assist chat')).to_be_visible(timeout=15000)
            await expect(chat.get_by_role('log')).to_contain_text('Wedding reference: ' + WEDDING['id'])
            await expect(chat.get_by_role('log')).to_contain_text('Username: local-wedding')
            assert support['sessions'] == 1 and len(support['sent']) == 1
            assert '#' not in chat.url
            await expect(page.get_by_label('Your welcome note')).to_have_value('Unsaved changes remain in this tab.')
            assert await chat.evaluate('document.documentElement.scrollWidth <= innerWidth')
            await chat.screenshot(path=f'/tmp/rovty-identity-chat-{width}.png')
            await chat.reload(wait_until='domcontentloaded')
            await chat.get_by_role('button', name='Open Rovty Assist chat').click()
            await expect(chat.get_by_role('log')).to_contain_text('Username: local-wedding')
            assert support['sessions'] == 1 and len(support['sent']) == 1, 'Reload must resume without resending'
            await chat.close()
            # Retry a delivery failure without opening another chat or retyping.
            support['delivery'] = False
            async with context.expect_page() as popup:
                await page.get_by_role('link', name='Request a change', exact=False).click()
            chat = await popup.value
            await expect(chat.get_by_role('button', name='Retry delivery')).to_be_visible()
            await expect(chat.get_by_label('Rovty has been notified')).to_have_count(0)
            support['delivery'] = True
            await chat.get_by_role('button', name='Retry delivery').click()
            await expect(chat.get_by_role('button', name='Retry delivery')).to_have_count(0)
            assert support['sessions'] == 2 and support['sent'][-1]['retryId'] == 1
            await chat.close()
            # Offline support keeps the prepared message and offers contact form.
            support['offline'] = True
            async with context.expect_page() as popup:
                await page.get_by_role('link', name='Request a change', exact=False).click()
            chat = await popup.value
            await expect(chat.get_by_role('button', name='Retry starting chat')).to_be_visible()
            await expect(chat.get_by_role('dialog')).to_contain_text('Username: local-wedding')
            await chat.get_by_role('button', name='Use contact form').click()
            await expect(chat.get_by_role('textbox', name='Message', exact=False)).to_have_value(support['sent'][-1]['body'])
            assert not state['errors'], state['errors']
            await context.close()
            print(f'PASS {width}px: locked editors, safe save payload, fresh prepared chat, unsaved edits retained, reload, retry and offline fallback.', flush=True)
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
