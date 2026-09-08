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
// these 14 has a genuinely different hero layout and opening animation —
// not just a recolor. TEMPLATE_META carries that structural choice per
// template; WEDDING_TEMPLATES (label/description only) is what the admin
// picker UI iterates over. Keep both, plus isDecorativeTemplate/
// hasLotusPetals below and the `weddings.template` check constraint
// (migration 20260907000000_wedding_templates_v2.sql), in sync.
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
  { id: "lotus", label: "Lotus", description: "Ivory & gold, falling lotus." },
  { id: "bloom", label: "Bloom", description: "Blush rose-gold, arched." },
] as const;
export type WeddingTemplate = (typeof WEDDING_TEMPLATES)[number]["id"];
const TEMPLATE_IDS = WEDDING_TEMPLATES.map((t) => t.id);

export type HeroLayout =
  "centered" | "framed" | "band" | "typo" | "photoTop" | "split" | "lotus";
export type OpenerKind =
  "envelope" | "ring" | "veil" | "gate" | "curtain" | "petals" | "lotus";
export type Motif =
  "diamond" | "geo" | "line" | "leaf" | "wave" | "deco" | "squiggle" | "lotus";

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
  lotus: { hero: "lotus", opener: "lotus", motif: "lotus" },
  bloom: { hero: "split", opener: "ring", motif: "leaf" },
};

// Only "classic" carries the falling-petal/corner-rose floral decoration —
// every other template is deliberately unadorned by that specific motif
// (they get their own personality through TEMPLATE_META + styles.css's
// .theme-* blocks instead). "lotus" gets its own separate falling-lotus/
// corner-vine decoration (hasLotusPetals below) rather than joining this
// set — it needs different assets (LotusPetals/LotusCorner, not
// RosePetals/RoseCorner), so folding it into the same boolean would force
// every call site to also branch on template just to pick the right pair.
const DECORATIVE_TEMPLATE_IDS = new Set<WeddingTemplate>(["classic"]);
export function isDecorativeTemplate(template: WeddingTemplate): boolean {
  return DECORATIVE_TEMPLATE_IDS.has(template);
}
const LOTUS_PETAL_TEMPLATE_IDS = new Set<WeddingTemplate>(["lotus"]);
export function hasLotusPetals(template: WeddingTemplate): boolean {
  return LOTUS_PETAL_TEMPLATE_IDS.has(template);
}
function isWeddingTemplate(v: string): v is WeddingTemplate {
  return (TEMPLATE_IDS as string[]).includes(v);
}

export type PublicWedding = {
  slug: string;
  bride: string;
  groom: string;
  groomParentsNames: string | null;
  brideParentsNames: string | null;
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
  shareImageUrl: string | null;
  mapsUrl: string | null;
  musicUrl: string | null;
};

function toPublicWedding(row: {
  slug: string;
  bride: string;
  groom: string;
  groom_parents_names: string | null;
  bride_parents_names: string | null;
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
  share_image_url: string | null;
  maps_url: string | null;
  music_url: string | null;
}): PublicWedding {
  const title = `${row.groom} & ${row.bride} Wedding`;
  return {
    slug: row.slug,
    bride: row.bride,
    groom: row.groom,
    groomParentsNames: row.groom_parents_names,
    brideParentsNames: row.bride_parents_names,
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
    shareImageUrl: row.share_image_url,
    mapsUrl: row.maps_url,
    musicUrl: row.music_url,
  };
}

const WEDDING_COLUMNS =
  "slug, bride, groom, groom_parents_names, bride_parents_names, event_date, event_end, reception_date, reception_end, venue, hall, address, description, template, couple_photo_url, venue_photo_url, share_image_url, maps_url, music_url";

// The "families" kicker several hero layouts open with (WeddingSite.tsx,
// InvitationOpener.tsx's VeilOpener) — swapped for the couple's actual
// parents' names when they've filled either or both in (Design → Details
// → Couple). Free text on both sides, so this never assumes a "Mr. & Mrs."
// shape or which side has which parent; it just credits whatever the
// couple typed. Falls back to `fallback` (each template's own generic
// wording — "Together with their families", lotus's "With the blessings
// of their families", etc.) when neither is set, so this is purely
// additive — no template needs its own opt-in, just its own fallback text.
export function familyLine(
  wedding: PublicWedding,
  fallback = "Together with their families",
): string {
  const groom = wedding.groomParentsNames?.trim();
  const bride = wedding.brideParentsNames?.trim();
  if (groom && bride)
    return `Together with the families of ${groom} & ${bride}`;
  if (groom || bride) return `Together with the family of ${groom || bride}`;
  return fallback;
}

// Couple photo, venue photo, background music, the hall's floor-plan photo,
// and the link-preview share image, all uploaded from the admin's
// Design/Details screen. Storage RLS (20260904070000_wedding_media.sql)
// keys off the object path's first folder segment being the wedding's id —
// that's the whole access-control story, so the path shape here isn't
// cosmetic. floor_plan and share both reuse the same bucket/policies
// (image/jpeg|png|webp is already allowed) rather than needing a bucket of
// their own.
export type WeddingMediaKind =
  "couple" | "venue" | "music" | "floor_plan" | "share";
const MEDIA_EXT_FALLBACK: Record<WeddingMediaKind, string> = {
  couple: "jpg",
  venue: "jpg",
  music: "mp3",
  floor_plan: "jpg",
  share: "jpg",
};

// WhatsApp's own link-preview crawler is one thing on iOS and something
// stricter on Android: iOS goes through Apple's shared Link Presentation
// stack, which decodes and downsamples pretty much whatever you throw at
// it, while Android's WhatsApp fetches og:image itself and quietly skips
// rendering a thumbnail (no error, no retry — the message just sends
// without a preview) once the file is too big or too tall. A phone-camera
// photo picked straight out of the gallery for "Share image" (several MB,
// 3000px+ on a side) sails past that ceiling — hence "works when an
// iPhone sends the invite link, not when an Android does". couple/venue
// don't go through this: couplePhotoUrl is framed full-bleed on the
// invitation page itself (often portrait) and would crop wrong at a
// fixed 1200×630, so only the dedicated share image gets normalized.
// Re-encoding to JPEG here also sidesteps Android WhatsApp's flaky
// handling of webp/gif source images for previews.
const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_HEIGHT = 630;
const SHARE_IMAGE_MAX_BYTES = 300 * 1024;

async function prepareShareImage(file: File): Promise<File> {
  if (typeof document === "undefined") return file; // never runs server-side, but guard anyway
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read that image."));
      el.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = SHARE_IMAGE_WIDTH;
    canvas.height = SHARE_IMAGE_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // Cover-fit crop into the 1200×630 box WhatsApp/OG expect, same idea
    // as CSS `object-fit: cover` — scale to fill, then center-crop the
    // overhang on whichever axis is longer.
    const scale = Math.max(
      SHARE_IMAGE_WIDTH / img.width,
      SHARE_IMAGE_HEIGHT / img.height,
    );
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    ctx.drawImage(
      img,
      (SHARE_IMAGE_WIDTH - drawWidth) / 2,
      (SHARE_IMAGE_HEIGHT - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );

    const toJpegBlob = (quality: number) =>
      new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
      );

    // Step quality down until it fits Android WhatsApp's practical size
    // budget, or we hit a floor not worth compressing past.
    let blob: Blob | null = null;
    for (const quality of [0.85, 0.75, 0.65, 0.55, 0.45]) {
      blob = await toJpegBlob(quality);
      if (blob && blob.size <= SHARE_IMAGE_MAX_BYTES) break;
    }
    if (!blob) return file;

    return new File([blob], "share.jpg", { type: "image/jpeg" });
  } catch {
    // Any decode failure (e.g. a format canvas can't read) — fall back to
    // uploading the original rather than blocking the save entirely.
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadWeddingMedia(
  weddingId: string,
  kind: WeddingMediaKind,
  file: File,
): Promise<string> {
  const uploadFile = kind === "share" ? await prepareShareImage(file) : file;
  const ext =
    uploadFile.name.split(".").pop()?.toLowerCase() || MEDIA_EXT_FALLBACK[kind];
  const path = `${weddingId}/${kind}.${ext}`;
  const { error } = await supabase.storage
    .from("wedding-media")
    .upload(path, uploadFile, {
      upsert: true,
      contentType: uploadFile.type || undefined,
    });
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
