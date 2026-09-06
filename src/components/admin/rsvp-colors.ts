// One shared traffic-light palette for RSVP/invite status, used by the
// Guests filter chips, each guest row's background tint, and the
// Dashboard's "Latest replies" feed — so "green" always means the same
// thing (accepted) everywhere in the admin, not a slightly different
// green per screen.
export const RSVP_COLOR = {
  pending: "#b45309",
  yes: "#1a7f37",
  no: "var(--admin-accent-active)",
} as const;

// Faint tints of the same three colors, for backgrounds (a guest row, a
// list item) rather than borders/text.
export const RSVP_TINT = {
  pending: `color-mix(in srgb, ${RSVP_COLOR.pending} 14%, white)`,
  yes: `color-mix(in srgb, ${RSVP_COLOR.yes} 14%, white)`,
  no: `color-mix(in srgb, ${RSVP_COLOR.no} 14%, white)`,
} as const;
