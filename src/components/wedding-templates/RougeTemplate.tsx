import { Calendar, MapPin } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import {
  familyLine,
  formatLongDate,
  formatTime,
  googleCalendarUrl,
} from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";
import venueImg from "@/assets/venue.webp";

const WINE = "#4a0d17";
const PAPER = "#f6e7e2";
const BLUSH = "#f0b6ae";

/**
 * "Rouge" — a single red rose, dramatic and romantic. Ported from
 * Rouge.dc.html; the opener is a gift-box lid sliding open. RSVP/countdown/
 * seating are the real site components.
 */
export function RougeTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2700,
    leaveMs: 1800,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const initials = `${wedding.groom.charAt(0)} & ${wedding.bride.charAt(0)}`;
  const placeLine = [wedding.venue, wedding.hall].filter(Boolean).join(" · ");

  return (
    <main
      className="theme-rouge wedding-stationery relative"
      style={{
        background: WINE,
        color: PAPER,
        fontFamily: "'Outfit', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .rg-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:#2e060c;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease}
        .rg-op--leave{opacity:0;pointer-events:none}
        .rg-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);overflow:hidden;perspective:1200px}
        .rg-lid,.rg-base{position:absolute;left:0;width:100%;height:50%;background:radial-gradient(120% 90% at 50% 100%,#7a1626,#3a0710 70%);transition:transform 1.1s cubic-bezier(.6,0,.3,1)}
        .rg-lid{top:0;transform-origin:50% 0}
        .rg-base{top:50%;background:radial-gradient(120% 90% at 50% 0%,#6a1220,#2e060c 70%)}
        .rg-op--leave .rg-lid{transform:translateY(-105%) rotateX(35deg)}
        .rg-op--leave .rg-base{transform:translateY(105%)}
        .rg-seam{position:absolute;left:0;right:0;top:50%;height:3px;background:linear-gradient(90deg,rgba(201,162,74,0),#d9b46a 20%,#f3dd9e 50%,#d9b46a 80%,rgba(201,162,74,0))}
        .rg-lidtxt{position:absolute;left:0;right:0;top:26%;text-align:center;font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:clamp(40px,12vw,64px);color:${BLUSH}}
        .rg-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${BLUSH};animation:rg-pulse 1.8s ease-in-out infinite}
        @keyframes rg-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .rg-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0;z-index:2}
        .rg-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`rg-op ${phase === "leave" ? "rg-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="rg-card">
            <div className="rg-lid">
              <span className="rg-lidtxt">{initials}</span>
            </div>
            <div className="rg-base" />
            <div className="rg-seam" />
            <button
              type="button"
              className="rg-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && <p className="rg-hint">Tap to open</p>}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="rg-col">
        {/* Hero */}
        <div
          style={{
            position: "relative",
            background:
              "radial-gradient(120% 70% at 70% 20%, #7a1626 0%, #4a0d17 60%, #2e060c 100%)",
            padding: "24px 24px 32px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "3.5px",
              textTransform: "uppercase",
              color: "rgba(246,231,226,0.8)",
            }}
          >
            Invitation
          </div>
          <div style={{ marginTop: 24 }}>
            <span
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 300,
                fontSize: "clamp(44px,13vw,70px)",
                lineHeight: 0.88,
                letterSpacing: "-2px",
                display: "block",
              }}
            >
              {wedding.groom}
            </span>
            <span
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(26px,8vw,38px)",
                color: BLUSH,
                display: "block",
                margin: "6px 0 6px 4px",
              }}
            >
              &amp; {wedding.bride}
            </span>
            <span
              style={{
                marginTop: 26,
                display: "block",
                fontSize: 13,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
              }}
            >
              {formatLongDate(wedding.date)}
            </span>
            {placeLine && (
              <span
                style={{
                  display: "block",
                  fontSize: 15,
                  color: "rgba(246,231,226,0.75)",
                  marginTop: 4,
                }}
              >
                {formatTime(wedding.date)} · {placeLine}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <a
              href="#rsvp"
              style={{
                flexGrow: 1,
                height: 56,
                borderRadius: 16,
                background: PAPER,
                color: WINE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Accept invitation
            </a>
            <a
              href={googleCalendarUrl(wedding)}
              aria-label="Add to calendar"
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                border: "1px solid rgba(246,231,226,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: PAPER,
              }}
            >
              <Calendar className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Quote */}
        <div
          style={{
            padding: "56px 24px 0",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: BLUSH,
              whiteSpace: "pre-line",
            }}
          >
            {familyLine(wedding, "For our families")}
          </span>
          <p
            style={{
              margin: 0,
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: "clamp(24px,7vw,32px)",
              lineHeight: 1.15,
            }}
          >
            {wedding.description}
          </p>
        </div>

        {/* Photo band */}
        <div style={{ marginTop: 48, position: "relative" }}>
          <img
            src={photo}
            alt={names}
            loading="eager"
            fetchPriority="high"
            style={{
              width: "100%",
              aspectRatio: "390/300",
              objectFit: "cover",
              display: "block",
              filter: "saturate(1.1) contrast(1.05)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(74,13,23,0.1), rgba(74,13,23,0.6))",
            }}
          />
        </div>

        {/* Evening */}
        <div style={{ margin: "48px 24px 0" }}>
          <h2
            style={{
              margin: "0 0 16px",
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(30px,9vw,40px)",
            }}
          >
            The evening
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "16px 0",
              borderTop: "1px solid rgba(246,231,226,0.2)",
            }}
          >
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22 }}>
              Ceremony
            </span>
            <span style={{ fontSize: 14, color: BLUSH }}>
              {formatTime(wedding.date)}
            </span>
          </div>
          {wedding.receptionDate && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "16px 0",
                borderTop: "1px solid rgba(246,231,226,0.2)",
                borderBottom: "1px solid rgba(246,231,226,0.2)",
              }}
            >
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22 }}>
                Reception &amp; dancing
              </span>
              <span style={{ fontSize: 14, color: BLUSH }}>
                {formatTime(wedding.receptionDate)}
              </span>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div style={{ margin: "48px 24px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "48px 24px 0",
              background: "#5c1320",
              borderRadius: 22,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: "3px", color: BLUSH }}>
              VENUE
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28 }}>
              {wedding.venue}
            </div>
            {(wedding.hall || wedding.address) && (
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(246,231,226,0.75)",
                  lineHeight: 1.5,
                }}
              >
                {[wedding.hall, wedding.address].filter(Boolean).join(" · ")}
              </div>
            )}
            <img
              src={venuePhoto}
              alt={wedding.venue ?? "The venue"}
              loading="lazy"
              style={{
                width: "100%",
                aspectRatio: "342/180",
                objectFit: "cover",
                display: "block",
                borderRadius: 14,
                marginTop: 8,
              }}
            />
            <a
              href={
                wedding.mapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.address ?? wedding.venue ?? "")}`
              }
              target="_blank"
              rel="noreferrer"
              style={{
                marginTop: 8,
                height: 50,
                borderRadius: 14,
                border: "1px solid rgba(246,231,226,0.4)",
                color: PAPER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <MapPin className="h-4 w-4" /> Open in Maps
            </a>
          </div>
        )}

        {/* RSVP */}
        <div id="rsvp" style={{ margin: "48px 24px 0", scrollMarginTop: 24 }}>
          <h2
            style={{
              margin: "0 0 20px",
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: "clamp(30px,9vw,40px)",
            }}
          >
            Your reply
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 24px 0" }}>
          <SeatingCta wedding={wedding} motif="diamond" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            background: "#2e060c",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "36px 24px",
          }}
        >
          <span
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 36,
              color: BLUSH,
            }}
          >
            {initials}
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "3px",
              color: "rgba(246,231,226,0.6)",
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
              border: "1px solid rgba(246,231,226,0.4)",
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
              color: PAPER,
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
