import { LayoutDashboard, Users, Grid2x2, Palette, Menu } from "lucide-react";
import type { AdminSection } from "./types";

// Shared between BottomNav (mobile) and Sidebar (desktop) so the two nav
// surfaces can never drift out of sync on labels/icons/order.
export const NAV_ITEMS: {
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
