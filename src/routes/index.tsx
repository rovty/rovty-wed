import { createFileRoute } from "@tanstack/react-router";
import { WeddingSite, WeddingNotLive } from "@/components/WeddingSite";
import { fetchPublishedWedding, formatLongDate, type PublicWedding } from "@/lib/wedding";

export const Route = createFileRoute("/")({
  loader: () => fetchPublishedWedding(),
  head: ({ loaderData }) => {
    const wedding = loaderData as PublicWedding | null;
    const names = wedding ? `${wedding.groom} & ${wedding.bride}` : "Wedding Invitation";
    const when = wedding
      ? `${formatLongDate(wedding.date)} · ${wedding.venue ?? ""}${wedding.hall ? ` · ${wedding.hall}` : ""}`
      : "";
    return {
      meta: [
        { title: `${names} - Wedding Invitation` },
        { name: "description", content: wedding?.description ?? "You're invited." },
        { property: "og:title", content: `${names} - Wedding Invitation` },
        { property: "og:description", content: when },
      ],
    };
  },
  component: Home,
});

function Home() {
  const wedding = Route.useLoaderData();
  return wedding ? <WeddingSite wedding={wedding} /> : <WeddingNotLive />;
}
