// The main public invitation page — moved here from $slug.tsx, which is
// now just the layout (`<Outlet />`) that this and $slug.seating.tsx both
// sit under. See $slug.tsx's header comment for why that split exists.
import { createFileRoute } from "@tanstack/react-router";
import { WeddingSite, WeddingNotLive } from "@/components/WeddingSite";
import {
  fetchWeddingBySlug,
  formatLongDate,
  type PublicWedding,
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
    };
  },
  component: SlugIndexPage,
});

function SlugIndexPage() {
  const wedding = Route.useLoaderData();
  return wedding ? <WeddingSite wedding={wedding} /> : <WeddingNotLive />;
}
