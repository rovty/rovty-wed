import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
async function handle({ request }: { request: Request }) {
  const {
    bearer,
    requirePlatformSession,
    productSession,
    platformCall,
    platformFailure,
    requireSameOrigin,
  } = await import("@/lib/platform/session.server");
  try {
    const token = bearer(request);
    if (request.method === "DELETE") {
      requireSameOrigin(request);
      const session = await productSession(token);
      await platformCall("/api/product-session/logout", {
        product: "wed",
        user_id: session.platformUserId,
        session_id: session.platformSessionId,
      });
    } else await requirePlatformSession(token);
    return Response.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "private, no-store",
          Vary: "Authorization",
        },
      },
    );
  } catch (error) {
    return platformFailure(error);
  }
}
export const Route = createFileRoute("/api/session")({
  server: { handlers: { GET: handle, DELETE: handle } },
});
