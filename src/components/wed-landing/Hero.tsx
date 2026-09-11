import { PAGE_SECTIONS, WHATSAPP_HREF } from "./content";

export function Hero() {
  return (
    <section id="b-top" className="border-b-2 border-wl-ink">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-0 px-5 sm:px-7 md:grid-cols-2">
        <div className="py-[60px] pb-14 md:pr-10">
          <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.28em] text-wed-deep">
            wed.rovty.com
          </p>
          <h1 className="font-archivo m-0 mt-6 text-[44px] font-extrabold leading-[0.9] tracking-[-0.045em] text-balance text-wl-ink sm:text-7xl md:text-[104px]">
            One link your guests will actually open.
          </h1>
          <p className="mx-0 mt-[26px] max-w-[44ch] text-lg leading-relaxed text-[#3c3a39]">
            A designed invitation page, guest list, WhatsApp sending, RSVPs and
            seating — all in one place, styled exactly like your wedding. One
            payment, per wedding, from LKR 4,900.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-2.5">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-wed bg-wed px-[18px] py-3 text-[12.5px] font-bold uppercase tracking-[0.12em] text-white no-underline hover:border-wed-deep hover:bg-wed-deep"
            >
              Message us on WhatsApp
            </a>
            <a
              href="#build"
              className="inline-flex items-center gap-2 border-2 border-wl-ink px-[18px] py-3 text-[12.5px] font-bold uppercase tracking-[0.12em] text-wl-ink no-underline hover:bg-wed-soft"
            >
              Build one now
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-7 border-t-2 border-wl-ink py-10 pb-14 md:border-l-2 md:border-t-0 md:py-[60px] md:pl-10">
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#605d5d]">
              On this page
            </p>
            <div className="mt-[14px] flex flex-col">
              {PAGE_SECTIONS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  className="flex items-baseline gap-3 border-t border-[rgba(32,30,29,.16)] py-[11px] text-[14.5px] font-semibold text-wl-ink no-underline hover:text-wed-deep"
                >
                  <span className="text-[10.5px] font-bold tracking-[0.18em] text-[#9b9797]">
                    {s.n}
                  </span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[18px] border-t-2 border-wl-ink pt-4">
            <div>
              <div className="text-3xl font-extrabold leading-none tracking-[-0.03em] text-wl-ink">
                14
              </div>
              <div className="mt-[5px] text-[10px] font-bold uppercase tracking-[0.16em] text-[#605d5d]">
                Designs, not recolours
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none tracking-[-0.03em] text-wl-ink">
                0
              </div>
              <div className="mt-[5px] text-[10px] font-bold uppercase tracking-[0.16em] text-[#605d5d]">
                Apps for guests to install
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
