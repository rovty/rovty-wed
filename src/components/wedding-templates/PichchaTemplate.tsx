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

const GREEN = "#0f3d2e";
const INK = "#1d3a2f";
const GOLD = "#e9d9a6";
const MUTED = "#5b7a6a";

/**
 * "Pichcha Mala" — jasmine garlands and poruwa tradition, deep green and
 * gold. Ported from Pichcha.dc.html; the opener parts like curtain doors
 * over a jasmine photo. RSVP/countdown/seating are the real site components.
 */
export function PichchaTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2600,
    leaveMs: 1700,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const initials = `${wedding.groom.charAt(0)} & ${wedding.bride.charAt(0)}`;

  return (
    <main
      className="theme-pichcha wedding-stationery relative"
      style={{
        background: "#fbf8ef",
        color: INK,
        fontFamily: "'Hind', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .pc-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:${GREEN};display:flex;align-items:center;justify-content:center;transition:opacity .5s ease}
        .pc-op--leave{opacity:0;pointer-events:none}
        .pc-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);overflow:hidden;perspective:1200px}
        .pc-half{position:absolute;top:0;width:50%;height:100%;overflow:hidden;transition:transform 1.2s cubic-bezier(.6,0,.3,1)}
        .pc-hl{left:0;transform-origin:0 50%}.pc-hr{right:0;transform-origin:100% 50%}
        .pc-op--leave .pc-hl{transform:translateX(-100%) rotateY(20deg)}
        .pc-op--leave .pc-hr{transform:translateX(100%) rotateY(-20deg)}
        .pc-half img{position:absolute;top:0;width:200%;height:100%;object-fit:cover}
        .pc-hl img{left:0}.pc-hr img{left:-100%}
        .pc-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,42,32,.35) 0%,rgba(10,42,32,.1) 35%,rgba(10,42,32,.75) 70%,rgba(10,42,32,.92) 100%)}
        .pc-greet{position:absolute;left:0;right:0;top:64%;text-align:center;font-family:'Noto Serif Sinhala',serif;font-size:26px;color:${GOLD}}
        .pc-names{position:absolute;left:0;right:0;top:70%;text-align:center;font-family:'Cormorant Upright',serif;font-weight:500;font-size:clamp(26px,8vw,36px);color:#fbf8ef}
        .pc-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${GOLD};animation:pc-pulse 1.8s ease-in-out infinite}
        @keyframes pc-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .pc-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0;z-index:2}
        .pc-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`pc-op ${phase === "leave" ? "pc-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="pc-card">
            <div className="pc-half pc-hl">
              <img src={photo} alt="" />
            </div>
            <div className="pc-half pc-hr">
              <img src={photo} alt="" />
            </div>
            <div className="pc-shade" />
            <div className="pc-greet">ආයුබෝවන්</div>
            <div className="pc-names">
              {wedding.groom} &amp; {wedding.bride}
            </div>
            <button
              type="button"
              className="pc-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && (
              <p className="pc-hint">Tap to part the jasmine</p>
            )}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="pc-col">
        {/* Hero */}
        <div
          style={{
            position: "relative",
            background: `radial-gradient(100% 70% at 50% 40%, #16563f 0%, ${GREEN} 65%, #0a2a20 100%)`,
            color: "#fbf8ef",
            padding: "0 28px",
            textAlign: "center",
          }}
        >
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
              opacity: 0.5,
            }}
          />
          <div
            style={{
              padding: "0 0 40px",
              marginTop: -80,
              position: "relative",
            }}
          >
            <div
              style={{
                fontFamily: "'Noto Serif Sinhala', serif",
                fontSize: 18,
                color: GOLD,
              }}
            >
              සුබ විවාහ මංගල්‍යය
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: "'Cormorant Upright', serif",
                fontWeight: 500,
                fontSize: "clamp(44px,13vw,66px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.groom}
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Upright', serif",
                fontSize: 24,
                color: GOLD,
                margin: "4px 0",
              }}
            >
              &amp;
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Upright', serif",
                fontWeight: 500,
                fontSize: "clamp(44px,13vw,66px)",
                lineHeight: 0.95,
              }}
            >
              {wedding.bride}
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 13,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
              }}
            >
              {formatLongDate(wedding.date)}
            </div>
            {(wedding.venue || wedding.hall) && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  color: "rgba(251,248,239,0.75)",
                }}
              >
                {formatTime(wedding.date)} ·{" "}
                {[wedding.venue, wedding.hall].filter(Boolean).join(", ")}
              </div>
            )}
            <a
              href="#rsvp"
              style={{
                marginTop: 24,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 52,
                padding: "0 28px",
                borderRadius: 999,
                background: "#fbf8ef",
                color: GREEN,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Confirm your presence
            </a>
          </div>
        </div>

        {/* Letter */}
        <div
          style={{
            padding: "48px 28px 0",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: "2px", color: MUTED }}>
            WITH THE BLESSINGS OF OUR FAMILIES
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: "'Cormorant Upright', serif",
              fontSize: 23,
              lineHeight: 1.35,
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
                borderTop: "1px solid #d6dfd0",
                borderBottom: "1px solid #d6dfd0",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  padding: "16px 6px",
                  borderRight: "1px solid #d6dfd0",
                }}
              >
                <div
                  style={{ fontSize: 10, letterSpacing: "2px", color: MUTED }}
                >
                  DAUGHTER OF
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Upright', serif",
                    fontSize: 18,
                    marginTop: 4,
                  }}
                >
                  {wedding.brideParentsNames || "—"}
                </div>
              </div>
              <div style={{ padding: "16px 6px" }}>
                <div
                  style={{ fontSize: 10, letterSpacing: "2px", color: MUTED }}
                >
                  SON OF
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Upright', serif",
                    fontSize: 18,
                    marginTop: 4,
                  }}
                >
                  {wedding.groomParentsNames || "—"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Programme */}
        <div
          style={{
            margin: "56px 20px 0",
            background: GREEN,
            color: "#fbf8ef",
            borderRadius: 28,
            padding: "28px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Cormorant Upright', serif",
              fontWeight: 500,
              fontSize: 32,
              textAlign: "center",
            }}
          >
            Nakath &amp; programme
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr",
              gap: 14,
            }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Upright', serif",
                fontSize: 22,
                color: GOLD,
              }}
            >
              {formatTime(wedding.date)}
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>The ceremony</div>
              {wedding.hall && (
                <div style={{ fontSize: 13, color: "rgba(251,248,239,0.7)" }}>
                  {wedding.hall}
                </div>
              )}
            </div>
          </div>
          {wedding.receptionDate && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr",
                gap: 14,
                background: "rgba(233,217,166,0.12)",
                margin: "0 -10px",
                padding: "12px 10px",
                borderRadius: 14,
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Upright', serif",
                  fontSize: 22,
                  color: GOLD,
                }}
              >
                {formatTime(wedding.receptionDate)}
              </span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Reception</div>
                <div style={{ fontSize: 13, color: "rgba(251,248,239,0.7)" }}>
                  Dinner &amp; dancing
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div style={{ margin: "48px 20px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "48px 20px 0",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <img
              src={venuePhoto}
              alt={wedding.venue ?? "The venue"}
              loading="lazy"
              style={{
                width: "100%",
                aspectRatio: "350/220",
                objectFit: "cover",
                display: "block",
                borderRadius: 24,
              }}
            />
            <div
              style={{
                fontFamily: "'Cormorant Upright', serif",
                fontWeight: 500,
                fontSize: 28,
              }}
            >
              {wedding.venue}
            </div>
            {(wedding.hall || wedding.address) && (
              <div style={{ fontSize: 15, color: "#4e6a5d" }}>
                {[wedding.hall, wedding.address].filter(Boolean).join(" · ")}
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
                  borderRadius: 999,
                  background: GREEN,
                  color: "#fbf8ef",
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
                  border: `1px solid ${GREEN}`,
                  color: GREEN,
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
        <div id="rsvp" style={{ margin: "56px 20px 0", scrollMarginTop: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Noto Serif Sinhala', serif",
                fontSize: 15,
                color: MUTED,
              }}
            >
              පැමිණීම තහවුරු කරන්න
            </div>
            <h2
              style={{
                margin: "4px 0 20px",
                fontFamily: "'Cormorant Upright', serif",
                fontWeight: 500,
                fontSize: 32,
              }}
            >
              Will you join us?
            </h2>
          </div>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 20px 0" }}>
          <SeatingCta wedding={wedding} motif="leaf" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 56,
            background: GREEN,
            color: "#fbf8ef",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "36px 24px",
          }}
        >
          <span
            style={{ fontFamily: "'Cormorant Upright', serif", fontSize: 32 }}
          >
            {initials}
          </span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "3px",
              color: "rgba(251,248,239,0.7)",
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
