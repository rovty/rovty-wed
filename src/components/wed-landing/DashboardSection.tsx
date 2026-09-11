import { AdminDemo } from "./AdminDemo";

export function DashboardSection() {
  return (
    <section
      id="dashboard"
      className="scroll-mt-16 border-b-2 border-wl-ink bg-wl-paper"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-12 pb-14 sm:px-7">
        <h2 className="font-archivo m-0 text-[30px] font-extrabold leading-[0.98] tracking-[-0.035em] text-wl-ink sm:text-5xl">
          <span className="mr-3.5 align-top text-[11px] font-bold tracking-[0.2em] text-wed">
            05
          </span>
          Your dashboard
        </h2>
        <div className="my-6 h-0.5 bg-wl-ink sm:my-8" />
        <AdminDemo />
      </div>
    </section>
  );
}
