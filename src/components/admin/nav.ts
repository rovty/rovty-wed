import {
  LayoutDashboard,
  Users,
  Grid2x2,
  Palette,
  UserCog,
} from "lucide-react";
import type { AdminSection } from "./types";

// Shared between BottomNav (mobile) and Sidebar (desktop) so the two nav
// surfaces can never drift out of sync on labels/icons/order.
// "more"'s label is "Team" — that's the only thing behind it (MoreSection
// is invite/members/sign-out), and calling it "More" in the nav read as a
// catch-all junk drawer rather than telling you what's actually there.
// The section id stays "more" internally so it doesn't ripple through
// every file that already switches on AdminSection.
export const NAV_ITEMS: {
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "guests", label: "Guests", icon: Users },
  { id: "seating", label: "Seating", icon: Grid2x2 },
  { id: "design", label: "Design", icon: Palette },
  { id: "more", label: "Team", icon: UserCog },
];
