-- Adds the 14th template, "lotus" (ivory & gold, falling lotus), to the
-- gallery from 20260907000000_wedding_templates_v2.sql — same reasoning as
-- that migration: the check constraint is the only thing on the DB side
-- that needs to know about a new template id, since template is otherwise
-- just an opaque string TEMPLATE_META (src/lib/wedding.ts) and styles.css's
-- .theme-lotus block key off.
alter table public.weddings drop constraint weddings_template_check;
alter table public.weddings
  add constraint weddings_template_check
  check (template in (
    'classic', 'poruwa', 'thali', 'chapel', 'nikkah', 'noir', 'editorial',
    'quiet', 'garden', 'shoreline', 'deco', 'film', 'lotus', 'bloom'
  ));
