import { WED_TEMPLATES } from "./templates";

export function DesignsSection() {
  return (
    <section
      id="designs"
      className="scroll-mt-16 border-b-2 border-wl-ink bg-white"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-7">
        <div className="grid items-end gap-6 py-12 pb-[26px] sm:grid-cols-[1fr,auto]">
          <h2 className="font-archivo m-0 text-[30px] font-extrabold leading-[0.98] tracking-[-0.035em] text-wl-ink sm:text-5xl">
            <span className="mr-3.5 align-top text-[11px] font-bold tracking-[0.2em] text-wed">
              01
            </span>
            Fourteen designs
          </h2>
          <p className="m-0 max-w-[50ch] text-[15.5px] leading-relaxed text-[#3c3a39]">
            Each one has its own hero layout, its own typeface and its own
            opening animation — a Poruwa invitation is not the Chapel one in
            different colours.
          </p>
        </div>
        <div className="h-0.5 bg-wl-ink" />
        <div>
          {WED_TEMPLATES.map((t, i) => (
            <div
              key={t.id}
              className="grid grid-cols-[40px,1fr] items-center gap-3 border-b border-[rgba(32,30,29,.14)] py-[15px] hover:bg-wl-paper sm:grid-cols-[56px,1.1fr,1.4fr,1fr] sm:gap-5"
            >
              <span className="text-[11px] font-bold tracking-[0.18em] text-[#9b9797]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-lg font-extrabold tracking-[-0.015em] text-wl-ink sm:text-[19px]">
                {t.label}
              </span>
              <span className="hidden text-sm text-[#605d5d] sm:block">
                {t.desc}
              </span>
              <span className="hidden h-[26px] gap-0 border border-[rgba(32,30,29,.16)] sm:flex">
                <span className="flex-[2]" style={{ background: t.swatchBg }} />
                <span className="flex-1" style={{ background: t.gold }} />
                <span className="flex-1" style={{ background: t.rose }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
