// The full public invitation page body — shared by the root `/` route (a
// single-tenant convenience alias) and `/$slug` (the real, shareable public
// URL every "Public link" in admin actually points at). Kept as one
// component so the two routes can't drift apart in what a guest sees.
import {
  Calendar,
  Clock,
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
import {
  formatDayMonth,
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
  type PublicWedding,
} from "@/lib/wedding";
import { supabase } from "@/integrations/supabase/client";
import coupleImg from "@/assets/couple.png";
import venueImg from "@/assets/venue.jpg";

export function WeddingNotLive() {
  return (
    <main className="grid min-h-[100svh] place-items-center px-5 text-center">
      <div className="glass-card max-w-sm rounded-3xl p-8">
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
    <main className={`theme-${wedding.template} relative overflow-x-hidden`}>
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

  return (
    <section className="relative">
      {hero === "centered" && (
        <div className="relative px-5 pt-12 pb-2">
          {decorative && <RoseCorner position="tl" size={140} opacity={0.2} />}
          <div className="relative z-20 mx-auto flex max-w-xl flex-col items-center text-center animate-fade-up">
            <Monogram initials={initials} size={74} />
            <p className="font-kicker mt-5 text-rose">{familyLine(wedding)}</p>
            <div className="mt-3.5">
              <Motif motif={motif} />
            </div>
            <h1 className="mt-3.5 font-display text-6xl leading-[0.95] text-foreground sm:text-7xl md:text-8xl">
              {wedding.groom}
              <span className="mx-2 font-script italic text-gradient-gold">
                &
              </span>
              {wedding.bride}
            </h1>
            <div className="mt-4">
              <Motif motif={motif} />
            </div>
          </div>
        </div>
      )}

      {hero === "framed" && (
        <div className="relative px-5 pt-12 pb-2 animate-fade-up">
          {decorative && <RoseCorner position="tl" size={140} opacity={0.2} />}
          <div
            className="relative z-20 mx-auto max-w-xl p-1.5"
            style={{
              border: "1px solid var(--gold)",
              background:
                "linear-gradient(160deg, rgba(255,255,255,.5), rgba(255,255,255,.12))",
            }}
          >
            <div
              className="flex flex-col items-center px-6 py-9 text-center"
              style={{ border: "1px solid var(--border)" }}
            >
              <Monogram initials={initials} size={70} />
              <p className="font-kicker mt-4.5 text-muted-foreground">
                {familyLine(wedding)}
              </p>
              <h1 className="mt-4 font-display text-5xl leading-[1.06] text-foreground sm:text-6xl">
                {wedding.groom}
                <br />
                <span className="font-script italic text-gradient-gold text-[0.8em]">
                  &
                </span>
                <br />
                {wedding.bride}
              </h1>
              <div className="mt-5">
                <Motif motif={motif} />
              </div>
            </div>
          </div>
        </div>
      )}

      {hero === "band" && (
        <div className="tpl-band relative overflow-hidden px-5 py-14 text-center animate-fade-up">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%)",
            }}
          />
          <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
            <Monogram initials={initials} size={74} />
            <p
              className="font-kicker mt-5"
              style={{ opacity: 0.85, color: "inherit" }}
            >
              {familyLine(wedding)}
            </p>
            <h1 className="mt-3.5 font-display text-6xl leading-[0.95] sm:text-7xl">
              {wedding.groom} &amp; {wedding.bride}
            </h1>
            <p
              className="mt-3.5 text-xs uppercase tracking-[0.24em]"
              style={{ opacity: 0.8 }}
            >
              {formatLongDate(wedding.date)}
            </p>
          </div>
        </div>
      )}

      {hero === "typo" && (
        <div className="relative px-5 pt-12 pb-2 animate-fade-up">
          <div className="relative z-20 mx-auto max-w-xl">
            <div className="flex items-center gap-4">
              <Monogram initials={initials} size={56} />
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, var(--gold), transparent)",
                }}
              />
            </div>
            <p className="font-kicker mt-5 text-muted-foreground">
              The wedding of
            </p>
            <h1 className="mt-3 font-display text-6xl leading-[0.96] text-foreground sm:text-7xl">
              {wedding.groom}
              <br />
              &amp; {wedding.bride}
            </h1>
            <div
              className="mt-5 flex items-end justify-between gap-4 border-t pt-3.5"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {formatLongDate(wedding.date)}
              </p>
              {wedding.venue && (
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {wedding.venue}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {hero === "photoTop" && (
        <div className="relative animate-fade-up">
          <img
            src={wedding.couplePhotoUrl ?? coupleImg}
            alt={`${wedding.groom} & ${wedding.bride}`}
            loading="eager"
            className="tpl-photo block h-[280px] w-full object-cover sm:h-[380px]"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,.12) 0%, rgba(0,0,0,.04) 38%, rgba(0,0,0,.72) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-6 text-center text-white">
            <div className="flex justify-center">
              <Monogram initials={initials} size={64} />
            </div>
            <p
              className="font-kicker mt-4.5"
              style={{ color: "#fff", opacity: 0.86, fontStyle: "normal" }}
            >
              {familyLine(wedding)}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">
              {wedding.groom} &amp; {wedding.bride}
            </h1>
          </div>
        </div>
      )}

      {hero === "split" && (
        <div className="relative px-5 pt-12 pb-2 animate-fade-up">
          <div className="relative z-20 mx-auto grid max-w-3xl items-center gap-8 md:grid-cols-2 md:gap-11">
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <Monogram initials={initials} size={64} />
              </div>
              <p className="font-kicker mt-4.5 text-rose">
                {familyLine(wedding)}
              </p>
              <h1 className="mt-3 font-display text-5xl leading-[0.99] text-foreground sm:text-6xl">
                {wedding.groom} &amp; {wedding.bride}
              </h1>
              <p className="mt-4.5 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
                Request the pleasure of your company as we celebrate our
                wedding.
              </p>
              <p
                className="mt-4.5 border-t pt-3.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                style={{ borderColor: "var(--border)" }}
              >
                {formatLongDate(wedding.date)}
                {wedding.venue ? ` · ${wedding.venue}` : ""}
              </p>
            </div>
            <img
              src={wedding.couplePhotoUrl ?? coupleImg}
              alt={`${wedding.groom} & ${wedding.bride}`}
              loading="eager"
              className="tpl-photo block w-full object-cover"
            />
          </div>
        </div>
      )}

      {hero === "lotus" && (
        <div className="relative px-5 pt-12 pb-2 text-center animate-fade-up">
          {hasLotusPetals(wedding.template) && <LotusVineBand />}
          <div className="relative z-20 mx-auto flex max-w-xl flex-col items-center">
            <Monogram variant="lotus" initials={initials} size={104} />
            {/* text-rose (not the usual text-muted-foreground) plus a soft
                halo — this line sits right where the vine band's flowers
                hang, and once it's real parents' names rather than the
                short generic fallback, low-contrast muted text got lost
                against that busier background. */}
            <p
              className="font-kicker mt-6 max-w-[36ch] text-rose"
              style={{
                textShadow:
                  "0 0 10px var(--background), 0 0 4px var(--background)",
              }}
            >
              {familyLine(wedding, "With the blessings of their families")}
            </p>
            <h1
              className="mt-4 leading-[1.2] text-foreground"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(2.2rem, 8vw, 3.4rem)",
                fontWeight: 600,
              }}
            >
              {wedding.groom}
            </h1>
            <p className="my-2.5 font-script text-3xl italic text-gradient-gold">
              &amp;
            </p>
            <h1
              className="leading-[1.2] text-foreground"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(2.2rem, 8vw, 3.4rem)",
                fontWeight: 600,
              }}
            >
              {wedding.bride}
            </h1>
            <div className="mt-6 mb-5">
              <Motif motif={motif} />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose">
              {formatLongDate(wedding.date)}
            </p>
          </div>
        </div>
      )}

      {/* Shared across every layout: the line, countdown, and RSVP CTA. */}
      <div className="relative z-20 mx-auto max-w-xl px-5 pt-6 pb-6 text-center">
        <p className="mx-auto max-w-[42ch] text-sm leading-relaxed text-muted-foreground text-balance">
          Request the pleasure of your company as we celebrate our wedding
        </p>
        <p className="mt-4.5 font-script text-xl italic text-foreground/80">
          {formatScriptDate(wedding.date)}
        </p>
        <div className="mt-5 w-full">
          <Countdown target={wedding.date} />
        </div>
        <a
          href="#rsvp"
          className="tpl-btn mt-8 min-h-12 px-7 text-sm font-medium"
        >
          <Heart className="h-4 w-4" /> RSVP Now
        </a>
      </div>
    </section>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="glass-card group rounded-3xl p-5 text-center transition-transform hover:-translate-y-1">
      <div className="tpl-icon mx-auto grid h-12 w-12 place-items-center">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Details({
  wedding,
  decorative,
}: {
  wedding: PublicWedding;
  decorative: boolean;
}) {
  const { motif } = TEMPLATE_META[wedding.template];
  return (
    <section className="relative px-5 pt-4 pb-10">
      {decorative && <RoseCorner position="tr" size={140} opacity={0.25} />}
      <div className="relative z-20 mx-auto max-w-xl text-center">
        <p className="font-kicker text-rose">Save the date</p>
        <h2 className="mt-1 font-display text-4xl text-foreground">
          Wedding Details
        </h2>
        <div className="mt-3.5 flex justify-center">
          <Motif motif={motif} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          <DetailCard
            icon={Calendar}
            label="Date"
            value={formatDayMonth(wedding.date)}
            sub={formatWeekdayYear(wedding.date)}
          />
          <DetailCard
            icon={Clock}
            label="Ceremony"
            value={formatTime(wedding.date)}
            sub="Auspicious time"
          />
          {wedding.receptionDate && (
            <DetailCard
              icon={Heart}
              label="Reception"
              value={formatTime(wedding.receptionDate)}
              sub="Onwards"
            />
          )}
          {wedding.venue && (
            <DetailCard
              icon={MapPin}
              label="Venue"
              value={wedding.venue}
              sub={wedding.hall ?? undefined}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Gallery({ wedding }: { wedding: PublicWedding }) {
  const { hero } = TEMPLATE_META[wedding.template];
  // The photoTop/split hero layouts already show the couple's photo up top —
  // showing it again here would be redundant.
  if (hero === "photoTop" || hero === "split") return null;
  return (
    <section className="relative px-5 py-4">
      <div className="relative z-20 mx-auto max-w-xl">
        <img
          src={wedding.couplePhotoUrl ?? coupleImg}
          alt="The couple"
          loading="lazy"
          className="tpl-photo mx-auto w-full max-w-md object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.12)]"
        />
      </div>
    </section>
  );
}

function CalButton({
  icon: Icon,
  label,
  onClick,
  href,
  sameTab,
}: {
  icon: typeof Calendar;
  label: string;
  onClick?: () => void;
  href?: string;
  sameTab?: boolean;
}) {
  const cls =
    "glass-card flex items-center gap-3 rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.98]";
  const inner = (
    <>
      <div className="tpl-icon grid h-10 w-10 shrink-0 place-items-center">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">Add to calendar</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  if (href)
    return (
      <a
        href={href}
        target={sameTab ? undefined : "_blank"}
        rel={sameTab ? undefined : "noreferrer"}
        className={cls}
      >
        {inner}
      </a>
    );
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function CalendarSection({
  wedding,
  decorative,
}: {
  wedding: PublicWedding;
  decorative: boolean;
}) {
  const { motif } = TEMPLATE_META[wedding.template];
  return (
    <section className="relative px-5 py-10">
      {decorative && <RoseCorner position="tl" size={140} opacity={0.25} />}
      <div className="relative z-20 mx-auto max-w-xl">
        <div className="text-center">
          <p className="font-kicker text-rose">Save the moment</p>
          <h2 className="mt-1 font-display text-4xl">Add to Calendar</h2>
          <div className="mt-3.5 flex justify-center">
            <Motif motif={motif} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CalButton
            icon={Apple}
            label="Apple Calendar"
            href="/calendar.ics"
            sameTab
          />
          <CalButton
            icon={Calendar}
            label="Google Calendar"
            href={googleCalendarUrl(wedding)}
          />
        </div>
      </div>
    </section>
  );
}

function RsvpCta({
  wedding,
  motif,
}: {
  wedding: PublicWedding;
  motif: MotifKind;
}) {
  return (
    <section id="rsvp" className="relative px-5 py-10">
      <div className="relative z-20 mx-auto max-w-xl">
        <div className="text-center">
          <p className="font-kicker text-rose">Kindly respond</p>
          <h2 className="mt-1 font-display text-4xl">RSVP</h2>
          <div className="mt-3.5 flex justify-center">
            <Motif motif={motif} />
          </div>
        </div>
        <div className="mt-6">
          <InlineRsvp
            slug={wedding.slug}
            coupleNames={`${wedding.groom} & ${wedding.bride}`}
          />
        </div>
      </div>
    </section>
  );
}

function SeatingCta({
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
    <section className="relative px-5 py-10">
      <div className="relative z-20 mx-auto max-w-xl">
        <div className="tpl-band relative overflow-hidden rounded-3xl px-6 py-9 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.3), transparent 65%)",
            }}
          />
          <div className="relative z-10">
            <p className="font-kicker" style={{ opacity: 0.85 }}>
              Reception
            </p>
            <h2 className="mt-2.5 font-display text-4xl">Your Seating</h2>
            <p
              className="mt-3 max-w-[38ch] text-sm leading-relaxed mx-auto"
              style={{ opacity: 0.9 }}
            >
              Your table has been assigned. View your seating details and find
              your table on the ballroom map.
            </p>
            <a
              href={`/seating?code=${code}`}
              className="tpl-btn mt-5 min-h-12 px-7 text-sm font-medium"
            >
              <Users className="h-4 w-4" /> View Your Table
            </a>
          </div>
        </div>
        <div className="sr-only">
          <Motif motif={motif} />
        </div>
      </div>
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
  // A custom maps link (Details tab) always wins — it's a real link to the
  // actual place, not a guess. The search-query fallback only exists for
  // weddings that haven't set one.
  const mapsHref =
    wedding.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.address ?? wedding.venue ?? "")}`;
  return (
    <section className="relative px-5 py-10">
      <div className="relative z-20 mx-auto max-w-xl">
        <div className="text-center">
          <p className="font-kicker text-rose">Find us</p>
          <h2 className="mt-1 font-display text-4xl">Location</h2>
          <div className="mt-3.5 flex justify-center">
            <Motif motif={motif} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {[wedding.venue, wedding.hall].filter(Boolean).join(" · ")}
          </p>
        </div>

        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="mt-6 block overflow-hidden shadow-soft glass-card p-1.5"
        >
          <img
            src={wedding.venuePhotoUrl ?? venueImg}
            alt={wedding.venue ?? "The venue"}
            loading="lazy"
            className="tpl-photo h-72 w-full object-cover"
          />
        </a>

        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white/60 px-5 py-3 text-sm font-medium text-foreground backdrop-blur hover:bg-white"
        >
          <MapPin className="h-4 w-4" /> Open in Google Maps
        </a>
      </div>
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
    <footer className="relative px-5 pb-16 pt-8 text-center">
      {decorative && (
        <>
          <RoseCorner position="bl" size={150} opacity={0.6} />
          <RoseCorner position="br" size={150} opacity={0.6} />
        </>
      )}
      {lotusDecor && <LotusStemsCorner opacity={0.6} />}
      <div className="relative z-20 mx-auto max-w-md">
        <div className="flex justify-center">
          <Monogram
            variant={lotusDecor ? "lotus" : "disc"}
            initials={`${wedding.groom.charAt(0)} & ${wedding.bride.charAt(0)}`}
            size={66}
          />
        </div>
        <h3 className="mt-5 font-script text-3xl italic text-gradient-gold">
          With love & gratitude
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you for being part of our story. We can't wait to celebrate with
          you.
        </p>
        <p className="mt-6 font-display text-xl">
          {wedding.groom}{" "}
          <span className="font-script italic text-rose">&</span>{" "}
          {wedding.bride}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatLongDate(wedding.date)}
        </p>
      </div>
    </footer>
  );
}
