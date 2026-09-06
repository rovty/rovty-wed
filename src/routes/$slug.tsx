// The actual public invitation URL — this is what admin.tsx's "Public link"
// (wed.rovty.com/{slug}) and the WhatsApp "Copy invitation" message both
// point guests at. Until this file existed, that link 404'd: no route
// matched it, so it always rendered __root.tsx's generic NotFoundComponent
// regardless of what was saved in Details — editing bride/groom never had
// anywhere to show up.
//
// This is a pure layout now — $slug.index.tsx has the actual invitation
// page. Adding $slug.seating.tsx (the guest seating-lookup page) made
// $slug.tsx a parent route whether it liked it or not: TanStack Router
// only ever shows a child route's component through this file's
// `<Outlet />`, so a component here that renders its own leaf content
// instead (which is what used to live in this file) silently swallows
// every child route — /$slug/seating matched fine, its loader ran fine,
// but nothing of it ever reached the screen, because there was no Outlet
// for it to render into.
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug")({
  component: () => <Outlet />,
});
