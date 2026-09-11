import { STEPS } from "./content";

export function HowSection() {
  return (
    <section
      id="how"
      className="scroll-mt-16 border-b-2 border-wl-ink bg-wl-paper"
    >
      <div className="mx-auto max-w-[1280px] px-5 pt-12 sm:px-7">
        <h2 className="font-archivo m-0 text-[30px] font-extrabold leading-[0.98] tracking-[-0.035em] text-wl-ink sm:text-5xl">
          <span className="mr-3.5 align-top text-[11px] font-bold tracking-[0.2em] text-wed">
            03
          </span>
          Four steps, then you&rsquo;re sending
        </h2>
        <div className="mt-6 h-0.5 bg-wl-ink" />
      </div>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-x-[22px] px-5 pb-[52px] sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={`py-[26px] pb-[30px] pr-[22px] ${i < STEPS.length - 1 ? "lg:border-r lg:border-[rgba(32,30,29,.14)]" : ""}`}
          >
            <div className="text-[44px] font-extrabold leading-[0.9] tracking-[-0.04em] text-wed">
              {s.n}
            </div>
            <h3 className="font-archivo mt-4 text-lg font-extrabold tracking-[-0.015em] text-wl-ink">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#605d5d]">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
