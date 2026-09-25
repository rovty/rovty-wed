import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";

const NAVY = "#141a33";
const PAPER = "#ece6d8";
const GOLD = "#e2c07d";

/**
 * "Lotus Night" — an evening lotus ceremony under a starlit sky. Ported
 * from LotusNight.dc.html; the opener is a floating lamp that ascends and
 * drifts away. RSVP/countdown/seating are the real site components.
 */
export function LotusNightTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2900,
    leaveMs: 1500,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const placeLine = [wedding.venue, wedding.hall].filter(Boolean).join(" · ");

  return (
    <main
      className="theme-lotus-night wedding-stationery relative"
      style={{
        background: NAVY,
        color: PAPER,
        fontFamily: "'Jost', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .ln-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:linear-gradient(180deg,#0a0e22 0%,${NAVY} 55%,#2b2650 100%);display:flex;align-items:center;justify-content:center;transition:opacity 1.5s ease,transform 1.5s cubic-bezier(.7,0,.3,1)}
        .ln-op--leave{opacity:0;transform:translateY(-8%)}
        .ln-card{position:relative;width:min(390px,100vw);height:min(844px,100svh)}
        .ln-lamp{position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(255,217,138,.9),rgba(255,170,80,.3) 55%,rgba(255,170,80,0) 75%);transition:transform 1.2s ease-in,opacity 1.2s ease-in}
        .ln-op--leave .ln-lamp{transform:translate(-50%,-50%) translateY(-260px) scale(.6);opacity:0}
        .ln-t{position:absolute;left:0;right:0;top:70%;text-align:center;font-family:'Italiana',serif;font-size:clamp(30px,9vw,48px);color:#ece6d8}
        .ln-t2{position:absolute;left:0;right:0;top:78%;text-align:center;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${GOLD}}
        .ln-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${GOLD};animation:ln-pulse 1.8s ease-in-out infinite}
        @keyframes ln-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .ln-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .ln-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`ln-op ${phase === "leave" ? "ln-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="ln-card">
            <div className="ln-lamp" />
            <div className="ln-t">
              {wedding.groom} &amp; {wedding.bride}
            </div>
            <div className="ln-t2">An evening of lamps &amp; lotus</div>
            <button
              type="button"
              className="ln-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && (
              <p className="ln-hint">Tap to release the lamp</p>
            )}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="ln-col">
        {/* Hero */}
        <div
          style={{
            position: "relative",
            background: `radial-gradient(90% 60% at 50% 42%, #2a3466 0%, ${NAVY} 70%)`,
            padding: "44px 24px 24px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 200,
              height: 175,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,217,138,0.4) 0%, rgba(255,217,138,0.1) 45%, rgba(255,217,138,0) 70%)",
              }}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: GOLD,
              marginTop: -60,
            }}
          >
            An evening of lamps &amp; lotus
          </div>
          <div
            style={{
              marginTop: 40,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Italiana', serif",
                fontSize: "clamp(40px,11vw,60px)",
                lineHeight: 1,
                letterSpacing: "2px",
              }}
            >
              {wedding.groom}
            </span>
            <span
              style={{
                fontFamily: "'Italiana', serif",
                fontSize: 22,
                color: GOLD,
                margin: "8px 0",
              }}
            >
              &amp;
            </span>
            <span
              style={{
                fontFamily: "'Italiana', serif",
                fontSize: "clamp(40px,11vw,60px)",
                lineHeight: 1,
                letterSpacing: "2px",
              }}
            >
              {wedding.bride}
            </span>
            <span
              style={{
                marginTop: 22,
                fontSize: 13,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              {formatLongDate(wedding.date)}
            </span>
            {placeLine && (
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(236,230,216,0.7)",
                  marginTop: 4,
                }}
              >
                {formatTime(wedding.date)} · {placeLine}
              </span>
            )}
          </div>
          <a
            href="#rsvp"
            style={{
              marginTop: 28,
              display: "flex",
              height: 56,
              border: `1px solid ${GOLD}`,
              color: PAPER,
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontSize: 13,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              background: "rgba(20,26,51,0.6)",
              textDecoration: "none",
            }}
          >
            Light a lamp · RSVP
          </a>
        </div>

        {/* Personal */}
        <div
          style={{
            padding: "56px 28px 0",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Italiana', serif",
              fontSize: "clamp(22px,6.5vw,28px)",
              lineHeight: 1.3,
            }}
          >
            {wedding.description}
          </p>
        </div>

        {/* Timeline */}
        <div
          style={{
            margin: "56px 24px 0",
            display: "grid",
            gridTemplateColumns: wedding.receptionDate
              ? "repeat(2,minmax(0,1fr))"
              : "1fr",
            gap: 8,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(226,192,125,0.35)",
              padding: "18px 10px",
              textAlign: "center",
              borderRadius: "80px 80px 8px 8px",
            }}
          >
            <div
              style={{
                fontFamily: "'Italiana', serif",
                fontSize: 26,
                color: GOLD,
              }}
            >
              {formatTime(wedding.date)}
            </div>
            <div style={{ fontSize: 12, marginTop: 8, lineHeight: 1.4 }}>
              Lamp-lighting &amp; vows
            </div>
          </div>
          {wedding.receptionDate && (
            <div
              style={{
                border: "1px solid rgba(226,192,125,0.35)",
                padding: "18px 10px",
                textAlign: "center",
                borderRadius: "80px 80px 8px 8px",
                background: "rgba(226,192,125,0.1)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Italiana', serif",
                  fontSize: 26,
                  color: GOLD,
                }}
              >
                {formatTime(wedding.receptionDate)}
              </div>
              <div style={{ fontSize: 12, marginTop: 8, lineHeight: 1.4 }}>
                Feast in the courtyard
              </div>
            </div>
          )}
        </div>

        {/* Photo */}
        <div style={{ margin: "56px 24px 0", position: "relative" }}>
          <img
            src={photo}
            alt={names}
            loading="lazy"
            style={{
              width: "100%",
              aspectRatio: "342/380",
              objectFit: "cover",
              display: "block",
              borderRadius: "171px 171px 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "-8px -8px 0 -8px",
              border: "1px solid rgba(226,192,125,0.5)",
              borderBottom: 0,
              borderRadius: "179px 179px 0 0",
            }}
          />
        </div>

        {/* Countdown */}
        <div style={{ margin: "48px 24px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "56px 24px 0",
              padding: 24,
              border: "1px solid rgba(226,192,125,0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontFamily: "'Italiana', serif", fontSize: 30 }}>
              {wedding.venue}
            </div>
            {wedding.address && (
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(236,230,216,0.75)",
                  lineHeight: 1.5,
                }}
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
                  background: GOLD,
                  color: NAVY,
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
                  border: `1px solid ${GOLD}`,
                  color: PAPER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: 13,
                }}
              >
                Save the date
              </a>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div
          id="rsvp"
          style={{
            margin: "56px 16px 0",
            scrollMarginTop: 24,
            background: "#1d2447",
            borderRadius: 24,
            padding: "30px 20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              textAlign: "center",
              fontFamily: "'Italiana', serif",
              fontWeight: 400,
              fontSize: 32,
            }}
          >
            Will you be there?
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 16px 0" }}>
          <SeatingCta wedding={wedding} motif="lotus" />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "40px 24px",
          }}
        >
          <span
            style={{
              fontFamily: "'Italiana', serif",
              fontSize: 30,
              color: GOLD,
            }}
          >
            {names}
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "3px",
              color: "rgba(236,230,216,0.6)",
            }}
          >
            {formatLongDate(wedding.date).toUpperCase()}
          </span>
        </div>
        <div style={{ textAlign: "center", padding: "0 0 28px" }}>
          <button
            type="button"
            onClick={replay}
            style={{
              border: `1px solid ${GOLD}`,
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
              color: GOLD,
              opacity: 0.85,
            }}
          >
            Replay opening
          </button>
        </div>
      </div>
    </main>
  );
}
