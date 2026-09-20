import type { CSSProperties } from "react";

export const SECTION_TYPES = [
  "hero",
  "introduction",
  "date",
  "countdown",
  "story",
  "schedule",
  "venue",
  "gallery",
  "video",
  "family",
  "party",
  "rsvp",
  "guestbook",
  "map",
  "accommodation",
  "dress-code",
  "registry",
  "contact",
  "calendar",
  "seating",
  "footer",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];
export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Welcome",
  introduction: "Couple introduction",
  date: "Wedding date",
  countdown: "Countdown",
  story: "Our story",
  schedule: "The celebrations",
  venue: "Venue",
  gallery: "Photo gallery",
  video: "Wedding film",
  family: "Our families",
  party: "Wedding party",
  rsvp: "RSVP",
  guestbook: "A note to the couple",
  map: "Location & directions",
  accommodation: "Where to stay",
  "dress-code": "Dress code",
  registry: "Gift registry",
  contact: "Contact",
  calendar: "Save the date",
  seating: "Guest seating",
  footer: "Closing note",
};
export type ColorKey =
  "primary" | "secondary" | "accent" | "background" | "text";
export type Palette = Record<ColorKey, string>;
export type SectionItem = {
  id: string;
  title: string;
  text: string;
  image: string;
  url: string;
  time: string;
};
export type DesignSection = {
  id: string;
  type: SectionType;
  enabled: boolean;
  title: string;
  body: string;
  image: string;
  link: string;
  items: SectionItem[];
  style: "default" | "feature" | "minimal";
  background: string;
  spacing: "compact" | "comfortable" | "airy";
};
export type DesignConfig = {
  version: 1;
  colors: Partial<Palette>;
  typography: {
    pairing: string;
    heading: string;
    body: string;
    accent: string;
    scale: number;
    weight: number;
  };
  motion: "gentle" | "expressive" | "none";
  photoPosition: { x: number; y: number };
  sections: DesignSection[];
};

export const FONT_CHOICES = [
  {
    id: "instrument",
    label: "Instrument Serif",
    css: '"Instrument Serif", Georgia, serif',
    query: "family=Instrument+Serif:ital@0;1",
  },
  {
    id: "cormorant",
    label: "Cormorant Garamond",
    css: '"Cormorant Garamond", Georgia, serif',
    query: "family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    css: '"Playfair Display", Georgia, serif',
    query: "family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400",
  },
  {
    id: "manrope",
    label: "Manrope",
    css: '"Manrope", Arial, sans-serif',
    query: "family=Manrope:wght@400;500;600",
  },
  {
    id: "inter",
    label: "Inter",
    css: '"Inter", Arial, sans-serif',
    query: "family=Inter:wght@400;500;600",
  },
  {
    id: "jost",
    label: "Jost",
    css: '"Jost", Arial, sans-serif',
    query: "family=Jost:wght@400;500;600",
  },
] as const;
export const FONT_PAIRINGS = [
  {
    id: "original",
    label: "Designer’s choice",
    description: "The original template typography",
    heading: "",
    body: "",
    accent: "",
  },
  {
    id: "editorial",
    label: "Modern editorial",
    description: "Instrument Serif + Inter",
    heading: "instrument",
    body: "inter",
    accent: "cormorant",
  },
  {
    id: "romantic",
    label: "Timeless romance",
    description: "Cormorant Garamond + Jost",
    heading: "cormorant",
    body: "jost",
    accent: "cormorant",
  },
  {
    id: "minimal",
    label: "Quiet simplicity",
    description: "Manrope + Inter",
    heading: "manrope",
    body: "inter",
    accent: "instrument",
  },
  {
    id: "classic",
    label: "A little grandeur",
    description: "Playfair Display + Inter",
    heading: "playfair",
    body: "inter",
    accent: "cormorant",
  },
] as const;

export const PALETTES: { name: string; colors: Palette }[] = [
  {
    name: "Olive & ivory",
    colors: {
      primary: "#59634e",
      secondary: "#e4e6dc",
      accent: "#a49065",
      background: "#f8f7f2",
      text: "#34392f",
    },
  },
  {
    name: "Rosewater",
    colors: {
      primary: "#8e525c",
      secondary: "#f0dfe1",
      accent: "#ae8265",
      background: "#fbf5f3",
      text: "#4c3337",
    },
  },
  {
    name: "Midnight champagne",
    colors: {
      primary: "#d2b782",
      secondary: "#2c2a28",
      accent: "#dbc89f",
      background: "#191a19",
      text: "#f4eee2",
    },
  },
  {
    name: "Something blue",
    colors: {
      primary: "#486378",
      secondary: "#dfe8ed",
      accent: "#b69769",
      background: "#f6f8f9",
      text: "#283d4c",
    },
  },
  {
    name: "Terracotta",
    colors: {
      primary: "#994e38",
      secondary: "#ecdacb",
      accent: "#bc8854",
      background: "#faf2e8",
      text: "#492f26",
    },
  },
  {
    name: "Ink on paper",
    colors: {
      primary: "#30302b",
      secondary: "#e7e5df",
      accent: "#82765e",
      background: "#f9f8f4",
      text: "#242420",
    },
  },
];

export function newSection(
  type: SectionType,
  id: string = type,
): DesignSection {
  return {
    id,
    type,
    enabled: true,
    title: SECTION_LABELS[type],
    body: "",
    image: "",
    link: "",
    items: [],
    style: "default",
    background: "",
    spacing: "comfortable",
  };
}

const object = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const str = (v: unknown, max = 5000) =>
  typeof v === "string" ? v.slice(0, max) : "";
const clamp = (v: unknown, fallback: number, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.max(min, Math.min(max, v))
    : fallback;
export const isHexColor = (v: unknown): v is string =>
  typeof v === "string" && /^#[\da-f]{6}$/i.test(v);
export function safeUrl(value: unknown, media = false): string {
  if (typeof value !== "string") return "";
  // Relative bundled assets and local preview blobs are also valid media.
  if (media && (/^\/(?!\/)/.test(value) || value.startsWith("blob:")))
    return value;
  try {
    const url = new URL(value);
    return ["https:", "http:", ...(media ? [] : ["mailto:", "tel:"])].includes(
      url.protocol,
    )
      ? value
      : "";
  } catch {
    return "";
  }
}

/** Treat stored JSON as untrusted. Unknown versions keep the legacy site intact. */
export function normalizeDesign(value: unknown): DesignConfig | null {
  const data = object(value);
  if (data.version !== 1 || !Array.isArray(data.sections)) return null;
  const colors: Partial<Palette> = {};
  for (const key of [
    "primary",
    "secondary",
    "accent",
    "background",
    "text",
  ] as ColorKey[]) {
    if (isHexColor(object(data.colors)[key]))
      colors[key] = object(data.colors)[key] as string;
  }
  const type = object(data.typography);
  const font = (v: unknown) =>
    FONT_CHOICES.some((f) => f.id === v) ? String(v) : "";
  const seen = new Set<string>();
  const sections = data.sections
    .slice(0, 30)
    .flatMap((value, index): DesignSection[] => {
      const s = object(value);
      if (!SECTION_TYPES.includes(s.type as SectionType)) return [];
      // One instance of each section keeps anchors, RSVP and seating unambiguous.
      if (seen.has(s.type as string)) return [];
      seen.add(s.type as string);
      return [
        {
          id: str(s.id, 80) || `${s.type}-${index}`,
          type: s.type as SectionType,
          enabled: s.enabled !== false,
          title: str(s.title, 200),
          body: str(s.body),
          image: safeUrl(s.image, true),
          link: safeUrl(s.link),
          style:
            s.style === "feature" || s.style === "minimal"
              ? s.style
              : "default",
          spacing:
            s.spacing === "compact" || s.spacing === "airy"
              ? s.spacing
              : "comfortable",
          background: isHexColor(s.background) ? s.background : "",
          items: Array.isArray(s.items)
            ? s.items.slice(0, 24).map((item, i) => {
                const x = object(item);
                return {
                  id: `${index}-${i}`,
                  title: str(x.title, 200),
                  text: str(x.text, 2000),
                  image: safeUrl(x.image, true),
                  url: safeUrl(x.url),
                  time: str(x.time, 100),
                };
              })
            : [],
        },
      ];
    });
  return {
    version: 1,
    colors,
    sections,
    typography: {
      pairing: str(type.pairing, 30) || "original",
      heading: font(type.heading),
      body: font(type.body),
      accent: font(type.accent),
      scale: clamp(type.scale, 1, 0.8, 1.3),
      weight: clamp(type.weight, 400, 400, 600),
    },
    motion:
      data.motion === "none" || data.motion === "expressive"
        ? data.motion
        : "gentle",
    photoPosition: {
      x: clamp(object(data.photoPosition).x, 50, 0, 100),
      y: clamp(object(data.photoPosition).y, 50, 0, 100),
    },
  };
}

export function customFontHref(design: DesignConfig): string | null {
  const queries = FONT_CHOICES.filter((f) =>
    [
      design.typography.heading,
      design.typography.body,
      design.typography.accent,
    ].includes(f.id),
  ).map((f) => f.query);
  return queries.length
    ? `https://fonts.googleapis.com/css2?${queries.join("&")}&display=swap`
    : null;
}

export function designVariables(
  design: DesignConfig,
  palette: Palette,
  fonts: { heading: string; body: string; accent: string },
): CSSProperties {
  const colors = { ...palette, ...design.colors };
  const chosen = (id: string, fallback: string) =>
    FONT_CHOICES.find((f) => f.id === id)?.css ?? fallback;
  return {
    "--site-primary": colors.primary,
    "--site-secondary": colors.secondary,
    "--site-accent": colors.accent,
    "--site-paper": colors.background,
    "--site-ink": colors.text,
    "--site-heading": chosen(design.typography.heading, fonts.heading),
    "--site-body": chosen(design.typography.body, fonts.body),
    "--site-script": chosen(design.typography.accent, fonts.accent),
    "--site-scale": design.typography.scale,
    "--site-weight": design.typography.weight,
    "--photo-position": `${design.photoPosition.x}% ${design.photoPosition.y}%`,
    // Bridge the existing secure RSVP, countdown and opener to customized tokens.
    "--background": colors.background,
    "--foreground": colors.text,
    "--primary": colors.primary,
    "--primary-foreground": colors.background,
    "--rose": colors.primary,
    "--gold": colors.accent,
    "--muted-foreground": `color-mix(in srgb, ${colors.text} 70%, ${colors.background})`,
    "--card": colors.background,
    "--card-foreground": colors.text,
    "--border": `color-mix(in srgb, ${colors.text} 20%, transparent)`,
    "--gradient-gold": colors.primary,
    "--tpl-btn-ink": colors.background,
  } as CSSProperties;
}
