// Wedding data — was a hardcoded single-tenant constant here; the
// 20260904000000_multi_tenant.sql migration moved it into the `weddings`
// table (one row per customer), but nothing on the public site was ever
// updated to read from it. This is the one place that fetches it, so every
// public page/component gets it the same way.
import { supabase } from "@/integrations/supabase/client";

// Wedding-day times are always meant in venue-local time, not the viewer's
// or the server's — formatting pins to this zone explicitly so an overseas
// guest and our Cloudflare Worker (UTC) both see "9:07 AM", not their own
// local equivalent, and so SSR output and client hydration always agree.
const TZ = "Asia/Colombo";

export type PublicWedding = {
  slug: string;
  bride: string;
  groom: string;
  title: string;
  date: Date;
  endDate: Date | null;
  receptionDate: Date | null;
  receptionEnd: Date | null;
  venue: string | null;
  hall: string | null;
  address: string | null;
  description: string;
};

function toPublicWedding(row: {
  slug: string;
  bride: string;
  groom: string;
  event_date: string;
  event_end: string | null;
  reception_date: string | null;
  reception_end: string | null;
  venue: string | null;
  hall: string | null;
  address: string | null;
  description: string | null;
}): PublicWedding {
  const title = `${row.groom} & ${row.bride} Wedding`;
  return {
    slug: row.slug,
    bride: row.bride,
    groom: row.groom,
    title,
    date: new Date(row.event_date),
    endDate: row.event_end ? new Date(row.event_end) : null,
    receptionDate: row.reception_date ? new Date(row.reception_date) : null,
    receptionEnd: row.reception_end ? new Date(row.reception_end) : null,
    venue: row.venue,
    hall: row.hall,
    address: row.address,
    description:
      row.description ??
      `Join us as we celebrate the wedding of ${row.groom} & ${row.bride}.`,
  };
}

// There's no slug in the URL anywhere on the public site yet (only the
// admin side is per-owner) — this deployment only ever serves one published
// wedding today, so "the published one" is an unambiguous lookup. Once
// there's real multi-tenant public routing (a slug segment in the URL) this
// is the function to change to take that slug instead of guessing.
export async function fetchPublishedWedding(): Promise<PublicWedding | null> {
  const { data, error } = await supabase
    .from("weddings")
    .select(
      "slug, bride, groom, event_date, event_end, reception_date, reception_end, venue, hall, address, description",
    )
    .eq("published", true)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return toPublicWedding(data);
}

export function formatDayMonth(d: Date) {
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: TZ });
}

export function formatWeekdayYear(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", timeZone: TZ });
}

export function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
}

export function formatLongDate(d: Date) {
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
}

export function formatScriptDate(d: Date) {
  return `The ${d.toLocaleDateString("en-US", { day: "numeric", timeZone: TZ })}${ordinalSuffix(d, TZ)} of ${d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: TZ })}`;
}

function ordinalSuffix(d: Date, timeZone: string) {
  const day = Number(d.toLocaleDateString("en-US", { day: "numeric", timeZone }));
  if (day % 10 === 1 && day !== 11) return "st";
  if (day % 10 === 2 && day !== 12) return "nd";
  if (day % 10 === 3 && day !== 13) return "rd";
  return "th";
}

function toICSDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildICS(wedding: PublicWedding) {
  const dtStart = toICSDate(wedding.date);
  const dtEnd = toICSDate(wedding.endDate ?? wedding.date);
  const uid = `${wedding.slug}@rovty-wed`;
  const location = wedding.address ?? [wedding.venue, wedding.hall].filter(Boolean).join(", ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Rovty Wed//${wedding.slug}//EN`,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${wedding.title}`,
    `DESCRIPTION:${wedding.description.replace(/,/g, "\\,")}`,
    `LOCATION:${location.replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadICS(wedding: PublicWedding, filename = "wedding.ics") {
  const blob = new Blob([buildICS(wedding)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function googleCalendarUrl(wedding: PublicWedding) {
  const location = wedding.address ?? [wedding.venue, wedding.hall].filter(Boolean).join(", ");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: wedding.title,
    dates: `${toICSDate(wedding.date)}/${toICSDate(wedding.endDate ?? wedding.date)}`,
    details: wedding.description,
    location,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(wedding: PublicWedding) {
  const location = wedding.address ?? [wedding.venue, wedding.hall].filter(Boolean).join(", ");
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: wedding.title,
    startdt: wedding.date.toISOString(),
    enddt: (wedding.endDate ?? wedding.date).toISOString(),
    body: wedding.description,
    location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
