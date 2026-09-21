# Wedding management

The Rovty team console lives at `/admin/manage`. An approved staff account opening
`/admin` is directed to the console after a server access check. Other accounts
keep the existing couple portal. The console is excluded from search indexing.

## Enable in production

1. Apply the existing Rovty Wed migrations through
   `20260921000000_lock_wedding_identity.sql`, then apply
   `supabase/migrations/20260922000000_wedding_management.sql` **to the Rovty Wed
   Supabase project**, not the dashboard project. Use the normal migration owner
   (`postgres`) so the privileged correction function can use the existing
   identity trigger's trusted role path.
2. Deploy the Wed Worker with its existing `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` server configuration. No new browser keys, dashboard
   tables, authentication provider, or database migration to another provider is
   needed.
3. Sign in through Rovty using **ireshek@gmail.com**, with access to Rovty Wed,
   and open `/admin/manage`. The email must be confirmed in the Wed Auth project.
   The migration approves exactly that account as an administrator.

These steps are release instructions. Development and tests do not apply the
migration to a hosted database or deploy the Worker.

## What the console supports

- Search by couple, username, owner email or venue; filter drafts, published,
  upcoming and past weddings. Wedding lists use 25-row pages.
- Summaries for invited parties, seats, responses, attendance, pending replies,
  table capacity and seating assignments.
- Owner email, sign-in time, wedding identifiers, dates, venue, invitation copy,
  media links, template, design presence, creation and update times.
- Correct couple names or usernames after verifying a support request. Changing
  a username changes the public URL and invalidates old wedding links.
- Edit dates, location, messages, media URLs, template and publication.
- Search guests in 50-row pages; edit guest name, title, phone and party size.
  Invitation codes and actual guest RSVPs are preserved.
- Change wedding member roles, remove members, or add an existing confirmed Wed
  account. Adds do not send email or grant a dashboard subscription. The account
  must already be able to open Wed. Because the couple portal opens one wedding,
  adding an account belonging to another wedding is rejected.
- Edit table names, capacity and active state; publish/unpublish the seating page.
- Review the latest 30 staff changes, including who, when, why and before/after
  values. Ordinary couple edits are not included in this history.

Times are displayed and edited in the operator's device timezone. The database
stores instants with timezone information. Billing and product entitlements are
owned by the separate dashboard database and are not fabricated in this console.

The custom studio design JSON is preserved. Layout, section and gallery design
editing remains in the existing studio. Ownership transfer, wedding deletion,
invitation sending and modifying a guest's response are intentionally outside
this console's edit actions.

## Access and data boundaries

`/api/manage` accepts a Supabase bearer session, verifies it with Auth, and derives
the actor UUID from that result. It never accepts the actor or a staff role from
the client. Only a server-side service client can execute `rovty_manage`.

The database function checks `rovty_staff` against the actor's **confirmed Auth
email on every request**. An ordinary wedding member with role `admin` does not
get platform access. `viewer` staff can read but cannot write. Only the explicitly
approved email is seeded. Future staff access changes must be made deliberately
through a trusted operator connection; the console cannot grant itself staff
access. Removing a staff row revokes subsequent API requests immediately.

Browser database roles cannot read or modify the staff allowlist/audit tables or
execute either management function. Existing wedding RLS and the couple identity
lock remain in effect. Server code stays out of the browser bundle.

Writes require a same-origin JSON request, a bounded body, whitelisted fields,
and a reason of 5 to 1000 characters. Wedding/table/publication edits use versions;
guest edits compare original editable values and member edits compare the previous
role. The record update and its audit row commit in one transaction. A stale save
returns 409 and the editor retains the unsaved values. Close it and refresh to
review the current record before applying the correction again.

Management data stays in transient query memory, is cleared when leaving the
console or losing session access, and is served with `private, no-store`. Audit
records include personal wedding/guest details and should be covered by the
project's normal data retention and backup process.

## Implementation

- `src/lib/management/schema.ts`: shared types, field definitions, strict validation.
- `src/lib/management/handler.server.ts`: injectable request handler, authentication,
  request boundaries and safe error responses.
- `src/routes/api.manage.ts`: lazy server wiring to the Supabase service client.
- `src/components/management/`: responsive directory/detail views and audited editor.
- `supabase/migrations/20260922000000_wedding_management.sql`: staff allowlist,
  service-only RPCs, metrics and atomic audit.

The console and its stylesheet are route chunks. Search is debounced, lists and
guests are paginated, and rows compute metrics only for the requested page.

## Local validation

```sh
npm test
npm run lint
npm run build
python3 tests/management_database.py
```

The database script creates a disposable `postgres:17-alpine` Docker container
with networking disabled, applies the real current migrations using small
Auth/Storage stubs, and removes the container afterward. It covers authorization,
identity protection, summaries, filters, pagination, conflicts, atomic rollback,
concurrent writes, cross-wedding references, editable entities and revocation.

For the browser checks, start the app using dummy Supabase values:

```sh
VITE_SUPABASE_URL=https://rovty-wed-test.supabase.co \
VITE_SUPABASE_PUBLISHABLE_KEY=local-test-public \
npm run dev -- --host 127.0.0.1 --port 5178
python3 tests/management_browser.py
```

The Python environment needs Playwright and Chrome. Browser tests intercept all
Auth/management requests, exercise desktop/mobile flows, and write screenshots
under `/tmp/rovty-management-*.png`. No real messages, user accounts, hosted
wedding updates or third-party authentication requests are made.
