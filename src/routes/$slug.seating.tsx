// Nested under /$slug (not a standalone /seating route) so it can look up
// *this* wedding by slug — same fix $slug.tsx itself needed (see that
// file's header comment): a top-level /seating route can't know which
// wedding it's for in a multi-tenant app, and "Copy seating message"
// (SeatingList.tsx) has always linked to `${slug}/seating?code=...`, so
// the old top-level /seating route 404'd on every real link sent to a
// guest.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  SeatingExperience,
  type SeatingData,
} from "@/components/wedding/SeatingExperience";
import { customFontHref } from "@/lib/studio/design";
import {
  fetchWeddingBySlug,
  fontLinks,
  templateFontsHref,
  type PublicWedding,
} from "@/lib/wedding";

type SeatingSearch = { code?: string };

export const Route = createFileRoute("/$slug/seating")({
  // Only one optional string param — a hand-rolled validator keeps zod (and
  // its adapter's peer-dep conflict) out of the client bundle entirely.
  validateSearch: (search: Record<string, unknown>): SeatingSearch => ({
    code:
      typeof search.code === "string" && search.code.trim()
        ? search.code.trim().slice(0, 32)
        : undefined,
  }),
  loader: ({ params }) => fetchWeddingBySlug(params.slug),
  head: ({ loaderData }) => {
    const wedding = loaderData as PublicWedding | null;
    const names = wedding
      ? `${wedding.groom} & ${wedding.bride}`
      : "the couple";
    return {
      meta: [
        { title: `Your Table is Ready · ${names} 🪑` },
        {
          name: "description",
          content: `Find your table at ${names}'s wedding reception${wedding?.venue ? ` at ${wedding.venue}` : ""}.`,
        },
        { name: "robots", content: "noindex" },
      ],
      links: [
        ...fontLinks(templateFontsHref(wedding?.template ?? "classic")),
        ...(wedding?.design && customFontHref(wedding.design)
          ? [{ rel: "stylesheet", href: customFontHref(wedding.design)! }]
          : []),
      ],
    };
  },
  component: SeatingPage,
});

function SeatingPage() {
  const wedding = Route.useLoaderData();
  const { code } = Route.useSearch();
  const [seating, setSeating] = useState<SeatingData | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "unavailable" | "error"
  >("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setSeating(null);
    setStatus("loading");
    if (!code || !wedding) return;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_seating_by_code", {
          _slug: wedding.slug,
          _code: code,
        });
        if (cancelled) return;
        setSeating(!error && data ? (data as unknown as SeatingData) : null);
        setStatus(error ? "error" : data ? "ready" : "unavailable");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wedding, code, attempt]);

  if (!wedding) {
    return (
      <main className="grid min-h-[100svh] place-items-center px-5 text-center">
        <div>
          <h1 className="font-display text-2xl">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This link isn't live yet. Check back once the invitation is
            published.
          </p>
        </div>
      </main>
    );
  }

  return (
    <SeatingExperience
      wedding={wedding}
      seating={seating}
      status={!code ? "missing" : status}
      code={code}
      onRetry={() => setAttempt((value) => value + 1)}
    />
  );
}
