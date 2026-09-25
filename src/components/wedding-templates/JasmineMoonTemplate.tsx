import { Calendar, MapPin } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";

const INK = "#2c2e26";
const PAPER = "#f7f4ec";
const ACCENT = "#5f6b4a";
const MUTED = "#6b6d60";

/**
 * "Jasmine Moon" — jasmine and moonlight, minimal and serene. Ported from
 * JasmineMoon.dc.html; the opener is a moon rising over a night sky that
 * dawns into the page. RSVP/countdown/seating are the real site components.
 */
export function JasmineMoonTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2900,
    leaveMs: 1500,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const names = `${wedding.groom} & ${wedding.bride}`;

  return (
    <main
      className="theme-jasmine-moon wedding-stationery relative"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: "'Figtree', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .jm-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:linear-gradient(180deg,#0c1124 0%,#1b2340 55%,#3a3552 100%);display:flex;align-items:center;justify-content:center;transition:opacity 1.4s ease,filter 1.4s ease}
        .jm-op--leave{opacity:0;filter:brightness(3)}
        .jm-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);overflow:hidden}
        .jm-moon{position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 38% 38%,#fff8dd,#f0e2aa 55%,#d9c578 100%);box-shadow:0 0 40px rgba(240,226,170,.8);transition:transform 1.2s cubic-bezier(.6,0,.3,1),opacity 1.2s}
        .jm-op--leave .jm-moon{transform:translate(-50%,-50%) translate(60px,-140px) scale(.55);opacity:0}
        .jm-line{position:absolute;left:0;right:0;top:55%;text-align:center;font-family:'Newsreader',serif;font-style:italic;font-weight:300;font-size:clamp(22px,7vw,30px);color:#efe7cf;transition:opacity .5s}
        .jm-names{position:absolute;left:0;right:0;top:61%;text-align:center;font-size:11px;letter-spacing:4px;color:#b9a66a;transition:opacity .5s}
        .jm-op--leave .jm-line,.jm-op--leave .jm-names{opacity:0}
        .jm-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#efe7cf;animation:jm-pulse 1.8s ease-in-out infinite}
        @keyframes jm-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .jm-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .jm-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`jm-op ${phase === "leave" ? "jm-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="jm-card">
            <div className="jm-moon" />
            <p className="jm-line">Under a jasmine moon</p>
            <p className="jm-names">
              {wedding.groom.toUpperCase()} &amp; {wedding.bride.toUpperCase()}{" "}
              · {formatLongDate(wedding.date).toUpperCase()}
            </p>
            <button
              type="button"
              className="jm-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && <p className="jm-hint">Tap for moonrise</p>}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="jm-col">
        {/* Hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 24px 0",
            textAlign: "center",
          }}
        >
          <div style={{ position: "relative", width: 200, height: 220 }}>
            <img
              src={photo}
              alt={names}
              loading="eager"
              fetchPriority="high"
              style={{
                position: "absolute",
                left: 16,
                top: 16,
                width: 168,
                height: 200,
                objectFit: "cover",
                borderRadius: "100px",
                filter: "saturate(0.85)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 10,
                width: 180,
                height: 212,
                border: `1px solid ${ACCENT}88`,
                borderRadius: 106,
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -20,
                top: -10,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 38% 38%,#fff8dd,#f0e2aa 55%,#d9c578 100%)",
                boxShadow: "0 0 16px rgba(217,197,120,0.6)",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 11,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            Under a jasmine moon
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: "'Newsreader', serif",
              fontWeight: 300,
              fontSize: "clamp(38px,10vw,58px)",
              lineHeight: 1,
              letterSpacing: "-1px",
            }}
          >
            {wedding.groom}{" "}
            <span style={{ fontStyle: "italic", color: ACCENT }}>&amp;</span>{" "}
            {wedding.bride}
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: "'Newsreader', serif",
              fontStyle: "italic",
              fontSize: 19,
              color: "#4a4c42",
            }}
          >
            {formatLongDate(wedding.date)}
          </div>
          {wedding.venue && (
            <div style={{ marginTop: 2, fontSize: 14, color: MUTED }}>
              {wedding.venue} · {formatTime(wedding.date)}
            </div>
          )}
          <a
            href="#rsvp"
            style={{
              marginTop: 24,
              height: 50,
              padding: "0 28px",
              borderRadius: 999,
              border: `1px solid ${INK}`,
              color: INK,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            RSVP
          </a>
        </div>

        {/* Personal */}
        <div
          style={{
            margin: "36px 28px 0",
            paddingTop: 30,
            borderTop: "1px solid #ddd6c3",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Newsreader', serif",
              fontWeight: 300,
              fontSize: "clamp(18px,5vw,21px)",
              lineHeight: 1.5,
              color: "#3d3f36",
            }}
          >
            {wedding.description}
          </p>
        </div>

        {/* Details grid */}
        <div
          style={{
            margin: "48px 28px 0",
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(0,1fr))",
            rowGap: 28,
            columnGap: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 10, letterSpacing: "2.5px", color: MUTED }}>
              CEREMONY
            </div>
            <div
              style={{
                fontFamily: "'Newsreader', serif",
                fontSize: 22,
                marginTop: 4,
              }}
            >
              {formatTime(wedding.date)}
            </div>
            {wedding.venue && (
              <div style={{ fontSize: 13, color: MUTED }}>{wedding.venue}</div>
            )}
          </div>
          {wedding.receptionDate && (
            <div>
              <div
                style={{ fontSize: 10, letterSpacing: "2.5px", color: MUTED }}
              >
                RECEPTION
              </div>
              <div
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 22,
                  marginTop: 4,
                }}
              >
                {formatTime(wedding.receptionDate)}
              </div>
              {wedding.hall && (
                <div style={{ fontSize: 13, color: MUTED }}>{wedding.hall}</div>
              )}
            </div>
          )}
        </div>

        {/* Countdown */}
        <div style={{ margin: "48px 28px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "48px 28px 0",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 30 }}>
              {wedding.venue}
            </div>
            {wedding.address && (
              <div style={{ fontSize: 15, lineHeight: 1.5, color: "#4a4c42" }}>
                {wedding.address}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 8,
                marginTop: 6,
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
                  height: 50,
                  borderRadius: 999,
                  background: INK,
                  color: PAPER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <MapPin className="h-4 w-4" /> Directions
              </a>
              <a
                href={googleCalendarUrl(wedding)}
                style={{
                  height: 50,
                  borderRadius: 999,
                  border: `1px solid ${INK}`,
                  color: INK,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <Calendar className="h-4 w-4" /> Calendar
              </a>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div
          id="rsvp"
          style={{
            margin: "56px 20px 0",
            scrollMarginTop: 24,
            background: "#fff",
            borderRadius: 26,
            padding: "28px 20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontFamily: "'Newsreader', serif",
              fontWeight: 300,
              fontSize: 32,
            }}
          >
            Will you be there?
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 20px 0" }}>
          <SeatingCta wedding={wedding} motif="line" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "40px 24px",
          }}
        >
          <span
            style={{
              fontFamily: "'Newsreader', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 30,
            }}
          >
            {names}
          </span>
          <span style={{ fontSize: 10, letterSpacing: "3px", color: MUTED }}>
            {formatLongDate(wedding.date).toUpperCase()}
          </span>
        </div>
        <div style={{ textAlign: "center", padding: "0 0 28px" }}>
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
