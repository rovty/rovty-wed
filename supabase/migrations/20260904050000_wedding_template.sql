-- Which of the 5 built-in visual templates this wedding's public page uses.
-- Purely presentational — every template shares the exact same
-- WeddingSite component tree and RSVP/seating/calendar functionality; only
-- the CSS tokens it reads differ (see styles.css's .theme-* blocks).
alter table public.weddings
  add column template text not null default 'classic'
    check (template in ('classic', 'minimal', 'botanical', 'luxe', 'pastel'));
