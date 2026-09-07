-- Fixes: "new row violates row-level security policy for table weddings"
-- when creating a wedding — specifically only when the insert also asks
-- for the row back (`.insert(...).select()`/`.single()`, or plain SQL
-- `INSERT ... RETURNING`), which is exactly what Onboarding.tsx does.
--
-- Root cause: PostgreSQL evaluates RLS's SELECT policy against a row
-- returned via RETURNING, in addition to the INSERT policy's WITH CHECK.
-- Our SELECT policy on `weddings` ("Members view their wedding") checks
-- `has_wedding_access(id)`, which re-queries the `weddings` table itself
-- (`select 1 from weddings where id = _wedding_id and owner_id = ...`).
-- That's a self-referential lookup: the very row being inserted, looked
-- up via a brand new sub-query, within the very same INSERT command that
-- created it. PostgreSQL does not guarantee that sub-query can see a row
-- inserted earlier in the same command (this holds regardless of the
-- function's volatility — tested live), so the lookup finds nothing,
-- has_wedding_access() correctly reports "no access" for a row that does
-- belong to the caller, and the RETURNING clause fails with the same RLS
-- error text as a real INSERT rejection — even though the row was
-- actually inserted successfully and the transaction would otherwise
-- have committed fine.
--
-- The "Admins edit their wedding" UPDATE policy has the identical
-- landmine via has_wedding_edit_access(id) and would hit the same bug
-- the first time any `.update(...).select()` call runs against a
-- wedding row's own owner-only edit path (not yet reported, but same
-- root cause — fixed here proactively).
--
-- Fix: for the *own row* case, check `owner_id` directly as a column of
-- the row being evaluated (bound in-memory from the tuple slot — no
-- re-query, so no self-visibility problem) instead of going through a
-- function that re-queries `weddings`. The *membership* case still goes
-- through a subquery, but against `wedding_members` — a different table,
-- unaffected by this since it isn't the row currently being written.
--
-- has_wedding_access()/has_wedding_edit_access() themselves are left
-- alone: every other table's policies (guests, rsvps, seating_*, etc.)
-- call them with a *different* table's `wedding_id` pointing at
-- `weddings`, which was never self-referential and never hit this bug.

drop policy if exists "Members view their wedding" on public.weddings;
create policy "Members view their wedding" on public.weddings
  for select to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.wedding_members
      where wedding_id = weddings.id and user_id = auth.uid()
    )
  );

drop policy if exists "Admins edit their wedding" on public.weddings;
create policy "Admins edit their wedding" on public.weddings
  for update to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.wedding_members
      where wedding_id = weddings.id and user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    owner_id = auth.uid()
    or exists (
      select 1 from public.wedding_members
      where wedding_id = weddings.id and user_id = auth.uid() and role = 'admin'
    )
  );
