// Rovty Wed's marketing homepage. This used to call fetchPublishedWedding()
// and render whichever customer's wedding happened to have `published =
// true` — a leftover from before this app went multi-tenant (see that
// function's own comment in lib/wedding.ts). That meant the bare domain
// root showed a random real couple's private invitation, which is exactly
// wrong for a URL that's meant to be indexable: Google would index whoever
// won that query. There's no loader here now, and nothing on this page
// reads from Supabase — see components/wed-landing/WedLandingPage.tsx for
// the actual page (implements the "Rovty Wed Landing B" design canvas).
import { createFileRoute } from "@tanstack/react-router";
import { WedLandingPage } from "@/components/wed-landing/WedLandingPage";

const TITLE = "Rovty Wed | Wedding Invitations Your Guests Actually Open";
const DESCRIPTION =
  "A designed invitation page, guest list, WhatsApp sending, RSVPs, and seating, all in one link, styled exactly like your wedding.";
const CANONICAL = "https://wed.rovty.com/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      // Explicit, not just "absence of noindex" — this is the one page on
      // this domain that should be indexed, so it says so outright rather
      // than relying on every other route remembering to opt out.
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: "https://wed.rovty.com/invite.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://wed.rovty.com/invite.jpg" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: WedLandingPage,
});
