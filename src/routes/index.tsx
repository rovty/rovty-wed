import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, Sparkles, Heart, ChevronRight, Apple, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { RosePetals } from "@/components/RosePetals";
import { RoseCorner } from "@/components/RoseCorner";
import { Countdown } from "@/components/Countdown";
import { MusicPlayer } from "@/components/MusicPlayer";
import { InlineRsvp } from "@/components/InlineRsvp";
import { InvitationOpener } from "@/components/InvitationOpener";
import { WEDDING, googleCalendarUrl } from "@/lib/wedding";
import { supabase } from "@/integrations/supabase/client";
import coupleImg from "@/assets/couple.png";
import venueImg from "@/assets/venue.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iresh & Asha - Wedding Invitation" },
      { name: "description", content: "Together with their families. Join Iresh & Asha on 26 August 2026 at The Epitome Hotel, Crown Ballroom." },
      { property: "og:title", content: "Iresh & Asha - Wedding Invitation" },
      { property: "og:description", content: "26 August 2026 · The Epitome Hotel · Crown Ballroom" },
      { property: "og:image", content: "https://asha.iresh.xyz/invite.jpg" },
    ],
  }),
  component: Home,
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

function Home() {
  return (
    <main className="relative overflow-x-hidden">
      <RosePetals />
      <MusicPlayer />
      <InvitationOpener />

      <Hero />
      <Details />
      <Gallery />
      <CalendarSection />
      <RsvpCta />
      <SeatingCta />
      <Location />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative px-5 pt-12 pb-6">
      <RoseCorner position="tl" size={140} opacity={0.2} />

      <div className="relative z-20 mx-auto flex max-w-xl flex-col items-center text-center animate-fade-up">
        <p className="font-script text-lg italic tracking-wide text-rose">
          Together with their families
        </p>
        <Ornament />
        <h1 className="font-display text-6xl leading-[0.95] text-foreground sm:text-7xl md:text-8xl" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)" }}>
          Iresh
          <span className="mx-2 font-script italic text-gradient-gold">&</span>
          Asha
        </h1>
        <Ornament />
        <p className="max-w-md text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
          Request the pleasure of your company as we celebrate our wedding
        </p>

        <p className="mt-6 font-script text-xl italic text-foreground/80">
          The 26th of August, 2026
        </p>

        <div className="mt-5 w-full">
          <Countdown target={WEDDING.date} />
        </div>

        <a
          href="#rsvp"
          className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white shadow-gold transition-transform hover:scale-[1.03] active:scale-95"
          style={{ background: "var(--gradient-gold)" }}
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
      <div
        className="mx-auto grid h-12 w-12 place-items-center rounded-full text-white"
        style={{ background: "var(--gradient-gold)" }}
      >
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

function Details() {
  return (
    <section className="relative px-5 pt-4 pb-10">
      <RoseCorner position="tr" size={140} opacity={0.25} />
      <div className="relative z-20 mx-auto max-w-xl text-center">
        <p className="font-script text-base italic text-rose">Save the date</p>
        <h2 className="mt-1 font-display text-4xl text-foreground">Wedding Details</h2>
        <Ornament />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          <DetailCard icon={Calendar} label="Date" value="26 Aug" sub="Wednesday, 2026" />
          <DetailCard icon={Clock} label="Poruwa" value="09:07 AM" sub="Auspicious time" />
          <DetailCard icon={Sparkles} label="Reception" value="9:00 AM" sub="Onwards" />
          <DetailCard icon={MapPin} label="Venue" value="The Epitome" sub="Crown Ballroom" />
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="relative px-5 py-4">
      <div className="relative z-20 mx-auto max-w-xl">
        <img
          src={coupleImg}
          alt="Iresh and Asha"
          loading="lazy"
          className="mx-auto w-full max-w-md object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.12)]"
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
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
        style={{ background: "var(--gradient-gold)" }}
      >
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

function CalendarSection() {
  return (
    <section className="relative px-5 py-10">
      <RoseCorner position="tl" size={140} opacity={0.25} />
      <div className="relative z-20 mx-auto max-w-xl">
        <div className="text-center">
          <p className="font-script text-base italic text-rose">Save the moment</p>
          <h2 className="mt-1 font-display text-4xl">Add to Calendar</h2>
          <Ornament />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CalButton icon={Apple} label="Apple Calendar" href="/calendar.ics" sameTab />
          <CalButton icon={Calendar} label="Google Calendar" href={googleCalendarUrl()} />
        </div>
      </div>
    </section>
  );
}

function RsvpCta() {
  return (
    <section id="rsvp" className="relative px-5 py-10">
      <div className="relative z-20 mx-auto max-w-xl">
        <div className="text-center">
          <p className="font-script text-base italic text-rose">Kindly respond</p>
          <h2 className="mt-1 font-display text-4xl">RSVP</h2>
          <Ornament />
        </div>
        <div className="mt-6">
          <InlineRsvp />
        </div>
      </div>
    </section>
  );
}

function SeatingCta() {
  const [hasSeating, setHasSeating] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("code");
    if (!c) return;
    setCode(c);
    supabase
      .rpc("get_seating_by_code", { _code: c })
      .then(({ data }) => {
        if (data) setHasSeating(true);
      });
  }, []);

  if (!hasSeating || !code) return null;

  return (
    <section className="relative px-5 py-10">
      <div className="relative z-20 mx-auto max-w-xl text-center">
        <p className="font-script text-base italic text-rose">Reception</p>
        <h2 className="mt-1 font-display text-4xl">Your Seating</h2>
        <Ornament />
        <p className="mt-3 text-sm text-muted-foreground">
          Your table has been assigned. View your seating details and find your
          table on the ballroom map.
        </p>
        <a
          href={`/seating?code=${code}`}
          className="mt-5 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white shadow-gold transition-transform hover:scale-[1.03] active:scale-95"
          style={{ background: "var(--gradient-gold)" }}
        >
          <Users className="h-4 w-4" /> View Your Table
        </a>
      </div>
    </section>
  );
}

function Location() {
  const q = encodeURIComponent("The Epitome Hotel Kurunegala");
  return (
    <section className="relative px-5 py-10">
      <div className="relative z-20 mx-auto max-w-xl">
        <div className="text-center">
          <p className="font-script text-base italic text-rose">Find us</p>
          <h2 className="mt-1 font-display text-4xl">Location</h2>
          <Ornament />
          <p className="text-sm text-muted-foreground">
            The Epitome Hotel · Crown Ballroom
          </p>
        </div>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 block overflow-hidden rounded-3xl shadow-soft glass-card p-1.5"
        >
          <img
            src={venueImg}
            alt="The Epitome Hotel venue"
            loading="lazy"
            className="h-72 w-full rounded-2xl object-cover"
          />
        </a>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${q}`}
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

function Footer() {
  return (
    <footer className="relative px-5 pb-16 pt-8 text-center">
      <RoseCorner position="bl" size={150} opacity={0.6} />
      <RoseCorner position="br" size={150} opacity={0.6} />
      <div className="relative z-20 mx-auto max-w-md">
        <Ornament />
        <h3 className="font-script text-3xl italic text-gradient-gold">
          With love & gratitude
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you for being part of our story. We can't wait to celebrate with you.
        </p>
        <p className="mt-6 font-display text-xl">Iresh <span className="font-script italic text-rose">&</span> Asha</p>
        <p className="mt-2 text-xs text-muted-foreground">26 · 08 · 2026</p>
      </div>
    </footer>
  );
}
