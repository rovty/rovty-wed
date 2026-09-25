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

const INK = "#243021";
const PALE = "#eef0e2";
const LEAF = "#3f5a2a";

/**
 * "Fern" — eucalyptus and fern, soft canopy light. Ported from Fern.dc.html
 * (titled "Canopy" in its own source); the opener parts sun-dappled
 * branches. RSVP/countdown/seating are the real site components.
 */
export function FernTemplate({ wedding }: { wedding: PublicWedding }) {
  const { phase, leave, replay } = useSignatureOpener(wedding, {
    autoMs: 2700,
    leaveMs: 1600,
  });
  const photo = wedding.couplePhotoUrl ?? coupleImg;
  const venuePhoto = wedding.venuePhotoUrl ?? venueImg;
  const names = `${wedding.groom} & ${wedding.bride}`;
  const day = wedding.date.getDate();
  const month = wedding.date
    .toLocaleDateString("en-US", { month: "short", timeZone: "Asia/Colombo" })
    .toUpperCase();

  return (
    <main
      className="theme-fern wedding-stationery relative"
      style={{
        background: PALE,
        color: INK,
        fontFamily: "'Instrument Sans', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        .fn-op{position:fixed;inset:0;z-index:100;overflow:hidden;background:radial-gradient(60% 50% at 50% 45%,#fffbe6,#f3efcf 40%,#c9d4b0 100%);display:flex;align-items:center;justify-content:center;transition:opacity .5s .3s ease}
        .fn-op--leave{opacity:0;pointer-events:none}
        .fn-card{position:relative;width:min(390px,100vw);height:min(844px,100svh);overflow:hidden}
        .fn-br{position:absolute;top:-4%;width:58%;height:105%;overflow:hidden;transition:transform 1.4s cubic-bezier(.5,0,.3,1)}
        .fn-bl{left:-4%}.fn-bR{right:-4%}
        .fn-br img{width:100%;height:100%;object-fit:cover}
        .fn-bR img{transform:scaleX(-1)}
        .fn-op--leave .fn-bl{transform:translateX(-115%) rotate(-14deg)}
        .fn-op--leave .fn-bR{transform:translateX(115%) rotate(14deg)}
        .fn-t{position:absolute;left:15%;right:15%;top:44%;text-align:center;padding:18px 0;border-radius:999px;background:rgba(255,253,240,.85);font-family:'Castoro',serif;font-style:italic;font-size:clamp(22px,7vw,30px);color:#243021;transition:opacity .4s}
        .fn-op--leave .fn-t{opacity:0}
        .fn-hint{position:absolute;left:24%;right:24%;bottom:12%;text-align:center;padding:10px 0;border-radius:999px;background:rgba(255,253,240,.8);font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#243021;animation:fn-pulse 1.8s ease-in-out infinite}
        @keyframes fn-pulse{0%,100%{opacity:.35}50%{opacity:1}}
        .fn-tap{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;padding:0;z-index:2}
        .fn-col{width:100%;max-width:430px;margin:0 auto}
      `}</style>

      {phase !== "gone" && (
        <div
          className={`fn-op ${phase === "leave" ? "fn-op--leave" : ""}`}
          role="dialog"
          aria-label="Wedding invitation"
        >
          <div className="fn-card">
            <div className="fn-br fn-bl">
              <img src={venuePhoto} alt="" />
            </div>
            <div className="fn-br fn-bR">
              <img src={venuePhoto} alt="" />
            </div>
            <div className="fn-t">{names}</div>
            <button
              type="button"
              className="fn-tap"
              aria-label="Open the invitation"
              onClick={leave}
            />
            {phase === "intro" && (
              <p className="fn-hint">Tap to part the leaves</p>
            )}
          </div>
        </div>
      )}

      <div className="tpl-pattern" aria-hidden="true" />
      <MusicPlayer src={wedding.musicUrl} />

      <div className="fn-col">
        {/* Hero */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={venuePhoto}
            alt=""
            loading="eager"
            fetchPriority="high"
            style={{
              width: "100%",
              aspectRatio: "390/340",
              objectFit: "cover",
              display: "block",
              maskImage: "linear-gradient(180deg,#000 55%,transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(180deg,#000 55%,transparent 100%)",
            }}
          />
          <img
            src={photo}
            alt={names}
            loading="lazy"
            style={{
              position: "absolute",
              right: 20,
              top: 180,
              width: 110,
              height: 140,
              objectFit: "cover",
              borderRadius: "55px 55px 12px 12px",
              border: `4px solid ${PALE}`,
              boxShadow: "0 14px 30px rgba(36,48,33,0.25)",
            }}
          />
          <div style={{ padding: "12px 24px 0" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                color: "#4d6b38",
              }}
            >
              Let's grow old together
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: "'Castoro', serif",
                fontSize: "clamp(38px,11vw,64px)",
                lineHeight: 0.92,
                letterSpacing: "-1.5px",
              }}
            >
              {wedding.groom}
            </div>
            <div
              style={{
                fontFamily: "'Castoro', serif",
                fontStyle: "italic",
                fontSize: "clamp(38px,11vw,64px)",
                lineHeight: 0.92,
                letterSpacing: "-1.5px",
                color: LEAF,
              }}
            >
              &amp; {wedding.bride}
            </div>
            <div
              style={{
                marginTop: 24,
                display: "flex",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: LEAF,
                  color: PALE,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Castoro', serif",
                    fontSize: 20,
                    lineHeight: 1,
                  }}
                >
                  {day}
                </span>
                <span style={{ fontSize: 9, letterSpacing: "1px" }}>
                  {month}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {wedding.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    timeZone: "Asia/Colombo",
                  })}{" "}
                  · {formatTime(wedding.date)}
                </div>
                {wedding.venue && (
                  <div style={{ fontSize: 14, color: "#52604c" }}>
                    {wedding.venue}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ padding: "20px 20px 0" }}>
            <a
              href="#rsvp"
              style={{
                height: 56,
                borderRadius: 18,
                background: INK,
                color: PALE,
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
        </div>

        {/* Note */}
        <div
          style={{
            margin: "20px 20px 0",
            background: "#fff",
            borderRadius: 28,
            padding: "28px 24px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.6,
              color: "#3a4636",
            }}
          >
            {wedding.description}
          </p>
        </div>

        {/* Day */}
        <div style={{ margin: "48px 20px 0" }}>
          <h2
            style={{
              margin: "0 0 16px",
              fontFamily: "'Castoro', serif",
              fontWeight: 400,
              fontSize: "clamp(30px,8.5vw,40px)",
              letterSpacing: "-0.5px",
            }}
          >
            How the day unfolds
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 10,
            }}
          >
            <div
              style={{
                background: "#dfe6c9",
                borderRadius: 22,
                padding: 18,
                minHeight: 110,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {formatTime(wedding.date)}
              </span>
              <span
                style={{
                  fontFamily: "'Castoro', serif",
                  fontSize: 20,
                  lineHeight: 1.1,
                }}
              >
                Vows under the canopy
              </span>
            </div>
            {wedding.receptionDate && (
              <div
                style={{
                  background: LEAF,
                  color: PALE,
                  borderRadius: 22,
                  padding: 18,
                  minHeight: 110,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {formatTime(wedding.receptionDate)}
                </span>
                <span
                  style={{
                    fontFamily: "'Castoro', serif",
                    fontSize: 20,
                    lineHeight: 1.1,
                  }}
                >
                  Long lunch in the shade
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Photo */}
        <div style={{ margin: "48px 20px 0", position: "relative" }}>
          <img
            src={venuePhoto}
            alt="The venue"
            loading="lazy"
            style={{
              width: "100%",
              aspectRatio: "350/300",
              objectFit: "cover",
              display: "block",
              borderRadius: 28,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 16,
              bottom: 16,
              background: "rgba(238,240,226,0.92)",
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Garden-casual · comfy shoes
          </div>
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
            <div style={{ fontFamily: "'Castoro', serif", fontSize: 30 }}>
              {wedding.venue}
            </div>
            {wedding.address && (
              <div style={{ fontSize: 15, lineHeight: 1.5, color: "#3a4636" }}>
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
                  height: 52,
                  borderRadius: 16,
                  background: LEAF,
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
                <MapPin className="h-4 w-4" /> Directions
              </a>
              <a
                href={googleCalendarUrl(wedding)}
                style={{
                  height: 52,
                  borderRadius: 16,
                  border: `1.5px solid ${INK}`,
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
        <div
          id="rsvp"
          style={{
            margin: "52px 20px 0",
            scrollMarginTop: 24,
            background: "#fff",
            borderRadius: 28,
            padding: "28px 20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontFamily: "'Castoro', serif",
              fontWeight: 400,
              fontSize: 32,
            }}
          >
            Can you make it?
          </h2>
          <InlineRsvp slug={wedding.slug} coupleNames={names} />
        </div>

        <div style={{ margin: "24px 20px 0" }}>
          <SeatingCta wedding={wedding} motif="leaf" />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            background: LEAF,
            color: PALE,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "36px 24px",
          }}
        >
          <span
            style={{
              fontFamily: "'Castoro', serif",
              fontStyle: "italic",
              fontSize: 32,
            }}
          >
            {names}
          </span>
          <span style={{ fontSize: 11, letterSpacing: "3px" }}>
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
