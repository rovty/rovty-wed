import { WeddingSite } from "@/components/WeddingSite";
// Browser-only sample renderer, imported by wedding_visual.py through the dev server.
import { createRoot } from "react-dom/client";
import { SeatingExperience } from "@/components/wedding/SeatingExperience";
import { StudioWeddingSite } from "@/components/studio/StudioWeddingSite";
import { createDesign, sampleWedding } from "@/lib/studio/catalog";
import { templateFontsHref, type WeddingTemplate } from "@/lib/wedding";
import seatingPlan from "@/assets/seating-demo.webp";

const host = document.createElement("div");
document.body.replaceChildren(host);
const root = createRoot(host);

export function renderFixture({
  template = "olive",
  motion = "gentle",
  invitation = false,
  publicView = false,
  legacy = false,
  floorPlan = true,
  status = "ready",
  custom = false,
  hidden = [],
  rsvpVisibility = "both",
}: {
  template?: WeddingTemplate;
  motion?: "gentle" | "expressive" | "none";
  invitation?: boolean;
  publicView?: boolean;
  legacy?: boolean;
  floorPlan?: boolean;
  status?: "ready" | "loading" | "missing" | "unavailable" | "error";
  custom?: boolean;
  hidden?: string[];
  rsvpVisibility?: "both" | "desktop" | "mobile";
}) {
  const design = createDesign(template);
  design.motion = motion;
  design.sections.forEach((section) => {
    if (hidden.includes(section.type)) section.enabled = false;
    if (section.type === "rsvp") {
      section.layout = {
        alignment: "original",
        width: "original",
        visibility: rsvpVisibility,
      };
    }
  });
  if (custom) {
    design.colors = { primary: "#795551", accent: "#795551" };
    design.typography.heading = "cormorant";
  }
  const wedding = {
    ...sampleWedding(template),
    design,
    floorPlanUrl: floorPlan ? seatingPlan : null,
  };
  const fonts = document.createElement("link");
  fonts.rel = "stylesheet";
  fonts.href = templateFontsHref(template);
  document.head.append(fonts);
  root.render(
    legacy ? (
      <WeddingSite key={template} wedding={{ ...wedding, design: null }} />
    ) : invitation ? (
      <StudioWeddingSite
        key={`${template}-${publicView}`}
        wedding={wedding}
        design={design}
        preview={!publicView}
      />
    ) : (
      <SeatingExperience
        wedding={wedding}
        seating={{
          guest_name: "Mrs. Nimali Perera",
          guest_code: "DEMO1234",
          table_number: 4,
          table_name: "The Rose Garden",
          map_x: 10.7,
          map_y: 11,
          tablemates: [
            { name: "Mrs. Nimali Perera", is_current: true },
            { name: "Mr. & Mrs. Perera", is_current: false },
            { name: "Dr. Sunil Perera", is_current: false },
            { name: "Ms. Tharushi Perera", is_current: false },
          ],
        }}
        status={status}
        code="DEMO1234"
      />
    ),
  );
}
