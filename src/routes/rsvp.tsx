import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState } from "react";
import { Heart, Check, X, Sparkles, ChevronLeft } from "lucide-react";
import { RosePetals } from "@/components/RosePetals";
import { RoseCorner } from "@/components/RoseCorner";
import { MusicPlayer } from "@/components/MusicPlayer";
import { findGuest } from "@/lib/guests";
import { WEDDING } from "@/lib/wedding";

const searchSchema = z.object({
  code: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/rsvp")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "RSVP - Iresh & Asha" },
      { name: "description", content: "RSVP to the wedding of Iresh & Asha on 26 August 2026." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RsvpPage,
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

function RsvpPage() {
  const { code } = Route.useSearch();
  const guest = findGuest(code);

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden px-5 py-10">
      <RosePetals count={10} />
      <MusicPlayer />

      <RoseCorner position="tl" size={150} opacity={0.7} />
      <RoseCorner position="br" size={170} opacity={0.6} />

      <div className="relative z-20 mx-auto max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to invitation
        </Link>

        {!guest ? <InvalidCode /> : <RsvpForm guest={guest} />}
      </div>
    </main>
  );
}

function InvalidCode() {
  return (
    <div className="glass-card mt-10 rounded-3xl p-8 text-center animate-fade-up">
      <Ornament />
      <h1 className="font-display text-3xl">Invitation Required</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Please use the personal invitation link sent to you. Each guest has a
        unique code that lets us greet you by name.
      </p>
      <Link
        to="/rsvp"
        search={{ code: "DEMO" }}
        className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white shadow-gold"
        style={{ background: "var(--gradient-gold)" }}
      >
        Try a demo invitation
      </Link>
    </div>
  );
}

function RsvpForm({ guest }: { guest: ReturnType<typeof findGuest> & {} }) {
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attending) return;
    // In a real app we'd POST to a server fn. For now, persist locally.
    try {
      localStorage.setItem(
        "rsvp:last",
        JSON.stringify({ name: guest.name, attending, message, at: Date.now() }),
      );
    } catch {}
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="glass-card mt-8 rounded-3xl p-8 text-center animate-fade-up">
        <div
          className="mx-auto grid h-16 w-16 place-items-center rounded-full text-white"
          style={{ background: "var(--gradient-gold)" }}
        >
          <Heart className="h-7 w-7 animate-float-soft" />
        </div>
        <Ornament />
        <h1 className="font-display text-3xl">Thank you, {guest.name.split(" ")[0]}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {attending === "yes"
            ? "Your response is received. We can't wait to celebrate with you."
            : "We'll miss you dearly. Thank you for letting us know."}
        </p>
        <p className="mt-6 font-script text-xl italic text-rose">
          With love, Iresh & Asha
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card mt-8 rounded-3xl p-7 animate-fade-up">
      <div className="text-center">
        <p className="font-script text-base italic text-rose">You are invited</p>
        <Ornament />
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Dear
        </p>
        <h1 className="mt-1 font-display text-3xl leading-tight">
          {guest.title ? `${guest.title} ` : ""}
          {guest.name}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {WEDDING.groom} & {WEDDING.bride} request the pleasure of your company
        </p>
        <p className="mt-1 font-script text-lg italic">26 August 2026</p>
      </div>

      <div className="mt-7">
        <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Will you attend?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Choice
            active={attending === "yes"}
            onClick={() => setAttending("yes")}
            icon={<Check className="h-4 w-4" />}
            label="Joyfully Accept"
          />
          <Choice
            active={attending === "no"}
            onClick={() => setAttending("no")}
            icon={<X className="h-4 w-4" />}
            label="Regretfully Decline"
          />
        </div>
      </div>


      {attending === "no" && (
        <div className="mt-4 animate-fade-up">
          <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Message to the couple <span className="lowercase italic">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Wishes, blessings, or a sweet note…"
            className="w-full resize-none rounded-2xl border border-input bg-white/70 px-4 py-3 text-sm outline-none ring-ring/40 backdrop-blur transition focus:border-ring focus:ring-2"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!attending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white shadow-gold transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--gradient-gold)" }}
      >
        <Heart className="h-4 w-4" /> Send Response
      </button>
    </form>
  );
}

function Choice({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-sm font-medium transition-all ${
        active
          ? "border-transparent text-white shadow-gold"
          : "border-border bg-white/60 text-foreground backdrop-blur hover:bg-white"
      }`}
      style={active ? { background: "var(--gradient-gold)" } : undefined}
    >
      {icon}
      {label}
    </button>
  );
}
