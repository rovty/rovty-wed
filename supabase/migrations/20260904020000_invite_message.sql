-- Lets the wedding owner write their own text around the guest's personal
-- RSVP link in the WhatsApp message admin.tsx's "Copy invitation" button
-- copies. The link itself is never part of this text — it's always spliced
-- in between the two fields at copy time (see copyInvitation in admin.tsx)
-- so it can't be edited or accidentally dropped. Both null means "hasn't
-- customized it yet" — the copy button falls back to a built-in default.
alter table public.weddings
  add column invite_message_before text,
  add column invite_message_after text;
