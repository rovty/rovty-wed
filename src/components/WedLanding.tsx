// The Rovty Wed marketing homepage — what `/` renders now instead of
// "whichever wedding happens to be published" (see index.tsx's header
// comment for why that changed). Every feature named below is real: it's
// drawn straight from WeddingSite.tsx (the actual invitation page) and the
// admin/ components (Send, SeatingSection, DetailsForm, Team, Templates) —
// nothing here is aspirational copy for something the app doesn't do yet.
//
// Styled by wrapping in `.theme-classic` (styles.css) — the same class
// WeddingSite.tsx puts on a real invitation — so this page inherits the
// product's actual look (background gradient, font-display, .glass-card,
// .tpl-btn) for free instead of a parallel "marketing" palette. It's a
// product page for a wedding-invitation product; it should look like one.
import { useState, type ReactNode } from "react";
import {
  Sparkles,
  MessageCircle,
  CalendarCheck,
  Grid2x2,
  CalendarClock,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "@/components/wedding/Reveal";
import { FloralCorner, FloralDivider } from "@/components/wedding/Floral";
import { Monogram } from "@/components/Monogram";
import { Countdown } from "@/components/Countdown";
import { WEDDING_TEMPLATES } from "@/lib/wedding";
import coupleImg from "@/assets/couple.png";

// Real destinations, not placeholders: dash.rovty.com is the actual
// sign-in flow every wedding admin goes through (see auth.tsx's own
// comment on the SSO hand-off), and rovty.com/pricing/wed is Rovty Wed's
// real pricing page — this app has no self-serve signup of its own to
// link to instead.
const PRICING_URL = "https://rovty.com/pricing/wed";
const SIGN_IN_URL = "https://dash.rovty.com/login";

// Fixed, not Date.now()-derived — a demo countdown ticking against a date
// computed at render time would render a different number on the server
// than on the client (hydration mismatch). Any future date works; this one
// just needs to stay in the future for a while.
const DEMO_DATE = new Date("2027-02-14T17:00:00+05:30");

const FEATURES: { icon: typeof Sparkles; title: string; body: string }[] = [
  {
    icon: Sparkles,
    title: "13 designed templates",
    body: "Classic, Poruwa, Nikkah, Chapel, Noir and more — each has its own hero layout and opening animation, not just a recolor of the same page.",
  },
  {
    icon: MessageCircle,
    title: "Send on WhatsApp, one tap",
    body: "Every guest gets their own personal link and code. Pick who to invite and Rovty Wed opens WhatsApp pre-filled, one chat at a time.",
  },
  {
    icon: CalendarCheck,
    title: "RSVP right on the page",
    body: "Guests reply on the invitation itself — no app to install, no account to create.",
  },
  {
    icon: Grid2x2,
    title: "Seating, sorted",
    body: "Guests find their table by entering their code. You lay out the whole floor plan and assign tables from your dashboard.",
  },
  {
    icon: CalendarClock,
    title: "Countdown & calendar",
    body: "A live countdown to the big day, plus one-tap “Add to calendar” for Apple and Google.",
  },
  {
    icon: MapPin,
    title: "Everything in one link",
    body: "Venue details, Google Maps directions, your own photos, and background music — all on the one page you share.",
  },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "Choose a design",
    body: "Pick from 13 templates and add your names, date, venue, and photos.",
  },
  {
    title: "Add your guests",
    body: "Add your guest list — Rovty Wed gives each guest their own code and personal link.",
  },
  {
    title: "Send on WhatsApp",
    body: "Select guests and send personalised invitations straight from your dashboard.",
  },
  {
    title: "Watch it come together",
    body: "RSVPs and seating fill in live in your admin as guests reply.",
  },
];

function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-kicker text-sm uppercase tracking-[0.14em] text-[var(--gold)]">
      {children}
    </p>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="tpl-btn inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold shadow-gold transition-transform hover:scale-[1.02]"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-black/[0.03]"
    >
      {children}
    </a>
  );
}

function TopBar() {
  return (
    <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-5 pt-6 sm:px-8">
      <div className="flex items-center gap-2.5">
        <Monogram initials="RW" size={38} />
        <span className="font-display text-lg tracking-tight">Rovty Wed</span>
      </div>
      <a
        href={SIGN_IN_URL}
        className="text-sm font-semibold text-[var(--rose)] hover:underline"
      >
        Sign in
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-5 pb-16 pt-14 text-center sm:pb-24 sm:pt-20">
      <FloralCorner
        className="pointer-events-none absolute left-2 top-2 h-24 w-24 opacity-60 sm:h-32 sm:w-32"
        style={{ transform: "none" }}
      />
      <FloralCorner
        className="pointer-events-none absolute right-2 top-2 h-24 w-24 opacity-60 sm:h-32 sm:w-32"
        style={{ transform: "scaleX(-1)" }}
      />
      <div className="relative z-10 mx-auto max-w-2xl">
        <Reveal>
          <SectionKicker>Wedding invitations, done properly</SectionKicker>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl md:text-7xl">
            One link your guests will actually open
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            A designed invitation page, guest list, WhatsApp sending, RSVPs, and
            seating — all in one place, styled exactly like your wedding.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PrimaryButton href={PRICING_URL}>See pricing</PrimaryButton>
            <SecondaryButton href={SIGN_IN_URL}>Sign in</SecondaryButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="relative px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <SectionKicker>What you get</SectionKicker>
          <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
            Everything for the invitation, nothing you don't need
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="glass-card h-full rounded-2xl p-6 text-left">
                <div className="tpl-icon grid h-10 w-10 place-items-center rounded-full">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg text-foreground">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <SectionKicker>How it works</SectionKicker>
          <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
            From blank page to sent invitations
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 80}>
              <div className="relative text-left">
                <span className="font-display text-4xl text-gradient-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-lg text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// A live demo, not a screenshot: this mounts the real Countdown component
// and the real .glass-card/.tpl-btn styling against fictional placeholder
// names and the app's own bundled placeholder photo (couple.png — the same
// fallback image WeddingSite.tsx shows for any real couple who hasn't
// uploaded their own yet, see its imports). No customer data touches this
// page — there's no loader here at all, unlike the old `/` route.
function InvitationPreview() {
  return (
    <section className="relative px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-md">
        <Reveal className="text-center">
          <SectionKicker>See it for yourself</SectionKicker>
          <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
            What your guests see
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            An example invitation — not a real couple. Yours is fully
            customisable.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="glass-card relative mt-8 overflow-hidden rounded-3xl p-6 text-center">
            <span className="tpl-band inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
              Example invitation
            </span>
            <img
              src={coupleImg}
              alt=""
              className="tpl-photo mx-auto mt-5 h-40 w-40 object-cover"
            />
            <h3 className="mt-5 font-display text-3xl text-foreground">
              Amara <span className="font-script italic text-rose">&amp;</span>{" "}
              Kavin
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Saturday, February 14 · Your Venue
            </p>
            <div className="mt-6">
              <Countdown target={DEMO_DATE} />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <span className="tpl-btn inline-flex items-center px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em]">
                RSVP
              </span>
              <span className="inline-flex items-center rounded-full border border-[var(--border)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                Add to calendar
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Templates() {
  return (
    <section className="relative px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <SectionKicker>13 designs</SectionKicker>
          <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
            One for every wedding
          </h2>
        </Reveal>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {WEDDING_TEMPLATES.map((t, i) => (
            <Reveal key={t.id} delay={i * 25}>
              <span className="glass-card inline-flex flex-col rounded-2xl px-4 py-2.5 text-left">
                <span className="font-display text-sm text-foreground">
                  {t.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {t.description}
                </span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative px-5 py-16 text-center sm:py-24">
      <FloralDivider className="mx-auto h-10 w-56 opacity-80" />
      <Reveal className="mt-6">
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">
          Ready to send invitations people actually open?
        </h2>
        <div className="mt-7">
          <PrimaryButton href={PRICING_URL}>See pricing</PrimaryButton>
        </div>
      </Reveal>
    </section>
  );
}

function MarketingFooter() {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <footer className="relative px-5 pb-10 pt-6 text-center">
      <p className="text-xs text-muted-foreground">
        &copy; {year} Rovty (Pvt) Ltd. Rovty Wed is a product by{" "}
        <a
          href="https://rovty.com"
          className="font-semibold text-[var(--rose)] hover:underline"
        >
          Rovty
        </a>
        .
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        <a href="https://rovty.com/privacy" className="hover:underline">
          Privacy
        </a>
        <span className="mx-2">&middot;</span>
        <a href="https://rovty.com/terms" className="hover:underline">
          Terms
        </a>
        <span className="mx-2">&middot;</span>
        <a href={SIGN_IN_URL} className="hover:underline">
          Sign in
        </a>
      </p>
    </footer>
  );
}

export function WedLanding() {
  return (
    <main className="theme-classic relative overflow-x-hidden">
      <div className="tpl-pattern" aria-hidden="true" />
      <TopBar />
      <Hero />
      <Features />
      <HowItWorks />
      <InvitationPreview />
      <Templates />
      <FinalCta />
      <MarketingFooter />
    </main>
  );
}
