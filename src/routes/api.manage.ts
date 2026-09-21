import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import type { Json } from "@/integrations/supabase/types";

async function handle({ request }: { request: Request }) {
  const { handleManagement } = await import("@/lib/management/handler.server");
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");
  return handleManagement(request, {
    user: async (token) => {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      return error ? null : (data.user?.id ?? null);
    },
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
