-- Turns this from a single hardcoded wedding into one row per customer.
-- Every existing table (guests, rsvps, seating_tables, seating_assignments,
-- seating_config) gets a wedding_id and its RLS policies rewritten from
-- "any signed-in user can touch anything" (fine when there was only ever one
-- wedding) to "only that wedding's owner can touch its rows." Public RPCs get
-- a wedding slug argument since a guest `code` is now only unique within one
-- wedding, not globally.
--
-- Fresh project, no existing data to preserve — this drops and recreates
-- rather than ALTERing in place, which keeps this file readable as the
-- actual current schema instead of a patch on top of the old one.

drop function if exists public.get_guest_by_code(text);
drop function if exists public.submit_rsvp(text, boolean, text);
drop function if exists public.get_seating_by_code(text);
drop function if exists public.get_seating_by_tables(int[]);
drop table if exists public.seating_assignments;
drop table if exists public.seating_tables;
drop table if exists public.seating_config;
drop table if exists public.rsvps;
drop table if exists public.guests;

-- ── Weddings ─────────────────────────────────────────────────────────────
-- One row per customer. `status` is the manual entitlement flag (see the
-- README note this migration's PR/commit should link to) — 'active' is
-- required to publish, not to use the editor.

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'),
  bride text not null,
  groom text not null,
  event_date timestamptz not null,
  event_end timestamptz,
  reception_date timestamptz,
  reception_end timestamptz,
  venue text,
  hall text,
  address text,
  description text,
  status text not null default 'pending' check (status in ('pending', 'active')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.weddings to authenticated;
grant all on public.weddings to service_role;
-- Anyone can resolve a slug to check it's published — this is exactly what
-- the public invitation page needs to do before it has any other data to
-- work with, and it's what makes the public RPCs below able to accept a
-- slug instead of an internal id.
grant select on public.weddings to anon;
alter table public.weddings enable row level security;

create policy "Owners manage their own wedding" on public.weddings
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Published weddings are publicly readable" on public.weddings
  for select to anon
  using (published = true);

-- ── Guests ───────────────────────────────────────────────────────────────

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  code text not null,
  name text not null,
  title text,
  seats int not null default 1,
  created_at timestamptz not null default now(),
  unique (wedding_id, code)
);
grant select, insert, update, delete on public.guests to authenticated;
grant all on public.guests to service_role;
alter table public.guests enable row level security;

create policy "Owners manage their wedding's guests" on public.guests
  for all to authenticated
  using (wedding_id in (select id from public.weddings where owner_id = auth.uid()))
  with check (wedding_id in (select id from public.weddings where owner_id = auth.uid()));

-- ── RSVPs ────────────────────────────────────────────────────────────────

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  guest_code text not null,
  attending boolean not null,
  message text,
  created_at timestamptz not null default now(),
  foreign key (wedding_id, guest_code) references public.guests (wedding_id, code) on delete cascade
);
grant select, insert, update, delete on public.rsvps to authenticated;
grant all on public.rsvps to service_role;
alter table public.rsvps enable row level security;

create policy "Owners view their wedding's rsvps" on public.rsvps
  for select to authenticated
  using (wedding_id in (select id from public.weddings where owner_id = auth.uid()));
create policy "Owners delete their wedding's rsvps" on public.rsvps
  for delete to authenticated
  using (wedding_id in (select id from public.weddings where owner_id = auth.uid()));

-- ── Seating ──────────────────────────────────────────────────────────────

create table public.seating_config (
  wedding_id uuid primary key references public.weddings (id) on delete cascade,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.seating_config to authenticated;
grant all on public.seating_config to service_role;
alter table public.seating_config enable row level security;

create policy "Owners manage their wedding's seating config" on public.seating_config
  for all to authenticated
  using (wedding_id in (select id from public.weddings where owner_id = auth.uid()))
  with check (wedding_id in (select id from public.weddings where owner_id = auth.uid()));

create table public.seating_tables (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  table_number int not null,
  table_name text,
  capacity int not null default 10,
  map_x numeric(5, 2) not null default 50,
  map_y numeric(5, 2) not null default 50,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wedding_id, table_number)
);
grant select, insert, update, delete on public.seating_tables to authenticated;
grant all on public.seating_tables to service_role;
alter table public.seating_tables enable row level security;

create policy "Owners manage their wedding's seating tables" on public.seating_tables
  for all to authenticated
  using (wedding_id in (select id from public.weddings where owner_id = auth.uid()))
  with check (wedding_id in (select id from public.weddings where owner_id = auth.uid()));

create table public.seating_assignments (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  guest_code text not null,
  table_id uuid not null references public.seating_tables (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wedding_id, guest_code),
  foreign key (wedding_id, guest_code) references public.guests (wedding_id, code) on delete cascade
);
grant select, insert, update, delete on public.seating_assignments to authenticated;
grant all on public.seating_assignments to service_role;
alter table public.seating_assignments enable row level security;

create policy "Owners manage their wedding's seating assignments" on public.seating_assignments
  for all to authenticated
  using (wedding_id in (select id from public.weddings where owner_id = auth.uid()))
  with check (wedding_id in (select id from public.weddings where owner_id = auth.uid()));

-- ── Public RPCs ──────────────────────────────────────────────────────────
-- Every one of these now resolves a wedding by slug first (only if
-- published) before touching anything scoped to it — a slug that doesn't
-- resolve to a published wedding behaves identically to an invalid code, so
-- these can't be used to probe which slugs exist.

create or replace function public.get_guest_by_code(_slug text, _code text)
returns table (code text, name text, title text, seats int)
language sql
stable
security definer
set search_path = public
as $$
  select g.code, g.name, g.title, g.seats
  from public.guests g
  join public.weddings w on w.id = g.wedding_id
  where w.slug = lower(trim(_slug))
    and w.published = true
    and g.code = upper(trim(_code))
  limit 1;
$$;
grant execute on function public.get_guest_by_code(text, text) to anon, authenticated;

create or replace function public.submit_rsvp(_slug text, _code text, _attending boolean, _message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _wedding_id uuid;
  _id uuid;
  _norm text := upper(trim(_code));
begin
  select w.id into _wedding_id
  from public.weddings w
  where w.slug = lower(trim(_slug)) and w.published = true;

  if _wedding_id is null then
    raise exception 'Invalid invitation link';
  end if;

  if not exists (select 1 from public.guests where wedding_id = _wedding_id and code = _norm) then
    raise exception 'Invalid invitation code';
  end if;

  insert into public.rsvps (wedding_id, guest_code, attending, message)
  values (_wedding_id, _norm, _attending, nullif(trim(coalesce(_message, '')), ''))
  returning id into _id;
  return _id;
end;
$$;
grant execute on function public.submit_rsvp(text, text, boolean, text) to anon, authenticated;

create or replace function public.get_seating_by_code(_slug text, _code text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  _wedding_id uuid;
  _seating_published boolean;
  _norm text := upper(trim(_code));
  _guest record;
  _assignment record;
  _tablemates json;
begin
  select w.id into _wedding_id
  from public.weddings w
  where w.slug = lower(trim(_slug)) and w.published = true;
  if _wedding_id is null then
    return null;
  end if;

  select published into _seating_published
  from public.seating_config where wedding_id = _wedding_id;
  if not coalesce(_seating_published, false) then
    return null;
  end if;

  select code, name, title, seats into _guest
  from public.guests where wedding_id = _wedding_id and code = _norm;
  if not found then
    return null;
  end if;

  select sa.id, sa.table_id, st.table_number, st.table_name, st.map_x, st.map_y
  into _assignment
  from public.seating_assignments sa
  join public.seating_tables st on st.id = sa.table_id
  where sa.wedding_id = _wedding_id and sa.guest_code = _norm and st.is_active;
  if not found then
    return null;
  end if;

  select json_agg(json_build_object(
    'name', g.name,
    'is_current', g.code = _norm
  ) order by (g.code = _norm) desc, g.name)
  into _tablemates
  from public.seating_assignments sa
  join public.guests g on g.wedding_id = sa.wedding_id and g.code = sa.guest_code
  where sa.table_id = _assignment.table_id;

  return json_build_object(
    'guest_name', _guest.name,
    'guest_code', _guest.code,
    'table_number', _assignment.table_number,
    'table_name', _assignment.table_name,
    'map_x', _assignment.map_x,
    'map_y', _assignment.map_y,
    'tablemates', coalesce(_tablemates, '[]'::json)
  );
end;
$$;
grant execute on function public.get_seating_by_code(text, text) to anon, authenticated;

create or replace function public.get_seating_by_tables(_slug text, _table_numbers int[])
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  _wedding_id uuid;
  _seating_published boolean;
  _tables json;
begin
  select w.id into _wedding_id
  from public.weddings w
  where w.slug = lower(trim(_slug)) and w.published = true;
  if _wedding_id is null then
    return '[]'::json;
  end if;

  select published into _seating_published
  from public.seating_config where wedding_id = _wedding_id;
  if not coalesce(_seating_published, false) then
    return '[]'::json;
  end if;

  select json_agg(json_build_object(
    'table_number', st.table_number,
    'table_name', st.table_name,
    'map_x', st.map_x,
    'map_y', st.map_y,
    'guests', (
      select coalesce(json_agg(json_build_object('name', g.name) order by g.name), '[]'::json)
      from public.seating_assignments sa
      join public.guests g on g.wedding_id = sa.wedding_id and g.code = sa.guest_code
      where sa.table_id = st.id
    )
  ) order by st.table_number)
  into _tables
  from public.seating_tables st
  where st.wedding_id = _wedding_id
    and st.table_number = any(_table_numbers)
    and st.is_active;

  return coalesce(_tables, '[]'::json);
end;
$$;
grant execute on function public.get_seating_by_tables(text, int[]) to anon, authenticated;
