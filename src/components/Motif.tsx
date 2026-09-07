import type { Motif as MotifKind } from "@/lib/wedding";

// Small SVG section divider — the shape varies by template (set in
// TEMPLATE_META), the color always follows the theme's accent token.
export function Motif({ motif }: { motif: MotifKind }) {
  return (
    <div
      className="flex items-center justify-center leading-none"
      style={{ color: "var(--gold)" }}
    >
      <MotifSvg motif={motif} />
    </div>
  );
}

function MotifSvg({ motif }: { motif: MotifKind }) {
  const common = {
    width: 150,
    height: 18,
    viewBox: "0 0 150 18",
    fill: "none",
    stroke: "currentColor",
    "aria-hidden": true as const,
  };
  switch (motif) {
    case "diamond":
      return (
        <svg {...common} strokeWidth={1.1}>
          <path d="M2 9h52" />
          <path
            d="M75 2.5 82 9l-7 6.5L68 9z"
            fill="currentColor"
            fillOpacity=".25"
          />
          <path d="M62 9h-4M92 9h-4" />
          <path d="M96 9h52" />
        </svg>
      );
    case "geo":
      return (
        <svg {...common} strokeWidth={1.1}>
          <path d="M2 9h50M98 9h50" />
          <path d="M75 1v16M67 9h16M69.4 3.4l11.2 11.2M80.6 3.4 69.4 14.6" />
          <circle cx="58" cy="9" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="92" cy="9" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "line":
      return (
        <svg {...common} strokeWidth={1}>
          <path d="M0 9h150" strokeOpacity=".55" />
        </svg>
      );
    case "leaf":
      return (
        <svg
          {...common}
          height={20}
          viewBox="0 0 150 20"
          strokeWidth={1.1}
          strokeLinecap="round"
        >
          <path d="M75 10C61 4 44 6 30 10M75 10c14-6 31-4 45 0" />
          <path
            d="M52 10c3-4 8-5 11-3-1 4-6 6-11 3zM52 10c3 4 8 5 11 3-1-4-6-6-11-3z"
            fill="currentColor"
            fillOpacity=".18"
          />
          <path
            d="M98 10c-3-4-8-5-11-3 1 4 6 6 11 3zM98 10c-3 4-8 5-11 3 1-4 6-6 11-3z"
            fill="currentColor"
            fillOpacity=".18"
          />
          <circle cx="75" cy="10" r="3" fill="currentColor" fillOpacity=".35" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common} strokeWidth={1.4} strokeLinecap="round">
          <path d="M4 11c8-8 16 8 24 0s16 8 24 0 16 8 24 0 16 8 24 0 16 8 24 0" />
        </svg>
      );
    case "deco":
      return (
        <svg {...common} strokeWidth={1.2}>
          <path d="M0 9h48M102 9h48" />
          <path d="M56 15 64 9l-8-6M94 15 86 9l8-6" />
          <path d="M71 3h8v12h-8z" fill="currentColor" fillOpacity=".3" />
        </svg>
      );
    case "squiggle":
      return (
        <svg
          {...common}
          height={20}
          viewBox="0 0 150 20"
          strokeWidth={2.6}
          strokeLinecap="round"
        >
          <path d="M6 13c10-10 20 6 30-2s20 8 30 0 20 8 30 0 20 6 28-2" />
        </svg>
      );
  }
}
