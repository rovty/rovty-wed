-- Optional parents' names, shown on the invitation's "Together with their
-- families" line when provided (src/lib/wedding.ts's familyLine()) instead
-- of a generic fallback. Free text, not split into father/mother — couples
-- write it however fits their family (single parent, remarried parents,
-- honorifics, etc.), same reasoning as invite_message_before/after already
-- being free text rather than structured fields. Both optional and
-- independent: either can be set without the other (familyLine handles
-- that case too).
alter table public.weddings
  add column groom_parents_names text,
  add column bride_parents_names text;

grant update (groom_parents_names, bride_parents_names)
  on public.weddings to authenticated;
