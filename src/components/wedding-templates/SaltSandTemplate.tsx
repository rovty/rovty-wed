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

const INK = "#16323c";
const SAND = "#efe6d6";
const SEA = "#1d5e74";
const MUTED = "#52646a";

/**
 * "Salt & Sand" — a minimal seaside invitation, postcard-inspired. Ported
 * from SaltSand.dc.html; the opener is a postcard tossed onto the sand that
 * flips over. RSVP/countdown/seating are the real site components.
 */
export function SaltSandTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2700,
    leaveMs: 1400,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const initials = `${wedding.groom.charAt(0)} & ${wedding.bride.charAt(0)}`;
  const place = wedding.venue ?? wedding.address ?? "the coast";

  return (
    <main
      className="theme-salt-sand wedding-stationery relative"
      style={{
        background: SAND,
        color: INK,
        fontFamily: "'Work Sans', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .ss-op{position:fixed;inset:0;z-index:100;overflow:hidden;background-color:${SAND};background-image:radial-gradient(rgba(140,110,70,.14) 1px,transparent 1.6px);background-size:8px 8px;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease}
        .ss-op--leave{opacity:0;pointer-events:none}
        .ss-card{position:relative;width:min(334px,86vw);aspect-ratio:334/230;transform-style:preserve-3d;transform:rotate(-4deg);transition:transform 1.1s cubic-bezier(.6,0,.3,1)}
        .ss-op--leave .ss-card{transform:rotate(-4deg) rotateY(180deg) scale(1.05)}
        .ss-front,.ss-back{position:absolute;inset:0;backface-visibility:hidden;box-shadow:0 24px 34px -18px rgba(22,50,60,.4)}
        .ss-front{background:#fff;padding:8px;box-sizing:border-box}
        .ss-front img{width:100%;height:100%;object-fit:cover}
        .ss-back{background:#fbf8f1;transform:rotateY(180deg);display:flex;align-items:center;justify-content:center;font-family:'Young Serif',serif;font-size:20px;color:${INK};text-align:center;padding:0 20px}
        .ss-greet{position:absolute;left:16px;bottom:16px;text-align:left;font-family:'Young Serif',serif;font-size:14px;line-height:1.1;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.4)}
        .ss-greet b{font-weight:400;font-size:26px}
        .ss-hint{position:absolute;left:0;right:0;bottom:8%;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${INK};animation:ss-pulse 1.8s ease-in-out infinite}
        @keyframes ss-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .ss-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0;z-index:2}
        .ss-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`ss-op ${phase === "leave" ? "ss-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="ss-card">
            <div className="ss-front">
              <img src={photo} alt="" />
              <div className="ss-greet">
                Greetings from
                <br />
                <b>{place}</b>
              </div>
            </div>
            <div className="ss-back">See you on the sand.</div>
          </div>
          <button
            type="button"
            className="ss-tap"
            aria-label="Open the invitation"
            onClick={leave}
          />
          {phase === "intro" && <p className="ss-hint">Tap to turn it over</p>}
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="ss-col">
        {/* Hero */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={venuePhoto}
            alt=""
            style={{
              width: "100%",
              aspectRatio: "390/470",
              objectFit: "cover",
              display: "block",
              maskImage: "linear-gradient(180deg,#000 78%,transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(180deg,#000 78%,transparent 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(10,30,40,0.4), rgba(10,30,40,0) 40%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              right: 24,
              display: "flex",
              justifyContent: "space-between",
              color: "#fff",
              fontSize: 11,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            <span>{place}</span>
            <span>{formatLongDate(wedding.date)}</span>
          </div>
          <div
            style={{
              position: "absolute",
              top: 90,
              left: 24,
              right: 24,
              color: "#fff",
              fontFamily: "'Young Serif', serif",
              fontSize: "clamp(46px,14vw,80px)",
              lineHeight: 0.92,
              letterSpacing: "-2px",
              textShadow: "0 2px 24px rgba(0,0,0,0.25)",
            }}
          >
            {wedding.groom}
            <br />
            &amp; {wedding.bride}
          </div>
          <img
            src={photo}
            alt={names}
            loading="eager"
            fetchPriority="high"
            style={{
              position: "absolute",
              top: "42%",
              right: 24,
              width: 130,
              height: 130,
              borderRadius: "50%",
              objectFit: "cover",
              border: `6px solid ${SAND}`,
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 70,
              left: 24,
              right: 24,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontFamily: "'Young Serif', serif",
                fontSize: 20,
                color: "#fff",
              }}
            >
              {formatTime(wedding.date)}
            </span>
          </div>
          <a
            href="#rsvp"
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 24,
              height: 56,
              borderRadius: 12,
              background: INK,
              color: SAND,
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

        {/* Note */}
        <div style={{ padding: "48px 24px 0" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "'Young Serif', serif",
              fontSize: "clamp(20px,6vw,26px)",
              lineHeight: 1.3,
            }}
          >
            {wedding.description}
          </p>
        </div>

        {/* Timeline */}
        <div
          style={{
            margin: "44px 24px 0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "76px 1fr",
              padding: "16px 0",
              borderTop: "1px solid #cdbfa6",
            }}
          >
            <span style={{ fontWeight: 600, color: SEA }}>
              {formatTime(wedding.date)}
            </span>
            <div>
              <div style={{ fontFamily: "'Young Serif', serif", fontSize: 20 }}>
                Vows at the waterline
              </div>
              <div style={{ fontSize: 13, color: MUTED }}>
                Shoes off at the path
              </div>
            </div>
          </div>
          {wedding.receptionDate && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "76px 1fr",
                padding: "16px 0",
                borderTop: "1px solid #cdbfa6",
                borderBottom: "1px solid #cdbfa6",
              }}
            >
              <span style={{ fontWeight: 600, color: SEA }}>
                {formatTime(wedding.receptionDate)}
              </span>
              <div>
                <div
                  style={{ fontFamily: "'Young Serif', serif", fontSize: 20 }}
                >
                  Dinner under the stars
                </div>
                <div style={{ fontSize: 13, color: MUTED }}>Then a bonfire</div>
              </div>
            </div>
          )}
        </div>

        {/* Packing list */}
        <div
          style={{
            margin: "44px 24px 0",
            background: "#f7f1e6",
            borderRadius: 20,
            padding: 22,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "2px",
              color: SEA,
            }}
          >
            PACK THIS
          </div>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}
          >
            {[
              "Sunglasses",
              "Light linen",
              "A shawl for later",
              "Swimsuit (just in case)",
            ].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "#fff",
                  fontSize: 13,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div style={{ margin: "44px 24px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "44px 24px 0",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontFamily: "'Young Serif', serif", fontSize: 28 }}>
              {wedding.venue}
            </div>
            {wedding.address && (
              <div style={{ fontSize: 15, lineHeight: 1.5, color: "#3e5058" }}>
                {wedding.address}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 8,
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
                  borderRadius: 12,
                  background: INK,
                  color: SAND,
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
                  borderRadius: 12,
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
                <Calendar className="h-4 w-4" /> Add to calendar
              </a>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div id="rsvp" style={{ margin: "52px 24px 0", scrollMarginTop: 24 }}>
          <h2
            style={{
              margin: "0 0 16px",
              fontFamily: "'Young Serif', serif",
              fontWeight: 400,
              fontSize: "clamp(28px,8vw,36px)",
            }}
          >
            See you on the sand?
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 24px 0" }}>
          <SeatingCta wedding={wedding} motif="wave" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 52,
            background: SEA,
            color: SAND,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "36px 24px",
          }}
        >
          <span style={{ fontFamily: "'Young Serif', serif", fontSize: 32 }}>
            {initials}
          </span>
          <span style={{ fontSize: 11, letterSpacing: "3px" }}>
            SEE YOU AT THE SEA
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
