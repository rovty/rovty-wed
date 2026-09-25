import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Music2, VolumeX } from "lucide-react";

// Default track, used until a wedding uploads its own (Details tab).
const DEFAULT_MUSIC_SRC =
  "https://raw.githubusercontent.com/emiresh/wedrsvp/main/music.mp3";

// Real invitations always want their music; the wed.rovty.com marketing
// homepage's live template picker (LivePreviewPhone.tsx) is the one place
// that renders a full template purely as a decorative preview and needs it
// silenced — wrapping just that subtree in this provider, rather than
// threading a "preview" prop through every one of the 16 signature
// templates that render <MusicPlayer> inline.
const MusicDisabledContext = createContext(false);
export const MusicDisabledProvider = MusicDisabledContext.Provider;

export function MusicPlayer({ src }: { src?: string | null } = {}) {
  const disabled = useContext(MusicDisabledContext);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (disabled) return;
    const a = new Audio(src || DEFAULT_MUSIC_SRC);
    a.loop = true;
    a.volume = 0.2;
    a.preload = "auto";
    audioRef.current = a;
    setReady(true);

    // Try direct autoplay (works on some browsers / when user revisits)
    a.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Mobile/Safari blocks autoplay until first user gesture.
        // Start playback on the very first interaction anywhere.
        const start = () => {
          a.play()
            .then(() => setPlaying(true))
            .catch(() => {});
          cleanup();
        };
        const cleanup = () => {
          window.removeEventListener("pointerdown", start);
          window.removeEventListener("touchstart", start);
          window.removeEventListener("keydown", start);
          window.removeEventListener("scroll", start);
        };
        window.addEventListener("pointerdown", start, { once: true });
        window.addEventListener("touchstart", start, { once: true });
        window.addEventListener("keydown", start, { once: true });
        window.addEventListener("scroll", start, { once: true, passive: true });
      });

    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, [src, disabled]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  if (disabled) return null;

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Mute background music" : "Play background music"}
      className="tpl-glass fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
      style={{ color: "var(--gold)" }}
      disabled={!ready}
    >
      {playing ? (
        <Music2 className="h-5 w-5 animate-float-soft" />
      ) : (
        <VolumeX className="h-5 w-5" />
      )}
    </button>
  );
}
