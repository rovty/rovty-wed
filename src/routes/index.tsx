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
import { fontLinks } from "@/lib/wedding";
import { WED_PUBLIC_SEO, WED_APPLICATION_SCHEMA } from "@/lib/public-seo";

// This route's own font, not the shared UI_FONTS_HREF (Archivo) every other
// admin/marketing route uses — the "Rovty Wed Home" redesign is set in
// Geist, not Archivo. Signature-template previews in the live picker load
// their own per-template fonts separately (LivePreviewPhone.tsx).
const HOME_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap";

const {
  title: TITLE,
  description: DESCRIPTION,
  url: CANONICAL,
} = WED_PUBLIC_SEO;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      // The public home and template collection explicitly opt into indexing.
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      // Deliberately the brand icon, not a real/sample invitation image:
      // this is the bare-domain marketing page, not any one wedding's link,
      // so its preview shouldn't imply it belongs to a specific couple.
      { property: "og:image", content: "https://wed.rovty.com/wed-og.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://wed.rovty.com/wed-og.png" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(WED_APPLICATION_SCHEMA),
      },
    ],
    // Template previews load their own fonts when they become visible.
    links: [
      { rel: "canonical", href: CANONICAL },
      ...fontLinks(HOME_FONTS_HREF),
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
  }),
  component: WedLandingPage,
});
