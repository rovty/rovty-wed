import lotusCorner from "@/assets/lotus-corner.svg";

type Pos = "tl" | "tr" | "bl" | "br";

const posClass: Record<Pos, string> = {
  tl: "top-0 left-0",
  tr: "top-0 right-0 -scale-x-100",
  bl: "bottom-0 left-0 -scale-y-100",
  br: "bottom-0 right-0 -scale-100",
};

// Same one-image-scaled-to-each-corner approach as RoseCorner, just with
// the lotus template's own gold botanical spray instead of roses.
export function LotusCorner({
  position = "tl",
  size = 180,
  opacity = 0.85,
  className = "",
}: {
  position?: Pos;
  size?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <img
      src={lotusCorner}
      alt=""
      aria-hidden
      loading="lazy"
      className={`pointer-events-none absolute select-none ${posClass[position]} ${className}`}
      style={{ width: size, height: size, opacity }}
    />
  );
}
