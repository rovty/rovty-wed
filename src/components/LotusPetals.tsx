import petalA from "@/assets/petal-lotus-a.png";
import petalB from "@/assets/petal-lotus-b.png";
import { useEffect, useMemo, useState } from "react";

// Same falling-petal mechanic as RosePetals — a random field of particles
// each riding the shared `petal-fall` keyframe (styles.css) — with the
// design's own two lotus petal photos, alternating (its lotusA/lotusB
// split by even/odd index). Not lotus.svg — that's a boolean feature flag
// in the source theme data (`petalSrc: "lotus.svg"` just means "petals
// are on"), not an actual image reference; every real petal in the design
// markup is petal-lotus-a/b.png.
export function LotusPetals({
  count = 12,
  prefill = false,
}: {
  count?: number;
  /** Start petals mid-fall so the screen is populated immediately. */
  prefill?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const duration = 14 + Math.random() * 16;
        return {
          id: i,
          src: i % 2 === 0 ? petalA : petalB,
          left: Math.random() * 100,
          size: 20 + Math.random() * 22,
          duration,
          delay: prefill ? -(Math.random() * duration) : Math.random() * 12,
          opacity: 0.35 + Math.random() * 0.4,
        };
      }),
    [count, prefill],
  );

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
      aria-hidden
    >
      {petals.map((p) => (
        <img
          key={p.id}
          src={p.src}
          alt=""
          className="absolute animate-petal will-change-transform"
          style={{
            left: `${p.left}%`,
            top: "-10vh",
            width: p.size,
            height: "auto",
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.06))",
          }}
        />
      ))}
    </div>
  );
}
