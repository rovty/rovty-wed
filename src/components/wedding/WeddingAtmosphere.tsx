import type { WeddingTemplate } from "@/lib/wedding";
import { weddingTheme } from "@/lib/wedding-themes";
import { RoseCorner } from "@/components/RoseCorner";
import { LotusVineBand, LotusStemsCorner } from "@/components/LotusCorner";
import { RosePetals } from "@/components/RosePetals";
import { LotusPetals } from "@/components/LotusPetals";
import { artwork } from "@/lib/studio/theme-art";

/** Real floral artwork and photographs, blended into the invitation's paper. */
export function WeddingAtmosphere({ template }: { template: WeddingTemplate }) {
  const theme = weddingTheme(template);
  return (
    <div
      className={`wedding-atmosphere atmosphere-${template} atmosphere-motion-${theme?.motion || "breathe"}`}
      aria-hidden="true"
    >
      <div className="wedding-silk" />
      {template === "classic" ? (
        <>
          <RoseCorner
            position="tl"
            size={310}
            opacity={0.8}
            className="theme-rose-corner"
          />
          <RoseCorner
            position="br"
            size={340}
            opacity={0.7}
            className="theme-rose-corner"
          />
        </>
      ) : template === "lotus" ? (
        <>
          <div className="theme-lotus-vines">
            <LotusVineBand height="45%" opacity={0.5} />
          </div>
          <LotusStemsCorner opacity={0.6} />
        </>
      ) : artwork[template] ? (
        <img
          className="theme-scene-image"
          src={artwork[template]}
          alt=""
          decoding="async"
        />
      ) : null}
      {template === "forest" && <div className="forest-light" />}
      {template === "moon-stars" && (
        <div className="theme-starlight">
          {Array.from({ length: 16 }, (_, i) => (
            <span
              key={i}
              style={{
                left: `${34 + ((i * 17) % 64)}%`,
                top: `${8 + ((i * 13) % 80)}%`,
                animationDelay: `${i * -0.7}s`,
              }}
            >
              ✦
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function WeddingParticles({ template }: { template: WeddingTemplate }) {
  if (template !== "classic" && template !== "lotus") return null;
  return (
    <div className="theme-particles" aria-hidden="true">
      {template === "classic" ? (
        <RosePetals count={12} prefill />
      ) : (
        <LotusPetals count={14} prefill />
      )}
    </div>
  );
}

/** A quiet continuation of the cover artwork on RSVP, place cards and closing notes. */
export function ThemeEmblem({ template }: { template: WeddingTemplate }) {
  if (!artwork[template]) return null;
  return (
    <div className={`theme-emblem emblem-${template}`} aria-hidden="true">
      <img src={artwork[template]} alt="" loading="lazy" decoding="async" />
    </div>
  );
}

export function ThemeCredit({ template }: { template: WeddingTemplate }) {
  if (!artwork[template] || template === "classic" || template === "lotus")
    return null;
  return (
    <a
      className="theme-credit"
      href={`/theme-artwork-credits.html#${template}`}
      target="_blank"
      rel="noreferrer"
    >
      Artwork credits
    </a>
  );
}
