import { useEffect, useRef, useState } from "react";
import { Music2, VolumeX } from "lucide-react";

const MUSIC_SRC =
  "https://raw.githubusercontent.com/emiresh/wedrsvp/main/music.mp3";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const a = new Audio(MUSIC_SRC);
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
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Mute background music" : "Play background music"}
      className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full text-white shadow-gold transition-transform hover:scale-105 active:scale-95"
      style={{ background: "var(--gradient-gold)" }}
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
