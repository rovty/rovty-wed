import { Calendar, MapPin } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import venueImg from "@/assets/venue.webp";

const INK = "#2b1d14";
const CREAM = "#fbf3e2";
const KUMKUM = "#a3161b";
const TEAL = "#0f4c45";
const GOLD = "#e3a018";
const MUTED = "#6a5646";

function KolamMotif({ size = 170 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 170 170" fill="none">
      <circle cx="85" cy="85" r="80" stroke={TEAL} strokeWidth={1.2} />
      <g stroke={KUMKUM} strokeWidth={1.6}>
        <path d="M85 25c14 18 14 42 0 60-14-18-14-42 0-60z" />
        <path d="M85 145c14-18 14-42 0-60-14 18-14 42 0 60z" />
        <path d="M25 85c18-14 42-14 60 0-18 14-42 14-60 0z" />
        <path d="M145 85c-18-14-42-14-60 0 18 14 42 14 60 0z" />
      </g>
      <g stroke={TEAL} strokeWidth={1.2}>
        <path d="M42 42c20 4 34 18 43 43-25-9-39-23-43-43z" />
        <path d="M128 42c-4 20-18 34-43 43 9-25 23-39 43-43z" />
        <path d="M42 128c4-20 18-34 43-43-9 25-23 39-43 43z" />
        <path d="M128 128c-20-4-34-18-43-43 25 9 39 23 43 43z" />
      </g>
      <circle
        cx="85"
        cy="85"
        r="72"
        stroke={GOLD}
        strokeWidth={1}
        strokeDasharray="2 5"
      />
      <circle cx="85" cy="85" r="7" fill={GOLD} />
    </svg>
  );
}

/**
 * "Kolam" — Tamil wedding tradition, kolam geometry in gold. Ported from
 * Kolam.dc.html; the opener draws a kolam medallion, then reveals "Welcome"
 * in Tamil. RSVP/countdown/seating are the real site components.
 */
export function KolamTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 3100,
    leaveMs: 1300,
  });
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;

  return (
    <main
      className="theme-kolam wedding-stationery relative"
      style={{
        background: CREAM,
        color: INK,
        fontFamily: "'Mukta', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .ko-op{position:fixed;inset:0;z-index:100;overflow:hidden;background-color:${CREAM};background-image:radial-gradient(rgba(163,22,27,.25) 1.3px,transparent 1.7px);background-size:22px 22px;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease}
        .ko-op--leave{opacity:0;pointer-events:none}
        .ko-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
        .ko-word{font-family:'Noto Serif Tamil',serif;font-weight:700;font-size:clamp(26px,8vw,34px);color:${KUMKUM}}
        .ko-sub{font-size:13px;letter-spacing:3px;color:${TEAL}}
        .ko-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${TEAL};animation:ko-pulse 1.8s ease-in-out infinite}
        @keyframes ko-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .ko-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .ko-col{width:100%;max-width:430px;margin:0 auto}
        .ko-rot{animation:ko-rot 60s linear infinite}
        @keyframes ko-rot{to{transform:rotate(360deg)}}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`ko-op ${phase === "leave" ? "ko-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="ko-card">
            <KolamMotif size={200} />
            <span className="ko-word">நல்வரவு</span>
            <span className="ko-sub">
              {wedding.groom.toUpperCase()} &amp; {wedding.bride.toUpperCase()}
            </span>
            <button
              type="button"
              className="ko-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && <p className="ko-hint">Tap to enter</p>}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="ko-col">
        {/* Hero */}
        <div
          style={{
            position: "relative",
            backgroundColor: CREAM,
            backgroundImage:
              "radial-gradient(rgba(163,22,27,0.22) 1.2px, transparent 1.6px)",
            backgroundSize: "22px 22px",
          }}
        >
          <img
            src={venuePhoto}
            alt=""
            loading="eager"
            fetchPriority="high"
            style={{
              width: "100%",
              aspectRatio: "390/120",
              objectFit: "cover",
              display: "block",
              maskImage: "linear-gradient(180deg,#000 50%,transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(180deg,#000 50%,transparent 100%)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "10px 24px 0",
            }}
          >
            <div
              style={{
                fontFamily: "'Noto Serif Tamil', serif",
                fontWeight: 700,
                fontSize: 22,
                color: KUMKUM,
              }}
            >
              சுப முகூர்த்தம்
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: TEAL,
                marginTop: 4,
              }}
            >
              With the blessings of the Almighty
            </div>
            <div className="ko-rot" style={{ marginTop: 22 }}>
              <KolamMotif />
            </div>
            <div
              style={{
                marginTop: 22,
                fontFamily: "'Gloock', serif",
                fontSize: "clamp(38px,11vw,58px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.groom}
            </div>
            <div
              style={{
                fontFamily: "'Gloock', serif",
                fontSize: 22,
                color: KUMKUM,
                margin: "6px 0",
              }}
            >
              weds
            </div>
            <div
              style={{
                fontFamily: "'Gloock', serif",
                fontSize: "clamp(38px,11vw,58px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.bride}
            </div>
            <div
              style={{
                marginTop: 22,
                display: "flex",
                alignItems: "stretch",
                background: TEAL,
                color: CREAM,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  background: KUMKUM,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Gloock', serif",
                    fontSize: 28,
                    lineHeight: 1,
                  }}
                >
                  {wedding.date.getDate()}
                </span>
                <span style={{ fontSize: 10, letterSpacing: "2px" }}>
                  {wedding.date
                    .toLocaleDateString("en-US", {
                      month: "short",
                      timeZone: "Asia/Colombo",
                    })
                    .toUpperCase()}
                </span>
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  {formatLongDate(wedding.date)}
                </span>
                <span style={{ fontSize: 13, color: "rgba(251,243,226,0.8)" }}>
                  Muhurtham {formatTime(wedding.date)}
                </span>
              </div>
            </div>
          </div>
          <div style={{ padding: "24px 20px 20px" }}>
            <a
              href="#rsvp"
              style={{
                height: 52,
                borderRadius: 14,
                background: KUMKUM,
                color: CREAM,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: "0 10px 24px rgba(163,22,27,0.3)",
              }}
            >
              RSVP
            </a>
          </div>
        </div>

        {/* Families */}
        <div
          style={{
            background: TEAL,
            color: CREAM,
            padding: "44px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            With love and blessings
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.6,
              color: "rgba(251,243,226,0.9)",
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
                gap: 12,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  border: "1px solid rgba(227,160,24,0.5)",
                  borderRadius: 12,
                  padding: "14px 8px",
                }}
              >
                <div
                  style={{ fontSize: 10, letterSpacing: "2px", color: GOLD }}
                >
                  BRIDE&apos;S PARENTS
                </div>
                <div
                  style={{
                    fontFamily: "'Gloock', serif",
                    fontSize: 15,
                    marginTop: 6,
                  }}
                >
                  {wedding.brideParentsNames || "—"}
                </div>
              </div>
              <div
                style={{
                  border: "1px solid rgba(227,160,24,0.5)",
                  borderRadius: 12,
                  padding: "14px 8px",
                }}
              >
                <div
                  style={{ fontSize: 10, letterSpacing: "2px", color: GOLD }}
                >
                  GROOM&apos;S PARENTS
                </div>
                <div
                  style={{
                    fontFamily: "'Gloock', serif",
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

        {/* Events */}
        <div
          style={{
            padding: "48px 20px 0",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h2
            style={{
              margin: "0 0 6px",
              textAlign: "center",
              fontFamily: "'Gloock', serif",
              fontWeight: 400,
              fontSize: 32,
            }}
          >
            The celebrations
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr",
              gap: 14,
              alignItems: "center",
              background: KUMKUM,
              color: CREAM,
              borderRadius: 18,
              padding: 16,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(251,243,226,0.14)",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  color: "#fbe3b0",
                }}
              >
                {formatLongDate(wedding.date).toUpperCase()} ·{" "}
                {formatTime(wedding.date).toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: "'Gloock', serif",
                  fontSize: 20,
                  lineHeight: 1.2,
                }}
              >
                Muhurtham
              </div>
              {wedding.venue && (
                <div style={{ fontSize: 14, color: "rgba(251,243,226,0.85)" }}>
                  {wedding.venue}
                </div>
              )}
            </div>
          </div>
          {wedding.receptionDate && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr",
                gap: 14,
                alignItems: "center",
                background: "#fff8ea",
                border: "1px solid rgba(15,76,69,0.18)",
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#d6e7e2",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    color: KUMKUM,
                  }}
                >
                  {formatTime(wedding.receptionDate).toUpperCase()}
                </div>
                <div
                  style={{
                    fontFamily: "'Gloock', serif",
                    fontSize: 20,
                    lineHeight: 1.2,
                  }}
                >
                  Reception
                </div>
                {wedding.hall && (
                  <div style={{ fontSize: 14, color: MUTED }}>
                    {wedding.hall}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div style={{ margin: "56px 20px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "56px 20px 0",
              borderRadius: 22,
              overflow: "hidden",
              background: "#fff8ea",
              border: "1px solid rgba(15,76,69,0.18)",
            }}
          >
            <img
              src={venuePhoto}
              alt={wedding.venue ?? "The venue"}
              loading="lazy"
              style={{
                width: "100%",
                aspectRatio: "350/200",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontFamily: "'Gloock', serif", fontSize: 24 }}>
                {wedding.venue}
              </div>
              {wedding.address && (
                <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.5 }}>
                  {wedding.address}
                </div>
              )}
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
                    height: 48,
                    borderRadius: 12,
                    background: TEAL,
                    color: CREAM,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <MapPin className="h-4 w-4" /> Directions
                </a>
                <a
                  href={googleCalendarUrl(wedding)}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    border: `1px solid ${TEAL}`,
                    color: TEAL,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Calendar className="h-4 w-4" /> Calendar
                </a>
              </div>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div id="rsvp" style={{ margin: "56px 20px 0", scrollMarginTop: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Noto Serif Tamil', serif",
                fontWeight: 500,
                fontSize: 16,
                color: KUMKUM,
              }}
            >
              வருகையை உறுதிசெய்க
            </div>
            <h2
              style={{
                margin: "4px 0 20px",
                fontFamily: "'Gloock', serif",
                fontWeight: 400,
                fontSize: 32,
              }}
            >
              Will you join us?
            </h2>
          </div>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 20px 0" }}>
          <SeatingCta wedding={wedding} motif="geo" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 56,
            backgroundColor: TEAL,
            backgroundImage:
              "radial-gradient(rgba(227,160,24,0.35) 1.2px, transparent 1.6px)",
            backgroundSize: "22px 22px",
            color: CREAM,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "44px 24px",
            gap: 6,
          }}
        >
          <span style={{ fontFamily: "'Gloock', serif", fontSize: 30 }}>
            {wedding.groom} <span style={{ color: GOLD }}>&amp;</span>{" "}
            {wedding.bride}
          </span>
          <span
            style={{
              fontSize: 12,
              letterSpacing: "3px",
              color: "rgba(251,243,226,0.75)",
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
