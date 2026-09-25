import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import venueImg from "@/assets/venue.webp";

const INK = "#22332f";
const PAPER = "#f3f1ea";
const ROSE = "#b4486a";
const SAGE = "#b9d3cb";
const MUTED = "#5d6f6a";

function LotusGlyph({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 120 70"
      fill="none"
      stroke={ROSE}
      strokeWidth={1.1}
    >
      <path d="M60 8c9 12 9 30 0 44-9-14-9-32 0-44z" />
      <path d="M60 52C52 38 40 30 26 30c2 14 16 24 34 22z" />
      <path d="M60 52c8-14 20-22 34-22-2 14-16 24-34 22z" />
      <path d="M30 64h60" />
    </svg>
  );
}

/**
 * "Lotus Pond" — a lotus pond, calm and graceful. Ported from
 * LotusPond.dc.html; the opener blooms a lotus over rippling water.
 * RSVP/countdown/seating are the real site components.
 */
export function LotusPondTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, guest, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2800,
    leaveMs: 1500,
  });
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const placeLine = [wedding.venue, wedding.hall].filter(Boolean).join(" · ");

  return (
    <main
      className="theme-lotus-pond wedding-stationery relative"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: "'Karla', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .lp-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:radial-gradient(90% 60% at 50% 42%,#e6f0eb,#b9d3cb 60%,#8fb5a8);display:flex;align-items:center;justify-content:center;transition:clip-path 1.5s cubic-bezier(.7,0,.3,1)}
        .lp-op--leave{clip-path:circle(0% at 50% 38%)}
        .lp-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}
        .lp-bloom{transition:transform 1s ease-in,opacity 1s ease-in}
        .lp-op--leave .lp-bloom{transform:translateY(-30px) scale(1.2);opacity:0}
        .lp-t1{font-family:'Noto Serif Sinhala',serif;font-size:20px;color:${ROSE}}
        .lp-t2{font-family:'Gilda Display',serif;font-size:clamp(26px,8vw,36px);color:${INK}}
        .lp-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${INK};animation:lp-pulse 1.8s ease-in-out infinite}
        @keyframes lp-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .lp-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .lp-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`lp-op ${phase === "leave" ? "lp-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="lp-card">
            <div className="lp-bloom">
              <LotusGlyph size={140} />
            </div>
            <span className="lp-t1">ශුභ මංගලම්</span>
            <span className="lp-t2">{names}</span>
            <button
              type="button"
              className="lp-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && <p className="lp-hint">Tap to begin</p>}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="lp-col">
        {/* Hero */}
        <div
          style={{
            position: "relative",
            background:
              "linear-gradient(180deg, #f6efe6 0%, #f3ece4 44%, #d9e7e1 62%, #b9d3cb 100%)",
            paddingBottom: 90,
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "58px 28px 0",
            }}
          >
            <div
              style={{
                fontFamily: "'Noto Serif Sinhala', serif",
                fontSize: 17,
                color: ROSE,
              }}
            >
              ශුභ මංගලම්
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                color: "#4e6a62",
              }}
            >
              A lotus blooms · two families unite
            </div>
            <div
              style={{
                marginTop: 36,
                fontFamily: "'Gilda Display', serif",
                fontSize: "clamp(40px,12vw,64px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.groom}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "10px 0",
              }}
            >
              <span style={{ width: 40, height: 1, background: ROSE }} />
              <LotusGlyph size={40} />
              <span style={{ width: 40, height: 1, background: ROSE }} />
            </div>
            <div
              style={{
                fontFamily: "'Gilda Display', serif",
                fontSize: "clamp(40px,12vw,64px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.bride}
            </div>
            <div
              style={{
                marginTop: 30,
                fontFamily: "'Gilda Display', serif",
                fontSize: 22,
              }}
            >
              {formatLongDate(wedding.date)}
            </div>
            {placeLine && (
              <div style={{ fontSize: 14, color: "#4e6a62", marginTop: 4 }}>
                {formatTime(wedding.date)} · {placeLine}
              </div>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              bottom: 24,
              height: 60,
              boxSizing: "border-box",
              borderRadius: 999,
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 6px 0 22px",
              boxShadow: "0 10px 30px rgba(34,51,47,0.15)",
            }}
          >
            <span style={{ fontSize: 13, color: INK }}>
              Dear{" "}
              <strong style={{ fontWeight: 600 }}>
                {guest?.name.split(" ")[0] ?? "friend"}
              </strong>
              , will you come?
            </span>
            <a
              href="#rsvp"
              style={{
                height: 48,
                padding: "0 22px",
                borderRadius: 999,
                background: ROSE,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Reply
            </a>
          </div>
        </div>

        {/* Blessing */}
        <div
          style={{
            background: SAGE,
            padding: "8px 28px 56px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Gilda Display', serif",
              fontSize: "clamp(20px,6vw,25px)",
              lineHeight: 1.35,
            }}
          >
            {wedding.description}
          </p>
          {(wedding.brideParentsNames || wedding.groomParentsNames) && (
            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 10,
                marginTop: 10,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.55)",
                  borderRadius: 18,
                  padding: "16px 8px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "2px",
                    color: "#4e6a62",
                  }}
                >
                  BRIDE&apos;S PARENTS
                </div>
                <div
                  style={{
                    fontFamily: "'Gilda Display', serif",
                    fontSize: 15,
                    marginTop: 6,
                  }}
                >
                  {wedding.brideParentsNames || "—"}
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.55)",
                  borderRadius: 18,
                  padding: "16px 8px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "2px",
                    color: "#4e6a62",
                  }}
                >
                  GROOM&apos;S PARENTS
                </div>
                <div
                  style={{
                    fontFamily: "'Gilda Display', serif",
                    fontSize: 15,
                    marginTop: 6,
                  }}
                >
                  {wedding.groomParentsNames || "—"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Programme */}
        <div
          style={{
            padding: "56px 24px 0",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              fontFamily: "'Gilda Display', serif",
              fontWeight: 400,
              fontSize: 32,
              textAlign: "center",
            }}
          >
            The programme
          </h2>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              padding: 16,
              background: "#fff",
              borderRadius: 22,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "#fbe0e7",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'Gilda Display', serif",
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                {formatTime(wedding.date).split(" ")[0]}
              </span>
              <span style={{ fontSize: 9, letterSpacing: "1px" }}>
                {formatTime(wedding.date).split(" ")[1]}
              </span>
            </div>
            <div>
              <div
                style={{ fontFamily: "'Gilda Display', serif", fontSize: 20 }}
              >
                Poruwa ceremony
              </div>
              <div style={{ fontSize: 13, color: "#5d6f6a" }}>
                At the auspicious hour
              </div>
            </div>
          </div>
          {wedding.receptionDate && (
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                padding: 16,
                background: ROSE,
                color: "#fff",
                borderRadius: 22,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Gilda Display', serif",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  {formatTime(wedding.receptionDate).split(" ")[0]}
                </span>
                <span style={{ fontSize: 9, letterSpacing: "1px" }}>
                  {formatTime(wedding.receptionDate).split(" ")[1]}
                </span>
              </div>
              <div>
                <div
                  style={{ fontFamily: "'Gilda Display', serif", fontSize: 20 }}
                >
                  Reception
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                  Dinner by the water
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div style={{ margin: "56px 24px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "56px 24px 0",
              borderRadius: 28,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <img
              src={venuePhoto}
              alt={wedding.venue ?? "The venue"}
              loading="lazy"
              style={{
                width: "100%",
                aspectRatio: "342/220",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{ fontFamily: "'Gilda Display', serif", fontSize: 26 }}
              >
                {wedding.venue}
              </div>
              {wedding.address && (
                <div
                  style={{ fontSize: 14, color: "#5d6f6a", lineHeight: 1.5 }}
                >
                  {wedding.address}
                </div>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                  gap: 8,
                  marginTop: 8,
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
                    height: 48,
                    borderRadius: 999,
                    background: INK,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Directions
                </a>
                <a
                  href={googleCalendarUrl(wedding)}
                  style={{
                    height: 48,
                    borderRadius: 999,
                    border: `1px solid ${INK}`,
                    color: INK,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Add to calendar
                </a>
              </div>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div
          id="rsvp"
          style={{
            margin: "56px 24px 0",
            scrollMarginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Gilda Display', serif",
              fontWeight: 400,
              fontSize: 32,
              textAlign: "center",
            }}
          >
            Kindly reply
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 24px 0" }}>
          <SeatingCta wedding={wedding} motif="lotus" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 56,
            background: SAGE,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "40px 24px",
          }}
        >
          <LotusGlyph size={56} />
          <span style={{ fontFamily: "'Gilda Display', serif", fontSize: 32 }}>
            {names}
          </span>
          <span
            style={{ fontSize: 11, letterSpacing: "3px", color: "#4e6a62" }}
          >
            {formatLongDate(wedding.date)}
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
              fontWeight: 600,
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
