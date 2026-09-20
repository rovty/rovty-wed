import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { DASHBOARD_ORIGIN, SITE_ORIGIN } from "@/lib/platform";

/** The same escape route is visible on phones, desktop, and onboarding. */
export function PlatformBar() {
  return (
    <nav
      aria-label="Rovty platform"
      className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-white/15 bg-[#111214] px-5 text-xs text-[#f3f2f2]"
    >
      <a
        href={DASHBOARD_ORIGIN}
        className="inline-flex min-h-11 items-center gap-2 font-semibold"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        All apps
      </a>
      <span className="font-semibold text-white/60">Rovty Wed</span>
      <a
        href={`${SITE_ORIGIN}/contact`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-1.5"
      >
        Get help
        <ArrowUpRight size={14} aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </nav>
  );
}
