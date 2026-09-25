import { Calendar, MapPin } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";

const INK = "#4a2a2e";
const PAPER = "#fbf1ee";
const ROSE = "#a4424f";
const MUTED = "#7a5a5d";

/**
 * "Rose Blush" — soft rose blush, romantic and light. Ported from
 * RoseBlush.dc.html; the opener scatters rose petals to reveal a card with
 * the couple's names. RSVP/countdown/seating are the real site components.
 */
export function RoseBlushTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2500,
    leaveMs: 1900,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const day = wedding.date.getDate();

  return (
    <main
      className="theme-rose-blush wedding-stationery relative"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: "'Lora', serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .rb-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:#f7dfe0;display:flex;align-items:center;justify-content:center;transition:opacity .5s .4s ease}
        .rb-op--leave{opacity:0;pointer-events:none}
        .rb-card{position:relative;width:min(280px,80vw);padding:34px 10px;border-radius:32px;background:rgba(255,255,255,.93);box-shadow:0 24px 50px -20px rgba(164,66,79,.45);text-align:center;transition:transform .6s ease-in,opacity .6s ease-in}
        .rb-op--leave .rb-card{transform:scale(1.1) translateY(-20px);opacity:0}
        .rb-n{font-family:'Parisienne',cursive;font-size:clamp(32px,9vw,46px);line-height:1.05;color:${INK}}
        .rb-d{font-family:'Nunito Sans',sans-serif;font-size:11px;letter-spacing:3px;color:${ROSE};margin-top:10px}
        .rb-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${INK};background:rgba(255,255,255,.85);margin:0 auto;width:fit-content;padding:10px 24px;border-radius:999px;animation:rb-pulse 1.8s ease-in-out infinite}
        @keyframes rb-pulse{0%,100%{opacity:.55}50%{opacity:1}}
        .rb-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .rb-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`rb-op ${phase === "leave" ? "rb-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="rb-card">
            <span className="rb-n">
              {wedding.groom}
              <br />
              &amp; {wedding.bride}
            </span>
            <span className="rb-d">
              {formatLongDate(wedding.date).toUpperCase()}
            </span>
            <button
              type="button"
              className="rb-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
          </div>
          {phase === "intro" && <p className="rb-hint">Tap to scatter</p>}
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="rb-col">
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
                "linear-gradient(180deg, rgba(251,241,238,0) 40%, rgba(251,241,238,0.95) 92%)",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "0 30px",
            }}
          >
            <div
              style={{
                marginTop: -140,
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: 11,
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                color: ROSE,
              }}
            >
              Save your heart for
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: "'Parisienne', cursive",
                fontSize: "clamp(44px,13vw,76px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.groom}
            </div>
            <div
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: 18,
                color: ROSE,
                margin: "4px 0",
              }}
            >
              and
            </div>
            <div
              style={{
                fontFamily: "'Parisienne', cursive",
                fontSize: "clamp(44px,13vw,76px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.bride}
            </div>
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  {wedding.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    timeZone: "Asia/Colombo",
                  })}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  {wedding.date.toLocaleDateString("en-US", {
                    month: "long",
                    timeZone: "Asia/Colombo",
                  })}
                </div>
              </div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  flexShrink: 0,
                  borderRadius: "50%",
                  border: `1px solid ${ROSE}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  color: ROSE,
                }}
              >
                {day}
              </div>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  {wedding.date.getFullYear()}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  {formatTime(wedding.date)}
                </div>
              </div>
            </div>
            {wedding.venue && (
              <div
                style={{
                  marginTop: 12,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: MUTED,
                }}
              >
                {wedding.venue}
              </div>
            )}
          </div>
          <div style={{ padding: "12px 24px 24px" }}>
            <a
              href="#rsvp"
              style={{
                width: 200,
                height: 52,
                borderRadius: 999,
                background: ROSE,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                boxShadow: "0 10px 24px rgba(164,66,79,0.3)",
              }}
            >
              RSVP
            </a>
          </div>
        </div>

        {/* Personal */}
        <div
          style={{
            margin: "12px 24px 0",
            background: "#fff",
            borderRadius: 32,
            padding: "32px 26px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "0 20px 40px -24px rgba(164,66,79,0.35)",
          }}
        >
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>
            {wedding.description}
          </p>
        </div>

        {/* Timeline */}
        <div
          style={{
            margin: "56px 24px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              fontFamily: "'Parisienne', cursive",
              fontWeight: 400,
              fontSize: 42,
            }}
          >
            The day
          </h2>
          <div
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 24px 1fr",
              rowGap: 26,
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "right", fontSize: 20 }}>
              {formatTime(wedding.date)}
            </div>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: ROSE,
                justifySelf: "center",
              }}
            />
            <div>
              <div style={{ fontSize: 16 }}>Ceremony</div>
              {wedding.venue && (
                <div
                  style={{ fontSize: 13, fontStyle: "italic", color: MUTED }}
                >
                  {wedding.venue}
                </div>
              )}
            </div>
            {wedding.receptionDate && (
              <>
                <div style={{ textAlign: "right", fontSize: 20 }}>
                  {formatTime(wedding.receptionDate)}
                </div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: `1px solid ${ROSE}`,
                    justifySelf: "center",
                  }}
                />
                <div>
                  <div style={{ fontSize: 16 }}>Dinner &amp; dance</div>
                  {wedding.hall && (
                    <div
                      style={{
                        fontSize: 13,
                        fontStyle: "italic",
                        color: MUTED,
                      }}
                    >
                      {wedding.hall}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
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
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: 11,
                letterSpacing: "3px",
                color: ROSE,
              }}
            >
              WHERE
            </div>
            <div style={{ fontSize: 26 }}>{wedding.venue}</div>
            {wedding.address && (
              <div style={{ fontSize: 15, fontStyle: "italic", color: MUTED }}>
                {wedding.address}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 8,
                marginTop: 10,
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
                  border: `1px solid ${ROSE}`,
                  color: ROSE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  textDecoration: "none",
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <MapPin className="h-4 w-4" /> Directions
              </a>
              <a
                href={googleCalendarUrl(wedding)}
                style={{
                  height: 50,
                  borderRadius: 999,
                  border: `1px solid ${ROSE}`,
                  color: ROSE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  textDecoration: "none",
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <Calendar className="h-4 w-4" /> Add to calendar
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
            background: "#fff",
            borderRadius: 32,
            padding: "30px 20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              textAlign: "center",
              fontFamily: "'Parisienne', cursive",
              fontWeight: 400,
              fontSize: 40,
            }}
          >
            Will you come?
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 16px 0" }}>
          <SeatingCta wedding={wedding} motif="leaf" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "40px 24px",
            background: "#f5dcdc",
          }}
        >
          <span style={{ fontFamily: "'Parisienne', cursive", fontSize: 40 }}>
            {names}
          </span>
          <span
            style={{
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: 11,
              letterSpacing: "3px",
              color: MUTED,
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
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
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
