import { WHATSAPP_HREF } from "./content";

const SIGN_IN_URL = "https://dash.rovty.com/login";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-wl-ink bg-wl-paper">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-5 px-5 sm:px-7">
        <a href="#b-top" className="flex items-center gap-2.5 no-underline">
          <span className="h-3.5 w-3.5 flex-shrink-0 bg-wed" />
          <span className="text-base font-black uppercase tracking-tight text-wl-ink">
            Rovty Wed
          </span>
        </a>
        <nav className="flex items-center gap-4 sm:gap-5">
          <a
            href="#build"
            className="hidden text-[12.5px] font-semibold text-wl-ink no-underline hover:text-wed-deep lg:inline"
          >
            Build one
          </a>
          <a
            href="#how"
            className="hidden text-[12.5px] font-semibold text-wl-ink no-underline hover:text-wed-deep lg:inline"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="hidden text-[12.5px] font-semibold text-wl-ink no-underline hover:text-wed-deep lg:inline"
          >
            Pricing
          </a>
          <a
            href={SIGN_IN_URL}
            className="text-[12.5px] font-semibold text-wl-ink no-underline hover:text-wed-deep"
          >
            Sign in
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-wed bg-wed px-3.5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-white no-underline hover:border-wed-deep hover:bg-wed-deep sm:px-[18px]"
          >
            WhatsApp us
          </a>
        </nav>
      </div>
    </header>
  );
}
