import { FAQS } from "./content";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="scroll-mt-16 border-b-2 border-wl-ink bg-wl-paper"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-12 pb-[52px] sm:px-7">
        <h2 className="font-archivo m-0 text-[30px] font-extrabold leading-[0.98] tracking-[-0.035em] text-wl-ink sm:text-5xl">
          <span className="mr-3.5 align-top text-[11px] font-bold tracking-[0.2em] text-wed">
            07
          </span>
          Questions couples ask
        </h2>
        <div className="mt-6 h-0.5 bg-wl-ink" />
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))",
            columnGap: 48,
          }}
        >
          {FAQS.map((q, i) => (
            <div
              key={q.q}
              className="border-b border-[rgba(32,30,29,.14)] py-[22px]"
            >
              <h3 className="font-archivo m-0 flex gap-3.5 text-[16.5px] font-extrabold tracking-[-0.01em]">
                <span className="pt-1 text-[10.5px] font-bold tracking-[0.18em] text-[#9b9797]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {q.q}
              </h3>
              <p className="mt-2 pl-[34px] text-sm leading-[1.65] text-[#605d5d]">
                {q.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
