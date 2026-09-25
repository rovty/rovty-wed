import { Calendar, MapPin } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";
import venueImg from "@/assets/venue.webp";

const INK = "#111111";
const ACCENT = "#d63d20";
const MUTED = "#6b6b66";

/**
 * "Mono" — bold grotesque type on a hard grid, a modern save-the-date feel.
 * Ported from Mono.dc.html; opener is five bars dropping away to reveal a
 * huge date. RSVP/countdown/seating are the real site components.
 */
export function MonoTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, guest, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2300,
    leaveMs: 1300,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const initials = `${wedding.groom.charAt(0)}+${wedding.bride.charAt(0)}`;
  const placeLine = [wedding.venue, wedding.hall].filter(Boolean).join(" · ");
  const dm = wedding.date
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Colombo",
    })
    .replace("/", ".");
  const yy = String(wedding.date.getFullYear()).slice(-2);

  return (
    <main
      className="theme-mono wedding-stationery relative"
      style={{
        background: "#fafaf7",
        color: INK,
        fontFamily: "'Bricolage Grotesque', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .mo-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:#111;display:flex;align-items:center;justify-content:center;transition:opacity .4s ease}
        .mo-op--leave{opacity:0;pointer-events:none}
        .mo-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);overflow:hidden}
        .mo-bar{position:absolute;top:0;width:20%;height:100%;background:#111;transition:transform .5s cubic-bezier(.7,0,.2,1)}
        .mo-op--leave .mo-bar{transform:translateY(-100%)}
        .mo-b0{left:0%}.mo-b1{left:20%;transition-delay:.06s}.mo-b2{left:40%;transition-delay:.12s}.mo-b3{left:60%;transition-delay:.18s}.mo-b4{left:80%;background:${ACCENT};transition-delay:.24s}
        .mo-num{position:absolute;left:5%;top:28%;font-weight:800;font-size:clamp(70px,22vw,124px);line-height:.82;letter-spacing:-4px;color:#fafaf7}
        .mo-tick{position:absolute;left:0;right:0;bottom:18%;height:38px;overflow:hidden;background:#fafaf7;color:#111;display:flex;align-items:center;font-family:'DM Mono',monospace;font-size:12px;white-space:nowrap}
        .mo-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#fafaf7;animation:mo-pulse 1.8s ease-in-out infinite}
        @keyframes mo-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .mo-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .mo-col{width:100%;max-width:430px;margin:0 auto}
        .mo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid ${INK};border-left:1px solid ${INK}}
        .mo-cell{border-right:1px solid ${INK};border-bottom:1px solid ${INK};padding:14px;min-height:96px;display:flex;flex-direction:column;justify-content:space-between}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`mo-op ${phase === "leave" ? "mo-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="mo-card">
            <span className="mo-bar mo-b0" />
            <span className="mo-bar mo-b1" />
            <span className="mo-bar mo-b2" />
            <span className="mo-bar mo-b3" />
            <span className="mo-bar mo-b4" />
            <div className="mo-num">
              {dm}
              <br />
              {yy}
            </div>
            <div className="mo-tick">
              {names.toUpperCase()} — SAVE THE DATE — {dm}.{yy} —{" "}
              {names.toUpperCase()} — SAVE THE DATE — {dm}.{yy} —
            </div>
            <button
              type="button"
              className="mo-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && <p className="mo-hint">Tap</p>}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="mo-col">
        {/* Hero */}
        <div style={{ padding: "18px 20px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              textTransform: "uppercase",
              borderBottom: `1px solid ${INK}`,
              paddingBottom: 10,
            }}
          >
            <span>{names}</span>
            <span style={{ textAlign: "center" }}>Wedding</span>
            <span style={{ textAlign: "right" }}>{wedding.venue ?? ""}</span>
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "clamp(64px,18vw,124px)",
              lineHeight: 0.82,
              letterSpacing: "-4px",
              marginTop: 18,
            }}
          >
            {dm}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: "clamp(64px,18vw,124px)",
                lineHeight: 0.82,
                letterSpacing: "-4px",
                color: ACCENT,
              }}
            >
              {yy}
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                textAlign: "right",
                lineHeight: 1.6,
                paddingBottom: 6,
              }}
            >
              {wedding.date
                .toLocaleDateString("en-US", {
                  weekday: "long",
                  timeZone: "Asia/Colombo",
                })
                .toUpperCase()}
              <br />
              {formatTime(wedding.date).toUpperCase()}
              <br />
              {(wedding.hall ?? wedding.venue ?? "").toUpperCase()}
            </span>
          </div>
          <div
            style={{ position: "relative", marginTop: 18, overflow: "hidden" }}
          >
            <img
              src={photo}
              alt={names}
              loading="eager"
              fetchPriority="high"
              style={{
                width: "100%",
                aspectRatio: "350/300",
                objectFit: "cover",
                display: "block",
                filter: "grayscale(1) contrast(1.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                background: ACCENT,
                color: "#fff",
                padding: "8px 12px",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                textTransform: "uppercase",
              }}
            >
              You're invited{guest ? `, ${guest.name.split(" ")[0]}` : ""}
            </div>
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: "clamp(32px,9vw,44px)",
              lineHeight: 0.95,
              letterSpacing: "-1.5px",
              margin: "16px 0 20px",
            }}
          >
            {wedding.groom} <span style={{ color: MUTED }}>&amp;</span>{" "}
            {wedding.bride}
          </div>
        </div>

        {/* Intro */}
        <div style={{ padding: "8px 20px 0" }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: "clamp(22px,6.5vw,30px)",
              lineHeight: 1.08,
              letterSpacing: "-0.8px",
            }}
          >
            {wedding.description}
          </p>
        </div>

        {/* Info grid */}
        <div style={{ margin: "44px 20px 0" }} className="mo-grid">
          <div className="mo-cell">
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              01 / Ceremony
            </span>
            <span
              style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}
            >
              {formatTime(wedding.date)}
            </span>
          </div>
          <div
            className="mo-cell"
            style={
              wedding.receptionDate
                ? { background: ACCENT, color: "#fff" }
                : undefined
            }
          >
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                textTransform: "uppercase",
                color: wedding.receptionDate ? "#fff" : MUTED,
              }}
            >
              02 / Reception
            </span>
            <span
              style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}
            >
              {wedding.receptionDate ? formatTime(wedding.receptionDate) : "—"}
            </span>
          </div>
          <div className="mo-cell">
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              Dress
            </span>
            <span style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.1 }}>
              Smart casual.
            </span>
          </div>
          <div className="mo-cell">
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              Venue
            </span>
            <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>
              {placeLine || "TBA"}
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div
          style={{
            margin: "48px 20px 0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            Countdown
          </span>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "48px 20px 0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              Venue
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: "clamp(28px,8vw,40px)",
                lineHeight: 0.95,
                letterSpacing: "-1.2px",
              }}
            >
              {wedding.venue}
            </span>
            {wedding.address && (
              <span style={{ fontSize: 16, lineHeight: 1.5, color: "#3a3a36" }}>
                {wedding.address}
              </span>
            )}
            <img
              src={venuePhoto}
              alt={wedding.venue ?? "The venue"}
              loading="lazy"
              style={{
                width: "100%",
                aspectRatio: "350/200",
                objectFit: "cover",
                display: "block",
                filter: "grayscale(1) contrast(1.1)",
              }}
            />
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
                  height: 52,
                  border: `1px solid ${INK}`,
                  color: INK,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin className="h-4 w-4" /> Directions
                </span>
                <span>↗</span>
              </a>
              <a
                href={googleCalendarUrl(wedding)}
                style={{
                  height: 52,
                  border: `1px solid ${INK}`,
                  color: INK,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar className="h-4 w-4" /> Calendar
                </span>
                <span>+</span>
              </a>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div
          id="rsvp"
          style={{
            marginTop: 56,
            background: INK,
            color: "#fafaf7",
            padding: "36px 20px 40px",
            scrollMarginTop: 24,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: "clamp(40px,12vw,64px)",
              lineHeight: 0.85,
              letterSpacing: "-3px",
              display: "block",
              marginBottom: 18,
            }}
          >
            Coming?
          </span>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 20px 0" }}>
          <SeatingCta wedding={wedding} motif="geo" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 24,
            background: ACCENT,
            color: "#fff",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 18,
            minHeight: 160,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: "clamp(48px,15vw,86px)",
              lineHeight: 0.85,
              letterSpacing: "-5px",
            }}
          >
            {initials.toUpperCase()}
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            {dm}.{yy} — see you on the dance floor
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
