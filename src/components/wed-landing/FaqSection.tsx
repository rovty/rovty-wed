import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQS, WHATSAPP_HREF } from "./content";

const SIGN_IN_URL = "/admin";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="relative z-[2] grid scroll-mt-16 grid-cols-1 items-start gap-5 px-5 pt-[90px] sm:px-10 lg:grid-cols-[1fr_420px] lg:px-[120px]"
    >
      <div className="flex flex-col gap-5">
        <h2 className="m-0 text-[34px] font-semibold leading-none tracking-[-0.04em] text-wl-ink sm:text-[52px]">
          Questions{" "}
          <span className="font-['Instrument_Serif',Georgia,serif] font-normal italic">
            couples ask.
          </span>
        </h2>
        <div className="flex flex-col gap-0.5 rounded-[30px] border border-white/85 bg-white/45 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_24px_50px_-34px_rgba(90,25,55,0.35)] backdrop-blur-[30px] backdrop-saturate-[1.7]">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="rounded-[24px]"
                style={{
                  background: isOpen ? "rgba(255,255,255,0.8)" : "transparent",
                  boxShadow: isOpen
                    ? "0 10px 30px -18px rgba(60,20,40,0.35)"
                    : "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-[54px] w-full items-center justify-between gap-4 rounded-[24px] border-0 bg-transparent px-4 py-0 pl-[22px] text-left text-[15.5px] font-semibold tracking-[-0.01em] text-wl-ink"
                >
                  {f.q}
                  <span
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-200"
                    style={{
                      background: isOpen
                        ? "var(--color-wed)"
                        : "rgba(29,26,27,0.06)",
                      color: isOpen ? "#fff" : "#1d1a1b",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    <Plus size={12} strokeWidth={2.6} />
                  </span>
                </button>
                {isOpen && (
                  <p className="m-0 px-[60px] pb-[18px] pl-[22px] text-[14.5px] leading-[1.55] text-[#4f494b]">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="relative mt-0 flex flex-col gap-[18px] overflow-hidden rounded-[34px] p-[40px_34px_34px] text-white shadow-[0_40px_80px_-36px_rgba(87,21,48,0.6)] lg:mt-[72px]"
        style={{ background: "var(--color-wed)" }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-[120px] -top-[140px] h-[380px] w-[380px] rounded-full opacity-55 blur-[90px]"
          style={{ background: "#e8a7c3" }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-[160px] -left-[120px] h-[360px] w-[360px] rounded-full opacity-60 blur-[90px]"
          style={{ background: "#2a0b1a" }}
        />
        <div className="relative text-[13px] font-semibold text-white/80">
          Talk to a human
        </div>
        <h2 className="relative m-0 text-[34px] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-[44px]">
          Send us your date{" "}
          <span className="font-['Instrument_Serif',Georgia,serif] font-normal italic">
            on WhatsApp.
          </span>
        </h2>
        <p className="relative m-0 text-[15px] leading-[1.55] text-white/90">
          Tell us your names, date and the design you liked. We'll set it up and
          send you the link to check before anything reaches your guests.
        </p>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-2 flex h-[52px] items-center justify-center rounded-full bg-white text-[15px] font-semibold text-wl-ink no-underline"
        >
          Message us on WhatsApp
        </a>
        <div className="relative text-center text-[13px] text-white/85">
          Already set up?{" "}
          <a href={SIGN_IN_URL} className="font-semibold text-white underline">
            Sign in
          </a>
        </div>
      </div>
    </section>
  );
}
