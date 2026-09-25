-- Adds the 16 bespoke "signature" templates (src/lib/wedding-signature.ts)
-- to the allowed weddings.template values. Superset of every id the
-- previous constraint migrations accepted, plus the new signature ids, so
-- this is safe to apply whether or not 20260925000000_wedding_nature_themes
-- has run yet. Existing invitations are not renamed or rewritten.
alter table public.weddings drop constraint if exists weddings_template_check;
alter table public.weddings add constraint weddings_template_check check (template in (
  'classic', 'poruwa', 'thali', 'chapel', 'nikkah', 'noir', 'editorial', 'quiet', 'garden', 'shoreline', 'deco', 'film', 'lotus', 'bloom',
  'olive', 'cherry-blossom', 'orchid', 'jasmine', 'palm', 'butterfly', 'moon-stars', 'dove', 'rings', 'feather', 'eucalyptus', 'sunflower', 'wheat', 'candlelight', 'oil-lamp', 'peacock', 'ocean', 'tree-of-love', 'forest',
  'maison', 'mono', 'pichcha', 'rouge', 'salt-sand', 'ran-poruwa', 'evergreen', 'fern', 'jasmine-moon', 'kolam', 'lotus-night', 'lotus-pond', 'nocturne', 'rose-blush', 'sunset-coast', 'wildflower'
));
