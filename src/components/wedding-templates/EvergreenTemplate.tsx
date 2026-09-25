import { Calendar, MapPin } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";
import venueImg from "@/assets/venue.webp";

const DARK = "#1c2b24";
const PALE = "#e9eee4";
const MOSS = "#c8d6c0";

/**
 * "Evergreen" — a misty forest, quiet and romantic. Ported from
 * Evergreen.dc.html; the opener clears a mist of fog banks off a forest
 * photo. RSVP/countdown/seating are the real site components.
 */
export function EvergreenTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, guest, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2900,
    leaveMs: 1900,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;

  return (
    <main
      className="theme-evergreen wedding-stationery relative"
      style={{
        background: DARK,
        color: PALE,
        fontFamily: "'Manrope', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .eg-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:${DARK};display:flex;align-items:center;justify-content:center;transition:opacity .6s ease}
        .eg-op--leave{opacity:0;pointer-events:none}
        .eg-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);overflow:hidden}
        .eg-cimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(4px) brightness(1.05)}
        .eg-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(223,230,222,.7) 0%,rgba(223,230,222,.3) 30%,rgba(28,43,36,.2) 60%,rgba(28,43,36,.92) 100%)}
        .eg-t1{position:absolute;left:0;right:0;top:38%;text-align:center;font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#3d5646}
        .eg-t2{position:absolute;left:0;right:0;top:42%;text-align:center;font-family:'Bellefair',serif;font-size:clamp(32px,10vw,52px);color:${DARK}}
        .eg-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${DARK};animation:eg-pulse 1.8s ease-in-out infinite}
        @keyframes eg-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .eg-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .eg-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`eg-op ${phase === "leave" ? "eg-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="eg-card">
            <img className="eg-cimg" src={venuePhoto} alt="" />
            <div className="eg-shade" />
            <div className="eg-t1">Into the woods, together</div>
            <div className="eg-t2">
              {wedding.groom} &amp; {wedding.bride}
            </div>
            <button
              type="button"
              className="eg-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && (
              <p className="eg-hint">Tap to clear the mist</p>
            )}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="eg-col">
        {/* Hero */}
        <div style={{ position: "relative", overflow: "hidden" }}>
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
                "linear-gradient(180deg, rgba(223,230,222,0.55) 0%, rgba(223,230,222,0.15) 28%, rgba(28,43,36,0.15) 55%, rgba(28,43,36,0.92) 92%)",
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
              color: DARK,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "4px",
                textTransform: "uppercase",
              }}
            >
              Into the woods, together
            </div>
            <div
              style={{
                marginTop: 20,
                fontFamily: "'Bellefair', serif",
                fontSize: "clamp(40px,12vw,66px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.groom}
            </div>
            <div
              style={{
                fontFamily: "'Bellefair', serif",
                fontSize: 22,
                margin: "4px 0",
              }}
            >
              &amp;
            </div>
            <div
              style={{
                fontFamily: "'Bellefair', serif",
                fontSize: "clamp(40px,12vw,66px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.bride}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 90,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ fontFamily: "'Bellefair', serif", fontSize: 22 }}>
                {formatLongDate(wedding.date)}
              </div>
              <div style={{ fontSize: 13, color: "rgba(233,238,228,0.75)" }}>
                {formatTime(wedding.date)}
              </div>
            </div>
            {wedding.venue && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Bellefair', serif", fontSize: 18 }}>
                  {wedding.venue}
                </div>
              </div>
            )}
          </div>
          <a
            href="#rsvp"
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 24,
              height: 52,
              borderRadius: 999,
              background: PALE,
              color: DARK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            RSVP
          </a>
        </div>

        {/* Personal */}
        <div
          style={{
            padding: "56px 24px 0",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <span style={{ fontSize: 11, letterSpacing: "3px", color: MOSS }}>
            DEAR {(guest?.name.split(" ")[0] ?? "FRIEND").toUpperCase()}
          </span>
          <p
            style={{
              margin: 0,
              fontFamily: "'Bellefair', serif",
              fontSize: "clamp(22px,6.5vw,30px)",
              lineHeight: 1.2,
            }}
          >
            {wedding.description}
          </p>
        </div>

        {/* Trail timeline */}
        <div style={{ margin: "52px 24px 0", position: "relative" }}>
          <h2
            style={{
              margin: "0 0 24px",
              fontFamily: "'Bellefair', serif",
              fontWeight: 400,
              fontSize: 34,
            }}
          >
            The trail
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  color: MOSS,
                }}
              >
                {formatTime(wedding.date).toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Bellefair', serif", fontSize: 22 }}>
                Ceremony
              </div>
              {wedding.venue && (
                <div style={{ fontSize: 14, color: "rgba(233,238,228,0.7)" }}>
                  {wedding.venue}
                </div>
              )}
            </div>
            {wedding.receptionDate && (
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    color: MOSS,
                  }}
                >
                  {formatTime(wedding.receptionDate).toUpperCase()}
                </div>
                <div style={{ fontFamily: "'Bellefair', serif", fontSize: 22 }}>
                  Fireside dinner &amp; dancing
                </div>
                {wedding.hall && (
                  <div style={{ fontSize: 14, color: "rgba(233,238,228,0.7)" }}>
                    {wedding.hall}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Photo */}
        <div style={{ margin: "52px 0 0", position: "relative" }}>
          <img
            src={photo}
            alt={names}
            loading="lazy"
            style={{
              width: "100%",
              aspectRatio: "390/280",
              objectFit: "cover",
              display: "block",
              filter: "saturate(0.7) hue-rotate(-10deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${DARK} 0%, rgba(28,43,36,0) 30%, rgba(28,43,36,0) 70%, ${DARK} 100%)`,
            }}
          />
        </div>

        {/* Countdown */}
        <div style={{ margin: "30px 24px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "52px 24px 0",
              background: "#243830",
              borderRadius: 24,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontFamily: "'Bellefair', serif", fontSize: 30 }}>
              {wedding.venue}
            </div>
            {wedding.address && (
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "rgba(233,238,228,0.75)",
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
                  height: 50,
                  borderRadius: 999,
                  background: MOSS,
                  color: DARK,
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
                  border: "1px solid rgba(200,214,192,0.5)",
                  color: PALE,
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
        <div id="rsvp" style={{ margin: "52px 24px 0", scrollMarginTop: 24 }}>
          <h2
            style={{
              margin: "0 0 16px",
              fontFamily: "'Bellefair', serif",
              fontWeight: 400,
              fontSize: 34,
            }}
          >
            Will you join us in the woods?
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 24px 0" }}>
          <SeatingCta wedding={wedding} motif="leaf" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 52,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "40px 24px 36px",
            background: "linear-gradient(180deg, #1c2b24, #15211b)",
          }}
        >
          <span style={{ fontFamily: "'Bellefair', serif", fontSize: 32 }}>
            {names}
          </span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "3px",
              color: "rgba(233,238,228,0.6)",
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
              border: `1px solid ${PALE}`,
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
              color: PALE,
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
