import { WED_TEMPLATES } from "@/components/wed-landing/templates";
import {
  isWeddingTemplate,
  type PublicWedding,
  type WeddingTemplate,
} from "@/lib/wedding";
import {
  newSection,
  normalizeDesign,
  type DesignConfig,
  type Palette,
  type SectionType,
} from "./design";
import couplePhoto from "@/assets/studio-couple.webp";
import venuePhoto from "@/assets/studio-garden.webp";
import celebrationPhoto from "@/assets/studio-celebration.webp";

export type Collection =
  | "All designs"
  | "Editorial"
  | "Romantic"
  | "Modern"
  | "Cultural"
  | "Dark & dramatic";
export const COLLECTIONS: Collection[] = [
  "All designs",
  "Editorial",
  "Romantic",
  "Modern",
  "Cultural",
  "Dark & dramatic",
];
export type TemplateDefinition = {
  id: WeddingTemplate;
  name: string;
  collection: Collection;
  note: string;
  composition:
    | "editorial"
    | "romantic"
    | "modern"
    | "ceremonial"
    | "cinematic"
    | "artistic";
  palette: Palette;
  fonts: { heading: string; body: string; accent: string };
  sections: SectionType[];
};
const common: SectionType[] = [
  "hero",
  "countdown",
  "story",
  "schedule",
  "venue",
  "gallery",
  "rsvp",
  "calendar",
  "seating",
  "footer",
];
const definitions: {
  id: WeddingTemplate;
  collection: Collection;
  note: string;
  composition: TemplateDefinition["composition"];
  sections?: SectionType[];
}[] = [
  {
    id: "editorial",
    collection: "Editorial",
    note: "A love story, beautifully typeset.",
    composition: "editorial",
  },
  {
    id: "garden",
    collection: "Romantic",
    note: "For a love that grows wild.",
    composition: "romantic",
    sections: [
      "hero",
      "story",
      "gallery",
      "countdown",
      "schedule",
      "venue",
      "rsvp",
      "calendar",
      "seating",
      "footer",
    ],
  },
  {
    id: "noir",
    collection: "Dark & dramatic",
    note: "An evening to remember.",
    composition: "cinematic",
    sections: [
      "hero",
      "date",
      "gallery",
      "story",
      "schedule",
      "rsvp",
      "venue",
      "calendar",
      "seating",
      "footer",
    ],
  },
  {
    id: "quiet",
    collection: "Modern",
    note: "Just you. Just us. Everything.",
    composition: "modern",
  },
  {
    id: "poruwa",
    collection: "Cultural",
    note: "Rooted in tradition. Made yours.",
    composition: "ceremonial",
    sections: [
      "hero",
      "family",
      "date",
      "schedule",
      "story",
      "venue",
      "gallery",
      "rsvp",
      "calendar",
      "seating",
      "footer",
    ],
  },
  {
    id: "bloom",
    collection: "Romantic",
    note: "A softer kind of forever.",
    composition: "artistic",
  },
  {
    id: "film",
    collection: "Editorial",
    note: "Your favorite story, in motion.",
    composition: "cinematic",
    sections: [
      "hero",
      "story",
      "gallery",
      "schedule",
      "venue",
      "rsvp",
      "calendar",
      "seating",
      "footer",
    ],
  },
  {
    id: "thali",
    collection: "Cultural",
    note: "A joyful beginning, together.",
    composition: "ceremonial",
  },
  {
    id: "shoreline",
    collection: "Modern",
    note: "Meet us where the sea begins.",
    composition: "artistic",
    sections: [
      "hero",
      "countdown",
      "venue",
      "story",
      "gallery",
      "schedule",
      "rsvp",
      "calendar",
      "seating",
      "footer",
    ],
  },
  {
    id: "deco",
    collection: "Dark & dramatic",
    note: "All that glitters, all our love.",
    composition: "ceremonial",
  },
  {
    id: "chapel",
    collection: "Romantic",
    note: "Something old. Something blue.",
    composition: "romantic",
  },
  {
    id: "nikkah",
    collection: "Cultural",
    note: "Two hearts. One beautiful promise.",
    composition: "modern",
  },
  {
    id: "lotus",
    collection: "Cultural",
    note: "With love, and every blessing.",
    composition: "ceremonial",
  },
  {
    id: "classic",
    collection: "Romantic",
    note: "Some love stories are timeless.",
    composition: "romantic",
  },
];

export const TEMPLATE_CATALOG: TemplateDefinition[] = definitions.map((def) => {
  const theme = WED_TEMPLATES.find((t) => t.id === def.id)!;
  return {
    ...def,
    name: theme.label,
    sections: def.sections ?? common,
    palette: {
      primary: theme.rose,
      secondary: theme.dark ? "#302e29" : "#e9e5dc",
      accent: theme.gold,
      background: theme.swatchBg,
      text: theme.fg,
    },
    fonts: {
      heading: theme.disp,
      body: '"Inter", sans-serif',
      accent: theme.scr,
    },
  };
});
export function getTemplate(id: WeddingTemplate): TemplateDefinition {
  return TEMPLATE_CATALOG.find((t) => t.id === id)!;
}

export function createDesign(template: WeddingTemplate): DesignConfig {
  return {
    version: 1,
    colors: {},
    typography: {
      pairing: "original",
      heading: "",
      body: "",
      accent: "",
      scale: 1,
      weight: 400,
    },
    motion: "gentle",
    photoPosition: { x: 50, y: 50 },
    sections: getTemplate(template).sections.map((type) => newSection(type)),
  };
}

export const DEMO_WEDDING: PublicWedding = {
  slug: "amelia-and-james",
  bride: "Amelia",
  groom: "James",
  title: "James & Amelia Wedding",
  groomParentsNames: null,
  brideParentsNames: null,
  date: new Date("2027-06-19T16:00:00+05:30"),
  endDate: null,
  receptionDate: new Date("2027-06-19T18:30:00+05:30"),
  receptionEnd: null,
  venue: "The Palm House",
  hall: "The Garden Pavilion",
  address: "Galle, Sri Lanka",
  description:
    "Together with our favorite people, in a place close to our hearts. We can’t wait to celebrate with you.",
  template: "editorial",
  couplePhotoUrl: couplePhoto,
  venuePhotoUrl: venuePhoto,
  shareImageUrl: null,
  floorPlanUrl: null,
  mapsUrl: null,
  musicUrl: null,
};

export type StudioDraft = { wedding: PublicWedding; design: DesignConfig };
export function sampleWedding(template: WeddingTemplate): PublicWedding {
  return {
    ...DEMO_WEDDING,
    template,
    couplePhotoUrl: ["noir", "film", "classic"].includes(template)
      ? celebrationPhoto
      : DEMO_WEDDING.couplePhotoUrl,
  };
}
export const DRAFT_KEY = "rovty-wed-studio-v1";

/** Date restoration and bounded validation for local drafts. Never trust localStorage. */
export function parseDraft(raw: string | null): StudioDraft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    const design = normalizeDesign(value.design);
    const w = value.wedding;
    if (
      !design ||
      !w ||
      !isWeddingTemplate(w.template) ||
      typeof w.groom !== "string" ||
      typeof w.bride !== "string" ||
      !Number.isFinite(Date.parse(w.date))
    )
      return null;
    const wedding = { ...DEMO_WEDDING };
    for (const key of [
      "groom",
      "bride",
      "description",
      "venue",
      "hall",
      "address",
      "groomParentsNames",
      "brideParentsNames",
      "mapsUrl",
      "couplePhotoUrl",
      "venuePhotoUrl",
    ] as const) {
      if (typeof w[key] === "string") wedding[key] = w[key].slice(0, 5000);
    }
    wedding.template = w.template;
    wedding.date = new Date(w.date);
    wedding.endDate =
      w.endDate && Number.isFinite(Date.parse(w.endDate))
        ? new Date(w.endDate)
        : null;
    wedding.receptionDate =
      w.receptionDate && Number.isFinite(Date.parse(w.receptionDate))
        ? new Date(w.receptionDate)
        : null;
    wedding.receptionEnd =
      w.receptionEnd && Number.isFinite(Date.parse(w.receptionEnd))
        ? new Date(w.receptionEnd)
        : null;
    // Session-only image previews must not restore as broken blob URLs.
    if (wedding.couplePhotoUrl?.startsWith("blob:"))
      wedding.couplePhotoUrl = couplePhoto;
    if (wedding.venuePhotoUrl?.startsWith("blob:"))
      wedding.venuePhotoUrl = venuePhoto;
    for (const section of design.sections) {
      if (section.image.startsWith("blob:")) section.image = "";
      section.items = section.items.map((item) => ({
        ...item,
        image: item.image.startsWith("blob:") ? "" : item.image,
      }));
    }
    return { wedding, design };
  } catch {
    return null;
  }
}

/** Change only presentation. Every enabled/disabled section and its content survives. */
export function switchTemplate(
  draft: StudioDraft,
  template: WeddingTemplate,
): StudioDraft {
  return {
    wedding: { ...draft.wedding, template },
    design: {
      ...draft.design,
      colors: {},
      typography: {
        ...draft.design.typography,
        pairing: "original",
        heading: "",
        body: "",
        accent: "",
      },
    },
  };
}
