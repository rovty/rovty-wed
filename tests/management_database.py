"""Run all current wedding migrations and privileged management flows in isolated PostgreSQL.
No Supabase connection, email, or production data. Requires Docker and postgres:17-alpine.
"""
import concurrent.futures
import json
import pathlib
import subprocess
import time
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[1]
NAME = 'rovty-management-test-' + uuid.uuid4().hex[:8]
def uid(n): return f'00000000-0000-4000-8000-{n:012d}'
def quote(value): return "'" + str(value).replace("'", "''") + "'"
def sql(query, ok=True):
    result = subprocess.run(['docker', 'exec', '-i', NAME, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-qAt'], input=query, text=True, capture_output=True)
    assert (result.returncode == 0) == ok, result.stderr or 'Expected rejection: ' + query
    return result.stdout.strip() if ok else result.stderr

def request(action, params=None, actor=1, role='service_role', ok=True):
    query = f"set role {role}; select public.rovty_manage('{uid(actor)}',{quote(action)},{quote(json.dumps(params or {}))}::jsonb);"
    result = sql(query, ok)
    return json.loads(result) if ok else result

def detail(n=101): return request('detail', {'weddingId': uid(n)})
def save(action='wedding', **params): return request(action, {'weddingId':uid(101),'reason':'Confirmed correction with the couple', **params})
def audit_count(): return int(sql('select count(*) from wedding_admin_audit'))

subprocess.run(['docker','run','--rm','-d','--network','none','--name',NAME,'-e','POSTGRES_PASSWORD=local-test-only','postgres:17-alpine'],check=True,capture_output=True)
try:
    for _ in range(40):
        if subprocess.run(['docker','exec',NAME,'pg_isready','-h','127.0.0.1','-U','postgres'],capture_output=True).returncode == 0: break
        time.sleep(.25)
    else:
        raise RuntimeError('The disposable PostgreSQL server did not become ready.')
    sql('''
      create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
      create schema auth;
      create table auth.sessions(id uuid primary key,user_id uuid,created_at timestamptz default now(),not_after timestamptz);
      create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,last_sign_in_at timestamptz,created_at timestamptz default now());
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated;
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid,bucket_id text,name text);
      alter table storage.objects enable row level security;
      create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1,'/') $$;
    ''')
    # Real current schema, including media, roles, RSVP, design and identity migrations.
    for file in sorted((ROOT/'supabase/migrations').glob('202609*.sql')):
        sql(file.read_text())
    sql("insert into auth.users(id,email,email_confirmed_at) select ('00000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid, 'account' || n || '@example.test', now() from generate_series(1,50) n;")
    sql(f"update auth.users set email='IreshEK@gmail.com' where id='{uid(1)}'; update auth.users set email='viewer@example.test' where id='{uid(2)}'; insert into rovty_staff(email,role) values('viewer@example.test','viewer');")
    sql(f"insert into weddings(id,owner_id,slug,bride,groom,event_date,published,design) values('{uid(101)}','{uid(3)}','alex-sam','Alex','Sam','2030-06-10T10:00Z',true,'{{\"version\":1,\"sections\":[]}}'),('{uid(102)}','{uid(4)}','nora-eli','Nora','Eli','2020-01-01T10:00Z',false,null);")
    sql(f"insert into wedding_members(id,wedding_id,user_id,email,invited_by,role) values('{uid(201)}','{uid(101)}','{uid(5)}','account5@example.test','{uid(3)}','admin');")
    sql(f"insert into guests(id,wedding_id,code,name,seats,invited_at) values('{uid(301)}','{uid(101)}','ABCDEFGH','Guest One',3,now()),('{uid(302)}','{uid(101)}','IJKLMNOP','Guest Two',2,null),('{uid(303)}','{uid(101)}','QRSTUVWX','Guest Three',1,now()),('{uid(304)}','{uid(102)}','ABCDEFGH','Other Wedding Guest',5,null);")
    sql(f"insert into rsvps(wedding_id,guest_code,attending) values('{uid(101)}','ABCDEFGH',true),('{uid(101)}','QRSTUVWX',false); insert into seating_tables(id,wedding_id,table_number,capacity) values('{uid(401)}','{uid(101)}',1,10),('{uid(402)}','{uid(102)}',1,8); insert into seating_assignments(wedding_id,guest_code,table_id) values('{uid(101)}','ABCDEFGH','{uid(401)}');")
    for role in ['anon','authenticated']:
        assert 'permission denied' in request('access',role=role,ok=False)
        for table in ['rovty_staff','wedding_admin_audit']:
            assert 'permission denied' in sql(f'set role {role}; select * from {table}',ok=False)
            assert 'permission denied' in sql(f'set role {role}; delete from {table}',ok=False)
        assert 'permission denied' in sql(f"set role {role}; select rovty_wedding_metrics('{uid(101)}');",ok=False)
    for actor in [3,5,999]: assert 'Rovty team access required' in request('list',actor=actor,ok=False)
    assert request('access') == {'email':'ireshek@gmail.com','role':'admin'}
    sql(f"update auth.users set email_confirmed_at=null where id='{uid(1)}'")
    assert 'Rovty team access required' in request('access',ok=False)
    sql(f"update auth.users set email_confirmed_at=now() where id='{uid(1)}'")
    listing = request('list')
    assert listing['summary'] == {'total':2,'published':1,'draft':1,'upcoming':1}
    assert listing['items'][0]['id'] == uid(101)
    assert request('list',{'query':'account4@'})['total'] == 1
    assert request('list',{'query':'%'})['total'] == 0
    assert request('list',{'filter':'past'})['total'] == 1
    d = detail()
    assert d['metrics'] == {'guests':3,'seats':6,'invited':2,'attending':1,'declined':1,'pending':1,'confirmedSeats':3,'assigned':1,'tables':1,'capacity':10}
    assert len(d['team']) == 1 and d['owner']['email'] == 'account3@example.test'
    assert request('guests',{'weddingId':uid(101),'query':'Guest'})['total'] == 3
    guest = request('guests',{'weddingId':uid(101),'query':'One'})['items'][0]
    assert guest['attending'] and guest['table_number'] == 1
    assert request('list',actor=2)['total'] == 2
    params = {'weddingId':uid(101),'version':d['wedding']['updated_at'],'changes':{'bride':'Alexandra','slug':'alexandra-sam'},'reason':'Requested by couple'}
    assert 'Editing requires' in request('wedding',params,actor=2,ok=False)
    # Couple identity protection remains intact, even with forged metadata.
    assert 'are locked' in sql(f"select set_config('request.headers',(select json_build_object('x-rovty-gateway',secret,'x-rovty-plans',json_build_object('00000000-0000-4000-8000-000000000101',json_build_object('features',array['website','canvas']))::text)::text from platform_gateway),false); set role authenticated; set request.jwt.claim.sub='{uid(3)}'; set request.jwt.claims='{{\"role\":\"service_role\"}}'; update weddings set bride='Other' where id='{uid(101)}'",ok=False)
    request('wedding',params)
    updated = detail()
    assert updated['wedding']['bride'] == 'Alexandra' and updated['wedding']['design'] == d['wedding']['design']
    assert updated['audit'][0]['actor_email'] == 'ireshek@gmail.com' and 'design' not in updated['audit'][0]['after_data']
    assert audit_count() == 1
    assert 'changed' in request('wedding',params,ok=False)
    params['version'] = updated['wedding']['updated_at']
    params['changes'] = {'slug':'nora-eli'}
    assert 'duplicate key' in request('wedding',params,ok=False)
    assert audit_count() == 1 and detail()['wedding']['slug'] == 'alexandra-sam'
    # Optimistic locking serializes simultaneous saves: exactly one wins.
    params['changes'] = {'venue':'New venue'}
    def attempt(_):
        try: request('wedding',params); return True
        except AssertionError as e: assert 'changed' in str(e); return False
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        assert sorted(pool.map(attempt,range(2))) == [False,True]
    # Cross-wedding IDs cannot be used to alter another record.
    expected = {k:guest[k] for k in ['name','phone','title','seats']}
    for action, extra in [('guest',{'guestId':uid(304),'expected':expected,'changes':{'name':'Wrong'}}),('table',{'tableId':uid(402),'version':d['tables'][0]['updated_at'],'changes':{'capacity':12}}),('member',{'weddingId':uid(102),'memberId':uid(201),'role':'remove','expectedRole':'admin'})]:
        assert 'not found' in request(action,{'weddingId':uid(101),'reason':'Cross wedding attempt',**extra},ok=False)
    save('guest',guestId=guest['id'],expected=expected,changes={'seats':4,'phone':'+94770000000'})
    assert detail()['metrics']['confirmedSeats'] == 4
    assert request('guests',{'weddingId':uid(101),'query':'One'})['items'][0]['attending'] is True
    assert 'changed' in request('guest',{'weddingId':uid(101),'reason':'Stale guest edit','guestId':guest['id'],'expected':expected,'changes':{'seats':2}},ok=False)
    save('table',tableId=uid(401),version=d['tables'][0]['updated_at'],changes={'table_name':'Family','capacity':12})
    assert detail()['tables'][0]['table_name'] == 'Family'
    assert 'changed' in request('table',{'weddingId':uid(101),'reason':'Stale table edit','tableId':uid(401),'version':d['tables'][0]['updated_at'],'changes':{'capacity':20}},ok=False)
    save('member',memberId=uid(201),expectedRole='admin',role='view')
    assert detail()['team'][0]['role'] == 'view'
    assert 'changed' in request('member',{'weddingId':uid(101),'reason':'Stale role edit','memberId':uid(201),'expectedRole':'admin','role':'remove'},ok=False)
    save('member',memberId=uid(201),expectedRole='view',role='remove')
    assert len(detail()['team']) == 0
    save('member',email='account6@example.test',role='admin')
    assert detail()['team'][0]['user_id'] == uid(6)
    assert 'another wedding' in request('member',{'weddingId':uid(101),'reason':'Existing owner add','email':'account4@example.test','role':'view'},ok=False)
    save('seating',version=None,published=True)
    assert detail()['seating']['published']
    assert 'changed' in request('seating',{'weddingId':uid(101),'reason':'Stale publication edit','version':None,'published':False},ok=False)
    # Revocation takes effect at the database on the next request.
    sql("delete from rovty_staff where email='viewer@example.test'")
    assert 'Rovty team access required' in request('detail',{'weddingId':uid(101)},actor=2,ok=False)
    sql("insert into weddings(owner_id,slug,bride,groom,event_date) select ('00000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,'wedding-'||n,'Partner','Partner',now() from generate_series(10,39) n")
    assert len(request('list')['items']) == 25 and len(request('list',{'page':1})['items']) == 7
    print('PASS: real migrations, RLS, confirmed allowlist, viewer/owner/member denial, identity lock, metrics, search, pagination, atomic audit, concurrent saves, cross-wedding protection, team/guest/table/seating edits and revocation.')
finally:
    subprocess.run(['docker','rm','-f',NAME],check=True,capture_output=True)
