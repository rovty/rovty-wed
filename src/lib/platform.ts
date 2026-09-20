export const DASHBOARD_ORIGIN = new URL(
  import.meta.env.VITE_ROVTY_DASHBOARD_ORIGIN || "https://dash.rovty.com",
).origin;
export const SITE_ORIGIN = new URL(
  import.meta.env.VITE_ROVTY_SITE_ORIGIN || "https://rovty.com",
).origin;
export const WED_SIGN_IN_URL = `${DASHBOARD_ORIGIN}/open/wed`;

export const ADMIN_SECTIONS = [
  "home",
  "guests",
  "seating",
  "design",
  "more",
] as const;
export type AdminDestination = (typeof ADMIN_SECTIONS)[number];

export function adminSearch(search: Record<string, unknown>): {
  section?: AdminDestination;
} {
  return typeof search.section === "string" &&
    ADMIN_SECTIONS.includes(search.section as AdminDestination)
    ? { section: search.section as AdminDestination }
    : {};
}
