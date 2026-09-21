-- Run on the Rovty Wed database. Existing identities become the locked
-- values; no wedding content is rewritten. Staff corrections use a trusted
-- service_role connection or the SQL editor, never a client-editable flag.
begin;

create function public.protect_wedding_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.slug, new.bride, new.groom) is distinct from
     (old.slug, old.bride, old.groom)
     and current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception using
      errcode = '42501',
      message = 'Couple names and username are locked. Request a change from the Rovty team.';
  end if;
  return new;
end;
$$;
revoke all on function public.protect_wedding_identity() from public, anon, authenticated;
create trigger protect_wedding_identity
  before update on public.weddings
  for each row execute function public.protect_wedding_identity();

-- One self-service wedding per owner, enforced with a unique claim rather
-- than a count check that concurrent inserts could race. Keep the claim if
-- a wedding is removed by staff. Existing duplicate owners are preserved.
create table public.wedding_identity_claims (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.wedding_identity_claims enable row level security;
revoke all on public.wedding_identity_claims from public, anon, authenticated;
grant all on public.wedding_identity_claims to service_role;
insert into public.wedding_identity_claims (owner_id)
  select distinct owner_id from public.weddings;

create function public.claim_wedding_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.wedding_identity_claims (owner_id)
    values (new.owner_id) on conflict do nothing;
  -- PostgREST's database role is set by the verified JWT, not user metadata.
  -- SECURITY DEFINER changes current_user but does not change this setting.
  if not found and current_setting('role', true) in ('authenticated', 'anon') then
    raise exception using
      errcode = '23514',
      message = 'This account already has a wedding. Contact Rovty to arrange another wedding.';
  end if;
  return new;
end;
$$;
revoke all on function public.claim_wedding_identity() from public, anon, authenticated;
create trigger claim_wedding_identity
  before insert on public.weddings
  for each row execute function public.claim_wedding_identity();

-- RLS already denies wedding deletion; make that intent explicit in grants.
revoke delete on public.weddings from authenticated, anon;

commit;
