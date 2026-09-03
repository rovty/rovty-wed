import { createFileRoute } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";
import { Reveal } from "@/components/wedding/Reveal";
import { FloralDivider, FloralCorner } from "@/components/wedding/Floral";
import seatingPlanImg from "@/assets/seating.png";

export const Route = createFileRoute("/peoples-bank")({
  component: PeoplesBankPage,
  head: () => ({
    meta: [
      { title: "People's Bank — Tables 13, 14, 16 — Iresh & Asha" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const TABLES = [
  { number: 13, x: 61.62, y: 73.10 },
  { number: 14, x: 63.82, y: 88.50 },
  { number: 16, x: 72.37, y: 73.10 },
];

function PeoplesBankPage() {
  return (
    <main className="relative min-h-[100svh] overflow-x-hidden">
      <FloralCorner
        className="pointer-events-none absolute left-3 top-3 h-20 w-20 opacity-50 sm:h-24 sm:w-24"
        style={{ transform: "none" }}
      />
      <FloralCorner
        className="pointer-events-none absolute right-3 top-3 h-20 w-20 opacity-50 sm:h-24 sm:w-24"
        style={{ transform: "scaleX(-1)" }}
      />

      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-14 sm:py-20">
        <Reveal>
          <h1 className="text-center font-display text-4xl leading-[1.05] sm:text-5xl">
            <span>Iresh</span>
            <span className="mx-2 font-script italic text-gradient-gold">&</span>
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

        <Reveal delay={350}>
          <p className="mt-8 text-center font-script text-2xl italic leading-snug text-foreground sm:text-3xl">
            Welcome, People's Bank{" "}
            <Heart className="inline h-5 w-5 text-rose" />
          </p>
        </Reveal>

        <Reveal delay={450} className="mt-8 w-full">
          <div className="glass-card rounded-3xl p-6 text-center sm:p-8">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
              Your Tables
            </p>
            <div className="mt-3 flex items-center justify-center gap-4">
              {TABLES.map((t) => (
                <p
                  key={t.number}
                  className="font-display text-5xl sm:text-6xl"
                  style={{
                    background: "var(--gradient-gold)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {String(t.number).padStart(2, "0")}
                </p>
              ))}
            </div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Crown Ballroom
            </p>
          </div>
        </Reveal>

        <Reveal delay={550} className="mt-6 w-full">
          <p className="mb-3 text-center text-[0.65rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
            Your Locations
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
              {TABLES.map((t) => (
                <div
                  key={t.number}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${t.x}%`, top: `${t.y}%` }}
                >
                  <div className="seating-marker flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-2 border-gold/80 shadow-[0_0_18px_4px_rgba(186,150,80,0.35)] sm:h-14 sm:w-14" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold/90 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-white shadow-sm sm:text-[0.6rem]">
                    Table {t.number}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={650} className="mt-6 w-full">
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

        <Reveal delay={750}>
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
