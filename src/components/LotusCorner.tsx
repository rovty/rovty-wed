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
    <img
      src={lotusStems}
      alt=""
      aria-hidden
      loading="lazy"
      className="pointer-events-none absolute select-none"
      style={{
        bottom: "-4%",
        right: "-18%",
        width: "50%",
        height: "auto",
        opacity,
      }}
    />
  );
}
