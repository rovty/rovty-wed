import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { weddingPhoto } from "@/lib/wedding-config";
import { fetchPublishedWedding, formatLongDate, type PublicWedding } from "@/lib/wedding";
import { Reveal } from "@/components/wedding/Reveal";
import { FloralDivider, FloralCorner, RoseBud } from "@/components/wedding/Floral";

export const Route = createFileRoute("/thankyou")({
  loader: () => fetchPublishedWedding(),
  head: ({ loaderData }) => {
    const wedding = loaderData as PublicWedding | null;
    const names = wedding ? `${wedding.groom} & ${wedding.bride}` : "us";
    const when = wedding ? formatLongDate(wedding.date) : "";
    return {
      meta: [
        { title: `Thank You — ${names} ♡ ${when}` },
        {
          name: "description",
          content: `A heartfelt thank you from ${names} for being part of our wedding day, ${when}.`,
        },
        { property: "og:title", content: `Thank You — ${names}` },
        {
          property: "og:description",
          content: `Thank you for being part of our special day. With love, ${names} — ${when}.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ThankYouPage,
});

function ThankYouPage() {
  // Lock the whole card to a light, ivory palette regardless of system theme.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const wedding = Route.useLoaderData();
  if (!wedding) return null;
  const weddingDate = formatLongDate(wedding.date);
  const coupleNames = `${wedding.groom} & ${wedding.bride}`;

  return (
    <main className="wedding-bg min-h-[100svh] w-full overflow-x-hidden font-serif text-ink">
      {/* Corner ornaments */}
      <FloralCorner
        className="pointer-events-none absolute left-4 top-4 h-24 w-24 opacity-80 sm:h-28 sm:w-28 float-slow"
        style={{ transform: "none" }}
      />
      <FloralCorner
        className="pointer-events-none absolute right-4 top-4 h-24 w-24 opacity-80 sm:h-28 sm:w-28 float-slow"
        style={{ transform: "scaleX(-1)" }}
      />
      <FloralCorner
        className="pointer-events-none absolute bottom-4 left-4 h-24 w-24 opacity-80 sm:h-28 sm:w-28 float-slow"
        style={{ transform: "scaleY(-1)" }}
      />
      <FloralCorner
        className="pointer-events-none absolute bottom-4 right-4 h-24 w-24 opacity-80 sm:h-28 sm:w-28 float-slow"
        style={{ transform: "scale(-1, -1)" }}
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center px-7 py-20 sm:py-24">
        {/* Names */}
        <Reveal>
          <h1 className="wedding-names text-center text-[2.75rem] leading-[1.05] sm:text-5xl">
            <span className="text-ink">{wedding.groom}</span>
            <span className="mx-3 text-champagne-deep" aria-hidden="true">
              ♡
            </span>
            <span className="text-ink">{wedding.bride}</span>
          </h1>
        </Reveal>

        <Reveal delay={250}>
          <p className="mt-5 text-center text-[0.7rem] font-medium uppercase tracking-[0.42em] text-champagne-deep sm:text-xs">
            {weddingDate}
          </p>
        </Reveal>

        <Reveal delay={450} className="mt-7">
          <FloralDivider className="w-64 text-champagne sm:w-72" />
        </Reveal>

        {/* Opening line */}
        <Reveal delay={650}>
          <p className="mt-10 text-center font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
            Thank you for being part of
            <br />
            our special day.
          </p>
        </Reveal>

        {/* The photograph — the heart of the card */}
        <Reveal delay={350} y={36} className="mt-12 w-full">
          <figure className="wedding-photo-frame group relative mx-auto w-full sm:max-w-[26rem]">
            <div className="absolute -inset-3 rounded-[2px] border border-champagne/30" aria-hidden="true" />
            <div className="relative rounded-[2px] border border-champagne/55 bg-cream p-2 shadow-[0_34px_70px_-34px_rgba(120,86,40,0.45)]">
              <div className="overflow-hidden rounded-[1px] border border-champagne/40">
                <img
                  src={weddingPhoto}
                  alt={`${coupleNames}'s wedding photograph`}
                  width={1024}
                  height={1536}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="block h-auto w-full select-none"
                  style={{ aspectRatio: "1024 / 1536" }}
                  draggable={false}
                />
              </div>
            </div>
            <RoseBud className="absolute -right-3 -top-3 h-7 w-7 opacity-90" />
          </figure>
        </Reveal>

        {/* Message below the photo */}
        <Reveal delay={300}>
          <p className="mt-12 max-w-[22rem] text-center font-serif text-lg leading-relaxed text-ink-soft sm:text-xl">
            Your presence, love and blessings made our day even more special.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-4 max-w-[22rem] text-center font-serif text-lg leading-relaxed text-ink-soft sm:text-xl">
            Thank you for celebrating this beautiful beginning with us.
          </p>
        </Reveal>

        <Reveal delay={350} className="mt-10">
          <FloralDivider className="w-56 text-champagne sm:w-64" />
        </Reveal>

        {/* Sign-off */}
        <Reveal delay={250}>
          <p className="mt-8 text-center font-serif text-xl italic text-ink-soft">With love,</p>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-2 text-center font-display text-3xl text-champagne-deep sm:text-4xl">
            {coupleNames} <span className="text-blush">♡</span>
          </p>
        </Reveal>

        <Reveal delay={600}>
          <p className="mt-10 text-center text-[0.62rem] uppercase tracking-[0.4em] text-champagne-deep/70">
            {weddingDate}
          </p>
        </Reveal>
      </div>
    </main>
  );
}

