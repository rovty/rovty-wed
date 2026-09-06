-- Fixes: "new row violates row-level security policy for table weddings"
-- when creating a wedding.
--
-- Root cause: at one point in this schema's history (20260904030000),
-- creating/editing/reading a wedding was all covered by one policy
-- checking has_wedding_access(id) — a function that looks the wedding up
-- by id in the weddings table itself. For a brand new row, that id
-- doesn't exist in the table yet (chicken-and-egg), so the check can
-- never pass and every insert is rejected. 20260904040000 already fixed
-- this by splitting insert into its own policy that just checks
-- `owner_id = auth.uid()` instead — but if that migration wasn't applied
-- (or migrations were applied out of order / only partway), the broken
-- policy is still what's active.
--
-- This migration is a safe, idempotent re-assertion of the correct end
-- state: `drop policy if exists` covers every name this policy has ever
-- had across the schema's history, and the functions are recreated with
-- `create or replace` so this doesn't depend on exactly which earlier
-- migrations already ran. Safe to run any number of times.

create or replace function public.has_wedding_access(_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.weddings where id = _wedding_id and owner_id = auth.uid()
  ) or exists (
    select 1 from public.wedding_members where wedding_id = _wedding_id and user_id = auth.uid()
  );
$$;

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

drop policy if exists "Owners manage their own wedding" on public.weddings;
drop policy if exists "Members manage their wedding" on public.weddings;
drop policy if exists "Owners create their wedding" on public.weddings;
drop policy if exists "Admins edit their wedding" on public.weddings;
drop policy if exists "Members view their wedding" on public.weddings;

-- Creation only needs "you own the row you're inserting" — there's no
-- existing membership to check yet for a brand new id.
create policy "Owners create their wedding" on public.weddings
  for insert to authenticated
  with check (owner_id = auth.uid());

-- Edits require admin access (owner, or an invited member with the
-- 'admin' role); any member (including 'view' role) can read.
create policy "Admins edit their wedding" on public.weddings
  for update to authenticated
  using (public.has_wedding_edit_access(id))
  with check (public.has_wedding_edit_access(id));

create policy "Members view their wedding" on public.weddings
  for select to authenticated
  using (public.has_wedding_access(id));
