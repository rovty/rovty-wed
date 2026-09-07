-- Replaces the original 5-template gallery (classic/minimal/botanical/
-- luxe/pastel) with the 13-template gallery from the "Wedding Templates"
-- design (classic/poruwa/thali/chapel/nikkah/noir/editorial/quiet/garden/
-- shoreline/deco/film/bloom). Unlike the old set, each of these has a
-- genuinely different hero layout and opening animation, not just a
-- recolor — see src/lib/wedding.ts's TEMPLATE_META and styles.css's new
-- .theme-* blocks.
--
-- Existing weddings keep looking intentional rather than reverting to a
-- template that no longer exists: each old id maps to whichever new id is
-- closest in spirit. "classic" is unchanged (same name, closest look).
update public.weddings set template = case template
  when 'minimal' then 'quiet'      -- clean monochrome → pearl white, gold hairline
  when 'botanical' then 'garden'   -- sage green & cream → pastel sage & cream
  when 'luxe' then 'noir'          -- charcoal & gold foil → champagne on charcoal
  when 'pastel' then 'bloom'       -- blush & lavender → blush rose-gold
  else template
end
where template in ('minimal', 'botanical', 'luxe', 'pastel');

alter table public.weddings drop constraint weddings_template_check;
alter table public.weddings
  add constraint weddings_template_check
  check (template in (
    'classic', 'poruwa', 'thali', 'chapel', 'nikkah', 'noir', 'editorial',
    'quiet', 'garden', 'shoreline', 'deco', 'film', 'bloom'
  ));
