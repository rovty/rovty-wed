import { Calendar, MapPin } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import {
  formatLongDate,
  formatTime,
  formatScriptDate,
  googleCalendarUrl,
} from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";
import venueImg from "@/assets/venue.webp";

const INK = "#1b1a17";
const ACCENT = "#a4502f";
const MUTED = "#6b655a";
const RULE = "rgba(27,26,23,0.18)";

/**
 * "Maison" — a wedding laid out like a magazine: masthead, a cover that
 * flips open, a numbered "contents" schedule, a pull quote, a colophon.
 * Ported from the Main.dc.html mockup; the RSVP form, countdown and guest
 * seating are the real, functional site components (themed via
 * .theme-maison in styles.css) rather than the mockup's static markup.
 */
export function MaisonTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, guest, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2700,
    leaveMs: 1500,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const initials = `${wedding.groom.charAt(0)}${wedding.bride.charAt(0)}`;
  const placeLine = [wedding.venue, wedding.hall].filter(Boolean).join(" · ");
  const day = wedding.date.getDate();
  const month = wedding.date
    .toLocaleDateString("en-US", { month: "short", timeZone: "Asia/Colombo" })
    .toUpperCase();
  const year = wedding.date.getFullYear();

  return (
    <main
      className="theme-maison wedding-stationery relative"
      style={{
        background: "#f4efe6",
        color: INK,
        fontFamily: "'DM Sans', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .ms-op{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#1b1a17;transition:opacity .5s ease}
        .ms-op--leave{opacity:0;pointer-events:none}
        .ms-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);overflow:hidden;perspective:1600px}
        .ms-cover{position:absolute;inset:0;background:#1b1a17;transform-origin:0 50%;overflow:hidden;transition:transform 1.3s cubic-bezier(.65,0,.25,1),filter 1.3s}
        .ms-op--leave .ms-cover{transform:rotateY(-106deg);filter:brightness(.55)}
        .ms-cimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:sepia(.25) saturate(.85)}
        .ms-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(27,26,23,.8) 0%,rgba(27,26,23,0) 30%,rgba(27,26,23,0) 50%,rgba(27,26,23,.88) 100%)}
        .ms-mast{position:absolute;top:22px;left:24px;right:24px;display:flex;justify-content:space-between;border-bottom:1px solid rgba(244,239,230,.6);padding-bottom:10px;font-size:10px;font-weight:600;letter-spacing:2.4px;color:#f4efe6}
        .ms-title{position:absolute;left:24px;right:24px;bottom:150px;text-align:left;font-family:'Instrument Serif',serif;font-size:clamp(56px,15vw,100px);line-height:.84;letter-spacing:-3px;color:#f4efe6}
        .ms-title em{color:#d9a88f;font-style:italic}
        .ms-sub{position:absolute;left:24px;bottom:112px;font-family:'Instrument Serif',serif;font-style:italic;font-size:19px;color:#f4efe6}
        .ms-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#f4efe6;animation:ms-pulse 1.8s ease-in-out infinite}
        @keyframes ms-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .ms-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .ms-col{width:100%;max-width:430px;margin:0 auto}
        .ms-row{display:grid;grid-template-columns:38px 1fr auto;font-size:14px}
        .ms-row > *{padding:18px 0;border-bottom:1px solid ${RULE}}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`ms-op ${phase === "leave" ? "ms-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="ms-card">
            <div className="ms-cover">
              <img className="ms-cimg" src={photo} alt="" />
              <div className="ms-shade" />
              <div className="ms-mast">
                <span>The Wedding Issue</span>
                <span>
                  Nº 01 · {month} {year}
                </span>
              </div>
              <h2 className="ms-title">
                {wedding.groom}
                <br />
                <em>&amp;</em> {wedding.bride}
              </h2>
              <p className="ms-sub">A love story, in full</p>
            </div>
            <button
              type="button"
              className="ms-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && (
              <p className="ms-hint">Tap to open the issue</p>
            )}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="ms-col">
        {/* Masthead */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px 14px",
            fontSize: 10,
            letterSpacing: "2.4px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 20,
              letterSpacing: 0,
              textTransform: "none",
              fontWeight: 400,
            }}
          >
            {wedding.groom.charAt(0)}
            <span style={{ fontStyle: "italic", color: ACCENT }}>&amp;</span>
            {wedding.bride.charAt(0)}
          </span>
          <span>The Wedding Issue</span>
          <span>Nº 01</span>
        </div>
        <div style={{ margin: "0 24px", height: 1, background: INK }} />

        {/* Names */}
        <div style={{ padding: "26px 24px 0" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              fontWeight: 600,
              color: ACCENT,
            }}
          >
            Together with their families
          </div>
          <h1
            style={{
              margin: "14px 0 0",
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              fontSize: "clamp(56px,16vw,104px)",
              lineHeight: 0.84,
              letterSpacing: "-3px",
            }}
          >
            {wedding.groom}
          </h1>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontSize: "clamp(56px,16vw,104px)",
                lineHeight: 0.84,
                letterSpacing: "-3px",
                color: ACCENT,
              }}
            >
              &amp;
            </span>
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(56px,16vw,104px)",
                lineHeight: 0.84,
                letterSpacing: "-3px",
              }}
            >
              {wedding.bride}
            </span>
          </div>
        </div>

        {/* Cover photo */}
        <div style={{ margin: "26px 24px 0", position: "relative" }}>
          <img
            src={photo}
            alt={names}
            loading="eager"
            fetchPriority="high"
            style={{
              width: "100%",
              aspectRatio: "342/400",
              objectFit: "cover",
              display: "block",
              filter: "sepia(0.18) saturate(0.9)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "#f4efe6",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              {day}
            </span>
            <span
              style={{ fontSize: 8, letterSpacing: "1.6px", fontWeight: 600 }}
            >
              {month} {year}
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "10px 24px 0",
            fontSize: 11,
            color: MUTED,
          }}
        >
          <span
            style={{
              fontStyle: "italic",
              fontFamily: "'Instrument Serif', serif",
              fontSize: 14,
            }}
          >
            {formatTime(wedding.date)}
          </span>
          {placeLine && <span>{placeLine}</span>}
        </div>

        {/* Letter */}
        <div
          style={{
            margin: "56px 24px 0",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            A letter for you
          </div>
          <div
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 34,
              lineHeight: 1.05,
            }}
          >
            Dear {guest?.name.split(" ")[0] ?? "friend"},
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.65,
              color: "#3b3831",
            }}
          >
            <span
              style={{
                float: "left",
                fontFamily: "'Instrument Serif', serif",
                fontSize: 62,
                lineHeight: 0.8,
                margin: "6px 8px 0 0",
                color: ACCENT,
              }}
            >
              {wedding.description.charAt(0) || "W"}
            </span>
            {wedding.description.slice(1)}
          </p>
          {guest && guest.seats > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderTop: `1px solid ${RULE}`,
                borderBottom: `1px solid ${RULE}`,
                padding: "14px 0",
                fontSize: 13,
              }}
            >
              <span>
                We've saved{" "}
                <strong style={{ fontWeight: 600 }}>
                  {guest.seats} {guest.seats === 1 ? "seat" : "seats"}
                </strong>{" "}
                in your name.
              </span>
            </div>
          )}
        </div>

        {/* Contents / schedule */}
        <div style={{ margin: "56px 24px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "'Instrument Serif', serif",
                fontWeight: 400,
                fontSize: 44,
                letterSpacing: "-1px",
              }}
            >
              In this issue
            </h2>
          </div>
          <div style={{ marginTop: 14, height: 1, background: INK }} />
          <div className="ms-row">
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontSize: 20,
                color: ACCENT,
              }}
            >
              01
            </span>
            <span>
              <span
                style={{
                  display: "block",
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 22,
                }}
              >
                The ceremony
              </span>
              {placeLine && (
                <span style={{ fontSize: 12, color: MUTED }}>{placeLine}</span>
              )}
            </span>
            <span style={{ fontWeight: 600 }}>{formatTime(wedding.date)}</span>
            {wedding.receptionDate && (
              <>
                <span
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: "italic",
                    fontSize: 20,
                    color: ACCENT,
                  }}
                >
                  02
                </span>
                <span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: 22,
                    }}
                  >
                    Reception
                  </span>
                  <span style={{ fontSize: 12, color: MUTED }}>
                    Dinner &amp; dancing
                  </span>
                </span>
                <span style={{ fontWeight: 600 }}>
                  {formatTime(wedding.receptionDate)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Pull quote with photo */}
        <div
          style={{
            margin: "64px 0 0",
            background: INK,
            color: "#f4efe6",
            padding: "40px 24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#d9a88f",
            }}
          >
            Our story
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: "'Instrument Serif', serif",
              fontSize: 32,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
            }}
          >
            “Every love story is beautiful,{" "}
            <span style={{ fontStyle: "italic", color: "#d9a88f" }}>
              but ours is my favorite.
            </span>
            ”
          </p>
        </div>

        {/* Countdown */}
        <div
          style={{
            margin: "48px 24px 0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Until we say I do
          </div>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "56px 24px 0",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "'Instrument Serif', serif",
                fontWeight: 400,
                fontSize: 44,
                letterSpacing: "-1px",
              }}
            >
              {wedding.venue ?? "The venue"}
            </h2>
            {(wedding.hall || wedding.address) && (
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#3b3831",
                }}
              >
                {[wedding.hall, wedding.address].filter(Boolean).join(" · ")}
              </p>
            )}
            <img
              src={venuePhoto}
              alt={wedding.venue ?? "The venue"}
              loading="lazy"
              style={{
                width: "100%",
                aspectRatio: "342/260",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                gap: 10,
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  height: 50,
                  border: `1px solid ${INK}`,
                  color: INK,
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  height: 50,
                  border: `1px solid ${INK}`,
                  color: INK,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Calendar className="h-4 w-4" /> Add to calendar
              </a>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div id="rsvp" style={{ margin: "64px 24px 0", scrollMarginTop: 24 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              fontWeight: 600,
              color: ACCENT,
            }}
          >
            Répondez s'il vous plaît
          </div>
          <h2
            style={{
              margin: "8px 0 20px",
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              fontSize: 44,
              lineHeight: 1,
              letterSpacing: "-1px",
            }}
          >
            Will you join us?
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 24px 0" }}>
          <SeatingCta wedding={wedding} motif="line" />
        </div>

        {/* Colophon */}
        <div
          style={{
            marginTop: 56,
            background: INK,
            color: "#f4efe6",
            padding: "40px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 52,
              lineHeight: 1,
            }}
          >
            {initials.charAt(0)}
            <span style={{ fontStyle: "italic", color: "#d9a88f" }}>&amp;</span>
            {initials.charAt(1)}
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
            }}
          >
            {formatLongDate(wedding.date)}
          </span>
          <p
            style={{
              margin: 0,
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontSize: 18,
              color: "#d9a88f",
            }}
          >
            {formatScriptDate(wedding.date)}
          </p>
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
