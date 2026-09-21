"""Local plan feature UX; all account, plan and wedding traffic is mocked."""
import asyncio,pathlib,sys
sys.dont_write_bytecode=True
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[2]/'rovty-dashboard/tests'))
from platform_browser import fixture,WED,WEDDING
from playwright.async_api import async_playwright,expect
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(channel='chrome',headless=True)
  for width in [1440,390]:
   context,page,state=await fixture(browser,width=width)
   async def plan(route):
    essential={'plan':'essential','active':True,'features':['website','templates','rsvp','guests']}
    await route.fulfill(json={'own':essential,'weddings':{WEDDING['id']:essential}})
   await context.route('**/api/plan',plan)
   await page.goto(WED+'/sso?token=local-only',wait_until='domcontentloaded')
   await page.get_by_role('button',name='Seating',exact=True).click(timeout=30000)
   await expect(page.get_by_role('heading',name='More possibilities with Complete')).to_be_visible()
   await expect(page.get_by_role('link',name='View plans')).to_have_attribute('href','http://127.0.0.1:5176/billing/wed')
   await page.get_by_role('button',name='Design',exact=True).click()
   await page.get_by_role('button',name='Open design studio',exact=True).click()
   await page.get_by_role('button',name='Elements',exact=True).click()
   await expect(page.get_by_role('heading',name='Create freely with Studio')).to_be_visible()
   assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
   await context.close()
  await browser.close()
 print('PASS: Essential cannot open paid seating or canvas tools; upgrade links and mobile layouts work.')
asyncio.run(run())
