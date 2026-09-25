import { Calendar, MapPin } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { formatLongDate, formatTime, googleCalendarUrl } from "@/lib/wedding";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useSignatureOpener } from "./useSignatureOpener";
import venueImg from "@/assets/venue.webp";

const MAROON = "#5b0e14";
const DARK_MAROON = "#3f080d";
const CREAM = "#f7eedb";
const GOLD = "#c9a24a";
const INK = "#3a1a12";
const MUTED = "#8a5a2b";

function KandyanBand({ background }: { background: string }) {
  return (
    <svg
      width="100%"
      height="26"
      viewBox="0 0 390 26"
      preserveAspectRatio="none"
      style={{ display: "block", background }}
    >
      <defs>
        <pattern id="kb" width="26" height="26" patternUnits="userSpaceOnUse">
          <path
            d="M13 3l10 10-10 10L3 13z"
            fill="none"
            stroke={GOLD}
            strokeWidth={1}
          />
          <circle cx="13" cy="13" r="2.4" fill={GOLD} />
        </pattern>
      </defs>
      <rect width="390" height="26" fill="url(#kb)" />
    </svg>
  );
}

/**
 * "Ran Poruwa" — the traditional poruwa ceremony, maroon lacquer and gold.
 * Ported from Poruwa.dc.html (registered under a new id — "poruwa" already
 * names a different, existing legacy template). The opener is gold-framed
 * temple doors parting around a lit seal. RSVP/countdown/seating are the
 * real site components.
 */
export function RanPoruwaTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2900,
    leaveMs: 1900,
  });
  const names = `${wedding.groom} & ${wedding.bride}`;
  const initials = `${wedding.groom.charAt(0)} · ${wedding.bride.charAt(0)}`;

  return (
    <main
      className="theme-ran-poruwa wedding-stationery relative"
      style={{
        background: CREAM,
        color: INK,
        fontFamily: "'Jost', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .rp-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:#2a0508;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease}
        .rp-op--leave{opacity:0;pointer-events:none}
        .rp-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);overflow:hidden;perspective:1300px}
        .rp-door{position:absolute;top:0;width:50%;height:100%;background:linear-gradient(90deg,#4a0a10,#701522 50%,#4a0a10);box-shadow:inset 0 0 0 10px #3f080d,inset 0 0 0 11px ${GOLD};transition:transform 1.3s .2s cubic-bezier(.6,0,.3,1),filter 1.3s .2s}
        .rp-dl{left:0;transform-origin:0 50%}.rp-dr{right:0;transform-origin:100% 50%}
        .rp-op--leave .rp-dl{transform:rotateY(-100deg);filter:brightness(.5)}
        .rp-op--leave .rp-dr{transform:rotateY(100deg);filter:brightness(.5)}
        .rp-seal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,#7a1720,#3f080d);box-shadow:0 0 0 2px ${GOLD},0 0 40px rgba(201,162,74,.45);display:flex;align-items:center;justify-content:center;transition:opacity .5s}
        .rp-op--leave .rp-seal{opacity:0}
        .rp-sealtxt{font-family:'Noto Serif Sinhala',serif;font-size:20px;color:#e3c47a}
        .rp-hint{position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#e3c47a;animation:rp-pulse 1.8s ease-in-out infinite}
        @keyframes rp-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .rp-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0;z-index:2}
        .rp-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`rp-op ${phase === "leave" ? "rp-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="rp-card">
            <div className="rp-door rp-dl" />
            <div className="rp-door rp-dr" />
            <div className="rp-seal">
              <span className="rp-sealtxt">ආයුබෝවන්</span>
            </div>
            <button
              type="button"
              className="rp-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && (
              <p className="rp-hint">Tap to open the doors</p>
            )}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="rp-col">
        {/* Hero */}
        <div
          style={{
            padding: 18,
            background: `radial-gradient(120% 80% at 50% 30%, #7a1720 0%, ${MAROON} 55%, ${DARK_MAROON} 100%)`,
          }}
        >
          <div style={{ border: `1px solid ${GOLD}`, padding: 6 }}>
            <div
              style={{
                border: "1px solid rgba(201,162,74,0.55)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "40px 22px 44px",
                textAlign: "center",
                color: CREAM,
              }}
            >
              <div
                style={{
                  fontFamily: "'Noto Serif Sinhala', serif",
                  fontSize: 22,
                  color: GOLD,
                }}
              >
                ආයුබෝවන්
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 10,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "rgba(247,238,219,0.75)",
                }}
              >
                With the blessings of our parents
              </div>
              <svg
                width="110"
                height="64"
                viewBox="0 0 120 70"
                fill="none"
                stroke={GOLD}
                style={{ marginTop: 22, strokeWidth: 1.1 }}
              >
                <path d="M60 8c9 12 9 30 0 44-9-14-9-32 0-44z" />
                <path d="M60 52C52 38 40 30 26 30c2 14 16 24 34 22z" />
                <path d="M60 52c8-14 20-22 34-22-2 14-16 24-34 22z" />
                <path d="M30 64h60" />
              </svg>
              <div
                style={{
                  marginTop: 22,
                  fontFamily: "'Marcellus SC', serif",
                  fontSize: "clamp(34px,10vw,50px)",
                  lineHeight: 1,
                  letterSpacing: "2px",
                }}
              >
                {wedding.groom}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  margin: "14px 0",
                }}
              >
                <span style={{ width: 48, height: 1, background: GOLD }} />
                <span
                  style={{
                    fontFamily: "'Cormorant', serif",
                    fontStyle: "italic",
                    fontSize: 26,
                    color: GOLD,
                  }}
                >
                  &amp;
                </span>
                <span style={{ width: 48, height: 1, background: GOLD }} />
              </div>
              <div
                style={{
                  fontFamily: "'Marcellus SC', serif",
                  fontSize: "clamp(34px,10vw,50px)",
                  lineHeight: 1,
                  letterSpacing: "2px",
                }}
              >
                {wedding.bride}
              </div>
              <div
                style={{
                  marginTop: 32,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "rgba(247,238,219,0.75)",
                  }}
                >
                  Poruwa ceremony at the auspicious hour
                </span>
                <span
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: 36,
                    color: GOLD,
                    lineHeight: 1.1,
                  }}
                >
                  {formatTime(wedding.date)}
                </span>
                <span
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: 16,
                    letterSpacing: "1px",
                  }}
                >
                  {formatLongDate(wedding.date)}
                </span>
                {wedding.venue && (
                  <span
                    style={{
                      fontSize: 13,
                      color: "rgba(247,238,219,0.8)",
                      marginTop: 2,
                    }}
                  >
                    {wedding.venue}
                  </span>
                )}
              </div>
              <a
                href="#rsvp"
                style={{
                  marginTop: 30,
                  height: 50,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: GOLD,
                  color: DARK_MAROON,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Confirm attendance
              </a>
            </div>
          </div>
        </div>

        <KandyanBand background={DARK_MAROON} />

        {/* Families */}
        <div
          style={{
            padding: "56px 28px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            Invited with love
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.7,
              color: "#5a4032",
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
                borderTop: "1px solid rgba(138,90,43,0.35)",
                borderBottom: "1px solid rgba(138,90,43,0.35)",
              }}
            >
              <div
                style={{
                  padding: "18px 8px",
                  borderRight: "1px solid rgba(138,90,43,0.35)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: MUTED,
                  }}
                >
                  Daughter of
                </div>
                <div
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: 16,
                    lineHeight: 1.35,
                    marginTop: 6,
                  }}
                >
                  {wedding.brideParentsNames || "—"}
                </div>
              </div>
              <div style={{ padding: "18px 8px" }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: MUTED,
                  }}
                >
                  Son of
                </div>
                <div
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: 16,
                    lineHeight: 1.35,
                    marginTop: 6,
                  }}
                >
                  {wedding.groomParentsNames || "—"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ceremonies */}
        <div
          style={{
            padding: "56px 20px 0",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <h2
            style={{
              margin: 0,
              textAlign: "center",
              fontFamily: "'Marcellus', serif",
              fontWeight: 400,
              fontSize: 30,
              color: MAROON,
            }}
          >
            The Ceremonies
          </h2>
          <div
            style={{
              background: "#fffaf0",
              border: "1px solid rgba(138,90,43,0.3)",
              padding: 22,
              display: "grid",
              gridTemplateColumns: "72px 1fr",
              gap: 16,
            }}
          >
            <div
              style={{
                textAlign: "center",
                borderRight: "1px solid rgba(138,90,43,0.3)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: 24,
                  color: MAROON,
                  lineHeight: 1,
                }}
              >
                {formatTime(wedding.date)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'Marcellus', serif", fontSize: 20 }}>
                Poruwa Ceremony
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#6b5042",
                  lineHeight: 1.55,
                  marginTop: 4,
                }}
              >
                Jayamangala Gatha, the tying of the fingers and the Kapuruka
                offering.
              </div>
            </div>
          </div>
          {wedding.receptionDate && (
            <div
              style={{
                background: MAROON,
                color: CREAM,
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: GOLD,
                }}
              >
                And the homecoming
              </div>
              <div style={{ fontFamily: "'Marcellus', serif", fontSize: 22 }}>
                {formatLongDate(wedding.receptionDate)} ·{" "}
                {formatTime(wedding.receptionDate)}
              </div>
              {wedding.hall && (
                <div style={{ fontSize: 13, color: "rgba(247,238,219,0.8)" }}>
                  {wedding.hall} · Dinner &amp; dancing
                </div>
              )}
            </div>
          )}
        </div>

        {/* Countdown */}
        <div style={{ margin: "60px 20px 0" }}>
          <Countdown target={wedding.date} />
        </div>

        {/* Venue */}
        {(wedding.venue || wedding.address) && (
          <div
            style={{
              margin: "60px 20px 0",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={wedding.venuePhotoUrl ?? venueImg}
                alt={wedding.venue ?? "The venue"}
                loading="lazy"
                style={{
                  width: "100%",
                  aspectRatio: "350/280",
                  objectFit: "cover",
                  display: "block",
                  borderRadius: "175px 175px 0 0",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "8px 8px 0 8px",
                  border: "1px solid rgba(247,238,219,0.8)",
                  borderBottom: 0,
                  borderRadius: "167px 167px 0 0",
                }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Marcellus', serif",
                  fontWeight: 400,
                  fontSize: 28,
                  color: MAROON,
                }}
              >
                {wedding.venue}
              </h2>
              {wedding.address && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#5a4032",
                  }}
                >
                  {wedding.address}
                </p>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
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
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  border: `1px solid ${MAROON}`,
                  color: MAROON,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <MapPin className="h-4 w-4" /> Google Maps
              </a>
              <a
                href={googleCalendarUrl(wedding)}
                style={{
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  border: `1px solid ${MAROON}`,
                  color: MAROON,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <Calendar className="h-4 w-4" /> Save the date
              </a>
            </div>
          </div>
        )}

        {/* RSVP */}
        <div
          id="rsvp"
          style={{
            marginTop: 64,
            background: DARK_MAROON,
            color: CREAM,
            padding: "44px 24px",
            scrollMarginTop: 24,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                fontFamily: "'Noto Serif Sinhala', serif",
                fontSize: 16,
                color: GOLD,
              }}
            >
              කරුණාකර දන්වන්න
            </div>
            <h2
              style={{
                margin: "6px 0 0",
                fontFamily: "'Marcellus', serif",
                fontWeight: 400,
                fontSize: 30,
              }}
            >
              Kindly respond
            </h2>
          </div>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 20px 0" }}>
          <SeatingCta wedding={wedding} motif="diamond" />
        </div>

        {/* Footer */}
        <div
          style={{
            background: MAROON,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 24px 36px",
            gap: 10,
            color: CREAM,
            textAlign: "center",
          }}
        >
          <KandyanBand background={MAROON} />
          <span
            style={{
              fontFamily: "'Marcellus SC', serif",
              fontSize: 24,
              letterSpacing: "3px",
              color: GOLD,
              marginTop: 12,
            }}
          >
            {initials}
          </span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: "rgba(247,238,219,0.75)",
            }}
          >
            {formatLongDate(wedding.date)}
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
