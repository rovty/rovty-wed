import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { buildICS, fetchPublishedWedding } from "@/lib/wedding";

export const Route = createFileRoute("/calendar.ics")({
  server: {
    handlers: {
      GET: async () => {
        const wedding = await fetchPublishedWedding();
        if (!wedding) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(buildICS(wedding), {
          headers: {
            // Served with the calendar MIME type so iOS/macOS open it directly
            // in the Calendar app (tap → "Add to Calendar") instead of just
            // downloading an .ics file.
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": `inline; filename="${wedding.slug}-wedding.ics"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
