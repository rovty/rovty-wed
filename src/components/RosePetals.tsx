import petal from "@/assets/petal.png";
import { useEffect, useMemo, useState } from "react";

export function RosePetals({
  count = 14,
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
        const duration = 12 + Math.random() * 14;
        return {
          id: i,
          left: Math.random() * 100,
          size: 16 + Math.random() * 28,
          duration,
          // Negative delay = start partway through the fall (instant coverage).
          delay: prefill ? -(Math.random() * duration) : Math.random() * 12,
          opacity: 0.35 + Math.random() * 0.45,
        };
      }),
    [count, prefill],
  );

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <img
          key={p.id}
          src={petal}
          alt=""
          className="absolute animate-petal will-change-transform"
          style={{
            left: `${p.left}%`,
            top: "-10vh",
            width: p.size,
            height: p.size,
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
