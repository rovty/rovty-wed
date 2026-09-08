import lotusBloom from "@/assets/lotus-bloom-sm.png";

// A circular initials badge — used across the opener, hero, seating, and
// footer sections of every template. Colors come from the theme tokens
// (--gold/--rose/--gradient-gold), so most templates never need a variant
// of their own; only the initials/size passed in change. "lotus" is the one
// exception — no disc backdrop at all, an arc-and-dot ring instead of a
// circle, and the initials joined without "&" in a gold-gradient serif
// (matches the design's Monogram variant="lotus"), so it gets its own
// render branch rather than fighting the disc's layered-circle styling.
export function Monogram({
  initials,
  size = 72,
  variant = "disc",
}: {
  initials: string;
  size?: number;
  variant?: "disc" | "lotus";
}) {
  if (variant === "lotus")
    return <LotusMonogram initials={initials} size={size} />;

  const fontSize = Math.round(size * 0.27);
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full isolate"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full backdrop-blur-[6px]"
        style={{
          background:
            "linear-gradient(155deg, rgba(255,255,255,.7), rgba(255,255,255,.12) 60%, rgba(255,255,255,.4))",
          boxShadow:
            "0 14px 30px -18px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.7)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-[.14]"
        style={{ background: "var(--gradient-gold)" }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-50"
        style={{ border: "1px solid var(--gold)" }}
      />
      <div
        className="absolute rounded-full opacity-[.28]"
        style={{ inset: "12%", border: "1px solid var(--gold)" }}
      />
      <span
        className="relative whitespace-nowrap leading-none tracking-[0.02em] font-display"
        style={{ fontSize, color: "var(--rose)" }}
      >
        {initials}
      </span>
    </div>
  );
}

function LotusMonogram({ initials, size }: { initials: string; size: number }) {
  const fontSize = Math.round(size * 0.44);
  const letters = initials.replace(/\s*&\s*/g, "");
  return (
    <div
      className="relative grid shrink-0 place-items-center isolate"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ color: "var(--gold)" }}
      >
        <path
          d="M20 26A38 38 0 1 0 84 70"
          strokeWidth={1.1}
          strokeOpacity=".8"
        />
        <path
          d="M26 20A34 34 0 0 0 12 46"
          strokeWidth={0.8}
          strokeOpacity=".45"
        />
        <path
          d="M88 60A34 34 0 0 1 74 82"
          strokeWidth={0.8}
          strokeOpacity=".45"
        />
        <circle
          cx="9"
          cy="55"
          r="1.5"
          fill="currentColor"
          stroke="none"
          fillOpacity=".6"
        />
        <circle
          cx="13"
          cy="62"
          r="1.1"
          fill="currentColor"
          stroke="none"
          fillOpacity=".45"
        />
        <circle
          cx="91"
          cy="50"
          r="1.5"
          fill="currentColor"
          stroke="none"
          fillOpacity=".6"
        />
        <circle
          cx="87"
          cy="43"
          r="1.1"
          fill="currentColor"
          stroke="none"
          fillOpacity=".45"
        />
      </svg>
      <img
        src={lotusBloom}
        alt=""
        aria-hidden
        className="absolute"
        style={{
          top: "-10%",
          right: "-12%",
          width: "46%",
          height: "auto",
          transform: "rotate(8deg)",
        }}
      />
      <span
        className="relative whitespace-nowrap leading-[0.9] tracking-[-0.03em] font-display"
        style={{
          fontSize,
          background:
            "linear-gradient(150deg, #f6e8bf 0%, #e0c07a 26%, #c79b45 58%, #9d7529 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {letters}
      </span>
    </div>
  );
}
