import { createFileRoute } from "@tanstack/react-router";
import { TemplateDiscovery } from "@/components/studio/TemplateDiscovery";
import { fontLinks, UI_FONTS_HREF } from "@/lib/wedding";
export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "The Wedding Collection | Rovty Wed" },
      {
        name: "description",
        content:
          "Discover 21 wedding themes, from Rose and Lotus to Ocean Waves. Preview, compare and personalize every detail in the Rovty Wed studio.",
      },
    ],
    links: [
      ...fontLinks(UI_FONTS_HREF),
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
      },
      { rel: "canonical", href: "https://wed.rovty.com/templates" },
    ],
  }),
  component: TemplateDiscovery,
});
