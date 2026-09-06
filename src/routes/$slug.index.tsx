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
    if (!wedding) return { meta: [{ title: "Wedding Invitation" }] };
    const names = `${wedding.groom} & ${wedding.bride}`;
    const when = `${formatLongDate(wedding.date)} · ${wedding.venue ?? ""}${wedding.hall ? ` · ${wedding.hall}` : ""}`;
    return {
      meta: [
        { title: `${names} - Wedding Invitation` },
        { name: "description", content: wedding.description },
        { property: "og:title", content: `${names} - Wedding Invitation` },
        { property: "og:description", content: when },
      ],
    };
  },
  component: SlugIndexPage,
});

function SlugIndexPage() {
  const wedding = Route.useLoaderData();
  return wedding ? <WeddingSite wedding={wedding} /> : <WeddingNotLive />;
}
