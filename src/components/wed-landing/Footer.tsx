const SIGN_IN_URL = "/admin";

export function Footer() {
  return (
    <footer className="relative z-[2] mt-auto px-5 pb-10 pt-[90px] sm:px-10 lg:px-[120px]">
      <div className="flex flex-col items-start gap-4 border-t border-black/10 pt-6 text-[13.5px] text-[#5a5456] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="h-[18px] w-[18px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #b44d7b, var(--color-wed) 70%)",
            }}
          />
          <span className="font-semibold text-wl-ink">
            Rovty{" "}
            <span className="font-['Instrument_Serif',Georgia,serif] text-base font-normal italic">
              Wed
            </span>
          </span>
          <span>· A product by Rovty</span>
        </div>
        <div className="flex flex-wrap gap-6">
          <a href="/templates" className="text-[#3a3536] no-underline">
            Collection
          </a>
          <a
            href="https://rovty.com/privacy"
            className="text-[#3a3536] no-underline"
          >
            Privacy
          </a>
          <a
            href="https://rovty.com/terms"
            className="text-[#3a3536] no-underline"
          >
            Terms
          </a>
          <a href={SIGN_IN_URL} className="text-[#3a3536] no-underline">
            Sign in
          </a>
        </div>
      </div>
    </footer>
  );
}
