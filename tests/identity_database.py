"""Exercise the real migration on disposable PostgreSQL; never contacts Supabase.
Run: python3 tests/identity_database.py (Docker required).
"""
import concurrent.futures
import pathlib
import subprocess
import time
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[1]
NAME = 'rovty-identity-test-' + uuid.uuid4().hex[:8]

def sql(query, ok=True):
    result = subprocess.run(['docker', 'exec', '-i', NAME, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], input=query, text=True, capture_output=True)
    if ok:
        assert result.returncode == 0, result.stderr
    else:
        assert result.returncode != 0, 'Expected rejection: ' + query
    return result

def as_user(query, owner='00000000-0000-4000-8000-000000000001'):
    return f"set role authenticated; set request.jwt.claim.sub = '{owner}'; " + query

def create(owner, slug):
    return f"insert into public.weddings(owner_id,slug,bride,groom) values ('{owner}','{slug}','Alex','Sam') returning slug;"

subprocess.run(['docker', 'run', '--rm', '-d', '--network', 'none', '--name', NAME, '-e', 'POSTGRES_PASSWORD=local-test-only', 'postgres:17-alpine'], check=True, capture_output=True)
try:
    for _ in range(40):
        ready = subprocess.run(['docker', 'exec', NAME, 'pg_isready', '-U', 'postgres'], capture_output=True)
        if ready.returncode == 0:
            break
        time.sleep(.25)
    sql("""
      create role authenticated nologin;
      create role anon nologin;
      create role service_role nologin bypassrls;
      create schema auth;
      create table auth.users(id uuid primary key);
      insert into auth.users select ('00000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid from generate_series(1,6) n;
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated;
      create table public.weddings (
        id uuid primary key default gen_random_uuid(),
        owner_id uuid not null references auth.users,
        slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
        bride text not null, groom text not null, venue text, published boolean default false
      );
      grant select, insert, delete on public.weddings to authenticated;
      grant update(slug,bride,groom,venue,published) on public.weddings to authenticated;
      grant all on public.weddings to service_role;
      alter table public.weddings enable row level security;
      create policy own_read on public.weddings for select to authenticated using (owner_id = auth.uid());
      create policy own_insert on public.weddings for insert to authenticated with check (owner_id = auth.uid());
      create policy own_update on public.weddings for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
      insert into public.weddings(owner_id,slug,bride,groom) values
        ('00000000-0000-4000-8000-000000000001','existing','Alex','Sam'),
        ('00000000-0000-4000-8000-000000000001','legacy-duplicate','Alex','Sam');
    """)
    sql((ROOT / 'supabase/migrations/20260921000000_lock_wedding_identity.sql').read_text())
    assert sql("select count(*) from weddings;").stdout.strip() == '2'
    for field in ['slug', 'bride', 'groom']:
        rejection = sql(as_user(f"update weddings set {field}='replacement' where slug='existing';"), ok=False)
        assert 'are locked' in rejection.stderr
    sql(as_user("update weddings set bride='Alex',groom='Sam',slug='existing',venue='New venue',published=true where slug='existing' returning *;"))
    sql(as_user("set request.jwt.claims = '{\"role\":\"service_role\"}'; update weddings set bride='Bypass' where slug='existing';"), ok=False)
    sql(as_user("delete from weddings where slug='existing';"), ok=False)
    sql(as_user("delete from wedding_identity_claims;"), ok=False)
    sql(as_user(create('00000000-0000-4000-8000-000000000001', 'second')), ok=False)
    sql(as_user(create('00000000-0000-4000-8000-000000000002', 'first'), '00000000-0000-4000-8000-000000000002'))
    sql("set role service_role; update weddings set bride='Corrected',slug='corrected' where slug='existing';")
    sql("update weddings set groom='Staff correction' where slug='corrected';")
    # A deleted row must not free its subscription for another couple.
    sql("delete from weddings where owner_id='00000000-0000-4000-8000-000000000001';")
    sql(as_user(create('00000000-0000-4000-8000-000000000001', 'reused')), ok=False)
    # Failed setup must roll back the claim as well.
    owner = '00000000-0000-4000-8000-000000000003'
    sql(as_user(create(owner, 'INVALID'), owner), ok=False)
    sql(as_user(create(owner, 'valid'), owner))
    # Two parallel inserts for one owner: exactly one can commit.
    owner = '00000000-0000-4000-8000-000000000004'
    def concurrent_insert(slug):
        return subprocess.run(['docker', 'exec', '-i', NAME, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], input=as_user('begin; ' + create(owner, slug) + 'select pg_sleep(0.5); commit;', owner), text=True, capture_output=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(concurrent_insert, ['parallel-one', 'parallel-two']))
    assert sorted(r.returncode for r in results) == [0, 3], [r.stderr for r in results]
    print('PASS: immutable identity, normal edits, staff corrections, existing rows, duplicate/create/delete bypasses, rollback and concurrent setup.')
finally:
    subprocess.run(['docker', 'rm', '-f', NAME], check=True, capture_output=True)
