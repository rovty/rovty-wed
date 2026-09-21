"""Real migrations in two disposable PostgreSQL databases. No hosted connections."""
import concurrent.futures
import json
import pathlib
import subprocess
import time
import uuid
ROOT=pathlib.Path(__file__).resolve().parents[1]
NAME='rovty-platform-test-'+uuid.uuid4().hex[:8]
def uid(n):return f'00000000-0000-4000-8000-{n:012d}'
def sql(query,db='postgres',ok=True):
    r=subprocess.run(['docker','exec','-i',NAME,'psql','-U','postgres','-d',db,'-v','ON_ERROR_STOP=1','-qAt'],input=query,text=True,capture_output=True)
    assert (r.returncode==0)==ok,r.stderr or 'Expected rejection: '+query
    return r.stdout.strip() if ok else r.stderr
AUTH='''create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,banned_until timestamptz,last_sign_in_at timestamptz,created_at timestamptz default clock_timestamp());
create table auth.sessions(id uuid primary key,user_id uuid references auth.users on delete cascade,created_at timestamptz default clock_timestamp(),not_after timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
grant usage on schema auth to authenticated;
'''
def who(query,user=3,session=103,gateway=False):
    headers={'x-rovty-gateway':'local-test-gateway','x-rovty-plans':json.dumps({uid(201):{'features':['website','seating','canvas']}}),'x-rovty-owner-plan':json.dumps({'features':['website','seating','canvas']})} if gateway else {}
    return f"set role authenticated; set request.jwt.claim.sub='{uid(user)}'; set request.jwt.claims='{json.dumps({'sub':uid(user),'session_id':uid(session)})}'; set request.headers='{json.dumps(headers)}'; "+query

def status(user=1,session=101,product='wed'):
    return json.loads(sql(f"set role service_role; select rovty_session_status('{uid(user)}','{uid(session)}','{product}');",'platform'))

subprocess.run(['docker','run','--rm','-d','--network','none','--name',NAME,'-e','POSTGRES_PASSWORD=local-test-only','postgres:17-alpine'],check=True,capture_output=True)
try:
    for _ in range(60):
        if subprocess.run(['docker','exec',NAME,'pg_isready','-h','127.0.0.1','-U','postgres'],capture_output=True).returncode==0:break
        time.sleep(.25)
    else:raise RuntimeError('PostgreSQL did not start')
    sql('create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; create database platform; create database wedding;')
    sql(AUTH,'platform');sql(AUTH,'wedding')
    for n in [1,2,4]:sql((ROOT.parent/'rovty-dashboard/supabase/migrations'/f'{n:04d}_{ {1:"product_access",2:"sso_nonces",4:"platform_identity"}[n]}.sql').read_text(),'platform')
    sql(f"insert into auth.users(id,email,email_confirmed_at) values('{uid(1)}','central@example.test',now()),('{uid(2)}','other@example.test',now()); insert into auth.sessions(id,user_id) values('{uid(101)}','{uid(1)}'),('{uid(102)}','{uid(2)}'); insert into product_access(user_id,product,status) values('{uid(1)}','wed','active'); grant select on product_access to authenticated;",'platform')
    assert status()['active']
    assert not status(session=102)['active']
    assert not status(product='assist')['active']
    assert sql(who('select count(*) from product_access',user=1,session=101),'platform')=='1'
    for role in ['anon','authenticated']:
        assert 'permission denied' in sql(f"set role {role}; select rovty_revoke_sessions('{uid(1)}','{uid(101)}');",'platform',False)
        assert 'permission denied' in sql(f'set role {role}; select * from platform_revocations','platform',False)
    sql(f"update product_access set status='inactive' where user_id='{uid(1)}'",'platform');assert status()=={'active':False,'reason':'access'}
    sql(f"update product_access set status='active' where user_id='{uid(1)}'",'platform');assert status()['active']
    sql(f"set role service_role; select rovty_revoke_sessions('{uid(1)}','{uid(101)}');",'platform')
    assert not status()['active']
    assert sql(who('select count(*) from product_access',user=1,session=101),'platform')=='0'
    # Refreshing a token still references the old session; a new login gets a new ID.
    sql(f"insert into auth.sessions(id,user_id) values('{uid(111)}','{uid(1)}')",'platform')
    assert status(session=111)['active']
    sql(f"set role service_role; select rovty_revoke_sessions('{uid(1)}','{uid(101)}');",'platform')
    assert status(session=111)['active'],'Retry with an old logout cannot revoke a later login'
    sql(f"update auth.users set banned_until=now()+interval '1 day' where id='{uid(1)}'",'platform');assert not status(session=111)['active']
    sql(f"update auth.users set banned_until=null,email_confirmed_at=null where id='{uid(1)}'",'platform');assert not status(session=111)['active']
    sql(f"update auth.users set email_confirmed_at=now() where id='{uid(1)}'; delete from auth.sessions where id='{uid(111)}'",'platform');assert not status(session=111)['active']
    sql('''create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid,bucket_id text,name text); alter table storage.objects enable row level security; grant all on storage.objects to authenticated; grant select on storage.objects to anon; grant usage on schema storage to authenticated,anon; create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1,'/') $$;''','wedding')
    for file in sorted((ROOT/'supabase/migrations').glob('202609*.sql')):sql(file.read_text(),'wedding')
    sql(f"insert into auth.users(id,email,email_confirmed_at) values('{uid(3)}','central@example.test',now()),('{uid(4)}','other@example.test',now()); insert into auth.sessions(id,user_id) values('{uid(103)}','{uid(3)}'),('{uid(104)}','{uid(4)}'); update platform_gateway set secret='local-test-gateway'; insert into weddings(id,owner_id,slug,bride,groom,event_date,published) values('{uid(201)}','{uid(3)}','alex-sam','Alex','Sam',now(),true),('{uid(202)}','{uid(4)}','other-couple','Other','Couple',now(),false); insert into guests(wedding_id,code,name) values('{uid(201)}','ABCDEFGH','Guest');",'wedding')
    assert sql(f"set role service_role; select rovty_link_account('{uid(1)}','central@example.test')",'wedding')==uid(3)
    assert sql(f"set role service_role; select rovty_link_account('{uid(1)}','changed@example.test')",'wedding')==uid(3)
    assert 'already linked' in sql(f"set role service_role; select rovty_link_account('{uid(9)}','central@example.test')",'wedding',False)
    for role in ['anon','authenticated']:
        for table in ['platform_account_links','platform_session_links','platform_gateway']:assert 'permission denied' in sql(f'set role {role}; select * from {table}','wedding',False)
        assert 'permission denied' in sql(f"set role {role}; select rovty_link_account('{uid(1)}','central@example.test')",'wedding',False)
        assert 'permission denied' in sql(f'set role {role}; select rovty_gateway_secret()','wedding',False)
    sql(f"set role service_role; select rovty_bind_session('{uid(3)}','{uid(103)}','{uid(1)}','{uid(101)}')",'wedding')
    linked=json.loads(sql(f"set role service_role; select rovty_platform_session('{uid(3)}','{uid(103)}')",'wedding'))
    assert linked=={'user_id':uid(1),'session_id':uid(101)}
    assert sql(f"set role service_role; select rovty_platform_session('{uid(4)}','{uid(103)}')",'wedding')==''
    assert 'Invalid session binding' in sql(f"set role service_role; select rovty_bind_session('{uid(3)}','{uid(104)}','{uid(1)}','{uid(101)}')",'wedding',False)
    assert 'duplicate key' in sql(f"set role service_role; select rovty_bind_session('{uid(3)}','{uid(103)}','{uid(1)}','{uid(999)}')",'wedding',False)
    # A valid local JWT alone cannot read/write data, even with its own owner ID.
    assert sql(who('select count(*) from weddings'),'wedding')=='0'
    assert sql(who('select count(*) from guests'),'wedding')=='0'
    assert sql(who("update weddings set venue='Bypass' returning id"),'wedding')==''
    assert sql(who('select count(*) from weddings',gateway=True),'wedding')=='1'
    assert sql(who("update weddings set venue='Approved' returning venue",gateway=True),'wedding')=='Approved'
    assert 'are locked' in sql(who("update weddings set bride='Replacement'",gateway=True),'wedding',False)
    assert sql('set role anon; select count(*) from weddings','wedding')=='1'
    assert sql("set role anon; select count(*) from get_guest_by_code('alex-sam','ABCDEFGH')",'wedding')=='1'
    assert 'row-level security' in sql(who(f"insert into storage.objects(id,bucket_id,name) values(gen_random_uuid(),'wedding-media','{uid(201)}/photo.webp')"),'wedding',False)
    assert sql(f"set role service_role; select rovty_media_access('{uid(3)}','{uid(201)}',true)",'wedding')=='t'
    assert sql(f"set role service_role; select rovty_media_access('{uid(3)}','{uid(202)}',true)",'wedding')=='f'
    assert 'row-level security' in sql(who(f"insert into storage.objects(id,bucket_id,name) values(gen_random_uuid(),'wedding-media','{uid(201)}/photo.webp')",gateway=True),'wedding',False)
    sql(f"insert into storage.objects(id,bucket_id,name) values(gen_random_uuid(),'wedding-media','{uid(201)}/photo.webp')",'wedding')
    assert 'row-level security' in sql(who(f"insert into storage.objects(id,bucket_id,name) values(gen_random_uuid(),'wedding-media','{uid(202)}/photo.webp')",gateway=True),'wedding',False)
    assert sql('set role anon; select count(*) from storage.objects','wedding')=='1'
    # Paid feature gates complement wedding membership and cannot be spoofed with a JWT.
    limited={'x-rovty-gateway':'local-test-gateway','x-rovty-plans':json.dumps({uid(201):{'features':['website']}}),'x-rovty-owner-plan':json.dumps({'features':['website']})}
    def plan_query(query):return who('',gateway=True)+f"set request.headers='{json.dumps(limited)}'; "+query
    sql(f"insert into seating_tables(id,wedding_id,table_number,capacity) values('{uid(301)}','{uid(201)}',1,8)",'wedding')
    assert sql(plan_query('select count(*) from seating_tables'),'wedding')=='0'
    assert 'row-level security' in sql(plan_query(f"insert into seating_tables(wedding_id,table_number,capacity) values('{uid(201)}',2,8)"),'wedding',False)
    canvas=json.dumps({'version':1,'sections':[{'type':'canvas','id':'canvas-1','canvas':{'elements':[]}}]})
    assert 'included in Studio' in sql(plan_query(f"update weddings set design='{canvas}'::jsonb"),'wedding',False)
    assert sql(plan_query("update weddings set venue='Essential plan' returning venue"),'wedding')=='Essential plan'
    assert sql(who(f"update weddings set design='{canvas}'::jsonb returning id",gateway=True),'wedding')==uid(201)
    limited['x-rovty-plans']=json.dumps({uid(201):{'features':[]}})
    assert sql(plan_query('select count(*) from guests'),'wedding')=='0'
    limited['x-rovty-owner-plan']=json.dumps({'features':[]})
    assert 'Choose a Rovty Wed plan' in sql(plan_query(f"insert into weddings(owner_id,slug,bride,groom,event_date) values('{uid(3)}','unpaid-wedding','A','B',now())"),'wedding',False)
    # Row locking makes legacy email linking unique under concurrent handoffs.
    def claim(n):
        try:return sql(f"set role service_role; select rovty_link_account('{uid(n)}','other@example.test')",'wedding')
        except AssertionError:return 'denied'
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:assert sorted(pool.map(claim,[7,8]))==[uid(4),'denied']
    print('PASS: two real databases, immutable identity mapping, email changes, concurrent linking, session binding, global revocation, stale refresh/logout, bans, direct API/storage bypass denial, original RLS and public invitations.')
finally:subprocess.run(['docker','rm','-f',NAME],check=True,capture_output=True)
