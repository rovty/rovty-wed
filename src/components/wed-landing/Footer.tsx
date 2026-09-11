import { WHATSAPP_HREF } from "./content";

const SIGN_IN_URL = "https://dash.rovty.com/login";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-wl-ink text-wl-paper">
      <div
        className="mx-auto grid max-w-[1280px] gap-8 px-5 py-11 pb-10 sm:px-7"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-3.5 w-3.5 bg-wed" />
            <span className="text-[17px] font-black uppercase tracking-tight">
              Rovty Wed
            </span>
          </div>
          <p className="mt-3.5 max-w-[30ch] text-[13px] leading-relaxed text-wl-paper/70">
            Wedding invitations, guest lists, RSVPs and seating in one link. A
            product by Rovty (Pvt) Ltd, Sri Lanka.
          </p>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-wl-paper/50">
            Product
          </div>
          <div className="mt-3.5 flex flex-col gap-2.5 text-[13.5px]">
            <a
              href="#designs"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Designs
            </a>
            <a
              href="#build"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Build one
            </a>
            <a
              href="#pricing"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Pricing
            </a>
            <a
              href="https://rovty.com/pricing/wed"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Full pricing page
            </a>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-wl-paper/50">
            Company
          </div>
          <div className="mt-3.5 flex flex-col gap-2.5 text-[13.5px]">
            <a
              href="https://rovty.com"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Rovty.com
            </a>
            <a
              href="https://rovty.com/privacy"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Privacy
            </a>
            <a
              href="https://rovty.com/terms"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Terms
            </a>
            <a
              href="https://rovty.com/security"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Security
            </a>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-wl-paper/50">
            Get started
          </div>
          <div className="mt-3.5 flex flex-col gap-2.5 text-[13.5px]">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              WhatsApp us
            </a>
            <a
              href={SIGN_IN_URL}
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Sign in
            </a>
            <a
              href="https://rovty.com/contact"
              className="text-wl-paper no-underline hover:text-wed-soft"
            >
              Contact form
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-wl-paper/20">
        <div className="mx-auto max-w-[1280px] px-5 py-[18px] pb-[26px] text-xs text-wl-paper/60 sm:px-7">
          © {year} Rovty (Pvt) Ltd. wed.rovty.com
        </div>
      </div>
    </footer>
  );
}
