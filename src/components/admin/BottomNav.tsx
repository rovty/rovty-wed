import { LayoutDashboard, Users, Grid2x2, Palette, Menu } from "lucide-react";
import type { AdminSection } from "./types";

const ITEMS: {
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "guests", label: "Guests", icon: Users },
  { id: "seating", label: "Seating", icon: Grid2x2 },
  { id: "design", label: "Design", icon: Palette },
  { id: "more", label: "More", icon: Menu },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: AdminSection;
  onChange: (section: AdminSection) => void;
}) {
  return (
    <nav
      className="sticky bottom-0 z-20 grid shrink-0 border-t-2 border-[var(--admin-ink)] bg-[var(--admin-paper)]"
      style={{
        gridTemplateColumns: "repeat(5, 1fr)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex h-16 flex-col items-center justify-center gap-1.5"
            style={{
              color: isActive
                ? "var(--admin-accent-active)"
                : "var(--admin-muted)",
            }}
          >
            <Icon className="h-[19px] w-[19px]" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.1em]">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
