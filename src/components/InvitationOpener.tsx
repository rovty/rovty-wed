import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WEDDING } from "@/lib/wedding";
import { RosePetals } from "@/components/RosePetals";
import { RoseCorner } from "@/components/RoseCorner";

type Guest = { code: string; name: string; title: string | null; seats: number };

/**
 * Full-screen invitation "opener" shown before the site is revealed.
 * If the visitor arrives via a personal link (?code=...), we greet them by name.
 * Clicking the wax seal plays an envelope-opening animation and unveils the site.
 */
export function InvitationOpener() {
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
        .rpc("get_guest_by_code", { _code: code })
        .then(({ data, error }) => {
          if (!error && data && (data as Guest[]).length > 0) {
            setGuest((data as Guest[])[0]);
          }
        });
    }

    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const open = () => {
    if (opening) return;
    setOpening(true);
    // Let the envelope open, then the overlay fades out fully before unmount.
    window.setTimeout(() => {
      document.body.style.overflow = "";
      setDismissed(true);
    }, 2100);
  };

  if (dismissed) return null;

  const greeting = guest
    ? `${guest.title ? `${guest.title} ` : ""}${guest.name}`
    : "Honored Guest";

  return (
    <div
      className={`invite-opener fixed inset-0 z-[100] flex items-center justify-center px-5 ${
        opening ? "invite-opener--opening" : ""
      }`}
      role="dialog"
      aria-label="Wedding invitation"
    >
      {/* Falling rose petals + corner bouquets, matching the main page */}
      <div className="invite-opener__petals">
        <RosePetals count={14} prefill />
      </div>
      <RoseCorner position="tl" size={150} opacity={0.4} />
      <RoseCorner position="br" size={150} opacity={0.4} />

      <div className="invite-opener__scene">
        {/* Envelope */}
        <div className="invite-envelope">
          {/* Envelope body — rounded & clipped so all 4 corners curve evenly */}
          <div className="invite-envelope__body">
            {/* Envelope back panel */}
            <div className="invite-envelope__back" />
            {/* Envelope front pocket */}
            <div className="invite-envelope__pocket" />
            {/* Envelope opening flap */}
            <div className="invite-envelope__flap" />
          </div>

          {/* The invitation card — tucked inside, slides out & up on open */}
          <div className="invite-card glass-card">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              You are cordially invited
            </p>
            <div className="divider-ornament my-3">
              <span className="divider-line" />
              <Sparkles className="h-4 w-4" />
              <span className="divider-line" />
            </div>
            <h2 className="font-display leading-[0.95] text-foreground">
              {WEDDING.groom}
              <span className="mx-2 font-script italic text-gradient-gold">&</span>
              {WEDDING.bride}
            </h2>
            <p className="mt-4 font-script text-lg italic text-rose">Dear {greeting},</p>
            <p className="mt-1 text-balance text-sm leading-relaxed text-muted-foreground">
              We joyfully request the honor of your presence.
            </p>
          </div>

          {/* Wax seal / open button */}
          <button
            onClick={open}
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
    </div>
  );
}
