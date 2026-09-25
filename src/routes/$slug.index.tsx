// The main public invitation page — moved here from $slug.tsx, which is
// now just the layout (`<Outlet />`) that this and $slug.seating.tsx both
// sit under. See $slug.tsx's header comment for why that split exists.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WeddingSite, WeddingNotLive } from "@/components/WeddingSite";
import { StudioWeddingSite } from "@/components/studio/StudioWeddingSite";
import { SignatureWeddingSite } from "@/components/wedding-templates";
import { isSignatureTemplate } from "@/lib/wedding-signature";
import { customFontHref } from "@/lib/studio/design";
import {
  fetchWeddingBySlug,
  fontLinks,
  formatLongDate,
  isWeddingTemplate,
  templateFontsHref,
  type PublicWedding,
  type WeddingTemplate,
} from "@/lib/wedding";

export const Route = createFileRoute("/$slug/")({
  loader: ({ params }) => fetchWeddingBySlug(params.slug),
  head: ({ loaderData }) => {
    const wedding = loaderData as PublicWedding | null;
    // Every wedding here is one customer's private invitation — reachable
    // only by knowing (or being sent) its slug/guest code, never something
    // Rovty Wed wants surfaced in Google results. `noindex` has to come from
    // this head() (SSR, runs server-side per request — see __root.tsx) and
    // not a client-side effect, since crawlers read the meta tags out of the
    // initial HTML and don't run our JS. Query params (?code=...) never
    // reach this function at all — TanStack Router matches /$slug purely on
    // the path, so a guest code can't produce a separate indexable variant.
    if (!wedding)
      return {
        meta: [
          { title: "Wedding Invitation" },
          { name: "robots", content: "noindex" },
        ],
        links: fontLinks(templateFontsHref("classic")),
      };
    const names = `${wedding.groom} & ${wedding.bride}`;
    const when = `${formatLongDate(wedding.date)} · ${wedding.venue ?? ""}${wedding.hall ? ` · ${wedding.hall}` : ""}`;
    // WhatsApp (and every other link-preview crawler) reads OG tags from the
    // server-rendered HTML at the moment a link is first shared, then caches
    // the result against that exact URL — so per-wedding images fall out for
    // free here since every wedding already has its own /$slug URL.
    // shareImageUrl is a dedicated upload for this (Design → "Share image")
    // since couplePhotoUrl is framed for the invitation page itself and
    // often portrait, which crops awkwardly into the wide box chat apps use
    // for preview cards. Falls back to the couple photo, then a generic
    // default, so weddings that haven't uploaded either still get *some*
    // preview. Must be an absolute URL: both Supabase storage URLs already
    // are (getPublicUrl), the last-resort fallback is hardcoded absolute for
    // the same reason.
    const ogImage =
      wedding.shareImageUrl ??
      wedding.couplePhotoUrl ??
      "https://wed.rovty.com/invite.jpg";
    return {
      meta: [
        { title: `${names} - Wedding Invitation` },
        { name: "description", content: wedding.description },
        { property: "og:title", content: `${names} - Wedding Invitation` },
        { property: "og:description", content: when },
        { property: "og:image", content: ogImage },
        { name: "twitter:image", content: ogImage },
        { name: "robots", content: "noindex" },
      ],
      links: [
        ...fontLinks(templateFontsHref(wedding.template)),
        ...(wedding.design && customFontHref(wedding.design)
          ? [{ rel: "stylesheet", href: customFontHref(wedding.design)! }]
          : []),
        // The hero photo is above the fold on every template — fetch it as
        // early as the HTML is parsed rather than waiting for React.
        ...(wedding.couplePhotoUrl
          ? [{ rel: "preload", as: "image", href: wedding.couplePhotoUrl }]
          : []),
      ],
    };
  },
  component: SlugIndexPage,
});

function SlugIndexPage() {
  const wedding = Route.useLoaderData();
  const [preview, setPreview] = useState<WeddingTemplate | null>(null);

  // `?preview=<template>` lets the admin's template picker (and anyone the
  // couple sends the link to) see the invitation in a different design
  // without saving it. Client-only so SSR/OG output always reflects the
  // saved template; harmless if the value isn't a real template id.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("preview");
    if (p && isWeddingTemplate(p)) setPreview(p);
  }, []);

  if (!wedding) return <WeddingNotLive />;
  const shown = preview ? { ...wedding, template: preview } : wedding;
  return (
    <>
      {preview && <TemplateFontLoader template={preview} />}
      {isSignatureTemplate(shown.template) ? (
        // A leftover `design` from a previous Studio template must never
        // route this to StudioWeddingSite below — signature designs are
        // fixed, bespoke pages with no Studio section data to render.
        <SignatureWeddingSite key={shown.template} wedding={shown} />
      ) : shown.design ? (
        <StudioWeddingSite
          key={shown.template}
          wedding={shown}
          design={shown.design}
        />
      ) : (
        <WeddingSite key={shown.template} wedding={shown} />
      )}
    </>
  );
}

// Fonts are normally emitted server-side per saved template (head() above);
// a client-side preview of a different template needs its fonts too.
function TemplateFontLoader({ template }: { template: WeddingTemplate }) {
  useEffect(() => {
    const href = templateFontsHref(template);
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [template]);
  return null;
}
