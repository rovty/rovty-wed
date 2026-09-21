import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import type { Json } from "@/integrations/supabase/types";

async function handle({ request }: { request: Request }) {
  const { handleManagement } = await import("@/lib/management/handler.server");
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");
  const { requirePlatformSession, bearer, platformFailure } =
    await import("@/lib/platform/session.server");
  let session;
  try {
    session = await requirePlatformSession(bearer(request));
  } catch (error) {
    return platformFailure(error);
  }
  return handleManagement(request, {
    user: async () => session.user.id,
    run: async (actor, action, params) =>
      supabaseAdmin.rpc("rovty_manage", {
        _actor: actor,
        _action: action,
        _params: params as Json,
      }),
  });
}
export const Route = createFileRoute("/api/manage")({
  server: { handlers: { GET: handle, PATCH: handle } },
});
