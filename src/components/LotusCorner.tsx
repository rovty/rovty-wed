import lotusVine from "@/assets/lotus-vine-sm.png";
import lotusStems from "@/assets/lotus-stems-sm.png";

// Unlike RoseCorner (one image, scaled into all four corners), the lotus
// template's own decoration is two distinct, asymmetric pieces — a vine
// draped across the top edge and a stem cluster tucked into the bottom
// right — per the design's `showLotusCorners` layer. Each renders once per
// scene (the top of a page/opener, the bottom of a page/footer), not
// repeated at every corner.

export function LotusVineBand({
  height = 190,
  opacity = 0.45,
}: {
  /** Height of the clipped band the vine hangs into — px or any CSS length. */
  height?: number | string;
  opacity?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
      style={{ height }}
      aria-hidden
    >
      <img
        src={lotusVine}
        alt=""
        loading="lazy"
        className="absolute"
        style={{
          top: "-8%",
          left: "-10%",
          width: "120%",
          height: "auto",
          opacity,
        }}
      />
    </div>
  );
}

export function LotusStemsCorner({ opacity = 0.46 }: { opacity?: number }) {
  return (
    // The image is deliberately offset past its own box (bottom/right
    // negative, so it bleeds toward the corner) — without this wrapper's
    // overflow-hidden, an absolutely-positioned element that extends past
    // its container still enlarges that container's *scrollable* area
    // even though it doesn't affect layout height, so the page scrolled
    // past the real content into blank space. inset-0 here clips it back
    // to the section's own box — the same crop the site already gets for
    // free horizontally from <main>'s overflow-x-hidden.
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <img
        src={lotusStems}
        alt=""
        loading="lazy"
        className="absolute select-none"
        style={{
          bottom: "-4%",
          right: "-18%",
          width: "50%",
          height: "auto",
          opacity,
        }}
      />
    </div>
  );
}
