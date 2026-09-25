import { themeArtworkStyle } from "@/lib/studio/theme-art";
import { templateClasses } from "@/lib/wedding-themes";
import { createDesign } from "@/lib/studio/catalog";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { formatLongDate, type PublicWedding } from "@/lib/wedding";
import { designVariables } from "@/lib/studio/design";
import { getTemplate } from "@/lib/studio/catalog";
import { Reveal } from "./Reveal";
import {
  WeddingAtmosphere,
  WeddingParticles,
  ThemeEmblem,
  ThemeCredit,
} from "./WeddingAtmosphere";

export type SeatingData = {
  guest_name: string;
  guest_code: string;
  table_number: number;
  table_name: string | null;
  map_x: number;
  map_y: number;
  tablemates: { name: string; is_current: boolean }[];
};

export function SeatingExperience({
  wedding: w,
  seating,
  status,
  code,
  onRetry,
}: {
  wedding: PublicWedding;
  seating: SeatingData | null;
  status: "loading" | "ready" | "missing" | "unavailable" | "error";
  code?: string;
  onRetry?: () => void;
}) {
  const template = getTemplate(w.template);
  const table = seating ? String(seating.table_number).padStart(2, "0") : "";
  return (
    <main
      className={`wedding-stationery seating-page ${templateClasses(w.template)} experience-${w.template}`}
      data-motion={w.design?.motion || "gentle"}
      style={{
        ...themeArtworkStyle(w.template),
        ...designVariables(
          w.design ?? createDesign(w.template),
          template.palette,
          template.fonts,
        ),
      }}
    >
      <WeddingAtmosphere template={w.template} />
      <WeddingParticles template={w.template} />
      <header className="seating-heading">
        <Reveal>
          <p className="seating-eyebrow">A place for you, a day for love</p>
          <h1 className="font-display">
            <span>{w.groom}</span>
            <em className="font-script">&</em>
            <span>{w.bride}</span>
          </h1>
          <p className="seating-date">{formatLongDate(w.date)}</p>
        </Reveal>
      </header>

      {status === "ready" && seating ? (
        <div className="seating-layout">
          <div>
            <Reveal delay={100}>
              <section
                className="seating-place-card"
                aria-labelledby="seating-welcome"
              >
                <ThemeEmblem template={w.template} />
                <p className="seating-eyebrow">
                  With love, we saved you a seat
                </p>
                <h2 id="seating-welcome" className="font-display">
                  {seating.guest_name}
                </h2>
                <div className="seating-rule" aria-hidden="true" />
                <p className="seating-eyebrow">Your table</p>
                <p className="seating-table-number font-display">{table}</p>
                {seating.table_name && (
                  <p className="seating-table-name font-script">
                    {seating.table_name}
                  </p>
                )}
                {(w.venue || w.hall) && (
                  <p className="seating-venue">
                    <MapPin size={14} aria-hidden="true" />
                    {[w.venue, w.hall].filter(Boolean).join(" · ")}
                  </p>
                )}
              </section>
            </Reveal>
            {seating.tablemates.length > 0 && (
              <Reveal delay={180}>
                <section
                  className="seating-company"
                  aria-labelledby="seating-company-heading"
                >
                  <p className="seating-eyebrow">
                    Good company, beautiful memories
                  </p>
                  <h2 id="seating-company-heading" className="font-display">
                    At your table
                  </h2>
                  <ul>
                    {seating.tablemates.map((mate, i) => (
                      <li
                        key={`${mate.name}-${i}`}
                        data-current={mate.is_current}
                      >
                        <span>{mate.name}</span>
                        {mate.is_current && (
                          <span className="seating-you">You</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}
          </div>
          <Reveal delay={250}>
            <section
              className="seating-location"
              aria-labelledby="seating-location-heading"
            >
              <p className="seating-eyebrow">Let us show you the way</p>
              <h2 id="seating-location-heading" className="font-display">
                Your little corner of the celebration
              </h2>
              {w.floorPlanUrl ? (
                <>
                  <div className="seating-map-frame">
                    <div className="seating-map">
                      <img
                        src={w.floorPlanUrl}
                        alt={`${w.hall || w.venue || "Reception"} seating plan, with table ${table} highlighted`}
                        draggable={false}
                      />
                      <span
                        className="seating-map-marker"
                        aria-hidden="true"
                        style={{
                          left: `${seating.map_x}%`,
                          top: `${seating.map_y}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="seating-map-note">
                    The soft outline marks table {table}
                    {seating.table_name ? ` · ${seating.table_name}` : ""}.
                  </p>
                </>
              ) : (
                <div className="seating-map-empty">
                  <MapPin size={26} strokeWidth={1} aria-hidden="true" />
                  <p>
                    We’ll welcome you to table {table} when you arrive. Our
                    hosts will be happy to show you the way.
                  </p>
                </div>
              )}
              {(w.venue || w.address) && (
                <a
                  className="seating-directions"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(w.address || w.venue || "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Directions to {w.venue || "the celebration"}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              )}
            </section>
          </Reveal>
        </div>
      ) : (
        <section className="seating-status" role="status" aria-live="polite">
          <div className="seating-rule" aria-hidden="true" />
          <h2 className="font-display">
            {status === "loading"
              ? "Preparing your place card…"
              : status === "missing"
                ? "Your invitation holds your place"
                : status === "error"
                  ? "Your place card couldn’t load"
                  : "A lovely seat is waiting"}
          </h2>
          <p>
            {status === "loading"
              ? "One little moment while we find your table."
              : status === "missing"
                ? "Please open the personal link sent to you to see your table and the people you’ll celebrate with."
                : status === "error"
                  ? "Please try again to see your seating details."
                  : "We’re adding the finishing touches to the seating plan. Please check your personal link closer to the day."}
          </p>
          {status === "error" && onRetry && (
            <button className="seating-directions" onClick={onRetry}>
              Try again
            </button>
          )}
        </section>
      )}

      <footer className="seating-footer">
        <ThemeCredit template={w.template} />
        <div className="seating-rule" aria-hidden="true" />
        <p className="font-script">The celebration is sweeter with you.</p>
        <a
          className="seating-return"
          href={`/${w.slug}${code ? `?code=${encodeURIComponent(code)}` : ""}`}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to the invitation
        </a>
      </footer>
    </main>
  );
}
