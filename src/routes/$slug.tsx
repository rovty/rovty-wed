// The actual public invitation URL — this is what admin.tsx's "Public link"
// (wed.rovty.com/{slug}) and the WhatsApp "Copy invitation" message both
// point guests at. Until this file existed, that link 404'd: no route
// matched it, so it always rendered __root.tsx's generic NotFoundComponent
// regardless of what was saved in Details — editing bride/groom never had
// anywhere to show up.
import { createFileRoute } from "@tanstack/react-router";
import { WeddingSite, WeddingNotLive } from "@/components/WeddingSite";
import { fetchWeddingBySlug, formatLongDate, type PublicWedding } from "@/lib/wedding";

export const Route = createFileRoute("/$slug")({
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
  component: SlugPage,
});

function SlugPage() {
  const wedding = Route.useLoaderData();
  return wedding ? <WeddingSite wedding={wedding} /> : <WeddingNotLive />;
}
