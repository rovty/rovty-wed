import { FEATURES } from "./content";

export function FeaturesSection() {
  return (
    <section
      id="included"
      className="scroll-mt-16 border-b-2 border-wl-ink bg-white"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-12 pb-[52px] sm:px-7">
        <h2 className="font-archivo m-0 text-[30px] font-extrabold leading-[0.98] tracking-[-0.035em] text-wl-ink sm:text-5xl">
          <span className="mr-3.5 align-top text-[11px] font-bold tracking-[0.2em] text-wed">
            03
          </span>
          What&rsquo;s included
        </h2>
        <div className="mt-6 h-0.5 bg-wl-ink" />
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            columnGap: 44,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="grid gap-4 border-b border-[rgba(32,30,29,.14)] py-[22px]"
              style={{ gridTemplateColumns: "26px 1fr" }}
            >
              <f.icon
                className="mt-0.5 h-[22px] w-[22px] text-wed"
                strokeWidth={2}
                aria-hidden
              />
              <span>
                <span className="block text-lg font-extrabold tracking-[-0.015em] text-wl-ink">
                  {f.title}
                </span>
                <span className="mt-[7px] block text-sm leading-relaxed text-[#605d5d]">
                  {f.body}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
