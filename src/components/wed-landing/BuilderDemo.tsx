import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { WED_TEMPLATES, type WedTemplateTheme } from "./templates";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

function glassFor(t: WedTemplateTheme): CSSProperties {
  return t.dark
    ? {
        background:
          "linear-gradient(160deg,rgba(255,255,255,.1),rgba(255,255,255,.03))",
        border: `1px solid ${t.border}`,
      }
    : {
        background:
          "linear-gradient(160deg,rgba(255,255,255,.82),rgba(255,255,255,.52))",
        border: `1px solid ${t.rad > 12 ? "rgba(255,255,255,.8)" : t.border}`,
      };
}

// The real invitation layout, in miniature, driven by whatever the visitor
// types — built off the same 14 template themes the product ships (see
// templates.ts), not a mockup of them.
export function BuilderDemo() {
  const [id, setId] = useState("classic");
  const [groom, setGroom] = useState("Amara");
  const [bride, setBride] = useState("Kavin");
  const [date, setDate] = useState("2027-02-14");
  const [venue, setVenue] = useState("Mount Lavinia Hotel");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const i = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(i);
  }, []);

  const t = useMemo(
    () => WED_TEMPLATES.find((x) => x.id === id) ?? WED_TEMPLATES[0],
    [id],
  );
  const glass = glassFor(t);

  const groomOut = groom.trim() || "Amara";
  const brideOut = bride.trim() || "Kavin";
  const venueOut = venue.trim() || "Your venue";

  const d = new Date(`${date}T17:00:00+05:30`);
  const valid = !isNaN(d.getTime());
  const ms = Math.max(0, valid ? d.getTime() - now : 0);
  const countdown: [string, number][] = [
    ["Days", Math.floor(ms / 864e5)],
    ["Hrs", Math.floor((ms % 864e5) / 36e5)],
    ["Min", Math.floor((ms % 36e5) / 6e4)],
    ["Sec", Math.floor((ms % 6e4) / 1e3)],
  ];

  const slug = `${groomOut}-${brideOut}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const initials = `${groomOut.charAt(0).toUpperCase()} & ${brideOut.charAt(0).toUpperCase()}`;
  const dateLine = valid
    ? `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    : "Your wedding day";
  const dateShort = valid
    ? `${d.getDate()}.${d.getMonth() + 1}.${String(d.getFullYear()).slice(2)}`
    : "—";

  const gradientText: CSSProperties = {
    background: t.grad,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
  const card: CSSProperties = {
    ...glass,
    borderRadius: t.rad,
    padding: "16px 14px",
    marginTop: 18,
    textAlign: "left",
  };
  const kicker: CSSProperties = {
    margin: "14px 0 0",
    fontFamily: t.kf,
    fontSize: t.ks,
    textTransform: t.kt,
    letterSpacing: t.kls,
    fontStyle: t.ki,
    color: t.rose,
  };
  const rule: CSSProperties = {
    width: 64,
    height: 1,
    background: t.gold,
    opacity: 0.8,
    margin: "14px auto 0",
  };
  const btn: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "11px 26px",
    borderRadius: t.brad,
    background: t.grad,
    color: t.btnInk,
    fontFamily:
      t.kf === '"Cormorant Garamond",serif' ? '"Archivo",sans-serif' : t.kf,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: ".14em",
  };

  const inputCls =
    "w-full border-2 border-wl-ink bg-white px-[11px] py-[9px] font-archivo text-sm text-wl-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-wed";

  return (
    <div className="grid items-start gap-7 text-wl-ink lg:grid-cols-[1.05fr,1fr]">
      {/* Left: inputs + template picker */}
      <div className="flex min-w-0 flex-col gap-[22px]">
        <div>
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#605d5d]">
            Step 01 — your details
          </p>
          <div className="mt-2 h-0.5 bg-wl-ink" />
          <div className="mt-3.5 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
              Groom
              <input
                className={inputCls}
                value={groom}
                onChange={(e) => setGroom(e.target.value)}
                aria-label="Groom name"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
              Bride
              <input
                className={inputCls}
                value={bride}
                onChange={(e) => setBride(e.target.value)}
                aria-label="Bride name"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
              Date
              <input
                type="date"
                className={inputCls}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Wedding date"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
              Venue
              <input
                className={inputCls}
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                aria-label="Venue"
              />
            </label>
          </div>
        </div>

        <div>
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#605d5d]">
            Step 02 — pick a design
          </p>
          <div className="mt-2 h-0.5 bg-wl-ink" />
          <div
            className="mt-3.5 grid gap-2.5"
            style={{
              gridTemplateColumns: "repeat(auto-fill,minmax(92px,1fr))",
            }}
          >
            {WED_TEMPLATES.map((k) => {
              const on = k.id === id;
              const nameSize = Math.max(
                6.5,
                10.5 -
                  Math.max(0, Math.max(groomOut.length, brideOut.length) - 5) *
                    0.7,
              );
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setId(k.id)}
                  aria-pressed={on}
                  className="flex cursor-pointer flex-col gap-1.5 border-none bg-transparent p-0 text-left font-archivo transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-wed"
                >
                  <span
                    className="flex flex-col items-center justify-center gap-[3px] px-2 py-3"
                    style={{
                      background: k.bg,
                      border: on
                        ? "2px solid #201e1d"
                        : "1px solid rgba(32,30,29,.22)",
                      boxShadow: on ? "4px 4px 0 #201e1d" : "none",
                      minHeight: 104,
                    }}
                  >
                    <span
                      className="grid h-[18px] w-[18px] place-items-center rounded-full"
                      style={{
                        border: `1px solid ${k.gold}`,
                        fontFamily: k.disp,
                        fontWeight: k.dw,
                        fontSize: 7,
                        lineHeight: 1,
                        color: k.rose,
                      }}
                    >
                      {initials.replace(" & ", "&")}
                    </span>
                    <span
                      style={{
                        marginTop: 2,
                        fontFamily: k.kf,
                        fontSize: "4.6px",
                        fontStyle: k.ki,
                        textTransform: k.kt,
                        letterSpacing: k.kt === "uppercase" ? ".2em" : ".02em",
                        color: k.muted,
                      }}
                    >
                      Together with
                    </span>
                    <span
                      style={{
                        width: 18,
                        height: 1,
                        background: k.gold,
                        opacity: 0.75,
                      }}
                    />
                    <span
                      className="max-w-full break-words text-center"
                      style={{
                        display: "block",
                        fontFamily: k.disp,
                        fontWeight: k.dw,
                        fontStyle: k.ditl || "normal",
                        textTransform: k.dt,
                        letterSpacing: k.dls,
                        fontSize: `${nameSize}px`,
                        lineHeight: 1.15,
                        color: k.fg,
                      }}
                    >
                      {groomOut}
                      <br />
                      <span
                        style={{
                          fontFamily: k.scr,
                          fontStyle: "italic",
                          fontSize: 8,
                          lineHeight: 1,
                          color: k.rose,
                        }}
                      >
                        &amp;
                      </span>
                      <br />
                      {brideOut}
                    </span>
                    <span
                      style={{
                        width: 18,
                        height: 1,
                        background: k.gold,
                        opacity: 0.75,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: k.kf,
                        fontSize: "4.6px",
                        letterSpacing: ".16em",
                        color: k.muted,
                      }}
                    >
                      {dateShort}
                    </span>
                    <span
                      style={{
                        marginTop: 3,
                        width: 26,
                        height: 6,
                        borderRadius:
                          Math.min(k.brad, 999) === 999 ? 999 : k.brad,
                        background: k.grad,
                      }}
                    />
                  </span>
                  <span
                    className="text-center text-[11px]"
                    style={{
                      fontWeight: on ? 800 : 600,
                      letterSpacing: ".01em",
                      color: on ? "#201e1d" : "#605d5d",
                    }}
                  >
                    {k.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3.5 text-[13px] leading-relaxed text-[#605d5d]">
            Every design changes the layout, the type and the opening animation
            — not just the colour.{" "}
            <strong className="text-wl-ink">{t.label}:</strong> {t.desc}
          </p>
        </div>
      </div>

      {/* Right: phone preview */}
      <div className="flex min-w-0 flex-col items-center gap-3">
        <div className="flex w-full max-w-[340px] items-center gap-2 border-2 border-wl-ink bg-white px-2.5 py-[7px] text-[11px] font-semibold">
          <span
            className="h-2 w-2 flex-shrink-0"
            style={{ background: t.rose }}
          />
          <span className="text-[#605d5d]">wed.rovty.com/</span>
          <span>{slug}</span>
        </div>
        <div
          className="w-full max-w-[340px] border-2 border-wl-ink bg-white"
          style={{ boxShadow: "12px 12px 0 #201e1d" }}
        >
          <div
            className="h-[560px] overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
            data-screen-label="Invitation preview"
          >
            <div
              style={{
                minHeight: "100%",
                padding: "26px 20px 30px",
                textAlign: "center",
                background: t.bg,
                color: t.fg,
              }}
            >
              <div className="relative mx-auto grid h-16 w-16 place-items-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid ${t.gold}`,
                    opacity: 0.55,
                    background: t.dark
                      ? "rgba(255,255,255,.05)"
                      : "rgba(255,255,255,.55)",
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: "12%",
                    border: `1px solid ${t.gold}`,
                    opacity: 0.3,
                  }}
                />
                <span
                  className="relative"
                  style={{
                    fontFamily: t.disp,
                    fontWeight: t.dw,
                    fontStyle: t.ditl || "normal",
                    fontSize: 17,
                    lineHeight: 1,
                    color: t.rose,
                  }}
                >
                  {initials}
                </span>
              </div>
              <p style={kicker}>Together with their families</p>
              <div style={rule} />
              <h2
                style={{
                  margin: "14px 0 0",
                  fontFamily: t.disp,
                  fontWeight: t.dw,
                  fontStyle: t.ditl || "normal",
                  textTransform: t.dt,
                  letterSpacing: t.dls,
                  fontSize: 34,
                  lineHeight: 1.05,
                  color: t.fg,
                }}
              >
                {groomOut}
                <span
                  style={{
                    fontFamily: t.scr,
                    fontStyle: "italic",
                    padding: "0 8px",
                    ...gradientText,
                  }}
                >
                  &amp;
                </span>
                {brideOut}
              </h2>
              <div style={{ ...rule, margin: "14px auto 0" }} />
              <p
                style={{
                  margin: "14px 0 0",
                  fontFamily: t.kf,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".24em",
                  color: t.muted,
                }}
              >
                {dateLine}
              </p>

              <div className="mt-[18px] grid grid-cols-4 gap-1.5">
                {countdown.map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      ...glass,
                      borderRadius: Math.min(t.rad, 16),
                      padding: "10px 2px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: t.disp,
                        fontWeight: t.dw,
                        fontSize: 22,
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                        ...gradientText,
                      }}
                    >
                      {pad2(value)}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontFamily: t.kf,
                        fontSize: 8,
                        textTransform: "uppercase",
                        letterSpacing: ".18em",
                        color: t.muted,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-center">
                <span style={btn}>RSVP</span>
              </div>

              <div style={card}>
                <p
                  style={{ ...kicker, margin: 0, fontSize: Math.min(t.ks, 12) }}
                >
                  Save the date
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontFamily: t.disp,
                    fontWeight: t.dw,
                    fontStyle: t.ditl || "normal",
                    textTransform: t.dt,
                    letterSpacing: t.dls,
                    fontSize: 20,
                    color: t.fg,
                  }}
                >
                  The Celebration
                </p>
                {[
                  ["Venue", venueOut],
                  ["Time", "5:00 PM onwards"],
                  ["Dress", "Formal / Saree"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-2.5 py-[9px] text-xs"
                    style={{ borderBottom: `1px solid ${t.border}` }}
                  >
                    <span
                      style={{
                        fontFamily: t.kf,
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: ".18em",
                        color: t.muted,
                        paddingTop: 2,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: '"Archivo",sans-serif',
                        fontSize: 12,
                        color: t.fg,
                        textAlign: "right",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ ...card, textAlign: "center" }}>
                <p
                  style={{ ...kicker, margin: 0, fontSize: Math.min(t.ks, 12) }}
                >
                  Your seating
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontFamily: t.disp,
                    fontWeight: t.dw,
                    fontStyle: t.ditl || "normal",
                    textTransform: t.dt,
                    letterSpacing: t.dls,
                    fontSize: 20,
                    color: t.fg,
                  }}
                >
                  Find your table
                </p>
                <span
                  className="mt-3 inline-flex items-center px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{
                    borderRadius: t.brad,
                    background: t.grad,
                    color: t.btnInk,
                    fontFamily: '"Archivo",sans-serif',
                  }}
                >
                  Enter your code
                </span>
              </div>

              <p
                style={{
                  margin: "22px 0 0",
                  fontFamily: t.scr,
                  fontStyle: "italic",
                  fontSize: 18,
                  ...gradientText,
                }}
              >
                Thank you for being part of our story
              </p>
            </div>
          </div>
        </div>
        <p className="max-w-[340px] text-center text-[11px] text-[#605d5d]">
          Scroll inside the phone. This is the real invitation layout — an
          example couple, not a real wedding.
        </p>
      </div>
    </div>
  );
}
