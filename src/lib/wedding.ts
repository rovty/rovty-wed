import {
  WEDDING_THEMES,
  LEGACY_TEMPLATE_IDS,
  baseTemplate,
  type LegacyTemplate,
  type SupportedTemplate,
} from "./wedding-themes";
import {
  isSignatureTemplate,
  signatureFontsHref,
  type SignatureTemplateId,
} from "./wedding-signature";
import { hostingAvailable } from "@/lib/platform/hosting.functions";
// Wedding data — was a hardcoded single-tenant constant here; the
// 20260904000000_multi_tenant.sql migration moved it into the `weddings`
// table (one row per customer), but nothing on the public site was ever
// updated to read from it. This is the one place that fetches it, so every
// public page/component gets it the same way.
import { supabase } from "@/integrations/supabase/client";
import { normalizeDesign, type DesignConfig } from "@/lib/studio/design";

// Wedding-day times are always meant in venue-local time, not the viewer's
// or the server's — formatting pins to this zone explicitly so an overseas
// guest and our Cloudflare Worker (UTC) both see "9:07 AM", not their own
// local equivalent, and so SSR output and client hydration always agree.
const TZ = "Asia/Colombo";

// Rose retains the persisted `classic` ID. Legacy invitations remain readable.
export const WEDDING_TEMPLATES = WEDDING_THEMES;
// The 16 bespoke "signature" designs (wedding-signature.ts) are a separate,
// parallel collection — see that file's header for why they can't join
// WEDDING_THEMES. WeddingTemplate covers both; TEMPLATE_META, TEMPLATE_
// FONT_FAMILIES and the rest of the palette/hero machinery below stay keyed
// by SupportedTemplate only, since signature ids never reach them —
// WeddingSite.tsx dispatches to components/wedding-templates/ for those
// before any of that runs.
export type WeddingTemplate = SupportedTemplate | SignatureTemplateId;
const TEMPLATE_IDS: string[] = [
  ...LEGACY_TEMPLATE_IDS,
  ...WEDDING_THEMES.map((t) => t.id),
];

export type HeroLayout =
  "centered" | "framed" | "band" | "typo" | "photoTop" | "split" | "lotus";
export type OpenerKind =
  "envelope" | "ring" | "veil" | "gate" | "curtain" | "petals" | "lotus";
export type Motif =
  "diamond" | "geo" | "line" | "leaf" | "wave" | "deco" | "squiggle" | "lotus";

// How the couple photo is framed in the body of the page. This — together
// with `.theme-*`'s card/radius tokens — is what makes the templates differ
// below the hero rather than only in it.
//   portrait  tall 4:5 image with soft corners (romantic templates)
//   arch      Roman-arch top (chapel/bloom/garden — the "wedding arch" cliché
//             done well: one shape, not a frame-of-frames)
//   editorial full-bleed to the section edge, hard corners, caption rule
//   framed    thin double gold rule around a 4:5 image (traditional)
//   film      3:2 landscape with grain/sepia (photo-led templates)
//   circle    round medallion (quiet/shoreline — small, precious)
export type PhotoFrame =
  "portrait" | "arch" | "editorial" | "framed" | "film" | "circle";

// Whether body sections read as cards on the background ("card"), as
// hairline-ruled blocks with no fill ("rule"), or as filled bands that
// alternate with the page background ("band").
export type SectionStyle = "card" | "rule" | "band";

const LEGACY_TEMPLATE_META: Record<
  LegacyTemplate,
  {
    hero: HeroLayout;
    opener: OpenerKind;
    motif: Motif;
    photo: PhotoFrame;
    sections: SectionStyle;
  }
> = {
  classic: {
    hero: "centered",
    opener: "envelope",
    motif: "diamond",
    photo: "portrait",
    sections: "card",
  },
  poruwa: {
    hero: "framed",
    opener: "ring",
    motif: "diamond",
    photo: "framed",
    sections: "rule",
  },
  thali: {
    hero: "band",
    opener: "veil",
    motif: "geo",
    photo: "arch",
    sections: "band",
  },
  chapel: {
    hero: "centered",
    opener: "curtain",
    motif: "diamond",
    photo: "arch",
    sections: "card",
  },
  nikkah: {
    hero: "framed",
    opener: "ring",
    motif: "geo",
    photo: "framed",
    sections: "rule",
  },
  noir: {
    hero: "typo",
    opener: "curtain",
    motif: "line",
    photo: "editorial",
    sections: "rule",
  },
  editorial: {
    hero: "split",
    opener: "veil",
    motif: "line",
    photo: "editorial",
    sections: "rule",
  },
  quiet: {
    hero: "typo",
    opener: "petals",
    motif: "line",
    photo: "circle",
    sections: "rule",
  },
  garden: {
    hero: "centered",
    opener: "petals",
    motif: "leaf",
    photo: "arch",
    sections: "card",
  },
  shoreline: {
    hero: "photoTop",
    opener: "curtain",
    motif: "wave",
    photo: "circle",
    sections: "band",
  },
  deco: {
    hero: "framed",
    opener: "gate",
    motif: "deco",
    photo: "framed",
    sections: "band",
  },
  film: {
    hero: "photoTop",
    opener: "curtain",
    motif: "line",
    photo: "film",
    sections: "rule",
  },
  lotus: {
    hero: "lotus",
    opener: "lotus",
    motif: "lotus",
    photo: "portrait",
    sections: "card",
  },
  bloom: {
    hero: "split",
    opener: "ring",
    motif: "leaf",
    photo: "arch",
    sections: "card",
  },
};

// Keyed by SupportedTemplate, not the wider WeddingTemplate — the 16
// signature ids (wedding-signature.ts) never index this. Every call site
// below only runs for a non-signature wedding.template, since WeddingSite()
// dispatches signature ids to components/wedding-templates/ first.
export const TEMPLATE_META = Object.fromEntries(
  TEMPLATE_IDS.map((id) => [
    id,
    LEGACY_TEMPLATE_META[baseTemplate(id as SupportedTemplate)],
  ]),
) as Record<SupportedTemplate, (typeof LEGACY_TEMPLATE_META)[LegacyTemplate]>;

// Google Fonts families each template actually uses (display / script /
// kicker — see the matching `.theme-*` blocks in styles.css). Loading only
// the current template's families instead of all 23 at once cuts the guest
// page's blocking font CSS from ~50 KB to a few KB. Inter is the shared body
// face for every template; Archivo is the admin/landing UI face.
const FONT_INTER = "family=Inter:wght@300;400;500;600;700";
const FONT_ARCHIVO = "family=Archivo:wght@400;500;600;700;800";
const FONT_CORMORANT =
  "family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500";
const FONT_PLAYFAIR =
  "family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400";
const TEMPLATE_FONT_FAMILIES: Record<LegacyTemplate, string[]> = {
  classic: [FONT_PLAYFAIR, FONT_CORMORANT],
  poruwa: [
    "family=Cinzel:wght@400;600",
    FONT_CORMORANT,
    "family=Mukta:wght@400;600",
  ],
  thali: ["family=Rozha+One", FONT_CORMORANT, "family=Mukta:wght@400;600"],
  chapel: [FONT_CORMORANT, "family=Lato:wght@400;700"],
  nikkah: [
    "family=Amiri:ital,wght@0,400;0,700;1,400",
    "family=Jost:wght@400;500;600",
  ],
  noir: [
    "family=Bodoni+Moda:ital,wght@0,400;0,500;1,400",
    "family=Jost:wght@400;500;600",
  ],
  editorial: ["family=Instrument+Serif:ital@0;1", FONT_ARCHIVO],
  quiet: ["family=Manrope:wght@400;600;800", FONT_CORMORANT],
  garden: ["family=Newsreader:ital,wght@0,400;0,500;1,400;1,500"],
  shoreline: [
    "family=Tenor+Sans",
    FONT_CORMORANT,
    "family=Nunito+Sans:wght@400;600",
  ],
  deco: ["family=Poiret+One", "family=Josefin+Sans:wght@300;400;600"],
  film: [
    "family=Crimson+Pro:ital,wght@0,400;1,400",
    "family=IBM+Plex+Sans:wght@400;500",
  ],
  lotus: [FONT_PLAYFAIR, FONT_CORMORANT, "family=Lato:wght@400;700"],
  bloom: ["family=Marcellus", FONT_CORMORANT, "family=Outfit:wght@400;500;600"],
};

function googleFontsHref(families: string[]): string {
  return `https://fonts.googleapis.com/css2?${[...new Set(families)].join("&")}&display=swap`;
}

/** Stylesheet URL for exactly the fonts one template needs (plus Inter). */
export function templateFontsHref(template: WeddingTemplate): string {
  if (isSignatureTemplate(template)) return signatureFontsHref(template);
  return googleFontsHref([
    FONT_INTER,
    ...TEMPLATE_FONT_FAMILIES[baseTemplate(template)],
  ]);
}

/** Stylesheet URL for the admin portal / product landing (Archivo + Inter). */
export const UI_FONTS_HREF = googleFontsHref([FONT_ARCHIVO, FONT_INTER]);

/** Stylesheet URL for every template — only for the admin template picker preview. */
export const ALL_TEMPLATE_FONTS_HREF = googleFontsHref([
  FONT_INTER,
  FONT_ARCHIVO,
  ...Object.values(TEMPLATE_FONT_FAMILIES).flat(),
]);

/** `<link>` descriptors for TanStack Router `head()`; preconnects included. */
type HeadLink = React.ComponentProps<"link">;
export function fontLinks(href: string): HeadLink[] {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    { rel: "stylesheet", href },
  ];
}

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
export function isWeddingTemplate(v: string): v is WeddingTemplate {
  return (TEMPLATE_IDS as string[]).includes(v) || isSignatureTemplate(v);
}

export type PublicWedding = {
  design?: DesignConfig | null;
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
  floorPlanUrl: string | null;
  mapsUrl: string | null;
  musicUrl: string | null;
};

export function toPublicWedding(row: {
  design?: unknown;
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
  floor_plan_url: string | null;
  maps_url: string | null;
  music_url: string | null;
}): PublicWedding {
  const title = `${row.groom} & ${row.bride} Wedding`;
  return {
    design: normalizeDesign(row.design),
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
    floorPlanUrl: row.floor_plan_url,
    mapsUrl: row.maps_url,
    musicUrl: row.music_url,
  };
}

const WEDDING_COLUMNS =
  "slug, bride, groom, groom_parents_names, bride_parents_names, event_date, event_end, reception_date, reception_end, venue, hall, address, description, template, couple_photo_url, venue_photo_url, share_image_url, floor_plan_url, maps_url, music_url";

// The "families" kicker several hero layouts open with (WeddingSite.tsx,
// InvitationOpener.tsx's VeilOpener) — swapped for the couple's actual
// parents' names when they've filled either or both in (Design → Details
// → Couple). Free text on both sides, so this never assumes a "Mr. & Mrs."
// shape or which side has which parent; it just credits whatever the
// couple typed. Falls back to `fallback` (each template's own generic
// wording — "Together with their families", lotus's "With the blessings
// of their families", etc.) when neither is set, so this is purely
// additive — no template needs its own opt-in, just its own fallback text.
//
// Two names ("Mr and Mrs Athukorala" / "Mr and Mrs Rathnayaka") easily run
// well past what the kicker's width can hold on one line, and left to
// plain CSS wrapping that breaks wherever it runs out of room — mid-name,
// or stranding a lone "&" — rather than at a sensible point. \n's here put
// the break exactly at "of" / before "&" / after "&" instead; every call
// site renders this with `whitespace-pre-line` so those breaks actually
// take effect (plain HTML text collapses \n to a space otherwise).
export function familyLine(
  wedding: PublicWedding,
  fallback = "Together with their families",
): string {
  const groom = wedding.groomParentsNames?.trim();
  const bride = wedding.brideParentsNames?.trim();
  if (groom && bride)
    return `Together with the families of\n${groom}\n&\n${bride}`;
  if (groom || bride) return `Together with the family of\n${groom || bride}`;
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

    // Most wedding photos are portrait, so a hard cover-crop into a
    // landscape box would slice off heads/feet. Instead: a cover-fit,
    // blurred, darkened copy of the same photo fills the box edge to
    // edge as a backdrop, then the whole uncropped photo sits centered
    // on top at contain-fit — nothing in the couple's photo is ever cut
    // off, and a portrait source still fills a landscape card instead of
    // leaving hard bars. Wide/landscape sources just fill the box on
    // their own with barely any backdrop showing.
    const coverScale = Math.max(
      SHARE_IMAGE_WIDTH / img.width,
      SHARE_IMAGE_HEIGHT / img.height,
    );
    const bgWidth = img.width * coverScale;
    const bgHeight = img.height * coverScale;
    ctx.filter = "blur(24px)";
    ctx.drawImage(
      img,
      (SHARE_IMAGE_WIDTH - bgWidth) / 2,
      (SHARE_IMAGE_HEIGHT - bgHeight) / 2,
      bgWidth,
      bgHeight,
    );
    ctx.filter = "none";
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT);

    const containScale = Math.min(
      SHARE_IMAGE_WIDTH / img.width,
      SHARE_IMAGE_HEIGHT / img.height,
    );
    const drawWidth = img.width * containScale;
    const drawHeight = img.height * containScale;
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

// The only public read path: a wedding is addressed by slug and must be
// published. There is deliberately no "whichever wedding is published"
// helper any more — every guest-facing route is under /$slug.
export async function fetchWeddingBySlug(
  slug: string,
): Promise<PublicWedding | null> {
  if (!(await hostingAvailable({ data: slug }))) return null;
  const { data, error } = await supabase
    .from("weddings")
    .select(`${WEDDING_COLUMNS}, design`)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  // During a rolling deployment, keep legacy invitations available until
  // the additive studio migration has reached this database.
  if (error?.code === "42703" || error?.code === "PGRST204") {
    const legacy = await supabase
      .from("weddings")
      .select(WEDDING_COLUMNS)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    return legacy.data ? toPublicWedding(legacy.data) : null;
  }
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
