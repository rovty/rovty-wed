-- Two fixes in one migration:
--
-- 1. "Members can see their wedding's team" (previous migration) queried
--    wedding_members from inside its own USING clause. Postgres treats that
--    as infinite recursion and errors on every read of the table — the
--    client silently treated that error as "no members", which is why an
--    accepted invite never showed up in the Members list. Fixed by routing
--    through has_wedding_access() (security definer, so its internal read
--    of wedding_members runs as the function owner and isn't subject to
--    this table's own RLS — breaking the self-reference).
--
-- 2. Adds a role per member: 'admin' (same full access as before) or
--    'view' (read-only). Every "owner or member" policy that used to grant
--    full access via has_wedding_access() now splits into a broad
--    read-only policy (has_wedding_access — owner + any role) and a
--    narrower write policy (has_wedding_edit_access — owner + admin role
--    only).

alter table public.wedding_members
  add column role text not null default 'admin' check (role in ('admin', 'view'));

create or replace function public.has_wedding_edit_access(_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.weddings where id = _wedding_id and owner_id = auth.uid()
  ) or exists (
    select 1 from public.wedding_members
    where wedding_id = _wedding_id and user_id = auth.uid() and role = 'admin'
  );
$$;

drop policy "Members can see their wedding's team" on public.wedding_members;
create policy "Members can see their wedding's team" on public.wedding_members
  for select to authenticated
  using (public.has_wedding_access(wedding_id));

-- weddings: creation stays "you can only create a row you own" (there's no
-- existing membership to check yet for a brand new id); edits need admin
-- access; any member can read.
drop policy "Members manage their wedding" on public.weddings;
create policy "Owners create their wedding" on public.weddings
  for insert to authenticated
  with check (owner_id = auth.uid());
create policy "Admins edit their wedding" on public.weddings
  for update to authenticated
  using (public.has_wedding_edit_access(id))
  with check (public.has_wedding_edit_access(id));
create policy "Members view their wedding" on public.weddings
  for select to authenticated
  using (public.has_wedding_access(id));

drop policy "Members manage their wedding's guests" on public.guests;
create policy "Admins manage their wedding's guests" on public.guests
  for all to authenticated
  using (public.has_wedding_edit_access(wedding_id))
  with check (public.has_wedding_edit_access(wedding_id));
create policy "Members view their wedding's guests" on public.guests
  for select to authenticated
  using (public.has_wedding_access(wedding_id));

drop policy "Members view their wedding's rsvps" on public.rsvps;
create policy "Members view their wedding's rsvps" on public.rsvps
  for select to authenticated
  using (public.has_wedding_access(wedding_id));
drop policy "Members delete their wedding's rsvps" on public.rsvps;
create policy "Admins delete their wedding's rsvps" on public.rsvps
  for delete to authenticated
  using (public.has_wedding_edit_access(wedding_id));

drop policy "Members manage their wedding's seating config" on public.seating_config;
create policy "Admins manage their wedding's seating config" on public.seating_config
  for all to authenticated
  using (public.has_wedding_edit_access(wedding_id))
  with check (public.has_wedding_edit_access(wedding_id));
create policy "Members view their wedding's seating config" on public.seating_config
  for select to authenticated
  using (public.has_wedding_access(wedding_id));

drop policy "Members manage their wedding's seating tables" on public.seating_tables;
create policy "Admins manage their wedding's seating tables" on public.seating_tables
  for all to authenticated
  using (public.has_wedding_edit_access(wedding_id))
  with check (public.has_wedding_edit_access(wedding_id));
create policy "Members view their wedding's seating tables" on public.seating_tables
  for select to authenticated
  using (public.has_wedding_access(wedding_id));

drop policy "Members manage their wedding's seating assignments" on public.seating_assignments;
create policy "Admins manage their wedding's seating assignments" on public.seating_assignments
  for all to authenticated
  using (public.has_wedding_edit_access(wedding_id))
  with check (public.has_wedding_edit_access(wedding_id));
create policy "Members view their wedding's seating assignments" on public.seating_assignments
  for select to authenticated
  using (public.has_wedding_access(wedding_id));
