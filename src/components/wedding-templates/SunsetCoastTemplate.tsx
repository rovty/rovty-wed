import { ArrowRight } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";
import venueImg from "@/assets/venue.webp";

const INK = "#1f3a4a";
const PAPER = "#fff6ea";
const CORAL = "#d9532e";

/**
 * "Sunset Coast" — a warm coastal sunset. Ported from SunsetCoast.dc.html;
 * the opener writes the couple's names on sand before a wave surges in.
 * RSVP/countdown/seating are the real site components.
 */
export function SunsetCoastTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2700,
    leaveMs: 1800,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;

  return (
    <main
      className="theme-sunset-coast wedding-stationery relative"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: "'Nunito Sans', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .sc-op{position:fixed;inset:0;z-index:100;overflow:hidden;background-color:#e7cda8;background-image:radial-gradient(rgba(140,100,60,.18) 1px,transparent 1.6px);background-size:7px 7px;display:flex;align-items:center;justify-content:center;transition:opacity 1.2s ease}
        .sc-op--leave{opacity:0;pointer-events:none}
        .sc-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
        .sc-write{font-family:'DM Serif Display',serif;font-style:italic;font-size:clamp(40px,12vw,64px);line-height:1;color:#c9a57a;text-shadow:1px 1px 0 rgba(255,255,255,.55),-1px -1px 1px rgba(110,70,35,.5)}
        .sc-date{font-size:13px;font-weight:800;letter-spacing:4px;color:#a7825a}
        .sc-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${INK};animation:sc-pulse 1.8s ease-in-out infinite}
        @keyframes sc-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .sc-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .sc-col{width:100%;max-width:430px;margin:0 auto}
        .sc-cards{display:flex;gap:12px;padding:0 24px;overflow-x:auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`sc-op ${phase === "leave" ? "sc-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="sc-card">
            <span className="sc-write">
              {wedding.groom}{" "}
              <em style={{ fontStyle: "normal", fontSize: "0.7em" }}>+</em>{" "}
              {wedding.bride}
            </span>
            <span className="sc-date">
              {formatLongDate(wedding.date).toUpperCase()}
            </span>
            <button
              type="button"
              className="sc-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && (
              <p className="sc-hint">Tap to let the tide in</p>
            )}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="sc-col">
        {/* Hero */}
        <div
          style={{ position: "relative", overflow: "hidden", background: INK }}
        >
          <img
            src={venuePhoto}
            alt=""
            loading="eager"
            fetchPriority="high"
            style={{
              width: "100%",
              aspectRatio: "390/500",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(251,196,140,0.55) 0%, rgba(247,170,120,0.3) 30%, rgba(0,0,0,0) 55%, rgba(20,40,55,0.55) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              color: "#3a1f2a",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "3.5px",
                textTransform: "uppercase",
              }}
            >
              Barefoot &amp; in love
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(38px,11vw,70px)",
                lineHeight: 0.9,
              }}
            >
              {wedding.groom}
            </div>
            <div
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontStyle: "italic",
                fontSize: 24,
                margin: "4px 0",
              }}
            >
              and
            </div>
            <div
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(38px,11vw,70px)",
                lineHeight: 0.9,
              }}
            >
              {wedding.bride}
            </div>
            <div style={{ marginTop: 18, fontSize: 14, fontWeight: 600 }}>
              {formatLongDate(wedding.date)} · {formatTime(wedding.date)}
            </div>
            {wedding.venue && (
              <div style={{ fontSize: 14 }}>{wedding.venue}</div>
            )}
          </div>
          <a
            href="#rsvp"
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 24,
              height: 56,
              borderRadius: 999,
              background: INK,
              color: PAPER,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8px 0 24px",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Save my spot on the sand
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: CORAL,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowRight className="h-4 w-4" style={{ color: "#fff" }} />
            </span>
          </a>
        </div>

        {/* Personal */}
        <div
          style={{
            padding: "48px 24px 0",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.6,
              color: "#3c5563",
            }}
          >
            {wedding.description}
          </p>
        </div>

        {/* Weekend cards */}
        <div style={{ marginTop: 40 }} className="sc-cards">
          <div
            style={{
              flexShrink: 0,
              width: 200,
              borderRadius: 26,
              background: "#ffe2c8",
              padding: 20,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "2px",
                color: "#b8472a",
              }}
            >
              WELCOME
            </div>
            <div
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 22,
                marginTop: 8,
                lineHeight: 1.05,
              }}
            >
              Drinks at the beach bar
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              width: 200,
              borderRadius: 26,
              background: INK,
              color: PAPER,
              padding: 20,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "2px",
                color: "#ffc59e",
              }}
            >
              {formatTime(wedding.date).toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 22,
                marginTop: 8,
                lineHeight: 1.05,
              }}
            >
              Sunset vows &amp; a seafood feast
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              width: 200,
              borderRadius: 26,
              background: "#d6ecef",
              padding: 20,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "2px",
                color: "#2d6f8f",
              }}
            >
              MORNING AFTER
            </div>
            <div
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 22,
                marginTop: 8,
                lineHeight: 1.05,
              }}
            >
              Recovery brunch
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div
          style={{
            margin: "48px 24px 0",
            background: "linear-gradient(135deg, #f7b58a, #d9687a)",
            borderRadius: 28,
            padding: 24,
            color: "#3a1f2a",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px" }}>
            SUNSETS TO GO
          </div>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "48px 24px 0",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30 }}
            >
              {wedding.venue}
            </div>
            {wedding.address && (
              <div style={{ fontSize: 15, lineHeight: 1.5, color: "#3c5563" }}>
                {wedding.address}
              </div>
            )}
            <img
              src={photo}
              alt={names}
              loading="lazy"
              style={{
                width: "100%",
                aspectRatio: "342/220",
                objectFit: "cover",
                display: "block",
                borderRadius: 20,
                marginTop: 4,
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 8,
                marginTop: 4,
              }}
            >
              <a
                href={
                  wedding.mapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.address ?? wedding.venue ?? "")}`
                }
                target="_blank"
                rel="noreferrer"
                style={{
                  height: 52,
                  borderRadius: 999,
                  background: CORAL,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Directions
              </a>
              <a
                href={googleCalendarUrl(wedding)}
                style={{
                  height: 52,
                  borderRadius: 999,
                  border: `1.5px solid ${INK}`,
                  color: INK,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Add to calendar
              </a>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div
          id="rsvp"
          style={{
            margin: "52px 16px 0",
            scrollMarginTop: 24,
            background: INK,
            color: PAPER,
            borderRadius: 30,
            padding: "30px 20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              fontFamily: "'DM Serif Display', serif",
              fontWeight: 400,
              fontSize: 32,
            }}
          >
            You in?
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 16px 0" }}>
          <SeatingCta wedding={wedding} motif="wave" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 44,
            background: "linear-gradient(180deg, #fff6ea, #f2dcc0)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "36px 24px",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: "italic",
              fontSize: 36,
            }}
          >
            {names}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "3px",
              color: "#6a5a4a",
            }}
          >
            {formatLongDate(wedding.date).toUpperCase()}
          </span>
        </div>
        <div style={{ textAlign: "center", padding: "14px 0 28px" }}>
          <button
            type="button"
            onClick={replay}
            style={{
              border: `1px solid ${INK}`,
              background: "transparent",
              borderRadius: 999,
              height: 36,
              padding: "0 14px",
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              cursor: "pointer",
              color: INK,
              opacity: 0.75,
            }}
          >
            Replay opening
          </button>
        </div>
      </div>
    </main>
  );
}
