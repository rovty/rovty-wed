// The "signature" collection: 16 fully bespoke invitation designs (each its
// own opener animation, typography and content structure — not a palette
// reskin of a shared layout the way every other template in wedding-themes.ts
// is). They live in their own registry rather than joining WEDDING_THEMES
// because nothing about them fits that system's "shared skeleton, themed
// tokens" model — see the header comment in
// components/wedding-templates/index.tsx for how they're actually rendered.
//
// "ran-poruwa" is deliberately not "poruwa" — that id already names the
// original, differently-designed legacy template and real invitations may
// already use it.
export type SignatureTemplateId =
  | "maison"
  | "mono"
  | "pichcha"
  | "rouge"
  | "salt-sand"
  | "ran-poruwa"
  | "evergreen"
  | "fern"
  | "jasmine-moon"
  | "kolam"
  | "lotus-night"
  | "lotus-pond"
  | "nocturne"
  | "rose-blush"
  | "sunset-coast"
  | "wildflower";

export type SignatureTemplateDefinition = {
  id: SignatureTemplateId;
  label: string;
  note: string;
  /** Three-color chip for the admin gallery card — not used for rendering. */
  swatch: { background: string; ink: string; accent: string };
  fontsHref: string;
};

// Each design's own Google Fonts families, exactly as its source mockup
// declared them. Kept as raw `family=...` fragments (not built into full
// URLs up front) so ALL_SIGNATURE_FONTS_HREF can flatten every template's
// families into one request without round-tripping through URL parsing —
// Google's family query values use "+" for spaces, which URLSearchParams
// silently (and unhelpfully) decodes back to a literal space.
const FONT_QUERIES: Record<SignatureTemplateId, string> = {
  maison:
    "family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600",
  mono: "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Mono:wght@400;500",
  pichcha:
    "family=Cormorant+Upright:wght@400;500;600&family=Hind:wght@400;500;600&family=Noto+Serif+Sinhala:wght@500;600",
  rouge:
    "family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@400;500;600",
  "salt-sand": "family=Young+Serif&family=Work+Sans:wght@400;500;600",
  "ran-poruwa":
    "family=Marcellus&family=Marcellus+SC&family=Noto+Serif+Sinhala:wght@400;600&family=Jost:wght@400;500;600&family=Cormorant:ital,wght@1,500",
  evergreen: "family=Bellefair&family=Manrope:wght@400;500;600",
  fern: "family=Castoro:ital@0;1&family=Instrument+Sans:wght@400;500;600",
  "jasmine-moon":
    "family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Figtree:wght@400;500;600",
  kolam:
    "family=Gloock&family=Noto+Serif+Tamil:wght@500;700&family=Mukta:wght@400;500;600",
  "lotus-night": "family=Italiana&family=Jost:wght@300;400;500;600",
  "lotus-pond":
    "family=Gilda+Display&family=Karla:wght@400;500;600&family=Noto+Serif+Sinhala:wght@500",
  nocturne:
    "family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Manrope:wght@400;500;600",
  "rose-blush":
    "family=Parisienne&family=Lora:ital,wght@0,400;0,500;1,400&family=Nunito+Sans:wght@400;600;700",
  "sunset-coast":
    "family=DM+Serif+Display:ital@0;1&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,800",
  wildflower:
    "family=Pinyon+Script&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Figtree:wght@400;500;600",
};

const FONTS = (query: string) =>
  `https://fonts.googleapis.com/css2?${query}&display=swap`;

export const SIGNATURE_TEMPLATES: SignatureTemplateDefinition[] = [
  {
    id: "maison",
    label: "Maison",
    note: "A love story, laid out like a magazine.",
    swatch: { background: "#f4efe6", ink: "#1b1a17", accent: "#a4502f" },
    fontsHref: FONTS(FONT_QUERIES.maison),
  },
  {
    id: "mono",
    label: "Mono",
    note: "Bold type, a hard grid, save-the-date energy.",
    swatch: { background: "#fafaf7", ink: "#111111", accent: "#d63d20" },
    fontsHref: FONTS(FONT_QUERIES.mono),
  },
  {
    id: "pichcha",
    label: "Pichcha Mala",
    note: "Jasmine garlands and Poruwa tradition, deep green and gold.",
    swatch: { background: "#fbf8ef", ink: "#1d3a2f", accent: "#b89a45" },
    fontsHref: FONTS(FONT_QUERIES.pichcha),
  },
  {
    id: "rouge",
    label: "Rouge",
    note: "A single red rose, dramatic and romantic.",
    swatch: { background: "#4a0d17", ink: "#f6e7e2", accent: "#f0b6ae" },
    fontsHref: FONTS(FONT_QUERIES.rouge),
  },
  {
    id: "salt-sand",
    label: "Salt & Sand",
    note: "A minimal seaside invitation, postcard-inspired.",
    swatch: { background: "#efe6d6", ink: "#16323c", accent: "#1d5e74" },
    fontsHref: FONTS(FONT_QUERIES["salt-sand"]),
  },
  {
    id: "ran-poruwa",
    label: "Ran Poruwa",
    note: "The traditional poruwa ceremony, maroon and gold.",
    swatch: { background: "#5b0e14", ink: "#f6ece1", accent: "#d6ad5c" },
    fontsHref: FONTS(FONT_QUERIES["ran-poruwa"]),
  },
  {
    id: "evergreen",
    label: "Evergreen",
    note: "A misty forest, quiet and romantic.",
    swatch: { background: "#1c2b24", ink: "#eef1ea", accent: "#9db894" },
    fontsHref: FONTS(FONT_QUERIES.evergreen),
  },
  {
    id: "fern",
    label: "Fern",
    note: "Eucalyptus and fern, soft canopy light.",
    swatch: { background: "#eef0e2", ink: "#2c3627", accent: "#71805f" },
    fontsHref: FONTS(FONT_QUERIES.fern),
  },
  {
    id: "jasmine-moon",
    label: "Jasmine Moon",
    note: "Jasmine and moonlight, minimal and serene.",
    swatch: { background: "#f7f4ec", ink: "#2d2b22", accent: "#8a8362" },
    fontsHref: FONTS(FONT_QUERIES["jasmine-moon"]),
  },
  {
    id: "kolam",
    label: "Kolam",
    note: "Tamil wedding tradition, kolam patterns in gold.",
    swatch: { background: "#fbf3e2", ink: "#3a2413", accent: "#a1442c" },
    fontsHref: FONTS(FONT_QUERIES.kolam),
  },
  {
    id: "lotus-night",
    label: "Lotus Night",
    note: "An evening lotus ceremony under a starlit sky.",
    swatch: { background: "#141a33", ink: "#f1efe3", accent: "#c9a45c" },
    fontsHref: FONTS(FONT_QUERIES["lotus-night"]),
  },
  {
    id: "lotus-pond",
    label: "Lotus Pond",
    note: "A lotus pond, calm and graceful.",
    swatch: { background: "#f3f1ea", ink: "#2b342d", accent: "#8a6f3f" },
    fontsHref: FONTS(FONT_QUERIES["lotus-pond"]),
  },
  {
    id: "nocturne",
    label: "Nocturne",
    note: "Black tie, monochrome drama.",
    swatch: { background: "#0e0d0c", ink: "#f3f0ea", accent: "#c7a45f" },
    fontsHref: FONTS(FONT_QUERIES.nocturne),
  },
  {
    id: "rose-blush",
    label: "Rose Blush",
    note: "Soft rose blush, romantic and light.",
    swatch: { background: "#fbf1ee", ink: "#3c2a28", accent: "#c98d86" },
    fontsHref: FONTS(FONT_QUERIES["rose-blush"]),
  },
  {
    id: "sunset-coast",
    label: "Sunset Coast",
    note: "A warm coastal sunset.",
    swatch: { background: "#fff6ea", ink: "#3d2b1f", accent: "#d97b43" },
    fontsHref: FONTS(FONT_QUERIES["sunset-coast"]),
  },
  {
    id: "wildflower",
    label: "Wildflower",
    note: "A wildflower garden, script and soft color.",
    swatch: { background: "#f6f1e7", ink: "#39341f", accent: "#93763f" },
    fontsHref: FONTS(FONT_QUERIES.wildflower),
  },
];

export const SIGNATURE_TEMPLATE_IDS: readonly SignatureTemplateId[] =
  SIGNATURE_TEMPLATES.map((t) => t.id);

export function isSignatureTemplate(v: string): v is SignatureTemplateId {
  return (SIGNATURE_TEMPLATE_IDS as readonly string[]).includes(v);
}

export function signatureTemplate(
  id: SignatureTemplateId,
): SignatureTemplateDefinition {
  return SIGNATURE_TEMPLATES.find((t) => t.id === id)!;
}

/** Google Fonts stylesheet URL for one signature template. */
export function signatureFontsHref(id: SignatureTemplateId): string {
  return signatureTemplate(id).fontsHref;
}

/** Every signature template's fonts in one request — admin gallery only. */
export const ALL_SIGNATURE_FONTS_HREF = FONTS(
  [...new Set(Object.values(FONT_QUERIES).join("&").split("&"))].join("&"),
);
