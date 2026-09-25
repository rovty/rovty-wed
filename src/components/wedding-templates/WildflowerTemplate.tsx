import { ArrowRight, Check } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import coupleImg from "@/assets/couple.webp";
import venueImg from "@/assets/venue.webp";

const INK = "#33362c";
const PAPER = "#f6f1e7";
const SAGE = "#4f5c40";
const BLUSH = "#9a5242";
const MUTED = "#5b5e50";

/**
 * "Wildflower" — a wildflower garden, script and soft color. Ported from
 * Wildflower.dc.html; the opener is a wax-sealed envelope that breaks open.
 * RSVP/countdown/seating are the real site components.
 */
export function WildflowerTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, guest, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2600,
    leaveMs: 2000,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const initials = `${wedding.groom.charAt(0)}·${wedding.bride.charAt(0)}`;

  return (
    <main
      className="theme-wildflower wedding-stationery relative"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: "'EB Garamond', serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .wf-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:radial-gradient(120% 80% at 50% 40%,#f8f4ec,#e4d9c5);display:flex;align-items:center;justify-content:center;transition:opacity .7s .5s ease}
        .wf-op--leave{opacity:0;pointer-events:none}
        .wf-env{position:relative;width:min(340px,88vw);height:230px;transition:transform .9s ease-in,opacity .9s ease-in}
        .wf-op--leave .wf-env{transform:translateY(30px) rotate(-1.5deg);opacity:0}
        .wf-back{position:absolute;inset:0;background:#dccdb2;border-radius:4px;box-shadow:0 34px 50px -22px rgba(51,54,44,.45)}
        .wf-card{position:absolute;left:18px;right:18px;top:14px;height:200px;z-index:1;background:#fffdf8;border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:0 2px 10px rgba(0,0,0,.1)}
        .wf-cn{font-family:'Pinyon Script',cursive;font-size:clamp(30px,8vw,42px);color:#2f3527}
        .wf-cd{font-family:'EB Garamond',serif;font-style:italic;font-size:14px;color:${MUTED}}
        .wf-front{position:absolute;inset:0;z-index:2;background:linear-gradient(160deg,#f1e7d4,#e6d8bf);clip-path:polygon(0 0,50% 58%,100% 0,100% 100%,0 100%);border-radius:4px}
        .wf-flap{position:absolute;left:0;top:0;width:100%;height:140px;z-index:3;background:linear-gradient(180deg,#eadfca,#dccdb2);clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:50% 0}
        .wf-seal{position:absolute;left:50%;top:112px;transform:translateX(-50%);width:56px;height:56px;z-index:4;border-radius:50%;background:radial-gradient(circle at 35% 30%,#d49a8b,#8e4536 72%);box-shadow:0 4px 10px rgba(120,60,40,.45);color:#fbe9e2;font-family:'Pinyon Script',cursive;font-size:21px;line-height:56px;text-align:center;transition:transform .3s ease-in,opacity .3s ease-in}
        .wf-op--leave .wf-seal{transform:translateX(-50%) scale(.3) rotate(50deg) translateY(40px);opacity:0}
        .wf-op--leave .wf-flap{transform:rotateX(180deg);transition:transform .5s .2s ease-in-out}
        .wf-to{position:absolute;left:0;right:0;bottom:14%;text-align:center;font-family:'Pinyon Script',cursive;font-size:28px;color:${SAGE}}
        .wf-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${SAGE};animation:wf-pulse 1.8s ease-in-out infinite}
        @keyframes wf-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .wf-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0}
        .wf-col{width:100%;max-width:430px;margin:0 auto}
        .wf-card-wrap{position:relative;width:min(390px,100vw);height:min(844px,100svh);display:flex;align-items:center;justify-content:center}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`wf-op ${phase === "leave" ? "wf-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="wf-card-wrap">
            <div className="wf-env">
              <span className="wf-back" />
              <span className="wf-card">
                <span className="wf-cn">
                  {wedding.groom} &amp; {wedding.bride}
                </span>
                <span className="wf-cd">{formatLongDate(wedding.date)}</span>
              </span>
              <span className="wf-front" />
              <span className="wf-flap" />
              <span className="wf-seal">{initials}</span>
            </div>
            <p className="wf-to">for {guest?.name.split(" ")[0] ?? "you"}</p>
            <button
              type="button"
              className="wf-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && (
              <p className="wf-hint">Tap to break the seal</p>
            )}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="wf-col">
        {/* Hero */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "34px 24px 0",
          }}
        >
          <div
            style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: 10,
              letterSpacing: "3.5px",
              textTransform: "uppercase",
              color: SAGE,
            }}
          >
            Please join us in the garden
          </div>
          <div
            style={{
              position: "relative",
              marginTop: 22,
              width: "min(260px, 70vw)",
            }}
          >
            <img
              src={venuePhoto}
              alt=""
              loading="eager"
              fetchPriority="high"
              style={{
                width: "100%",
                aspectRatio: "300/420",
                objectFit: "cover",
                display: "block",
                borderRadius: "150px 150px 4px 4px",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -8,
                border: "1px solid rgba(94,107,78,0.55)",
                borderRadius: "158px 158px 8px 8px",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 30,
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              fontFamily: "'Pinyon Script', cursive",
              fontSize: "clamp(38px,11vw,58px)",
              lineHeight: 1,
              color: "#2f3527",
            }}
          >
            <span>{wedding.groom}</span>
            <span style={{ fontSize: "0.6em", color: BLUSH }}>&amp;</span>
            <span>{wedding.bride}</span>
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 16,
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontVariant: "small-caps",
              textAlign: "center",
            }}
          >
            {formatLongDate(wedding.date)}
          </div>
          {wedding.venue && (
            <div style={{ fontStyle: "italic", fontSize: 16, color: MUTED }}>
              {wedding.venue}
            </div>
          )}
          <div style={{ width: "100%", padding: "26px 0 30px" }}>
            <a
              href="#rsvp"
              style={{
                height: 56,
                borderRadius: 999,
                background: SAGE,
                color: PAPER,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontFamily: "'Figtree', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 10px 24px rgba(79,92,64,0.3)",
              }}
            >
              Reply to our invitation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Personal note card */}
        <div
          style={{
            margin: "0 24px 0",
            background: "#fffdf8",
            borderRadius: 4,
            padding: "30px 26px",
            boxShadow: "0 18px 40px -20px rgba(51,54,44,0.25)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -22,
              right: 24,
              width: 50,
              height: 50,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #d49a8b, #9a5242 70%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(120,60,40,0.35)",
              fontFamily: "'Pinyon Script', cursive",
              fontSize: 22,
              color: "#fbe9e2",
            }}
          >
            {initials}
          </div>
          <div
            style={{
              fontFamily: "'Pinyon Script', cursive",
              fontSize: 32,
              color: "#2f3527",
            }}
          >
            Dear {guest?.name.split(" ")[0] ?? "friend"},
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.55,
              color: "#45483c",
            }}
          >
            {wedding.description}
          </p>
          <p
            style={{
              margin: 0,
              fontStyle: "italic",
              fontSize: 16,
              color: MUTED,
            }}
          >
            With love, {wedding.groom} &amp; {wedding.bride}
          </p>
        </div>

        {/* The day */}
        <div
          style={{
            margin: "64px 24px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Pinyon Script', cursive",
              fontWeight: 400,
              fontSize: 44,
              color: "#2f3527",
            }}
          >
            The Day
          </h2>
          <div
            style={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr",
                gap: 16,
                padding: "18px 0",
                borderTop: "1px dashed rgba(94,107,78,0.45)",
              }}
            >
              <span style={{ fontSize: 18, color: SAGE }}>
                {formatTime(wedding.date)}
              </span>
              <div>
                <div style={{ fontSize: 20 }}>Ceremony</div>
                {wedding.venue && (
                  <div
                    style={{ fontSize: 14, fontStyle: "italic", color: MUTED }}
                  >
                    {wedding.venue}
                  </div>
                )}
              </div>
            </div>
            {wedding.receptionDate && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr",
                  gap: 16,
                  padding: "18px 0",
                  borderTop: "1px dashed rgba(94,107,78,0.45)",
                  borderBottom: "1px dashed rgba(94,107,78,0.45)",
                }}
              >
                <span style={{ fontSize: 18, color: SAGE }}>
                  {formatTime(wedding.receptionDate)}
                </span>
                <div>
                  <div style={{ fontSize: 20 }}>Firelight &amp; dancing</div>
                  {wedding.hall && (
                    <div
                      style={{
                        fontSize: 14,
                        fontStyle: "italic",
                        color: MUTED,
                      }}
                    >
                      {wedding.hall}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Countdown */}
        <div style={{ margin: "64px 24px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "64px 24px 0",
              background: "#e6e8da",
              borderRadius: 4,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: 10,
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                color: SAGE,
              }}
            >
              Where
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.1 }}>{wedding.venue}</div>
            {wedding.address && (
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: "#45483c",
                }}
              >
                {wedding.address}
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 10,
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
                  height: 48,
                  borderRadius: 999,
                  border: `1px solid ${SAGE}`,
                  color: SAGE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontFamily: "'Figtree', sans-serif",
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
                  borderRadius: 999,
                  border: `1px solid ${SAGE}`,
                  color: SAGE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Add to calendar
              </a>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div
          id="rsvp"
          style={{
            margin: "64px 24px 0",
            scrollMarginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Pinyon Script', cursive",
                fontWeight: 400,
                fontSize: 44,
                color: "#2f3527",
              }}
            >
              Kindly reply
            </h2>
          </div>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 24px 0" }}>
          <SeatingCta wedding={wedding} motif="leaf" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 56,
            background: SAGE,
            color: PAPER,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 24px",
            gap: 6,
          }}
        >
          <span
            style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 40 }}
          >
            {names}
          </span>
          <span
            style={{
              fontStyle: "italic",
              fontSize: 15,
              color: "rgba(246,241,231,0.8)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Check className="h-3 w-3" /> {formatLongDate(wedding.date)}
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
