import { useState } from "react";
import { ArrowRight, Check, MessageCircle, RotateCcw } from "lucide-react";
import {
  SIGNATURE_TEMPLATES,
  type SignatureTemplateId,
} from "@/lib/wedding-signature";
import { LivePreviewPhone } from "./LivePreviewPhone";

const PHONE_WIDTH = 292;
const PHONE_HEIGHT = 632;

export function Hero() {
  const [design, setDesign] = useState<SignatureTemplateId>("maison");
  const [replayKey, setReplayKey] = useState(0);
  const current =
    SIGNATURE_TEMPLATES.find((t) => t.id === design) ?? SIGNATURE_TEMPLATES[0];

  return (
    <section
      id="top"
      className="relative z-[2] grid grid-cols-1 items-center gap-14 px-5 pt-14 sm:px-10 lg:grid-cols-[1fr_540px] lg:gap-14 lg:px-[120px]"
    >
      <div id="designs" className="flex flex-col items-start">
        <div className="flex h-8 items-center gap-2 rounded-full border border-white/80 bg-white/50 px-3.5 text-[13px] font-medium text-[#4a4446] backdrop-blur-[20px]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--color-wed)" }}
          />
          Your forever deserves a beautiful beginning
        </div>
        <h1 className="m-0 mt-[22px] text-[44px] font-semibold leading-[0.98] tracking-[-0.045em] text-wl-ink sm:text-[60px] lg:text-[76px]">
          A little website.
          <br />
          <span
            className="font-['Instrument_Serif',Georgia,serif] font-normal italic tracking-[-0.02em]"
            style={{ color: "var(--color-wed)" }}
          >
            A whole lot of love.
          </span>
        </h1>
        <p className="m-0 mt-5 max-w-[520px] text-lg leading-relaxed text-[#4f494b] text-balance">
          One link with your invitation, RSVPs, seating and directions, sent to
          every guest on WhatsApp.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <a
            href="/templates"
            className="flex h-[52px] items-center gap-2.5 rounded-full px-[26px] text-[15.5px] font-semibold text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_14px_30px_-12px_rgba(122,32,72,0.6)]"
            style={{ background: "var(--color-wed)" }}
          >
            Start with this design <ArrowRight size={16} />
          </a>
          <a
            href="#pricing"
            className="flex h-[52px] items-center rounded-full border border-white/85 bg-white/55 px-6 text-[15.5px] font-medium text-wl-ink no-underline backdrop-blur-[20px]"
          >
            See pricing
          </a>
        </div>

        {/* Design picker */}
        <div className="mt-9 w-full rounded-[28px] border border-white/85 bg-white/42 p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_60px_-36px_rgba(90,25,55,0.35)] backdrop-blur-[30px] backdrop-saturate-[1.7]">
          <div className="flex items-center justify-between px-1 pb-3.5">
            <span className="text-[13.5px] font-semibold text-wl-ink">
              Pick a design{" "}
              <span className="font-normal text-[#5a5456]">
                · watch it open
              </span>
            </span>
            <button
              type="button"
              onClick={() => setReplayKey((k) => k + 1)}
              className="flex h-[34px] items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3.5 text-[12.5px] font-semibold text-wl-ink"
            >
              <RotateCcw size={13} /> Replay
            </button>
          </div>
          <div
            role="group"
            aria-label="Designs"
            className="grid grid-cols-2 gap-1.5 sm:grid-cols-4"
          >
            {SIGNATURE_TEMPLATES.map((t) => {
              const selected = t.id === design;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDesign(t.id)}
                  aria-pressed={selected}
                  className="flex h-10 items-center gap-2 overflow-hidden whitespace-nowrap rounded-xl px-2.5 text-left text-[12.5px] font-medium text-wl-ink"
                  style={{
                    background: selected ? "#fff" : "rgba(255,255,255,0.5)",
                    border: `1px solid ${selected ? "var(--color-wed)" : "rgba(29,26,27,0.08)"}`,
                    boxShadow: selected
                      ? "0 0 0 3px rgba(122,32,72,0.14)"
                      : "none",
                  }}
                >
                  <span
                    className="h-4 w-4 flex-shrink-0 rounded-full"
                    style={{
                      background: t.swatch.background,
                      boxShadow: `inset 0 0 0 4px ${t.swatch.accent}, 0 0 0 1px rgba(0,0,0,0.1)`,
                    }}
                  />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phone stage — always shown (not just from sm: up) so mobile guests
          can see the live template too; the floating notification cards
          stay lg:flex-only below since their negative offsets are sized for
          the wide desktop stage and would overflow a phone-width one. */}
      <div className="relative mx-auto flex h-[700px] w-full max-w-[460px] items-center justify-center rounded-[44px] border border-white/80 bg-white/32 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_60px_120px_-50px_rgba(90,25,55,0.45)] backdrop-blur-[40px] backdrop-saturate-[1.7] lg:h-[760px]">
        <div
          aria-hidden="true"
          className="absolute h-[380px] w-[380px] rounded-full opacity-35 blur-[90px]"
          style={{ background: current.swatch.accent }}
        />
        <div className="relative box-border rounded-[54px] bg-[#121012] p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_50px_90px_-30px_rgba(40,10,25,0.55)]">
          <div
            className="relative overflow-hidden rounded-[44px]"
            style={{
              width: PHONE_WIDTH,
              height: PHONE_HEIGHT,
              background: current.swatch.background,
            }}
          >
            <LivePreviewPhone
              id={design}
              replayKey={replayKey}
              width={PHONE_WIDTH}
              height={PHONE_HEIGHT}
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[22px] z-[80] h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-[#121012]"
          />
        </div>

        <FloatingCard
          className="left-[-36px] top-[130px]"
          delay="0s"
          icon={<MessageCircle size={19} color="#fff" />}
          iconBg="#25a55f"
          title="Sent on WhatsApp"
          body="Each guest's own link"
        />
        <FloatingCard
          className="right-[-28px] top-[330px]"
          delay="-2s"
          icon={<Check size={19} color="#fff" />}
          iconBg="var(--color-wed)"
          title="RSVP received"
          body="Attending · 2 guests"
        />
        <FloatingCard
          className="bottom-[110px] left-[-20px]"
          delay="-4s"
          icon={<span className="text-[15px] font-bold text-white">4</span>}
          iconBg="#1d1a1b"
          title="Table 4"
          body="Already on their invitation"
        />
      </div>
    </section>
  );
}

function FloatingCard({
  className,
  delay,
  icon,
  iconBg,
  title,
  body,
}: {
  className: string;
  delay: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className={`wl-float absolute hidden items-center gap-3 rounded-[20px] border border-white/90 bg-white/68 py-2.5 pl-2.5 pr-4 shadow-[0_20px_40px_-20px_rgba(60,20,40,0.4)] backdrop-blur-[24px] backdrop-saturate-[1.7] lg:flex ${className}`}
      style={{ animationDelay: delay }}
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px]"
        style={{ background: iconBg }}
      >
        {icon}
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-wl-ink">
          {title}
        </span>
        <span className="block text-xs text-[#5a5456]">{body}</span>
      </span>
    </div>
  );
}
