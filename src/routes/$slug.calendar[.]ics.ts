// Nested under /$slug for the same reason $slug.seating.tsx is (see that
// file's header comment): a top-level /calendar.ics can't know which
// wedding it's for in a multi-tenant app. It used to be a top-level route
// (calendar[.]ics.ts, kept for the single-tenant "whichever wedding is
// published" home route) reused here by mistake — every guest's "Add to
// Calendar → Apple Calendar" tap hit that same top-level route regardless
// of whose invitation they were viewing, so once more than one wedding was
// published the .ics they got could silently be a *different couple's*
// date/time/venue, which reads on-device as "the start time, end time and
// location aren't showing right" rather than as an obviously wrong event.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { buildICS, fetchWeddingBySlug } from "@/lib/wedding";

export const Route = createFileRoute("/$slug/calendar.ics")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const wedding = await fetchWeddingBySlug(params.slug);
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
