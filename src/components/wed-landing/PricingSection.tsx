import { PLANS, WHATSAPP_HREF } from "./content";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-16 border-b-2 border-wl-ink bg-white"
    >
      <div className="mx-auto max-w-[1280px] px-5 pt-12 sm:px-7">
        <div className="grid items-end gap-6 sm:grid-cols-[1fr,auto]">
          <h2 className="font-archivo m-0 text-[30px] font-extrabold leading-[0.98] tracking-[-0.035em] text-wl-ink sm:text-5xl">
            <span className="mr-3.5 align-top text-[11px] font-bold tracking-[0.2em] text-wed">
              07
            </span>
            One payment, per wedding
          </h2>
          <p className="m-0 max-w-[50ch] text-[15.5px] leading-relaxed text-[#3c3a39]">
            No subscription and no per-guest fee. Hosting is included — 6, 12 or
            24 months depending on the plan.
          </p>
        </div>
        <div className="mt-6 h-0.5 bg-wl-ink" />

        {PLANS.map((p, i) => (
          <div
            key={p.name}
            className="py-[30px] pb-[34px]"
            style={{
              borderBottom:
                i < PLANS.length - 1
                  ? "1px solid rgba(32,30,29,.16)"
                  : "2px solid #201e1d",
            }}
          >
            <div
              className="grid items-start gap-8"
              style={{
                gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              }}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-archivo m-0 text-2xl font-extrabold tracking-[-0.025em]">
                    {p.name}
                  </h3>
                  {p.badge && (
                    <span className="bg-wed px-[9px] py-[5px] text-[9.5px] font-bold uppercase tracking-[0.14em] text-white">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-[34px] font-extrabold leading-none tracking-[-0.03em]">
                  {p.price}
                </div>
                <div className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#605d5d]">
                  {p.priceNote}
                </div>
                <p className="mt-3.5 max-w-[34ch] text-sm leading-relaxed text-[#605d5d]">
                  {p.description}
                </p>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[18px] inline-flex items-center gap-2 border-2 border-wed bg-wed px-[18px] py-3 text-[12.5px] font-bold uppercase tracking-[0.12em] text-white no-underline hover:border-wed-deep hover:bg-wed-deep"
                >
                  {p.cta}
                </a>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b9797]">
                  Included
                </div>
                <ul
                  className="m-0 mt-3 grid list-none p-0"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
                    columnGap: 28,
                  }}
                >
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex gap-[9px] border-t border-[rgba(32,30,29,.1)] py-[7px] text-[13.5px] leading-[1.45]"
                    >
                      <span className="mt-[7px] h-[5px] w-[5px] flex-shrink-0 bg-wed" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        <div className="py-5 pb-11 text-[13px] text-[#605d5d]">
          Planning several weddings?{" "}
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-wl-ink"
          >
            Message us
          </a>{" "}
          about planner and vendor pricing.
        </div>
      </div>
    </section>
  );
}
