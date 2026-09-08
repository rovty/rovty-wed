import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://wed.rovty.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Deliberately just "/" — this is the whole indexable inventory on
        // this domain. Every other route here is either one customer's
        // private invitation (/$slug, /$slug/seating — noindex, keyed off a
        // slug/guest code that has no business in a sitemap), or app
        // functionality (/rsvp, /thankyou, /admin, /auth — also noindex).
        // Rovty Wed's marketing pages (features, pricing, ...) live on
        // rovty.com, a separate site/repo with its own sitemap.
        const entries = [{ path: "/", changefreq: "weekly", priority: "1.0" }];
        const urls = entries.map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
