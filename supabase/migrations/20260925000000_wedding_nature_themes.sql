-- Extend the collection without renaming or modifying existing invitations.
alter table public.weddings drop constraint if exists weddings_template_check;
alter table public.weddings add constraint weddings_template_check check (template in (
  'classic', 'poruwa', 'thali', 'chapel', 'nikkah', 'noir', 'editorial', 'quiet', 'garden', 'shoreline', 'deco', 'film', 'lotus', 'bloom', 'olive', 'cherry-blossom', 'orchid', 'jasmine', 'palm', 'butterfly', 'moon-stars', 'dove', 'rings', 'feather', 'eucalyptus', 'sunflower', 'wheat', 'candlelight', 'oil-lamp', 'peacock', 'ocean', 'tree-of-love', 'forest'
));
