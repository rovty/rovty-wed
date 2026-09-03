import { useEffect, useState } from "react";
import { Heart, Check, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Guest = { code: string; name: string; title: string | null; seats: number };

function Ornament() {
  return (
    <div className="divider-ornament my-3">
      <span className="divider-line" />
      <Sparkles className="h-4 w-4" />
      <span className="divider-line" />
    </div>
  );
}

export function InlineRsvp() {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [checked, setChecked] = useState(false);
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      setChecked(true);
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc("get_guest_by_code", { _code: code });
      if (!error && data && (data as Guest[]).length > 0) {
        setGuest((data as Guest[])[0]);
      }
      setChecked(true);
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attending || !guest) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.rpc("submit_rsvp", {
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

  if (!checked) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center text-sm text-muted-foreground">
        Loading your invitation…
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center">
        <Ornament />
        <h3 className="font-display text-2xl">Personal invitation required</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Please open the unique invitation link sent to you so we can greet you
          by name and confirm your seats.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center animate-fade-up">
        <div
          className="mx-auto grid h-16 w-16 place-items-center rounded-full text-white"
          style={{ background: "var(--gradient-gold)" }}
        >
          <Heart className="h-7 w-7 animate-float-soft" />
        </div>
        <Ornament />
        <h3 className="font-display text-2xl">
          Thank you, {guest.name.split(" ")[0]}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          {attending === "yes"
            ? "Your response is received. We can't wait to celebrate with you."
            : "We'll miss you dearly. Thank you for letting us know."}
        </p>
        <p className="mt-5 font-script text-lg italic text-rose">
          With love, Iresh & Asha
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card rounded-3xl p-7 animate-fade-up">
      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Dear
        </p>
        <h3 className="mt-1 font-display text-2xl leading-tight">
          {guest.title ? `${guest.title} ` : ""}
          {guest.name}
        </h3>
        {guest.seats ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Reserved for {guest.seats} {guest.seats === 1 ? "guest" : "guests"}
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
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
          <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Message to the couple <span className="lowercase italic">(optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="A sweet note or your blessings…"
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
