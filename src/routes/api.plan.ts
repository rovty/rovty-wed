import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
export const Route = createFileRoute("/api/plan")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { requirePlatformSession, bearer, platformFailure } =
          await import("@/lib/platform/session.server");
        const { weddingPlans } = await import("@/lib/platform/plans.server");
        try {
          const session = await requirePlatformSession(bearer(request));
          return Response.json(
            { own: session.entitlement, weddings: await weddingPlans(session) },
            {
              headers: {
                "Cache-Control": "private, no-store",
                Vary: "Authorization",
              },
            },
          );
        } catch (e) {
          return platformFailure(e);
        }
      },
    },
  },
});
