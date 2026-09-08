import lotus from "@/assets/lotus.svg";
import { useEffect, useMemo, useState } from "react";

// Same falling-petal mechanic as RosePetals — a random field of particles
// each riding the shared `petal-fall` keyframe (styles.css) — just with the
// lotus template's own bloom icon instead of a rose petal, per the design's
// `petalSrc: "lotus.svg"`.
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
          src={lotus}
          alt=""
          className="absolute animate-petal will-change-transform"
          style={{
            left: `${p.left}%`,
            top: "-10vh",
            width: p.size,
            height: p.size * 0.875,
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
