// The full public invitation page body, rendered by /$slug. Every "Public
// link" and personalised WhatsApp link the admin hands out points here.
import {
  Calendar,
  MapPin,
  Heart,
  ChevronRight,
  Apple,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RosePetals } from "@/components/RosePetals";
import { RoseCorner } from "@/components/RoseCorner";
import { LotusPetals } from "@/components/LotusPetals";
import { LotusVineBand, LotusStemsCorner } from "@/components/LotusCorner";
import { Countdown } from "@/components/Countdown";
import { MusicPlayer } from "@/components/MusicPlayer";
import { InlineRsvp } from "@/components/InlineRsvp";
import { InvitationOpener } from "@/components/InvitationOpener";
import { Monogram } from "@/components/Monogram";
import { Motif } from "@/components/Motif";
import { Reveal } from "@/components/wedding/Reveal";
import {
  formatWeekdayYear,
  formatTime,
  formatScriptDate,
  formatLongDate,
  googleCalendarUrl,
  isDecorativeTemplate,
  hasLotusPetals,
  familyLine,
  TEMPLATE_META,
  type Motif as MotifKind,
  type PhotoFrame,
  type PublicWedding,
  type SectionStyle,
} from "@/lib/wedding";
import { supabase } from "@/integrations/supabase/client";
import coupleImg from "@/assets/couple.webp";
import venueImg from "@/assets/venue.webp";

export function WeddingNotLive() {
  return (
    <main className="grid min-h-[100svh] place-items-center px-5 text-center">
      <div className="tpl-card tpl-surface-body max-w-sm">
        <h1 className="font-display text-2xl">
          This invitation isn't live yet
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Check back soon, or ask the couple for their latest link.
        </p>
      </div>
    </main>
  );
}

// Every template renders this same WeddingSite tree with the same
// RSVP/seating/calendar functionality — what differs per template
// (TEMPLATE_META, in @/lib/wedding) is the hero layout, the opener
// animation, the divider motif, and the CSS tokens `theme-${template}`
// redefines (see styles.css's .theme-* blocks). Only "classic" shows the
// falling-petals/corner-rose decoration (isDecorativeTemplate); "lotus"
// gets its own separate falling-lotus/corner-vine decoration
// (hasLotusPetals) instead of joining that set — see that function's own
// comment in lib/wedding.ts for why.
export function WeddingSite({ wedding }: { wedding: PublicWedding }) {
  const decorative = isDecorativeTemplate(wedding.template);
  const lotusDecor = hasLotusPetals(wedding.template);
  const meta = TEMPLATE_META[wedding.template];
  return (
    // overflow-x-hidden (not -clip) here used to leave <main> as its own
    // independently-scrollable container: per spec, when one axis is
    // "hidden" and the other is left "visible", the browser must compute
    // the visible one as "auto" instead — so <main> silently became a
    // second, nested overflow-y:auto scroller alongside the page's own
    // window scroll, and things like the opener's focused button being
    // removed from the DOM could nudge *that* inner scrollTop instead of
    // (or in addition to) window.scrollY, landing the revealed invitation
    // not quite at the top even though window.scrollY read 0. overflow-x
    // "clip" gets the same horizontal-bleed clipping (still needed — the
    // lotus corner art and a couple of hero/gallery images intentionally
    // bleed past the edge) without that side effect, since "clip" doesn't
    // carry the "other axis becomes auto" rule "hidden" does.
    <main
      className={`theme-${wedding.template} relative`}
      style={{ overflowX: "clip" }}
    >
      <div className="tpl-pattern" aria-hidden="true" />
      {decorative && <RosePetals />}
      {lotusDecor && <LotusPetals />}
      <MusicPlayer src={wedding.musicUrl} />
      <InvitationOpener wedding={wedding} />

      <Hero wedding={wedding} decorative={decorative} />
      <Details wedding={wedding} decorative={decorative} />
      <Gallery wedding={wedding} />
      <CalendarSection wedding={wedding} decorative={decorative} />
      <RsvpCta wedding={wedding} motif={meta.motif} />
      <SeatingCta wedding={wedding} motif={meta.motif} />
      <Location wedding={wedding} motif={meta.motif} />
      <Footer wedding={wedding} decorative={decorative} />
    </main>
  );
}

function Hero({
  wedding,
  decorative,
}: {
  wedding: PublicWedding;
  decorative: boolean;
}) {
  const { hero, motif } = TEMPLATE_META[wedding.template];
  const initials = `${wedding.groom.charAt(0)} & ${wedding.bride.charAt(0)}`;
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const dateLine = formatLongDate(wedding.date);
  const placeLine = [wedding.venue, wedding.hall].filter(Boolean).join(" · ");

  return (
    <section className="relative">
      {/* ── centered: classic / chapel / garden — monogram, family line,
          names stacked large, motif. The most "invitation card" layout. */}
      {hero === "centered" && (
        <div className="relative px-5 pt-14 pb-2 sm:pt-20">
          {decorative && <RoseCorner position="tl" size={140} opacity={0.2} />}
          <div className="tpl-stagger relative z-20 mx-auto flex tpl-col flex-col items-center text-center">
            <Monogram initials={initials} size={72} />
            <p className="font-kicker mt-6 whitespace-pre-line text-rose">
              {familyLine(wedding)}
            </p>
            <h1 className="tpl-names mt-5 font-display text-foreground">
              <span className="block">{wedding.groom}</span>
              <span className="font-script my-1 block text-[0.55em] italic leading-none text-gradient-gold">
                &amp;
              </span>
              <span className="block">{wedding.bride}</span>
            </h1>
            <div className="mt-6">
              <Motif motif={motif} />
            </div>
            <p className="font-kicker mt-5 text-muted-foreground">{dateLine}</p>
          </div>
        </div>
      )}

      {/* ── framed: poruwa / nikkah / deco — a double gold rule frames the
          names; formal, traditional, symmetrical. */}
      {hero === "framed" && (
        <div className="relative px-5 pt-12 pb-2 sm:pt-16">
          <div className="tpl-stagger relative z-20 mx-auto tpl-col">
            <div className="tpl-frame p-1.5">
              <div className="tpl-frame__inner flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-14">
                <Monogram initials={initials} size={64} />
                <p className="font-kicker mt-6 whitespace-pre-line text-muted-foreground">
                  {familyLine(wedding)}
                </p>
                <h1 className="tpl-names mt-5 font-display text-foreground">
                  <span className="block">{wedding.groom}</span>
                  <span className="font-script my-1 block text-[0.5em] italic leading-none text-gradient-gold">
                    &amp;
                  </span>
                  <span className="block">{wedding.bride}</span>
                </h1>
                <div className="mt-6">
                  <Motif motif={motif} />
                </div>
                <p className="font-kicker mt-5 text-muted-foreground">
                  {dateLine}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── band: thali — a full-width coloured band carries the names;
          celebratory, saturated. */}
      {hero === "band" && (
        <div
          className="tpl-band relative overflow-hidden px-5 py-16 text-center sm:py-20"
          style={{ borderRadius: 0 }}
        >
          <div className="tpl-stagger relative z-10 mx-auto flex tpl-col flex-col items-center">
            <Monogram initials={initials} size={72} />
            <p
              className="font-kicker mt-6 whitespace-pre-line"
              style={{ opacity: 0.85 }}
            >
              {familyLine(wedding)}
            </p>
            <h1 className="tpl-names mt-5 font-display">
              {wedding.groom} <span className="font-script italic">&amp;</span>{" "}
              {wedding.bride}
            </h1>
            <div className="mt-6" style={{ color: "inherit" }}>
              <Motif motif={motif} />
            </div>
            <p className="font-kicker mt-5" style={{ opacity: 0.8 }}>
              {dateLine}
            </p>
          </div>
        </div>
      )}

      {/* ── typo: noir / quiet — left-aligned, typographic, editorial rule
          under the names, date and venue as a small row. */}
      {hero === "typo" && (
        <div className="relative px-5 pt-14 pb-2 sm:pt-20">
          <div className="tpl-stagger relative z-20 mx-auto tpl-col">
            <div className="flex items-center gap-4">
              <Monogram initials={initials} size={52} />
              <div
                className="h-px flex-1"
                style={{ background: "var(--tpl-rule)" }}
              />
            </div>
            <p className="font-kicker mt-8 text-muted-foreground">
              The wedding of
            </p>
            <h1 className="tpl-names tpl-names--left mt-3 font-display text-foreground">
              <span className="block">{wedding.groom}</span>
              <span className="block">&amp; {wedding.bride}</span>
            </h1>
            <div
              className="mt-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t pt-4"
              style={{ borderColor: "var(--tpl-rule)" }}
            >
              <p className="font-kicker text-muted-foreground">{dateLine}</p>
              {placeLine && (
                <p className="font-kicker text-muted-foreground">{placeLine}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── photoTop: shoreline / film — the photo *is* the hero, edge to
          edge, names set into a gradient at its foot. Tall on phones so it
          fills the first screen like a poster. */}
      {hero === "photoTop" && (
        <div className="relative">
          <div className="relative h-[78svh] min-h-[520px] w-full overflow-hidden sm:h-[72vh]">
            <img
              src={photo}
              alt={names}
              loading="eager"
              fetchPriority="high"
              className="tpl-photo tpl-photo--hero block h-full w-full object-cover"
              style={{ borderRadius: 0 }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.15) 55%, rgba(0,0,0,.78) 100%)",
              }}
            />
            <div className="tpl-stagger absolute inset-x-0 bottom-0 px-6 pb-9 text-center text-white sm:pb-14">
              <p
                className="font-kicker whitespace-pre-line"
                style={{ color: "#fff", opacity: 0.85 }}
              >
                {familyLine(wedding)}
              </p>
              <h1
                className="tpl-names mt-3 font-display"
                style={{ color: "#fff" }}
              >
                {wedding.groom}{" "}
                <span className="font-script italic">&amp;</span>{" "}
                {wedding.bride}
              </h1>
              <p
                className="font-kicker mt-4"
                style={{ color: "#fff", opacity: 0.8 }}
              >
                {dateLine}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── split: editorial / bloom — photo beside the words on desktop,
          photo then words on phones. Magazine opener. */}
      {hero === "split" && (
        <div className="relative px-5 pt-8 pb-2 sm:pt-14">
          <div className="tpl-stagger relative z-20 mx-auto grid tpl-col-wide items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-12">
            <Photo
              src={photo}
              alt={names}
              frame={TEMPLATE_META[wedding.template].photo}
              priority
            />
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <Monogram initials={initials} size={60} />
              </div>
              <p className="font-kicker mt-6 whitespace-pre-line text-rose">
                {familyLine(wedding)}
              </p>
              <h1 className="tpl-names tpl-names--split mt-4 font-display text-foreground md:text-left">
                <span className="block">{wedding.groom}</span>
                <span className="block">
                  <span className="font-script italic text-gradient-gold">
                    &amp;
                  </span>{" "}
                  {wedding.bride}
                </span>
              </h1>
              <div className="mt-6 flex justify-center md:justify-start">
                <Motif motif={motif} />
              </div>
              <p className="font-kicker mt-5 text-muted-foreground">
                {dateLine}
                {placeLine ? ` · ${placeLine}` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── lotus — its own ceremonial layout with the vine band and the
          lotus monogram. */}
      {hero === "lotus" && (
        <div className="relative px-5 pt-24 pb-2 text-center sm:pt-28">
          {hasLotusPetals(wedding.template) && <LotusVineBand />}
          <div className="tpl-stagger relative z-20 mx-auto flex tpl-col flex-col items-center">
            <Monogram variant="lotus" initials={initials} size={104} />
            <p
              className="font-kicker mt-7 max-w-[36ch] whitespace-pre-line text-rose"
              style={{
                textShadow:
                  "0 0 10px var(--background), 0 0 4px var(--background)",
              }}
            >
              {familyLine(wedding, "With the blessings of their families")}
            </p>
            <h1 className="tpl-names mt-5 font-display text-foreground">
              <span className="block">{wedding.groom}</span>
              <span className="font-script my-1 block text-[0.55em] italic leading-none text-gradient-gold">
                &amp;
              </span>
              <span className="block">{wedding.bride}</span>
            </h1>
            <div className="mt-7 mb-1">
              <Motif motif={motif} />
            </div>
            <p className="font-kicker mt-5 text-rose">{dateLine}</p>
          </div>
        </div>
      )}

      {/* Shared across every layout: the line, countdown, and RSVP CTA. */}
      <div className="relative z-20 mx-auto tpl-col px-5 pt-8 pb-8 text-center">
        <p className="mx-auto max-w-[40ch] text-[15px] leading-relaxed text-muted-foreground text-balance">
          {wedding.description}
        </p>
        <p className="mt-5 font-script text-2xl italic text-foreground/85">
          {formatScriptDate(wedding.date)}
        </p>
        <div className="mt-7 w-full">
          <Countdown target={wedding.date} />
        </div>
        <a
          href="#rsvp"
          className="tpl-btn mt-8 min-h-12 px-8 text-sm font-medium"
        >
          <Heart className="h-4 w-4" /> RSVP
        </a>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Shared body primitives. The hero above is already per-template; these
   make the *body* differ too, driven by TEMPLATE_META.photo/.sections and
   the .theme-* tokens — so "Noir" is hairline rules on charcoal, "Chapel"
   is arched photos on pale cards, "Editorial" is full-bleed with captions,
   rather than every template sharing the same glass tiles.
   ──────────────────────────────────────────────────────────────────────── */

function SectionHead({
  kicker,
  title,
  motif,
  align = "center",
}: {
  kicker: string;
  title: string;
  motif: MotifKind;
  align?: "center" | "left";
}) {
  return (
    <header className={align === "center" ? "text-center" : "text-left"}>
      <p className="font-kicker text-rose">{kicker}</p>
      <h2 className="mt-1.5 font-display text-[2rem] leading-[1.05] text-foreground sm:text-4xl">
        {title}
      </h2>
      <div
        className={`mt-4 flex ${align === "center" ? "justify-center" : "justify-start"}`}
      >
        <Motif motif={motif} />
      </div>
    </header>
  );
}

/** A section body surface whose treatment follows the template. */
function Surface({
  sections,
  className = "",
  children,
}: {
  sections: SectionStyle;
  className?: string;
  children: React.ReactNode;
}) {
  const base =
    sections === "card"
      ? "tpl-card"
      : sections === "band"
        ? "tpl-band-surface"
        : "tpl-rule-surface";
  return <div className={`${base} ${className}`}>{children}</div>;
}

/** The couple photo, framed per template. */
function Photo({
  src,
  alt,
  frame,
  priority = false,
}: {
  src: string;
  alt: string;
  frame: PhotoFrame;
  priority?: boolean;
}) {
  const loading = priority ? "eager" : "lazy";
  if (frame === "circle") {
    return (
      <div className="tpl-photo-circle mx-auto aspect-square w-[min(72vw,20rem)] overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading={loading}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  if (frame === "arch") {
    return (
      <div className="tpl-photo-arch mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading={loading}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  if (frame === "framed") {
    return (
      <div className="tpl-photo-framed mx-auto w-full max-w-sm p-2">
        <div className="tpl-photo-framed__inner aspect-[4/5] overflow-hidden">
          <img
            src={src}
            alt={alt}
            loading={loading}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    );
  }
  if (frame === "film") {
    return (
      <figure className="mx-auto w-full max-w-2xl">
        <div className="tpl-photo aspect-[3/2] w-full overflow-hidden">
          <img
            src={src}
            alt={alt}
            loading={loading}
            className="h-full w-full object-cover"
          />
        </div>
      </figure>
    );
  }
  if (frame === "editorial") {
    return (
      <figure className="-mx-5 sm:mx-0">
        <div className="tpl-photo aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4]">
          <img
            src={src}
            alt={alt}
            loading={loading}
            className="h-full w-full object-cover"
          />
        </div>
        <figcaption className="font-kicker mt-3 px-5 text-muted-foreground sm:px-0">
          {alt}
        </figcaption>
      </figure>
    );
  }
  return (
    <div className="tpl-photo mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden">
      <img
        src={src}
        alt={alt}
        loading={loading}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/* ── Details: a proper schedule, not four tiles ───────────────────────── */

function Details({
  wedding,
  decorative,
}: {
  wedding: PublicWedding;
  decorative: boolean;
}) {
  const { motif, sections } = TEMPLATE_META[wedding.template];
  const rows: { label: string; value: string; sub?: string }[] = [
    {
      label: "The day",
      value: formatLongDate(wedding.date),
      sub: formatWeekdayYear(wedding.date).split(" ")[0],
    },
    {
      label: "Ceremony",
      value: formatTime(wedding.date),
      sub: wedding.endDate
        ? `until ${formatTime(wedding.endDate)}`
        : "Auspicious time",
    },
  ];
  if (wedding.receptionDate)
    rows.push({
      label: "Reception",
      value: formatTime(wedding.receptionDate),
      sub: wedding.receptionEnd
        ? `until ${formatTime(wedding.receptionEnd)}`
        : "Onwards",
    });
  if (wedding.venue)
    rows.push({
      label: "Venue",
      value: wedding.venue,
      sub: wedding.hall ?? undefined,
    });

  return (
    <section className="relative px-5 py-14 sm:py-20">
      {decorative && <RoseCorner position="tr" size={140} opacity={0.25} />}
      <Reveal className="relative z-20 mx-auto tpl-col">
        <SectionHead kicker="Save the date" title="The Details" motif={motif} />
        <Surface sections={sections} className="mt-8">
          <dl className="tpl-schedule">
            {rows.map((r) => (
              <div key={r.label} className="tpl-schedule__row">
                <dt className="font-kicker text-muted-foreground">{r.label}</dt>
                <dd>
                  <span className="font-display text-xl text-foreground sm:text-2xl">
                    {r.value}
                  </span>
                  {r.sub && (
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {r.sub}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Surface>
      </Reveal>
    </section>
  );
}

/* ── Gallery: the couple photo, framed per template ──────────────────── */

function Gallery({ wedding }: { wedding: PublicWedding }) {
  const { hero, photo } = TEMPLATE_META[wedding.template];
  // photoTop/split heroes already lead with the photo.
  if (hero === "photoTop" || hero === "split") return null;
  return (
    <section className="relative px-5 py-4">
      <Reveal className="relative z-20 mx-auto tpl-col">
        <Photo
          src={wedding.couplePhotoUrl ?? coupleImg}
          alt={`${wedding.groom} & ${wedding.bride}`}
          frame={photo}
        />
      </Reveal>
    </section>
  );
}

/* ── Calendar ─────────────────────────────────────────────────────────── */

function CalRow({
  icon: Icon,
  label,
  href,
  sameTab,
}: {
  icon: typeof Calendar;
  label: string;
  href: string;
  sameTab?: boolean;
}) {
  return (
    <a
      href={href}
      target={sameTab ? undefined : "_blank"}
      rel={sameTab ? undefined : "noreferrer"}
      className="tpl-row group"
    >
      <span className="tpl-icon grid h-10 w-10 shrink-0 place-items-center">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-foreground">
          {label}
        </span>
        <span className="block text-xs text-muted-foreground">
          Add to calendar
        </span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

function CalendarSection({
  wedding,
  decorative,
}: {
  wedding: PublicWedding;
  decorative: boolean;
}) {
  const { motif, sections } = TEMPLATE_META[wedding.template];
  return (
    <section className="relative px-5 py-14 sm:py-20">
      {decorative && <RoseCorner position="tl" size={140} opacity={0.25} />}
      <Reveal className="relative z-20 mx-auto tpl-col">
        <SectionHead
          kicker="Save the moment"
          title="Add to Calendar"
          motif={motif}
        />
        <Surface sections={sections} className="mt-8">
          <div className="tpl-rows">
            <CalRow
              icon={Apple}
              label="Apple Calendar"
              href={`/${wedding.slug}/calendar.ics`}
              sameTab
            />
            <CalRow
              icon={Calendar}
              label="Google Calendar"
              href={googleCalendarUrl(wedding)}
            />
          </div>
        </Surface>
      </Reveal>
    </section>
  );
}

/* ── RSVP ─────────────────────────────────────────────────────────────── */

function RsvpCta({
  wedding,
  motif,
}: {
  wedding: PublicWedding;
  motif: MotifKind;
}) {
  return (
    <section id="rsvp" className="relative scroll-mt-6 px-5 py-14 sm:py-20">
      <Reveal className="relative z-20 mx-auto tpl-col">
        <SectionHead kicker="Kindly respond" title="RSVP" motif={motif} />
        <div className="mt-8">
          <InlineRsvp
            slug={wedding.slug}
            coupleNames={`${wedding.groom} & ${wedding.bride}`}
          />
        </div>
      </Reveal>
    </section>
  );
}

export function SeatingCta({
  wedding,
  motif,
}: {
  wedding: PublicWedding;
  motif: MotifKind;
}) {
  const [hasSeating, setHasSeating] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("code");
    if (!c) return;
    setCode(c);
    supabase
      .rpc("get_seating_by_code", { _slug: wedding.slug, _code: c })
      .then(({ data }) => {
        if (data) setHasSeating(true);
      });
  }, [wedding.slug]);

  if (!hasSeating || !code) return null;

  return (
    <section className="relative px-5 py-6">
      <Reveal className="relative z-20 mx-auto tpl-col">
        <div className="tpl-band relative overflow-hidden px-6 py-10 text-center sm:px-10">
          <div className="relative z-10">
            <p className="font-kicker" style={{ opacity: 0.85 }}>
              Reception
            </p>
            <h2 className="mt-2 font-display text-[2rem] leading-[1.05] sm:text-4xl">
              Your Seating
            </h2>
            <div className="mt-4 flex justify-center">
              <Motif motif={motif} />
            </div>
            <p
              className="mx-auto mt-4 max-w-[38ch] text-[15px] leading-relaxed"
              style={{ opacity: 0.9 }}
            >
              Your table has been assigned. See who you're sitting with and
              where your table is in the hall.
            </p>
            <a
              href={`/${wedding.slug}/seating?code=${encodeURIComponent(code)}`}
              className="tpl-btn mt-6 min-h-12 px-7 text-sm font-medium"
            >
              <Users className="h-4 w-4" /> View your table
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Location({
  wedding,
  motif,
}: {
  wedding: PublicWedding;
  motif: MotifKind;
}) {
  if (
    !wedding.venue &&
    !wedding.address &&
    !wedding.mapsUrl &&
    !wedding.venuePhotoUrl
  )
    return null;
  const { sections, photo } = TEMPLATE_META[wedding.template];
  const mapsHref =
    wedding.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.address ?? wedding.venue ?? "")}`;
  const landscape = photo === "film" || photo === "editorial";
  return (
    <section className="relative px-5 py-14 sm:py-20">
      <Reveal className="relative z-20 mx-auto tpl-col">
        <SectionHead kicker="Find us" title="Location" motif={motif} />
        <Surface sections={sections} className="mt-8">
          <a href={mapsHref} target="_blank" rel="noreferrer" className="block">
            <div
              className={`tpl-photo w-full overflow-hidden ${landscape ? "aspect-[3/2]" : "aspect-[16/10]"}`}
            >
              <img
                src={wedding.venuePhotoUrl ?? venueImg}
                alt={wedding.venue ?? "The venue"}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </a>
          <div className="tpl-surface-body">
            {wedding.venue && (
              <p className="font-display text-xl text-foreground sm:text-2xl">
                {wedding.venue}
              </p>
            )}
            {(wedding.hall || wedding.address) && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {[wedding.hall, wedding.address].filter(Boolean).join(" · ")}
              </p>
            )}
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="tpl-btn tpl-btn--secondary mt-5 min-h-12 w-full px-6 text-sm font-medium sm:w-auto"
            >
              <MapPin className="h-4 w-4" /> Open in Google Maps
            </a>
          </div>
        </Surface>
      </Reveal>
    </section>
  );
}

function Footer({
  wedding,
  decorative,
}: {
  wedding: PublicWedding;
  decorative: boolean;
}) {
  const lotusDecor = hasLotusPetals(wedding.template);
  return (
    <footer className="relative px-5 pb-20 pt-10 text-center">
      {decorative && (
        <>
          <RoseCorner position="bl" size={150} opacity={0.6} />
          <RoseCorner position="br" size={150} opacity={0.6} />
        </>
      )}
      {lotusDecor && <LotusStemsCorner opacity={0.6} />}
      <Reveal className="relative z-20 mx-auto max-w-md">
        <div className="flex justify-center">
          <Monogram
            variant={lotusDecor ? "lotus" : "disc"}
            initials={`${wedding.groom.charAt(0)} & ${wedding.bride.charAt(0)}`}
            size={66}
          />
        </div>
        <h3 className="mt-6 font-script text-3xl italic text-gradient-gold">
          With love &amp; gratitude
        </h3>
        <p className="mx-auto mt-3 max-w-[36ch] text-[15px] leading-relaxed text-muted-foreground">
          Thank you for being part of our story. We can't wait to celebrate with
          you.
        </p>
        <p className="mt-7 font-display text-xl text-foreground">
          {wedding.groom}{" "}
          <span className="font-script italic text-rose">&amp;</span>{" "}
          {wedding.bride}
        </p>
        <p className="font-kicker mt-2 text-muted-foreground">
          {formatLongDate(wedding.date)}
        </p>
      </Reveal>
    </footer>
  );
}
