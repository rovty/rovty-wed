import { Check } from "lucide-react";
import { useWedPricing } from "@/hooks/useWedPricing";
import { PLANS, WHATSAPP_HREF } from "./content";

export function PricingSection() {
  const pricing = useWedPricing();
  return (
    <section
      id="pricing"
      className="relative z-[2] flex scroll-mt-16 flex-col gap-9 px-5 pt-[90px] sm:px-10 lg:px-[120px]"
    >
      <div className="flex flex-wrap items-end justify-between gap-10">
        <h2 className="m-0 text-[34px] font-semibold leading-none tracking-[-0.04em] text-wl-ink sm:text-[52px]">
          One payment,{" "}
          <span className="font-['Instrument_Serif',Georgia,serif] font-normal italic">
            per wedding.
          </span>
        </h2>
        <p className="m-0 max-w-[340px] text-[15.5px] leading-relaxed text-[#4f494b]">
          No subscription, no per-guest fee. Hosting included for the period
          shown.
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
        {PLANS.filter((p) => pricing.available(p.name)).map((p) => {
          const dark = !!p.badge;
          return (
            <div
              key={p.name}
              className={
                dark
                  ? "relative flex flex-col overflow-hidden rounded-[30px] bg-wl-ink p-[30px_28px] text-[#f6f1ee] shadow-[0_30px_70px_-30px_rgba(29,26,27,0.6)]"
                  : "flex flex-col rounded-[30px] border border-white/85 bg-white/50 p-[30px_28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_24px_50px_-34px_rgba(90,25,55,0.35)] backdrop-blur-[30px] backdrop-saturate-[1.7]"
              }
            >
              {dark && (
                <div
                  aria-hidden="true"
                  className="absolute -left-[60px] -top-[110px] h-[300px] w-[300px] rounded-full opacity-85 blur-[90px]"
                  style={{ background: "var(--color-wed)" }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <div className="text-xl font-semibold tracking-[-0.02em]">
                  {p.name}
                </div>
                {p.badge && (
                  <span className="flex h-[26px] items-center rounded-full border border-white/25 bg-white/14 px-[11px] text-[11.5px] font-semibold">
                    {p.badge}
                  </span>
                )}
              </div>
              <p
                className="relative m-0 mt-1.5 min-h-10 text-sm leading-relaxed"
                style={{ color: dark ? "rgba(246,241,238,0.75)" : "#55504f" }}
              >
                {p.description}
              </p>
              <div className="relative mt-4 flex items-baseline gap-2.5">
                <span className="text-[38px] font-semibold leading-none tracking-[-0.035em]">
                  {pricing.price(p.name)}
                </span>
                <span
                  className="text-[12.5px]"
                  style={{ color: dark ? "rgba(246,241,238,0.7)" : "#6b6567" }}
                >
                  {p.priceNote}
                  {pricing.months(p.name)
                    ? ` · ${pricing.months(p.name)} months hosting`
                    : ""}
                </span>
              </div>
              <ul
                className="relative m-0 mb-[22px] mt-5 flex list-none flex-col gap-2.5 p-0 text-[13.5px] leading-[1.4]"
                style={{ color: dark ? undefined : "#2e2a2b" }}
              >
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check
                      size={15}
                      strokeWidth={2.4}
                      className="mt-0.5 flex-shrink-0"
                      color={dark ? "#f0b5cf" : "var(--color-wed)"}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={pricing.href(p.name)}
                className={
                  dark
                    ? "relative mt-auto flex h-12 items-center justify-center rounded-full bg-white text-[14.5px] font-semibold text-wl-ink no-underline"
                    : "mt-auto flex h-12 items-center justify-center rounded-full border border-black/8 bg-white/85 text-[14.5px] font-semibold text-wl-ink no-underline"
                }
              >
                Choose {p.name}
              </a>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-[#5a5456]">
        <a href="/pricing/wed" className="font-semibold text-wl-ink">
          Compare every feature
        </a>{" "}
        · Planning several weddings?{" "}
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-wl-ink"
        >
          Message us
        </a>
      </div>
    </section>
  );
}
