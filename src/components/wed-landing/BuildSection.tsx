import { BuilderDemo } from "./BuilderDemo";

export function BuildSection() {
  return (
    <section
      id="build"
      className="scroll-mt-16 border-b-2 border-wl-ink bg-wl-paper"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-12 pb-14 sm:px-7">
        <div className="grid items-end gap-6 sm:grid-cols-[1fr,auto]">
          <h2 className="font-archivo m-0 text-[30px] font-extrabold leading-[0.98] tracking-[-0.035em] text-wl-ink sm:text-5xl">
            <span className="mr-3.5 align-top text-[11px] font-bold tracking-[0.2em] text-wed">
              01
            </span>
            Build yours now
          </h2>
          <p className="m-0 max-w-[50ch] text-[15.5px] leading-relaxed text-[#3c3a39]">
            Type your details, pick a design, scroll the phone. This is the real
            invitation your guests would receive — nothing is saved.
          </p>
        </div>
        <div className="my-6 h-0.5 bg-wl-ink sm:my-8" />
        <BuilderDemo />
      </div>
    </section>
  );
}
