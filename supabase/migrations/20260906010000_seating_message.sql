-- Lets the wedding owner write their own text around the guest's personal
-- seating-lookup link, mirroring invite_message_before/after
-- (20260904020000_invite_message.sql) for the "Copy seating message"
-- action in the Seating list. The link itself is never part of this text —
-- always spliced in between the two fields at copy time — so it can't be
-- edited or dropped. Both null means "hasn't customized it yet"; the copy
-- button falls back to defaultSeatingMessage's built-in wording.
alter table public.weddings
  add column seating_message_before text,
  add column seating_message_after text;

-- weddings' UPDATE grant is column-scoped
-- (20260904030000_wedding_members.sql revoked the table-wide grant and
-- replaced it with an explicit column list), so every new column needs
-- its own grant here or PostgREST reports "permission denied for table
-- weddings" the moment Design's save button sends it.
grant update (seating_message_before, seating_message_after) on public.weddings to authenticated;
