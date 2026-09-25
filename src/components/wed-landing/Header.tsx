import { WHATSAPP_HREF } from "./content";

const SIGN_IN_URL = "/admin";

// Floating glass pill nav — replaces the old sticky ink/paper bar to match
// the "Rovty Wed Home" redesign (glassmorphism over ambient colour, not the
// flat Modernist header). See Hero.tsx for the ambient background it floats
// over.
export function Header() {
  return (
    <header className="relative z-[5] flex justify-center pt-5">
      <nav
        aria-label="Main"
        className="flex h-[60px] w-full max-w-[1200px] items-center justify-between gap-4 rounded-full border border-white/80 bg-white/55 py-0 pl-[22px] pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_-24px_rgba(90,25,55,0.35)] backdrop-blur-[28px] backdrop-saturate-[1.7]"
      >
        <a
          href="#top"
          className="flex items-center gap-2.5 text-wl-ink no-underline"
        >
          <span
            className="h-[22px] w-[22px] flex-shrink-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #b44d7b, var(--color-wed) 70%)",
            }}
          />
          <span className="text-base font-semibold tracking-[-0.02em]">
            Rovty{" "}
            <span className="font-['Instrument_Serif',Georgia,serif] text-[19px] font-normal italic">
              Wed
            </span>
          </span>
        </a>
        <div className="hidden items-center gap-[30px] md:flex">
          <a
            href="#designs"
            className="text-sm font-medium text-[#3a3536] no-underline"
          >
            Designs
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-[#3a3536] no-underline"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-[#3a3536] no-underline"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-[#3a3536] no-underline"
          >
            Questions
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={SIGN_IN_URL}
            className="flex h-11 items-center rounded-full px-[18px] text-sm font-medium text-wl-ink no-underline"
          >
            Sign in
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center rounded-full bg-wl-ink px-5 text-sm font-semibold text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
          >
            WhatsApp us
          </a>
        </div>
      </nav>
    </header>
  );
}
