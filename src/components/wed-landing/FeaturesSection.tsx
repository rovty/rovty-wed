import { FEATURES, STEPS } from "./content";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative z-[2] flex flex-col gap-5 px-5 pt-[90px] sm:px-10 lg:px-[120px]"
    >
      <div className="flex flex-wrap items-end justify-between gap-10 pb-4">
        <h2 className="m-0 text-[34px] font-semibold leading-none tracking-[-0.04em] text-wl-ink sm:text-[52px]">
          Everything in one link.{" "}
          <span className="font-['Instrument_Serif',Georgia,serif] font-normal italic">
            Nothing to install.
          </span>
        </h2>
        <p className="m-0 max-w-[340px] text-[15.5px] leading-relaxed text-[#4f494b]">
          Guests open it in WhatsApp, Safari or Chrome. No app, no account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => {
          const dark = i === 1;
          return (
            <div
              key={f.title}
              className={
                dark
                  ? "flex flex-col gap-2.5 rounded-[28px] bg-wl-ink p-[26px] text-[#f6f1ee] shadow-[0_24px_50px_-28px_rgba(29,26,27,0.6)]"
                  : "flex flex-col gap-2.5 rounded-[28px] border border-white/85 bg-white/50 p-[26px] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_24px_50px_-34px_rgba(90,25,55,0.35)] backdrop-blur-[30px] backdrop-saturate-[1.7]"
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-xl"
                  style={{
                    background: dark
                      ? "rgba(126,224,166,0.14)"
                      : "rgba(122,32,72,0.1)",
                  }}
                >
                  <f.icon
                    size={20}
                    strokeWidth={1.9}
                    color={dark ? "#7ee0a6" : "var(--color-wed)"}
                  />
                </span>
                <span className="text-lg font-semibold tracking-[-0.02em]">
                  {f.title}
                </span>
              </div>
              <p
                className="m-0 text-[14.5px] leading-relaxed"
                style={{ color: dark ? "rgba(246,241,238,0.74)" : "#55504f" }}
              >
                {f.body}
              </p>
            </div>
          );
        })}
      </div>

      <ol
        aria-label="How it works"
        id="how"
        className="m-0 mt-1 grid scroll-mt-24 list-none grid-cols-1 gap-2 rounded-[28px] border border-white/85 bg-white/42 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_24px_50px_-34px_rgba(90,25,55,0.35)] backdrop-blur-[30px] backdrop-saturate-[1.7] sm:grid-cols-2 lg:grid-cols-4"
      >
        {STEPS.map((s, i) => (
          <li
            key={s.n}
            className="flex items-start gap-3.5 rounded-[22px] p-[18px_20px]"
            style={{
              background: i === 0 ? "rgba(255,255,255,0.65)" : "transparent",
            }}
          >
            <span
              className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
              style={{
                background:
                  i === 0 ? "var(--color-wed)" : "rgba(122,32,72,0.1)",
                color: i === 0 ? "#fff" : "var(--color-wed)",
              }}
            >
              {i + 1}
            </span>
            <span>
              <span className="block text-[15px] font-semibold text-wl-ink">
                {s.title}
              </span>
              <span className="mt-[3px] block text-[13px] leading-[1.45] text-[#55504f]">
                {s.body}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
