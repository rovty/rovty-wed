import { SeatingDemo } from "./SeatingDemo";

export function SeatSection() {
  return (
    <section
      id="seat"
      className="scroll-mt-16 border-b-2 border-wl-ink bg-white"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-12 pb-14 sm:px-7">
        <h2 className="font-archivo m-0 text-[30px] font-extrabold leading-[0.98] tracking-[-0.035em] text-wl-ink sm:text-5xl">
          <span className="mr-3.5 align-top text-[11px] font-bold tracking-[0.2em] text-wed">
            05
          </span>
          No one asks where they&rsquo;re sitting
        </h2>
        <p className="mt-3.5 max-w-[56ch] text-[15.5px] leading-relaxed text-[#3c3a39]">
          Because nobody has to search. The personalised link you send each
          guest opens their invitation with their table already on it.
        </p>
        <div className="my-6 h-0.5 bg-wl-ink sm:my-8" />
        <SeatingDemo />
      </div>
    </section>
  );
}
