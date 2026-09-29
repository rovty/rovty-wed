import { createFileRoute } from "@tanstack/react-router";
import { TemplateDiscovery } from "@/components/studio/TemplateDiscovery";
import { fontLinks, UI_FONTS_HREF } from "@/lib/wedding";
export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Wedding Website Templates & Invitation Designs | Rovty Wed" },
      {
        name: "description",
        content:
          "Browse wedding website templates and invitation designs, from Rose and Lotus to Ocean Waves. Preview and personalize your wedding in the Rovty Wed studio.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      {
        property: "og:title",
        content: "Wedding Website Templates | Rovty Wed",
      },
      {
        property: "og:description",
        content:
          "Find a wedding invitation design, preview it and make it yours with Rovty Wed.",
      },
      { property: "og:url", content: "https://wed.rovty.com/templates" },
      { property: "og:image", content: "https://wed.rovty.com/wed-og.png" },
      { name: "twitter:image", content: "https://wed.rovty.com/wed-og.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Rovty Wed wedding website templates",
          url: "https://wed.rovty.com/templates",
          isPartOf: { "@id": "https://wed.rovty.com/#website" },
          about: {
            "@type": "SoftwareApplication",
            name: "Rovty Wed",
            url: "https://wed.rovty.com/",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
          },
        }),
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
