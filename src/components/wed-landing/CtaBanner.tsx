import { WHATSAPP_HREF } from "./content";

const SIGN_IN_URL = "https://dash.rovty.com/login";

export function CtaBanner() {
  return (
    <section className="bg-wed text-white">
      <div className="mx-auto max-w-[1280px] px-5 py-[68px] pb-[72px] sm:px-7">
        <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.28em] text-white/85">
          Talk to a human
        </p>
        <h2 className="font-archivo mt-5 max-w-[22ch] text-[38px] font-extrabold leading-[0.9] tracking-[-0.045em] text-balance sm:text-7xl lg:text-[92px]">
          Send us your date on WhatsApp.
        </h2>
        <div
          className="mt-[34px] grid items-end gap-7"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}
        >
          <p className="m-0 max-w-[44ch] text-[17px] leading-relaxed">
            Tell us your names, your date and which design you liked.
            We&rsquo;ll set the invitation up and send you the link to check
            before anything goes out to your guests.
          </p>
          <div className="flex flex-col items-start gap-3.5">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-white bg-white px-5 py-[13px] text-[12.5px] font-bold uppercase tracking-[0.12em] text-wl-ink no-underline hover:border-wl-ink hover:bg-wl-ink hover:text-white"
            >
              Message us on WhatsApp
            </a>
            <p className="m-0 text-[13px]">
              Already set up?{" "}
              <a
                href={SIGN_IN_URL}
                className="font-bold text-white hover:underline"
              >
                Sign in to your dashboard
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
