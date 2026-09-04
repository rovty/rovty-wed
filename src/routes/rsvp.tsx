import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Heart, Check, X, Sparkles, ChevronLeft } from "lucide-react";
import { RosePetals } from "@/components/RosePetals";
import { RoseCorner } from "@/components/RoseCorner";
import { MusicPlayer } from "@/components/MusicPlayer";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublishedWedding, formatLongDate, type PublicWedding } from "@/lib/wedding";

type Guest = { code: string; name: string; title: string | null; seats: number };

const searchSchema = z.object({
  code: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/rsvp")({
  validateSearch: zodValidator(searchSchema),
  loader: () => fetchPublishedWedding(),
  head: ({ loaderData }) => {
    const wedding = loaderData as PublicWedding | null;
    const names = wedding ? `${wedding.groom} & ${wedding.bride}` : "the couple";
    return {
      meta: [
        { title: `RSVP - ${names}` },
        {
          name: "description",
          content: wedding ? `RSVP to the wedding of ${names} on ${formatLongDate(wedding.date)}.` : "RSVP to the wedding.",
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
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
  const wedding = Route.useLoaderData();
  const { code } = Route.useSearch();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!wedding || !code) {
      setChecked(true);
      return;
    }
    setChecked(false);
    supabase
      .rpc("get_guest_by_code", { _slug: wedding.slug, _code: code })
      .then(({ data, error }) => {
        setGuest(!error && data && (data as Guest[]).length > 0 ? (data as Guest[])[0] : null);
        setChecked(true);
      });
  }, [wedding, code]);

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

        {!wedding || !checked ? (
          <div className="glass-card mt-10 rounded-3xl p-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : !guest ? (
          <InvalidCode />
        ) : (
          <RsvpForm wedding={wedding} guest={guest} />
        )}
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
    </div>
  );
}

function RsvpForm({ wedding, guest }: { wedding: PublicWedding; guest: Guest }) {
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attending) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.rpc("submit_rsvp", {
      _slug: wedding.slug,
      _code: guest.code,
      _attending: attending === "yes",
      _message: message || "",
    });
    setSubmitting(false);
    if (error) {
      setError("Could not send your response. Please try again.");
      return;
    }
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
          With love, {wedding.groom} & {wedding.bride}
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
          {wedding.groom} & {wedding.bride} request the pleasure of your company
        </p>
        <p className="mt-1 font-script text-lg italic">{formatLongDate(wedding.date)}</p>
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

      {error && (
        <p className="mt-3 text-center text-xs text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={!attending || submitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white shadow-gold transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--gradient-gold)" }}
      >
        <Heart className="h-4 w-4" /> {submitting ? "Sending…" : "Send Response"}
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
