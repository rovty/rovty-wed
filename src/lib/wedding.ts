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

// Unlike the site's other shared-tree templates historically, each of
// these 13 has a genuinely different hero layout and opening animation —
// not just a recolor. TEMPLATE_META carries that structural choice per
// template; WEDDING_TEMPLATES (label/description only) is what the admin
// picker UI iterates over. Keep both, plus isDecorativeTemplate below and
// the `weddings.template` check constraint (migration
// 20260907000000_wedding_templates_v2.sql), in sync.
export const WEDDING_TEMPLATES = [
  {
    id: "classic",
    label: "Classic",
    description: "Rose & gold, falling petals.",
  },
  { id: "poruwa", label: "Poruwa", description: "Sri Lankan, antique gold." },
  { id: "thali", label: "Thali", description: "Pastel marigold & gold." },
  { id: "chapel", label: "Chapel", description: "Powder blue & pearl." },
  { id: "nikkah", label: "Nikkah", description: "Pastel sage & gold." },
  { id: "noir", label: "Noir", description: "Champagne on charcoal." },
  {
    id: "editorial",
    label: "Editorial",
    description: "Oat, clay & gold rules.",
  },
  { id: "quiet", label: "Quiet", description: "Pearl white, gold hairline." },
  { id: "garden", label: "Garden", description: "Pastel sage & cream." },
  { id: "shoreline", label: "Shoreline", description: "Pastel aqua & sand." },
  { id: "deco", label: "Deco", description: "Pastel jade & gilt." },
  { id: "film", label: "Film", description: "Warm sepia, photo-led." },
  { id: "bloom", label: "Bloom", description: "Blush rose-gold, arched." },
] as const;
export type WeddingTemplate = (typeof WEDDING_TEMPLATES)[number]["id"];
const TEMPLATE_IDS = WEDDING_TEMPLATES.map((t) => t.id);

export type HeroLayout =
  "centered" | "framed" | "band" | "typo" | "photoTop" | "split";
export type OpenerKind =
  "envelope" | "ring" | "veil" | "gate" | "curtain" | "petals";
export type Motif =
  "diamond" | "geo" | "line" | "leaf" | "wave" | "deco" | "squiggle";

export const TEMPLATE_META: Record<
  WeddingTemplate,
  { hero: HeroLayout; opener: OpenerKind; motif: Motif }
> = {
  classic: { hero: "centered", opener: "envelope", motif: "diamond" },
  poruwa: { hero: "framed", opener: "ring", motif: "diamond" },
  thali: { hero: "band", opener: "veil", motif: "geo" },
  chapel: { hero: "centered", opener: "curtain", motif: "diamond" },
  nikkah: { hero: "framed", opener: "ring", motif: "geo" },
  noir: { hero: "typo", opener: "curtain", motif: "line" },
  editorial: { hero: "split", opener: "veil", motif: "line" },
  quiet: { hero: "typo", opener: "petals", motif: "line" },
  garden: { hero: "centered", opener: "petals", motif: "leaf" },
  shoreline: { hero: "photoTop", opener: "curtain", motif: "wave" },
  deco: { hero: "framed", opener: "gate", motif: "deco" },
  film: { hero: "photoTop", opener: "curtain", motif: "line" },
  bloom: { hero: "split", opener: "ring", motif: "leaf" },
};

// Only "classic" carries the falling-petal/corner-rose floral decoration —
// every other template is deliberately unadorned by that specific motif
// (they get their own personality through TEMPLATE_META + styles.css's
// .theme-* blocks instead).
const DECORATIVE_TEMPLATE_IDS = new Set<WeddingTemplate>(["classic"]);
export function isDecorativeTemplate(template: WeddingTemplate): boolean {
  return DECORATIVE_TEMPLATE_IDS.has(template);
}
function isWeddingTemplate(v: string): v is WeddingTemplate {
  return (TEMPLATE_IDS as string[]).includes(v);
}

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
  template: WeddingTemplate;
  couplePhotoUrl: string | null;
  venuePhotoUrl: string | null;
  mapsUrl: string | null;
  musicUrl: string | null;
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
  template: string;
  couple_photo_url: string | null;
  venue_photo_url: string | null;
  maps_url: string | null;
  music_url: string | null;
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
    template: isWeddingTemplate(row.template) ? row.template : "classic",
    couplePhotoUrl: row.couple_photo_url,
    venuePhotoUrl: row.venue_photo_url,
    mapsUrl: row.maps_url,
    musicUrl: row.music_url,
  };
}

const WEDDING_COLUMNS =
  "slug, bride, groom, event_date, event_end, reception_date, reception_end, venue, hall, address, description, template, couple_photo_url, venue_photo_url, maps_url, music_url";

// Couple photo, venue photo, background music, and the hall's floor-plan
// photo, all uploaded from the admin's Design/Details screen. Storage RLS
// (20260904070000_wedding_media.sql) keys off the object path's first
// folder segment being the wedding's id — that's the whole access-control
// story, so the path shape here isn't cosmetic. floor_plan reuses the same
// bucket/policies (image/jpeg|png|webp is already allowed) rather than
// needing a bucket of its own.
export type WeddingMediaKind = "couple" | "venue" | "music" | "floor_plan";
const MEDIA_EXT_FALLBACK: Record<WeddingMediaKind, string> = {
  couple: "jpg",
  venue: "jpg",
  music: "mp3",
  floor_plan: "jpg",
};

export async function uploadWeddingMedia(
  weddingId: string,
  kind: WeddingMediaKind,
  file: File,
): Promise<string> {
  const ext =
    file.name.split(".").pop()?.toLowerCase() || MEDIA_EXT_FALLBACK[kind];
  const path = `${weddingId}/${kind}.${ext}`;
  const { error } = await supabase.storage
    .from("wedding-media")
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw error;
  const { data } = supabase.storage.from("wedding-media").getPublicUrl(path);
  // Upsert keeps the same URL across re-uploads — cache-bust with a query
  // param so a replaced photo/track actually shows up instead of the
  // browser (or a CDN) serving the old cached response for that URL.
  return `${data.publicUrl}?v=${Date.now()}`;
}

// Kept for the root `/` route — a convenience alias to "whichever wedding is
// published" for this single-tenant deployment. The real, shareable public
// URL is /$slug (fetchWeddingBySlug below), which is what the admin's own
// "Public link" points guests at and what actually scales to more than one
// customer sharing this Worker.
export async function fetchPublishedWedding(): Promise<PublicWedding | null> {
  const { data, error } = await supabase
    .from("weddings")
    .select(WEDDING_COLUMNS)
    .eq("published", true)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return toPublicWedding(data);
}

export async function fetchWeddingBySlug(
  slug: string,
): Promise<PublicWedding | null> {
  const { data, error } = await supabase
    .from("weddings")
    .select(WEDDING_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return toPublicWedding(data);
}

export function formatDayMonth(d: Date) {
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });
}

export function formatWeekdayYear(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    timeZone: TZ,
  });
}

export function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function formatLongDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  });
}

export function formatScriptDate(d: Date) {
  return `The ${d.toLocaleDateString("en-US", { day: "numeric", timeZone: TZ })}${ordinalSuffix(d, TZ)} of ${d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: TZ })}`;
}

function ordinalSuffix(d: Date, timeZone: string) {
  const day = Number(
    d.toLocaleDateString("en-US", { day: "numeric", timeZone }),
  );
  if (day % 10 === 1 && day !== 11) return "st";
  if (day % 10 === 2 && day !== 12) return "nd";
  if (day % 10 === 3 && day !== 13) return "rd";
  return "th";
}

function toICSDate(d: Date) {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function buildICS(wedding: PublicWedding) {
  const dtStart = toICSDate(wedding.date);
  const dtEnd = toICSDate(wedding.endDate ?? wedding.date);
  const uid = `${wedding.slug}@rovty-wed`;
  const location =
    wedding.address ?? [wedding.venue, wedding.hall].filter(Boolean).join(", ");
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
  const blob = new Blob([buildICS(wedding)], {
    type: "text/calendar;charset=utf-8",
  });
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
  const location =
    wedding.address ?? [wedding.venue, wedding.hall].filter(Boolean).join(", ");
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
  const location =
    wedding.address ?? [wedding.venue, wedding.hall].filter(Boolean).join(", ");
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
