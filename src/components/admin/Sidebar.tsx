import { ExternalLink, LogOut } from "lucide-react";
import type { AdminSection, Wedding } from "./types";
import { NAV_ITEMS } from "./nav";

// Desktop only (`md` and up) — BottomNav covers the same navigation on
// mobile. A standard fixed left sidebar rather than the phone's bottom
// tab bar, since a mouse-and-keyboard dashboard is used very differently
// from a one-thumb phone screen: everything should be reachable without
// scrolling to the bottom of a tall viewport.
export function Sidebar({
  wedding,
  active,
  onChange,
  onSignOut,
  inviteUrl,
}: {
  wedding: Wedding;
  active: AdminSection;
  onChange: (section: AdminSection) => void;
  onSignOut: () => void;
  inviteUrl: string;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] md:flex">
      <div className="border-b-2 border-[var(--admin-ink)] px-5 py-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold tracking-tight">ROVTY</span>
          <span className="text-lg font-extrabold tracking-tight text-[var(--admin-accent)]">
            WED
          </span>
        </div>
        <div className="mt-3 truncate text-sm font-bold">
          {wedding.bride} &amp; {wedding.groom}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-[var(--admin-muted)]">
          wed.rovty.com/{wedding.slug}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold"
              style={
                isActive
                  ? { background: "var(--admin-ink)", color: "#fff" }
                  : { color: "var(--admin-ink)" }
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1.5 border-t-2 border-[var(--admin-ink)] p-3">
        {wedding.published && (
          <a
            href={inviteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 border-2 border-[var(--admin-ink)] px-3 py-2 text-xs font-semibold"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View site
          </a>
        )}
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--admin-muted)]"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
