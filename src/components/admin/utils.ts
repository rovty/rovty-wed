import type { Wedding } from "./types";

export function randCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

// Used by the guest list's "Message" action only until the owner writes
// their own wording in Design → Details (invite_message_before/after) —
// keeps the button useful before anyone's customized anything.
export function defaultInvitationMessage(wedding: Wedding, url: string) {
  const eventDate = new Date(wedding.event_date);
  return `*We're getting married!* 💍

With joyful hearts, we invite you to celebrate our wedding.

🗓️ *${eventDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}*
🕘 *${eventDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} onwards*
${wedding.venue ? `📍 *${wedding.venue}*\n` : ""}
💌 *View your invitation & RSVP:*
${url}

We can't wait to celebrate with you!

*${wedding.bride} & ${wedding.groom}* 💕`;
}

export function defaultSeatingMessage(wedding: Wedding, url: string) {
  const eventDate = new Date(wedding.event_date);
  return `❤️ We're almost there!

Your reception table is ready 🪑
Easily find your table & seating companions:

👉 ${url}

🗓️ ${eventDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}

Can't wait to celebrate with you! ❤️
${wedding.bride} & ${wedding.groom}`;
}

// `wedding.event_date` from the DB is a UTC ISO string; a <input
// type="datetime-local"> needs "YYYY-MM-DDTHH:MM" in the *browser's* local
// time. Truncating the UTC string directly (`.slice(0, 16)`) silently shows
// the wrong clock time whenever the browser isn't in UTC — this converts
// properly using local getters, the same way the round trip back to
// `.toISOString()` on save is already correct.
export function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// wa.me needs digits only, country code first, no leading "+" or "0" trunk
// prefix. This is a best-effort clean-up, not validation — numbers save as
// typed either way, this only shapes the link.
export function whatsappHref(phone: string, text: string) {
  const digits = phone.replace(/[^\d+]/g, "").replace(/^0+/, "");
  const withCountry = digits.startsWith("+") ? digits.slice(1) : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
}

export function initials(nameOrEmail: string) {
  const base = nameOrEmail.includes("@")
    ? nameOrEmail.split("@")[0]
    : nameOrEmail;
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const chars =
    parts.length >= 2 ? [parts[0][0], parts[1][0]] : [base.slice(0, 2)];
  return chars.join("").toUpperCase().slice(0, 2);
}

export function daysUntil(iso: string) {
  const ms =
    new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

// Short relative time for feed rows ("2h", "1d", "3w") — deliberately
// terser than Intl.RelativeTimeFormat's "2 hours ago" since it sits next
// to other metadata in a single line.
export function shortRelativeTime(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h`;
  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}d`;
  const weeks = days / 7;
  if (weeks < 5) return `${Math.floor(weeks)}w`;
  const months = days / 30;
  return `${Math.floor(months)}mo`;
}
