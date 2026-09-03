import type { CSSProperties } from "react";

/**
 * Hand-drawn botanical SVG ornaments in champagne-gold and blush.
 * Inline SVG keeps them razor-sharp, fully transparent, and tiny to load.
 */

function Leaf({
  x,
  y,
  angle = 0,
  scale = 1,
}: {
  x: number;
  y: number;
  angle?: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <path
        d="M0 0 C 7 -5 16 -4 19 0 C 16 4 7 5 0 0 Z"
        fill="var(--blush-soft)"
        stroke="var(--champagne)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path d="M3 0 L 16 0" stroke="var(--champagne)" strokeWidth="0.6" strokeLinecap="round" />
    </g>
  );
}

function Rose({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="var(--blush)" opacity="0.5" />
      {petals.map((a) => (
        <ellipse
          key={a}
          rx={r * 0.48}
          ry={r * 0.92}
          cy={-r * 0.42}
          fill="var(--blush)"
          stroke="var(--champagne)"
          strokeWidth="0.6"
          transform={`rotate(${a})`}
        />
      ))}
      <circle r={r * 0.34} fill="var(--champagne)" />
      <circle r={r * 0.16} fill="var(--champagne-deep)" />
    </g>
  );
}

/** Symmetric horizontal floral sprig for use as a section divider. */
export function FloralDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="var(--champagne)" strokeWidth="1.1" strokeLinecap="round">
        <path d="M140 30 Q 112 22, 86 30 T 38 30" />
        <path d="M140 30 Q 168 22, 194 30 T 242 30" />
      </g>
      {/* left leaves */}
      <Leaf x={96} y={24} angle={-28} />
      <Leaf x={96} y={36} angle={152} />
      <Leaf x={64} y={24} angle={-18} scale={0.85} />
      <Leaf x={64} y={36} angle={162} scale={0.85} />
      <Leaf x={40} y={30} angle={-8} scale={0.7} />
      {/* right leaves (mirrored) */}
      <Leaf x={184} y={24} angle={28} />
      <Leaf x={184} y={36} angle={-152} />
      <Leaf x={216} y={24} angle={18} scale={0.85} />
      <Leaf x={216} y={36} angle={-162} scale={0.85} />
      <Leaf x={240} y={30} angle={8} scale={0.7} />
      {/* side buds */}
      <Rose cx={86} cy={30} r={4.5} />
      <Rose cx={194} cy={30} r={4.5} />
      {/* center rose */}
      <Rose cx={140} cy={30} r={8.5} />
    </svg>
  );
}

/** L-shaped corner flourish. Use CSS transform to mirror into each corner. */
export function FloralCorner({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 130 130"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="var(--champagne)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14 C 14 44, 22 64, 40 74 C 56 83, 74 82, 86 72" fill="none" />
        <path d="M14 14 C 44 14, 64 22, 74 40 C 83 56, 82 74, 72 86" fill="none" />
      </g>
      <Leaf x={30} y={20} angle={70} scale={0.8} />
      <Leaf x={20} y={30} angle={160} scale={0.8} />
      <Leaf x={40} y={66} angle={-40} scale={0.9} />
      <Leaf x={66} y={40} angle={50} scale={0.9} />
      <Leaf x={58} y={78} angle={20} scale={0.75} />
      <Leaf x={78} y={58} angle={110} scale={0.75} />
      <Rose cx={86} cy={72} r={5.5} />
      <Rose cx={72} cy={86} r={5.5} />
      <Rose cx={22} cy={22} r={3.5} />
    </svg>
  );
}

/** Tiny single rose bud, used as a soft accent. */
export function RoseBud({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
      <Rose cx={20} cy={20} r={8} />
    </svg>
  );
}
