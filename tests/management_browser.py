"""Browser checks on the local app with fake auth and management responses only.
Start Vite with the environment documented in docs/wedding-management.md.
"""
import asyncio
import base64
import copy
import json
import time
from urllib.parse import urlparse,parse_qs
from playwright.async_api import async_playwright,expect

WED='http://127.0.0.1:5178'
def uid(n): return f'00000000-0000-4000-8000-{n:012d}'
USER={'id':uid(1),'email':'ireshek@gmail.com','aud':'authenticated','role':'authenticated','app_metadata':{},'user_metadata':{},'created_at':'2026-01-01T00:00:00Z'}
def encode(v): return base64.urlsafe_b64encode(json.dumps(v).encode()).decode().rstrip('=')
def session():
    expires=int(time.time())+3600
    return {'access_token':f'{encode({"alg":"HS256","typ":"JWT"})}.{encode({"sub":uid(1),"exp":expires})}.test','refresh_token':'local-only','expires_in':3600,'expires_at':expires,'token_type':'bearer','user':USER}
WEDDING={'id':uid(101),'owner_id':uid(3),'slug':'alex-sam','bride':'Alex','groom':'Sam','event_date':'2030-06-10T10:00:00Z','event_end':None,'reception_date':None,'reception_end':None,'venue':'Galle Face Hotel','hall':'Grand Ballroom','address':'Colombo, Sri Lanka','published':True,'template':'editorial','description':'A celebration with our favourite people.','design':None,'updated_at':'2026-09-21T10:00:00Z','created_at':'2026-08-01T00:00:00Z','bride_parents_names':None,'groom_parents_names':None,'couple_photo_url':None,'venue_photo_url':None,'share_image_url':None,'maps_url':None,'music_url':None,'floor_plan_url':None,'invite_message_before':None,'invite_message_after':None,'seating_message_before':None,'seating_message_after':None}
METRICS={'guests':3,'seats':6,'invited':2,'attending':1,'declined':1,'pending':1,'confirmedSeats':3,'assigned':1,'tables':1,'capacity':10}
DETAIL={'wedding':WEDDING,'metrics':METRICS,'owner':{'id':uid(3),'email':'alex@example.test','last_sign_in_at':'2026-09-21T09:00:00Z','created_at':'2026-07-01T00:00:00Z'},'team':[{'id':uid(201),'wedding_id':uid(101),'user_id':uid(5),'email':'planner@example.test','role':'admin','invited_by':uid(3),'created_at':'2026-08-01T00:00:00Z'}],'tables':[{'id':uid(401),'wedding_id':uid(101),'table_number':1,'table_name':'Family','capacity':10,'map_x':50,'map_y':50,'is_active':True,'created_at':'2026-08-01T00:00:00Z','updated_at':'2026-09-21T10:00:00Z'}],'seating':None,'audit':[]}
GUEST={'id':uid(301),'wedding_id':uid(101),'code':'ABCDEFGH','name':'Taylor Morgan','phone':'+94770000000','title':None,'seats':3,'invited_at':'2026-09-01T00:00:00Z','created_at':'2026-08-01T00:00:00Z','attending':True,'rsvp_message':'Looking forward to celebrating with you!','replied_at':'2026-09-15T00:00:00Z','table_number':1,'table_name':'Family','table_id':uid(401)}
async def fixture(browser,width=1440,role='admin',signed_in=True):
    context=await browser.new_context(viewport={'width':width,'height':960},reduced_motion='reduce')
    state={'role':role,'detail':copy.deepcopy(DETAIL),'guest':copy.deepcopy(GUEST),'writes':[],'queries':[],'conflict':False,'errors':[],'fail':False}
    if signed_in: await context.add_init_script(f"localStorage.setItem('sb-rovty-wed-test-auth-token',{json.dumps(json.dumps(session()))})")
    async def route(r):
        url=r.request.url; path=urlparse(url).path
        if path=='/api/session':
            assert 'authorization' in r.request.headers
            return await r.fulfill(json={'ok':True})
        if path=='/api/data':
            assert 'authorization' in r.request.headers
            data_path=urlparse(parse_qs(urlparse(url).query)['path'][0]).path
            return await r.fulfill(json=WEDDING if data_path.endswith('/weddings') else [])
        if path=='/api/manage':
            assert 'authorization' in r.request.headers
            if state['role']=='denied': return await r.fulfill(status=403,json={'error':'Rovty team access required.'})
            if state['fail']: return await r.fulfill(status=503,json={'error':'Temporarily unavailable.'})
            if r.request.method=='PATCH':
                payload=r.request.post_data_json; state['writes'].append(payload)
                assert len(payload['params']['reason']) >= 5
                assert r.request.headers.get('origin')==WED
                if state['conflict']: return await r.fulfill(status=409,json={'error':'This record changed. Reload before saving.'})
                assert state['role']=='admin'
                a=payload['action']; p=payload['params']; before=None; after=None
                if a=='wedding':
                    before=copy.deepcopy(state['detail']['wedding']); state['detail']['wedding'].update(p['changes']);state['detail']['wedding']['updated_at']='2026-09-21T11:00:00Z';after=state['detail']['wedding']
                if a=='guest': state['guest'].update(p['changes'])
                if a=='table': state['detail']['tables'][0].update(p['changes'])
                if a=='member':
                    if p['role']=='remove': state['detail']['team']=[]
                    elif p.get('memberId'): state['detail']['team'][0]['role']=p['role']
                    else: state['detail']['team'].append({**DETAIL['team'][0],'id':uid(202),'email':p['email'],'role':p['role']})
                if a=='seating':state['detail']['seating']={'wedding_id':uid(101),'published':p['published'],'updated_at':'2026-09-21T11:00:00Z'}
                state['detail']['audit'].insert(0,{'id':uid(501+len(state['writes'])),'actor_email':USER['email'],'action':a,'reason':p['reason'],'created_at':'2026-09-21T11:00:00Z','before_data':before,'after_data':copy.deepcopy(after)})
                return await r.fulfill(json={'ok':True})
            q={k:v[0] for k,v in parse_qs(urlparse(url).query).items()};state['queries'].append(q);a=q.get('action','access')
            if a=='access':return await r.fulfill(json={'email':USER['email'],'role':state['role']})
            if a=='detail':return await r.fulfill(json=state['detail'])
            if a=='guests':return await r.fulfill(json={'total':1,'page':0,'items':[state['guest']] if 'nobody' not in q.get('query','') else []})
            w=state['detail']['wedding'];items=[{**w,'metrics':METRICS,'owner_email':'alex@example.test'},{**w,'metrics':METRICS,'owner_email':'nora@example.test','id':uid(102),'bride':'Nora','groom':'Eli','slug':'nora-eli','published':False,'template':'garden','venue':'The Secret Garden'}]
            if q.get('query'):items=[row for row in items if q['query'].lower() in (row['bride']+' '+row['groom']+' '+row['slug']).lower()]
            if q.get('filter')=='draft':items=[row for row in items if not row['published']]
            return await r.fulfill(json={'summary':{'total':2,'published':1,'draft':1,'upcoming':2},'total':len(items),'page':0,'items':items})
        if 'supabase.co' in url:
            if path.endswith('/user'):return await r.fulfill(json=USER)
            if path.endswith('/token'):return await r.fulfill(json=session())
            if path.endswith('/weddings'):return await r.fulfill(json=WEDDING)
            return await r.fulfill(json=[])
        if url.startswith(WED) or url.startswith('https://fonts.googleapis.com/') or url.startswith('https://fonts.gstatic.com/'): return await r.continue_()
        await r.abort()
    await context.route('**/*',route)
    page=await context.new_page();page.on('pageerror',lambda error:state['errors'].append(str(error)))
    page.on('console',lambda msg: state['errors'].append(msg.text) if msg.type=='error' and not msg.text.startswith('Failed to load resource') else None)
    return context,page,state
async def save(page,reason='Confirmed correction with the couple'):
    await page.get_by_label('Reason for this change').fill(reason)
    await page.get_by_role('button',name='Save changes',exact=True).click()
    await expect(page.get_by_role('dialog')).to_have_count(0)
    await expect(page.get_by_role('status')).to_contain_text('Changes saved')

async def run():
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='chrome',headless=True)
        for width in [1440,390]:
            context,page,state=await fixture(browser,width)
            await page.goto(WED+'/admin',wait_until='domcontentloaded')
            await expect(page).to_have_url(WED+'/admin/manage',timeout=30000)
            try: await expect(page.get_by_role('button',name='Manage Alex & Sam')).to_be_visible()
            except AssertionError:
                print(await page.locator('body').inner_text(), state['errors'], state['queries'], flush=True)
                await page.screenshot(path='/tmp/rovty-management-failure.png')
                raise
            await page.screenshot(path=f'/tmp/rovty-management-directory-{width}.png',full_page=True)
            await page.get_by_label('Search weddings').fill('nora')
            await expect(page.get_by_role('button',name='Manage Alex & Sam')).to_have_count(0)
            await expect(page.get_by_role('button',name='Manage Nora & Eli')).to_be_visible()
            await page.get_by_label('Search weddings').fill('')
            await page.get_by_label('Filter weddings').select_option('draft')
            await expect(page.get_by_role('button',name='Manage Alex & Sam')).to_have_count(0)
            await page.get_by_label('Filter weddings').select_option('all')
            await page.get_by_role('button',name='Manage Alex & Sam').click()
            await expect(page.get_by_role('heading',name='Alex & Sam')).to_be_visible()
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            await page.screenshot(path=f'/tmp/rovty-management-overview-{width}.png',full_page=True)
            await page.get_by_role('button',name='Edit wedding',exact=True).click()
            await expect(page.get_by_role('dialog')).to_be_visible()
            await expect(page.get_by_role('button',name='Save changes',exact=True)).to_be_disabled()
            await page.get_by_label('Partner one',exact=False).first.fill('Alexandra')
            page.once('dialog',lambda dialog:dialog.dismiss())
            await page.go_back()
            await expect(page.get_by_role('dialog')).to_be_visible()
            await expect(page.get_by_label('Partner one *',exact=True)).to_have_value('Alexandra')
            await page.screenshot(path=f'/tmp/rovty-management-edit-{width}.png',full_page=True)
            await save(page)
            assert state['writes'][-1]['params']['changes']=={'bride':'Alexandra'}
            await expect(page.get_by_role('heading',name='Alexandra & Sam')).to_be_visible()
            await page.get_by_role('button',name='History',exact=True).click()
            await expect(page.get_by_text('Confirmed correction with the couple',exact=True)).to_be_visible()
            await page.get_by_text('See changed values',exact=True).click()
            await expect(page.locator('ins')).to_contain_text('Alexandra')
            await page.get_by_role('button',name='Guests',exact=False).click()
            await expect(page.get_by_text('Taylor Morgan',exact=True)).to_be_visible()
            await page.get_by_role('button',name='Edit guest',exact=True).click()
            await page.get_by_label('Party size').fill('4')
            await save(page,'Corrected the guest party size')
            assert state['writes'][-1]['params']['expected']['seats']==3
            await page.get_by_role('button',name='Team',exact=True).click()
            await page.get_by_role('button',name='Manage access',exact=True).click()
            await page.get_by_label('Wedding access').select_option('view')
            await save(page,'Planner needs view access only')
            await expect(page.get_by_text('View only · Added',exact=False)).to_be_visible()
            await page.get_by_role('button',name='Seating',exact=True).click()
            await page.get_by_role('button',name='Publish seating',exact=True).click()
            await expect(page.get_by_label('Seating page published')).to_be_checked()
            await save(page,'Seating plan ready for guests')
            await page.get_by_role('button',name='Edit table',exact=True).click()
            await page.get_by_label('Capacity').fill('12')
            await save(page,'Venue confirmed table capacity')
            await expect(page.get_by_text('12 seats · Active')).to_be_visible()
            await page.get_by_role('button',name='Wedding details',exact=True).click()
            await page.get_by_role('button',name='Edit details',exact=True).click()
            await page.get_by_label('Partner one *',exact=True).fill('Conflicting edit')
            state['conflict']=True
            await page.get_by_label('Reason for this change').fill('Concurrent edit check')
            await page.get_by_role('button',name='Save changes',exact=True).click()
            await expect(page.get_by_role('alert')).to_contain_text('Your inputs are still here')
            await expect(page.get_by_label('Partner one *',exact=True)).to_have_value('Conflicting edit')
            page.once('dialog',lambda dialog:dialog.accept())
            await page.get_by_role('button',name='Close edit').click()
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            state['role']='denied'
            await page.get_by_role('button',name='Refresh wedding').click()
            await expect(page.get_by_role('heading',name='Team access required')).to_be_visible()
            await expect(page.get_by_role('heading',name='Alexandra & Sam')).to_have_count(0)
            assert not state['errors'],state['errors']
            await context.close()
            print(f'PASS {width}px: staff entry, search/filter, summary, identity/guest/team/table/publication saves, audit, navigation guard, conflicts, revocation, responsive layouts.',flush=True)
        context,page,state=await fixture(browser,role='viewer')
        await page.goto(WED+'/admin/manage?wedding='+uid(101),wait_until='domcontentloaded')
        await expect(page.get_by_role('heading',name='Alex & Sam')).to_be_visible()
        await expect(page.get_by_role('button',name='Edit wedding')).to_have_count(0)
        await page.get_by_role('button',name='Team',exact=True).click()
        await expect(page.get_by_role('button',name='Add member')).to_have_count(0)
        assert not state['writes']
        await context.close()
        context,page,state=await fixture(browser,role='denied')
        await page.goto(WED+'/admin/manage',wait_until='domcontentloaded')
        await expect(page.get_by_role('heading',name='Team access required')).to_be_visible()
        assert not any(q.get('action')=='list' for q in state['queries'])
        await page.goto(WED+'/admin',wait_until='domcontentloaded')
        await expect(page.get_by_role('button',name='Design',exact=True)).to_be_visible()
        await expect(page).to_have_url(WED+'/admin')
        await context.close()
        context,page,state=await fixture(browser,signed_in=False)
        await page.goto(WED+'/admin/manage',wait_until='domcontentloaded')
        await expect(page.get_by_role('button',name='Continue with Rovty')).to_be_visible()
        assert not state['queries']
        await context.close()
        print('PASS: viewer read-only, unauthorized and anonymous denial, ordinary couple portal preserved.',flush=True)
        await browser.close()
if __name__=='__main__':asyncio.run(run())
