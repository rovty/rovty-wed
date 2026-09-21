import { createFileRoute } from "@tanstack/react-router";
import { ManagementPage } from "@/components/management/ManagementPage";
import { UI_FONTS_HREF, fontLinks } from "@/lib/wedding";
import { isId } from "@/lib/management/schema";
import managementCss from "@/components/management/management.css?url";

export const Route = createFileRoute("/admin_/manage")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { wedding?: string } => ({
    wedding: isId(search.wedding) ? search.wedding : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Wedding management | Rovty" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      ...fontLinks(UI_FONTS_HREF),
      { rel: "stylesheet", href: managementCss },
    ],
  }),
  component: ManagementPage,
});
