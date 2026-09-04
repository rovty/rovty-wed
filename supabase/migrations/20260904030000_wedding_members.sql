-- Lets the wedding owner invite other people (groom, bride, planner, ...)
-- to edit the same wedding — signing in directly on wed.rovty.com via their
-- own emailed magic link (see /api/team), not through the dashboard's SSO.
-- A member gets the same edit access as the owner everywhere except
-- membership itself, which stays owner-only (enforced by /api/team, which
-- is the only writer of this table — see below).

create table public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  unique (wedding_id, user_id)
);
-- Only select is granted to authenticated — insert/delete happen solely
-- through /api/team's service-role calls, which check "caller is the
-- owner" themselves. That's what makes invite/remove owner-only: there's
-- no RLS insert/delete policy here for anyone to satisfy in the first
-- place, so calling PostgREST directly can't add or remove members either.
grant select on public.wedding_members to authenticated;
grant all on public.wedding_members to service_role;
alter table public.wedding_members enable row level security;

create policy "Members can see their wedding's team" on public.wedding_members
  for select to authenticated
  using (
    wedding_id in (select id from public.weddings where owner_id = auth.uid())
    or wedding_id in (select wedding_id from public.wedding_members where user_id = auth.uid())
  );

-- Central "owner or invited member" check, used by every policy below
-- instead of repeating that union per table. security definer so it can
-- read wedding_members/weddings regardless of the caller's own RLS grants.
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

drop policy "Owners manage their own wedding" on public.weddings;
create policy "Members manage their wedding" on public.weddings
  for all to authenticated
  using (public.has_wedding_access(id))
  with check (public.has_wedding_access(id));

-- owner_id (and id/created_at) must never be writable by anyone, owner or
-- member — ownership transfer isn't a feature this UI exposes, so it isn't
-- a column anyone can write to, independent of whatever the RLS policy
-- above would otherwise allow.
revoke update on public.weddings from authenticated;
grant update (
  slug, bride, groom, event_date, event_end, reception_date, reception_end,
  venue, hall, address, description, invite_message_before,
  invite_message_after, published, updated_at
) on public.weddings to authenticated;

drop policy "Owners manage their wedding's guests" on public.guests;
create policy "Members manage their wedding's guests" on public.guests
  for all to authenticated
  using (public.has_wedding_access(wedding_id))
  with check (public.has_wedding_access(wedding_id));

drop policy "Owners view their wedding's rsvps" on public.rsvps;
create policy "Members view their wedding's rsvps" on public.rsvps
  for select to authenticated
  using (public.has_wedding_access(wedding_id));

drop policy "Owners delete their wedding's rsvps" on public.rsvps;
create policy "Members delete their wedding's rsvps" on public.rsvps
  for delete to authenticated
  using (public.has_wedding_access(wedding_id));

drop policy "Owners manage their wedding's seating config" on public.seating_config;
create policy "Members manage their wedding's seating config" on public.seating_config
  for all to authenticated
  using (public.has_wedding_access(wedding_id))
  with check (public.has_wedding_access(wedding_id));

drop policy "Owners manage their wedding's seating tables" on public.seating_tables;
create policy "Members manage their wedding's seating tables" on public.seating_tables
  for all to authenticated
  using (public.has_wedding_access(wedding_id))
  with check (public.has_wedding_access(wedding_id));

drop policy "Owners manage their wedding's seating assignments" on public.seating_assignments;
create policy "Members manage their wedding's seating assignments" on public.seating_assignments
  for all to authenticated
  using (public.has_wedding_access(wedding_id))
  with check (public.has_wedding_access(wedding_id));
