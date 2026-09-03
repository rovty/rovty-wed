import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { buildICS } from "@/lib/wedding";

export const Route = createFileRoute("/calendar.ics")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildICS(), {
          headers: {
            // Served with the calendar MIME type so iOS/macOS open it directly
            // in the Calendar app (tap → "Add to Calendar") instead of just
            // downloading an .ics file.
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'inline; filename="iresh-asha-wedding.ics"',
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
