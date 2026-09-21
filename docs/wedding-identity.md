# Locked wedding identity

The couple names (`bride`, `groom`) and public username (`slug`) are editable
during onboarding. Creation locks those values. Existing weddings retain their
current identity when the migration is applied. Dates, venues, parents' names,
media, templates and design content remain editable.

The details form and authenticated studio show read-only names with **Request a
change**. Anonymous template previews remain editable. Importing a demo draft,
switching templates and undo/redo preserve the authenticated wedding identity;
normal saves omit identity columns. A database trigger also blocks direct API
updates, including updates from wedding team members with the `admin` role.
Unchanged identity values in older clients' save payloads remain valid.

## Rollout

1. Apply `supabase/migrations/20260921000000_lock_wedding_identity.sql` to the
   **Rovty Wed Supabase project**, not the dashboard project. Verify the project's
   URL against the deployed Wed Worker before running SQL; this repository's
   local Supabase project ID may differ. This change was tested locally only.
2. Deploy the `rovty.com` support widget and Worker changes.
3. Deploy `rovty-wed` with the locked fields and support action.

No dashboard database migration is needed. Chat continues to use the existing
Assist tables and Telegram integration. Required marketing Worker secrets and
vars remain the existing `ASSIST_*` settings and `telegram` bot token.

`wedding_identity_claims` records the first setup for each owner. Its unique
primary key blocks concurrent or subsequent self-service creation, including
after a wedding has been removed by staff. Failed setup rolls the claim back.
Existing rows and duplicate owners are preserved. Clients cannot edit claims or
delete weddings. This fits the current portal's single-wedding account model;
support should arrange a separate purchase/account for another wedding. The
claim is removed with the auth account through its foreign key.

## Support and staff corrections

The request action opens a new `rovty.com/contact` tab and starts a fresh Assist
conversation with a prepared correction request. The original editor and its
unsaved work stay open. Only wedding ID, username and couple names are passed,
in a URL fragment that is consumed and removed from history. No auth token,
guest code, account email or other wedding data is included. Chat session tokens
remain on the marketing origin. Reload resumes the conversation without sending
the prepared message again. Interrupted sends keep a prepared retry; an unavailable
chat offers the contact form. Failed Telegram delivery is shown explicitly and
can be retried using the saved message, without making another chat.

The request is **visitor-supplied context, not proof of ownership**. Staff must
verify ownership, ask for the requested correction and reason, and distinguish
a setup mistake from a different couple seeking to reuse access. A chat request
never changes the wedding automatically.

For an approved correction, use a trusted SQL editor or server-side service-role
connection. Wedding member `admin` is not a platform staff role. Never expose a
service-role key or a bypass switch to clients. Record the decision in the
support conversation, then update only approved fields and `updated_at`:

```sql
-- Replace placeholders only after verifying the request. Run in a transaction
-- and inspect the returning row before committing.
begin;
update public.weddings
set bride = 'Approved name', updated_at = now()
where id = '<verified wedding UUID>'
returning id, bride, groom, slug;
-- commit;  -- after review; rollback if incorrect
```

Changing a username changes the public URL: existing invitations and links will
need updating. Tell the couple before approving that correction. Refresh the
editor after staff changes; optimistic save checks prevent a stale studio draft
from overwriting the new version.

## Validation

- `npm test`, `npm run build`, `npm run lint` in Wed.
- `python3 tests/identity_database.py` runs the migration on an isolated,
  disposable PostgreSQL container, including concurrent setup and bypass tests.
- `tests/identity_browser.py` uses the three local servers documented in
  `rovty-dashboard/docs/platform-navigation.md` and Python Playwright + Chrome.
  All account, wedding, support and contact APIs are mocked.
- Marketing: `node --experimental-strip-types --test tests/assist.test.ts`,
  `npm run build`, `npm run lint`. API tests mock both Supabase and Telegram.
