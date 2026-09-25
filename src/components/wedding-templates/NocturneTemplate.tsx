import { ArrowRight } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";

const BLACK = "#0e0d0c";
const PAPER = "#efe8dc";
const GOLD = "#d8c3a0";

/**
 * "Nocturne" — black tie, monochrome drama. Ported from Nocturne.dc.html;
 * the opener is a candle flame igniting behind an iris that opens onto the
 * page. RSVP/countdown/seating are the real site components.
 */
export function NocturneTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2800,
    leaveMs: 1700,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const placeLine = [wedding.venue, wedding.hall].filter(Boolean).join(" · ");
  const day = wedding.date.getDate();
  const month = wedding.date.getMonth() + 1;
  const year = wedding.date.getFullYear();

  return (
    <main
      className="theme-nocturne wedding-stationery relative"
      style={{
        background: BLACK,
        color: PAPER,
        fontFamily: "'Manrope', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .no-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:${BLACK};display:flex;align-items:center;justify-content:center;transition:opacity 1s ease}
        .no-op--leave{opacity:0;pointer-events:none}
        .no-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
        .no-flame{width:16px;height:40px;border-radius:50% 50% 45% 45%/70% 70% 30% 30%;background:radial-gradient(ellipse at 50% 78%,#fff 0%,#fff1c2 22%,#ffb347 55%,rgba(255,120,40,0) 82%);animation:no-flick .16s ease-in-out infinite alternate;transition:opacity .6s}
        @keyframes no-flick{0%{transform:scale(1,1) rotate(-1.5deg)}100%{transform:scale(.93,1.07) rotate(1.5deg)}}
        .no-op--leave .no-flame{opacity:0}
        .no-names{font-family:'Bodoni Moda',serif;font-size:clamp(28px,8vw,42px);color:${PAPER};text-align:center;transition:opacity .5s}
        .no-names em{font-style:italic;color:${GOLD}}
        .no-date{font-size:11px;letter-spacing:4px;color:${GOLD};transition:opacity .5s}
        .no-op--leave .no-names,.no-op--leave .no-date{opacity:0}
        .no-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${GOLD};animation:no-pulse 1.8s ease-in-out infinite}
        @keyframes no-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .no-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .no-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`no-op ${phase === "leave" ? "no-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="no-card">
            <div className="no-flame" />
            <div className="no-names">
              {wedding.groom} <em>&amp;</em> {wedding.bride}
            </div>
            <div className="no-date">
              {formatLongDate(wedding.date).toUpperCase()}
            </div>
            <button
              type="button"
              className="no-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && (
              <p className="no-hint">Tap to light the evening</p>
            )}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="no-col">
        {/* Hero */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={photo}
            alt={names}
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
                "linear-gradient(180deg, rgba(14,13,12,0.55) 0%, rgba(14,13,12,0) 26%, rgba(14,13,12,0.2) 48%, rgba(14,13,12,0.96) 92%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 22,
              left: 24,
              right: 24,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "rgba(239,232,220,0.85)",
            }}
          >
            <span>An evening for</span>
            <span>{formatLongDate(wedding.date)}</span>
          </div>
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 24,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontFamily: "'Bodoni Moda', serif",
                fontSize: "clamp(46px,13vw,78px)",
                lineHeight: 0.92,
                letterSpacing: "-1.5px",
              }}
            >
              {wedding.groom}
            </span>
            <span
              style={{
                fontFamily: "'Bodoni Moda', serif",
                fontStyle: "italic",
                fontSize: "clamp(24px,7vw,40px)",
                lineHeight: 1.1,
                color: GOLD,
                paddingLeft: 6,
              }}
            >
              and
            </span>
            <span
              style={{
                fontFamily: "'Bodoni Moda', serif",
                fontSize: "clamp(46px,13vw,78px)",
                lineHeight: 0.92,
                letterSpacing: "-1.5px",
                alignSelf: "flex-end",
              }}
            >
              {wedding.bride}
            </span>
            <div
              style={{
                marginTop: 22,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid rgba(216,195,160,0.4)",
                paddingTop: 14,
                fontSize: 12,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              <span>{formatLongDate(wedding.date)}</span>
              <span style={{ color: GOLD }}>{formatTime(wedding.date)}</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "0 20px" }}>
          <a
            href="#rsvp"
            style={{
              marginTop: -30,
              position: "relative",
              height: 56,
              borderRadius: 999,
              background: "rgba(239,232,220,0.1)",
              border: "1px solid rgba(239,232,220,0.2)",
              backdropFilter: "blur(14px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 6px 0 22px",
            }}
          >
            <span style={{ fontSize: 13, color: PAPER }}>
              Reserve your place
            </span>
            <span
              style={{
                height: 44,
                padding: "0 20px",
                display: "flex",
                alignItems: "center",
                borderRadius: 999,
                background: GOLD,
                color: BLACK,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              RSVP
            </span>
          </a>
        </div>

        {/* Personal */}
        <div
          style={{
            padding: "44px 24px 0",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Bodoni Moda', serif",
              fontSize: "clamp(22px,6.5vw,30px)",
              lineHeight: 1.22,
            }}
          >
            {wedding.description}
          </p>
        </div>

        {/* Big date */}
        <div
          style={{
            margin: "56px 24px 0",
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            borderTop: "1px solid rgba(216,195,160,0.35)",
            borderBottom: "1px solid rgba(216,195,160,0.35)",
          }}
        >
          <div style={{ padding: "18px 0", textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Bodoni Moda', serif",
                fontSize: 48,
                lineHeight: 1,
              }}
            >
              {day}
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "2px",
                color: "rgba(239,232,220,0.6)",
                marginTop: 6,
              }}
            >
              DAY
            </div>
          </div>
          <div
            style={{
              padding: "18px 0",
              textAlign: "center",
              borderLeft: "1px solid rgba(216,195,160,0.35)",
              borderRight: "1px solid rgba(216,195,160,0.35)",
            }}
          >
            <div
              style={{
                fontFamily: "'Bodoni Moda', serif",
                fontSize: 48,
                lineHeight: 1,
                color: GOLD,
              }}
            >
              {month}
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "2px",
                color: "rgba(239,232,220,0.6)",
                marginTop: 6,
              }}
            >
              MONTH
            </div>
          </div>
          <div style={{ padding: "18px 0", textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Bodoni Moda', serif",
                fontSize: 48,
                lineHeight: 1,
              }}
            >
              {String(year).slice(-2)}
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "2px",
                color: "rgba(239,232,220,0.6)",
                marginTop: 6,
              }}
            >
              YEAR
            </div>
          </div>
        </div>
        <div style={{ margin: "14px 24px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Evening timeline */}
        <div style={{ margin: "56px 24px 0" }}>
          <h2
            style={{
              margin: "0 0 30px",
              fontFamily: "'Bodoni Moda', serif",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: "clamp(32px,9vw,44px)",
            }}
          >
            The evening
          </h2>
          <div
            style={{
              position: "relative",
              paddingLeft: 34,
              display: "flex",
              flexDirection: "column",
              gap: 30,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 6,
                top: 8,
                bottom: 8,
                width: 1,
                background:
                  "linear-gradient(180deg, #d8c3a0, rgba(216,195,160,0.1))",
              }}
            />
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: -34,
                  top: 5,
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  background: GOLD,
                  boxShadow:
                    "0 0 0 5px rgba(216,195,160,0.18), 0 0 18px rgba(216,195,160,0.6)",
                }}
              />
              <div style={{ fontSize: 12, letterSpacing: "2px", color: GOLD }}>
                {formatTime(wedding.date).toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: "'Bodoni Moda', serif",
                  fontSize: 24,
                  marginTop: 4,
                }}
              >
                Vows by candlelight
              </div>
              {wedding.venue && (
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(239,232,220,0.65)",
                    marginTop: 4,
                  }}
                >
                  {wedding.venue}
                </div>
              )}
            </div>
            {wedding.receptionDate && (
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: -32,
                    top: 7,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    border: `1px solid ${GOLD}`,
                  }}
                />
                <div
                  style={{ fontSize: 12, letterSpacing: "2px", color: GOLD }}
                >
                  {formatTime(wedding.receptionDate).toUpperCase()}
                </div>
                <div
                  style={{
                    fontFamily: "'Bodoni Moda', serif",
                    fontSize: 24,
                    marginTop: 4,
                  }}
                >
                  Supper &amp; dancing
                </div>
                {wedding.hall && (
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(239,232,220,0.65)",
                      marginTop: 4,
                    }}
                  >
                    {wedding.hall}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seat card */}
        <div style={{ margin: "56px 24px 0" }}>
          <SeatingCta wedding={wedding} motif="line" />
        </div>

        {/* Dress code */}
        <div
          style={{
            margin: "24px 24px 0",
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(0,1fr))",
            gap: 12,
          }}
        >
          <div
            style={{
              borderTop: "1px solid rgba(216,195,160,0.45)",
              paddingTop: 14,
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: "2.5px", color: GOLD }}>
              DRESS
            </div>
            <div
              style={{
                fontFamily: "'Bodoni Moda', serif",
                fontSize: 18,
                marginTop: 6,
                lineHeight: 1.25,
              }}
            >
              Black tie.
            </div>
          </div>
          {placeLine && (
            <div
              style={{
                borderTop: "1px solid rgba(216,195,160,0.45)",
                paddingTop: 14,
              }}
            >
              <div
                style={{ fontSize: 10, letterSpacing: "2.5px", color: GOLD }}
              >
                WHERE
              </div>
              <div
                style={{
                  fontFamily: "'Bodoni Moda', serif",
                  fontSize: 18,
                  marginTop: 6,
                  lineHeight: 1.25,
                }}
              >
                {placeLine}
              </div>
            </div>
          )}
        </div>

        {/* RSVP */}
        <div
          id="rsvp"
          style={{
            margin: "56px 16px 0",
            scrollMarginTop: 24,
            background: "#181614",
            border: "1px solid rgba(216,195,160,0.2)",
            borderRadius: 24,
            padding: "32px 20px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Bodoni Moda', serif",
                fontWeight: 400,
                fontSize: 32,
              }}
            >
              Will you{" "}
              <span style={{ fontStyle: "italic", color: GOLD }}>attend?</span>
            </h2>
          </div>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "48px 24px",
          }}
        >
          <span
            style={{
              fontFamily: "'Bodoni Moda', serif",
              fontStyle: "italic",
              fontSize: 36,
              color: GOLD,
            }}
          >
            {names}
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "3px",
              color: "rgba(239,232,220,0.55)",
            }}
          >
            UNTIL THE CANDLES BURN DOWN
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
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Replay opening <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </main>
  );
}
