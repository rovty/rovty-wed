import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Sparkles, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/wedding/Reveal";
import { FloralDivider, FloralCorner } from "@/components/wedding/Floral";
import { z } from "zod";
import { fallback } from "@tanstack/zod-adapter";
import seatingPlanImg from "@/assets/seating.png";

type SeatingData = {
  guest_name: string;
  guest_code: string;
  table_number: number;
  table_name: string | null;
  map_x: number;
  map_y: number;
  tablemates: { name: string; is_current: boolean }[];
};

export const Route = createFileRoute("/seating")({
  validateSearch: z.object({
    code: fallback(z.string().optional(), undefined),
  }),
  head: () => ({
    meta: [
      { title: "Your Table is Ready — Iresh & Asha ♡ 26 August 2026" },
      {
        name: "description",
        content: "Find your table at Iresh & Asha's wedding reception at The Epitome Hotel, Crown Ballroom.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Your Table is Ready 🪑" },
      {
        property: "og:description",
        content: "See your seating details for Iresh & Asha's wedding reception — 26 August 2026 ♡",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://asha.iresh.xyz/seat.png" },
      { property: "og:image:secure_url", content: "https://asha.iresh.xyz/seat.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "1024" },
      { property: "og:image:alt", content: "Iresh & Asha Wedding Seating" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Your Table is Ready 🪑" },
      { name: "twitter:description", content: "See your seating details for Iresh & Asha's wedding reception — 26 August 2026 ♡" },
      { name: "twitter:image", content: "https://asha.iresh.xyz/seat.png" },
    ],
  }),
  component: SeatingPage,
});

function Ornament() {
  return (
    <div className="divider-ornament my-4">
      <span className="divider-line" />
      <Sparkles className="h-4 w-4" />
      <span className="divider-line" />
    </div>
  );
}

function SeatingPage() {
  const { code } = Route.useSearch();
  const [seating, setSeating] = useState<SeatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noCode, setNoCode] = useState(false);

  useEffect(() => {
    if (!code) {
      setNoCode(true);
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc("get_seating_by_code", {
        _code: code,
      });
      if (!error && data) {
        setSeating(data as unknown as SeatingData);
      }
      setLoading(false);
    })();
  }, [code]);

  if (loading) {
    return (
      <main className="grid min-h-[100svh] place-items-center text-sm text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (noCode) {
    return (
      <main className="grid min-h-[100svh] place-items-center px-5">
        <div className="glass-card max-w-sm rounded-3xl p-8 text-center">
          <Ornament />
          <h2 className="font-display text-2xl">Invitation Required</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Please use the personal link sent to you to view your seating
            information.
          </p>
        </div>
      </main>
    );
  }

  if (!seating) {
    return (
      <main className="grid min-h-[100svh] place-items-center px-5">
        <div className="glass-card max-w-sm rounded-3xl p-8 text-center">
          <FloralCorner
            className="pointer-events-none absolute left-4 top-4 h-20 w-20 opacity-60"
            style={{ transform: "none" }}
          />
          <FloralCorner
            className="pointer-events-none absolute right-4 top-4 h-20 w-20 opacity-60"
            style={{ transform: "scaleX(-1)" }}
          />
          <Ornament />
          <p className="font-script text-lg italic text-rose">Stay tuned</p>
          <h2 className="mt-2 font-display text-2xl">
            Your seating information will be available soon
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            We're still finalising the seating arrangement. Please check back
            closer to the day.
          </p>
          <Heart className="mx-auto mt-4 h-5 w-5 text-rose" />
        </div>
      </main>
    );
  }

  const tableNum = String(seating.table_number).padStart(2, "0");

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden">
      {/* Corner ornaments */}
      <FloralCorner
        className="pointer-events-none absolute left-3 top-3 h-20 w-20 opacity-50 sm:h-24 sm:w-24"
        style={{ transform: "none" }}
      />
      <FloralCorner
        className="pointer-events-none absolute right-3 top-3 h-20 w-20 opacity-50 sm:h-24 sm:w-24"
        style={{ transform: "scaleX(-1)" }}
      />

      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-14 sm:py-20">
        {/* Header */}
        <Reveal>
          <h1 className="text-center font-display text-4xl leading-[1.05] sm:text-5xl">
            <span>Iresh</span>
            <span className="mx-2 font-script italic text-gradient-gold">
              &
            </span>
            <span>Asha</span>
          </h1>
        </Reveal>

        <Reveal delay={150}>
          <p className="mt-3 text-center text-[0.65rem] font-medium uppercase tracking-[0.4em] text-muted-foreground sm:text-xs">
            26 August 2026
          </p>
        </Reveal>

        <Reveal delay={250}>
          <FloralDivider className="mt-5 w-56 text-champagne sm:w-64" />
        </Reveal>

        {/* Welcome */}
        <Reveal delay={350}>
          <p className="mt-8 text-center font-script text-2xl italic leading-snug text-foreground sm:text-3xl">
            Welcome, {seating.guest_name}{" "}
            <Heart className="inline h-5 w-5 text-rose" />
          </p>
        </Reveal>

        {/* Table number card */}
        <Reveal delay={450} className="mt-8 w-full">
          <div className="glass-card rounded-3xl p-6 text-center sm:p-8">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
              Your Table
            </p>
            <p
              className="mt-2 font-display text-6xl sm:text-7xl"
              style={{
                background: "var(--gradient-gold)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {tableNum}
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Crown Ballroom
            </p>
          </div>
        </Reveal>

        {/* Tablemates */}
        <Reveal delay={550} className="mt-6 w-full">
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <p className="text-center text-[0.65rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
              You're seated with
            </p>
            <Ornament />
            <ul className="space-y-2.5">
              {seating.tablemates.map((mate) => (
                <li
                  key={mate.name}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                    mate.is_current
                      ? "bg-champagne/20 font-semibold text-foreground"
                      : "text-foreground/80"
                  }`}
                >
                  <span
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      mate.is_current
                        ? "bg-gold"
                        : "bg-champagne"
                    }`}
                  />
                  {mate.name}
                  {mate.is_current && (
                    <span className="ml-auto text-[0.6rem] uppercase tracking-widest text-gold">
                      You
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Seating map */}
        <Reveal delay={650} className="mt-6 w-full">
          <p className="mb-3 text-center text-[0.65rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
            Your Location
          </p>
          <div className="glass-card overflow-hidden rounded-3xl p-2 sm:p-3">
            <div className="relative">
              <img
                src={seatingPlanImg}
                alt="Crown Ballroom seating plan"
                className="block h-auto w-full select-none rounded-2xl"
                loading="eager"
                draggable={false}
              />
              {/* Highlight marker */}
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${seating.map_x}%`,
                  top: `${seating.map_y}%`,
                }}
              >
                {/* Outer glow */}
                <div className="seating-marker flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full border-2 border-gold/80 shadow-[0_0_18px_4px_rgba(186,150,80,0.35)] sm:h-14 sm:w-14" />
                </div>
                {/* Label */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold/90 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-white shadow-sm sm:text-[0.6rem]">
                  Your Table
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Venue directions */}
        <Reveal delay={750} className="mt-6 w-full">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("The Epitome Hotel Kurunegala")}`}
            target="_blank"
            rel="noreferrer"
            className="glass-card flex items-center gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
              style={{ background: "var(--gradient-gold)" }}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">The Epitome Hotel</p>
              <p className="text-[11px] text-muted-foreground">
                Crown Ballroom · Kurunegala
              </p>
            </div>
            <span className="text-xs text-muted-foreground">Directions →</span>
          </a>
        </Reveal>

        {/* Closing */}
        <Reveal delay={850}>
          <FloralDivider className="mt-10 w-56 text-champagne sm:w-64" />
          <p className="mt-6 text-center font-script text-lg italic text-foreground/70">
            We can't wait to celebrate with you{" "}
            <Heart className="inline h-4 w-4 text-rose" />
          </p>
        </Reveal>
      </div>
    </main>
  );
}
