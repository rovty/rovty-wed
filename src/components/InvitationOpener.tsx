import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  isDecorativeTemplate,
  TEMPLATE_META,
  type Motif as MotifKind,
  type PublicWedding,
} from "@/lib/wedding";
import { RosePetals } from "@/components/RosePetals";
import { RoseCorner } from "@/components/RoseCorner";
import { LotusPetals } from "@/components/LotusPetals";
import { LotusCorner } from "@/components/LotusCorner";
import { Monogram } from "@/components/Monogram";
import { Motif } from "@/components/Motif";
import coupleImg from "@/assets/couple.png";

type Guest = {
  code: string;
  name: string;
  title: string | null;
  seats: number;
};

/**
 * Full-screen invitation "opener" shown before the site is revealed. Which
 * of the seven animations plays (envelope/ring/veil/gate/curtain/petals/
 * lotus) is decided by the template (TEMPLATE_META) — the guest-lookup,
 * scroll-lock, and dismiss-timing logic underneath is shared by all of them.
 * If the visitor arrives via a personal link (?code=...), we greet them by name.
 */
export function InvitationOpener({ wedding }: { wedding: PublicWedding }) {
  const decorative = isDecorativeTemplate(wedding.template);
  const meta = TEMPLATE_META[wedding.template];
  const [guest, setGuest] = useState<Guest | null>(null);
  const [opening, setOpening] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Lock scroll while the opener is on screen.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      supabase
        .rpc("get_guest_by_code", { _slug: wedding.slug, _code: code })
        .then(({ data, error }) => {
          if (!error && data && (data as Guest[]).length > 0) {
            setGuest((data as Guest[])[0]);
          }
        });
    }

    return () => {
      document.body.style.overflow = prev;
    };
  }, [wedding.slug]);

  const open = () => {
    if (opening) return;
    setOpening(true);
    // Let the animation play, then the overlay fades out fully before unmount.
    window.setTimeout(() => {
      document.body.style.overflow = "";
      setDismissed(true);
    }, 2100);
  };

  if (dismissed) return null;

  const greeting = guest
    ? `${guest.title ? `${guest.title} ` : ""}${guest.name}`
    : "Honored Guest";
  const initials = `${wedding.groom.charAt(0)} & ${wedding.bride.charAt(0)}`;

  return (
    <div
      className={`invite-opener fixed inset-0 z-[100] flex items-center justify-center px-5 ${
        opening ? "invite-opener--opening" : ""
      }`}
      role="dialog"
      aria-label="Wedding invitation"
    >
      {decorative && (
        <>
          <div className="invite-opener__petals">
            <RosePetals count={14} prefill />
          </div>
          <RoseCorner position="tl" size={150} opacity={0.4} />
          <RoseCorner position="br" size={150} opacity={0.4} />
        </>
      )}

      {meta.opener === "envelope" && (
        <EnvelopeOpener
          wedding={wedding}
          greeting={greeting}
          opening={opening}
          onOpen={open}
        />
      )}
      {meta.opener === "ring" && (
        <RingOpener
          wedding={wedding}
          initials={initials}
          opening={opening}
          onOpen={open}
        />
      )}
      {meta.opener === "veil" && (
        <VeilOpener
          wedding={wedding}
          greeting={greeting}
          initials={initials}
          opening={opening}
          onOpen={open}
        />
      )}
      {meta.opener === "gate" && (
        <GateOpener
          wedding={wedding}
          initials={initials}
          motif={meta.motif}
          opening={opening}
          onOpen={open}
        />
      )}
      {meta.opener === "curtain" && (
        <CurtainOpener
          wedding={wedding}
          greeting={greeting}
          initials={initials}
          opening={opening}
          onOpen={open}
        />
      )}
      {meta.opener === "petals" && (
        <PetalsOpener
          wedding={wedding}
          greeting={greeting}
          initials={initials}
          motif={meta.motif}
          opening={opening}
          onOpen={open}
        />
      )}
      {meta.opener === "lotus" && (
        <LotusOpener
          wedding={wedding}
          greeting={greeting}
          initials={initials}
          motif={meta.motif}
          opening={opening}
          onOpen={open}
        />
      )}
    </div>
  );
}

type OpenerProps = {
  wedding: PublicWedding;
  opening: boolean;
  onOpen: () => void;
};

function EnvelopeOpener({
  wedding,
  greeting,
  opening,
  onOpen,
}: OpenerProps & { greeting: string }) {
  return (
    <div className="invite-opener__scene">
      <div className="invite-envelope">
        <div className="invite-envelope__body">
          <div className="invite-envelope__back" />
          <div className="invite-envelope__pocket" />
          <div className="invite-envelope__flap" />
        </div>

        <div className="invite-card glass-card">
          <p className="font-kicker text-muted-foreground">
            You are cordially invited
          </p>
          <div className="divider-ornament my-3">
            <span className="divider-line" />
            <Sparkles className="h-4 w-4" />
            <span className="divider-line" />
          </div>
          <h2 className="font-display leading-[0.95] text-foreground">
            {wedding.groom}
            <span className="mx-2 font-script italic text-gradient-gold">
              &
            </span>
            {wedding.bride}
          </h2>
          <p className="mt-4 font-script text-lg italic text-rose">
            Dear {greeting},
          </p>
          <p className="mt-1 text-balance text-sm leading-relaxed text-muted-foreground">
            We joyfully request the honor of your presence.
          </p>
        </div>

        <button
          onClick={onOpen}
          className="invite-seal"
          aria-label="Open your invitation"
        >
          <Heart className="h-6 w-6" />
        </button>
      </div>

      {!opening && (
        <p className="invite-opener__hint mt-8 text-center text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Tap the seal to open
        </p>
      )}
    </div>
  );
}

function RingOpener({
  wedding,
  initials,
  opening,
  onOpen,
}: OpenerProps & { initials: string }) {
  return (
    <div className="invite-opener__scene">
      <button
        onClick={onOpen}
        aria-label="Open your invitation"
        className="invite-ring relative grid place-items-center bg-transparent border-none p-0 cursor-pointer"
        style={{ width: 210, height: 210 }}
      >
        <span
          className={`invite-ring__outer ${opening ? "invite-ring__outer--open" : ""}`}
        />
        <span
          className={`invite-ring__inner ${opening ? "invite-ring__inner--open" : ""}`}
          style={{ color: "var(--gold)" }}
        />
        <Monogram initials={initials} size={112} />
      </button>
      <p className="font-kicker mt-8 text-muted-foreground">The wedding of</p>
      <h2 className="mt-3 font-display text-4xl leading-[1.06] text-foreground text-center">
        {wedding.groom}
        <span className="mx-2 font-script italic text-gradient-gold">&</span>
        {wedding.bride}
      </h2>
      <p className="mt-3.5 max-w-[34ch] text-center text-[13px] leading-relaxed text-muted-foreground">
        Dear Guest — touch the monogram to unseal your invitation.
      </p>
    </div>
  );
}

function VeilOpener({
  wedding,
  greeting,
  initials,
  opening,
  onOpen,
}: OpenerProps & { greeting: string; initials: string }) {
  return (
    <>
      <div
        className={`invite-veil invite-veil--left ${opening ? "invite-veil--open" : ""}`}
      />
      <div
        className={`invite-veil invite-veil--right ${opening ? "invite-veil--open" : ""}`}
      />
      <div className="invite-opener__scene relative z-[3]">
        <Monogram initials={initials} size={84} />
        <p className="font-kicker mt-6 text-muted-foreground">
          Together with their families
        </p>
        <h2 className="mt-3 font-display text-4xl leading-[1.06] text-foreground text-center">
          {wedding.groom} & {wedding.bride}
        </h2>
        <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
          Dear {greeting},
        </p>
        <button
          onClick={onOpen}
          className="tpl-btn mt-6 min-h-12 px-8 text-xs font-semibold uppercase tracking-[0.16em]"
        >
          Draw the veil
        </button>
      </div>
    </>
  );
}

function GateOpener({
  wedding,
  initials,
  motif,
  opening,
  onOpen,
}: OpenerProps & { initials: string; motif: MotifKind }) {
  return (
    <>
      <div
        className={`invite-gate invite-gate--left ${opening ? "invite-gate--open" : ""}`}
      />
      <div
        className={`invite-gate invite-gate--right ${opening ? "invite-gate--open" : ""}`}
      />
      <div className="invite-opener__scene relative z-[3]">
        <Monogram initials={initials} size={88} />
        <div className="mt-5">
          <Motif motif={motif} />
        </div>
        <h2 className="mt-4 font-display text-3xl leading-[1.1] text-foreground text-center">
          {wedding.groom}
          <br />
          <span className="font-script italic text-gradient-gold text-[0.8em]">
            &
          </span>
          <br />
          {wedding.bride}
        </h2>
        <button
          onClick={onOpen}
          className="tpl-btn mt-6 min-h-12 px-8 text-xs font-semibold uppercase tracking-[0.16em]"
        >
          Open the doors
        </button>
      </div>
    </>
  );
}

function CurtainOpener({
  wedding,
  greeting,
  opening,
  onOpen,
}: OpenerProps & { greeting: string; initials: string }) {
  return (
    <>
      <div
        className={`invite-curtain ${opening ? "invite-curtain--open" : ""}`}
      >
        <img src={coupleImg} alt="" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,8,8,.42), rgba(10,8,8,.76))",
          }}
        />
      </div>
      <div className="invite-opener__scene relative z-[3] max-w-[520px] text-white">
        <p
          className="font-kicker text-xs uppercase tracking-[0.34em]"
          style={{ opacity: 0.85, fontStyle: "normal", color: "#fff" }}
        >
          {wedding.groom} &amp; {wedding.bride}
        </p>
        <h2 className="mt-3.5 font-display text-5xl leading-[1.02] text-center">
          {wedding.groom} &amp; {wedding.bride}
        </h2>
        <p className="mt-4 text-sm leading-relaxed" style={{ opacity: 0.85 }}>
          Dear {greeting} — you are invited to celebrate with us.
        </p>
        <button
          onClick={onOpen}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-8 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,.06))",
            borderColor: "rgba(255,255,255,.5)",
          }}
        >
          Fade in
        </button>
      </div>
    </>
  );
}

function PetalsOpener({
  wedding,
  greeting,
  initials,
  motif,
  opening,
  onOpen,
}: OpenerProps & { greeting: string; initials: string; motif: MotifKind }) {
  return (
    <div
      className={`invite-opener__scene invite-soft ${opening ? "invite-soft--open" : ""}`}
    >
      <Monogram initials={initials} size={96} />
      <h2 className="mt-6 font-display text-4xl leading-[1.04] text-foreground text-center">
        {wedding.groom} & {wedding.bride}
      </h2>
      <div className="my-5">
        <Motif motif={motif} />
      </div>
      <p className="max-w-[32ch] text-center text-[13px] leading-relaxed text-muted-foreground">
        Dear {greeting}, we joyfully request the honour of your presence.
      </p>
      <button
        onClick={onOpen}
        className="tpl-btn mt-6 min-h-12 px-8 text-xs font-semibold uppercase tracking-[0.16em]"
      >
        Begin
      </button>
    </div>
  );
}

// Two silk panels part like the veil opener, but with a soft field of
// falling lotus blooms and a gold corner spray underneath instead of a bare
// panel — the design's own falling-petal field behind an already-visible
// scene, made tap-to-reveal (rather than fully invisible until tapped) via
// a shared explicit button, matching every other opener here instead of
// the prototype's full-screen invisible tap target.
function LotusOpener({
  wedding,
  greeting,
  initials,
  motif,
  opening,
  onOpen,
}: OpenerProps & { greeting: string; initials: string; motif: MotifKind }) {
  return (
    <>
      <div className="invite-opener__petals">
        <LotusPetals count={12} prefill />
      </div>
      <LotusCorner position="tl" size={140} opacity={0.5} />
      <LotusCorner position="br" size={140} opacity={0.5} />
      <div
        className={`invite-lotus invite-lotus--left ${opening ? "invite-lotus--open" : ""}`}
      />
      <div
        className={`invite-lotus invite-lotus--right ${opening ? "invite-lotus--open" : ""}`}
      />
      <div className="invite-opener__scene relative z-[3]">
        <div className="flex flex-col items-center">
          <Monogram variant="lotus" initials={initials} size={124} />
          <p className="font-kicker mt-7 text-muted-foreground">
            The wedding of
          </p>
          <h2
            className="mt-4 text-center leading-[1.14]"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(2.1rem, 8vw, 2.75rem)",
              fontWeight: 600,
              letterSpacing: ".04em",
              color: "var(--foreground)",
            }}
          >
            {wedding.groom}
            <br />
            <span className="font-script text-[0.62em] italic text-gradient-gold">
              &amp;
            </span>
            <br />
            {wedding.bride}
          </h2>
          <div className="my-5">
            <Motif motif={motif} />
          </div>
          <p className="max-w-[32ch] text-center text-[13px] leading-relaxed text-muted-foreground">
            Dear{" "}
            <span
              style={{ fontFamily: "'Cinzel', serif", color: "var(--rose)" }}
              className="text-[15px] font-semibold tracking-[.02em]"
            >
              {greeting}
            </span>
            , we joyfully request the honour of your presence.
          </p>
          <button
            onClick={onOpen}
            className="tpl-btn mt-6 min-h-12 px-8 text-xs font-semibold uppercase tracking-[0.16em]"
          >
            Open the invitation
          </button>
        </div>
      </div>
    </>
  );
}
