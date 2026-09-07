// A circular initials badge — used across the opener, hero, seating, and
// footer sections of every template. Colors come from the theme tokens
// (--gold/--rose/--gradient-gold), so it never needs a per-template variant
// of its own; only the initials/size passed in change.
export function Monogram({
  initials,
  size = 72,
}: {
  initials: string;
  size?: number;
}) {
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
