import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requirePlatformSession, PlatformError } from "./session.server";
import { weddingPlans, type Entitlement } from "./plans.server";
import { handleGateway } from "./gateway";
let keyCache: { key: string; until: number } | undefined;
async function gatewayKey() {
  if (keyCache && keyCache.until > Date.now()) return keyCache.key;
  const { data, error } = await supabaseAdmin.rpc("rovty_gateway_secret");
  if (error || typeof data !== "string" || !data)
    throw new PlatformError("The data connection is not configured.");
  keyCache = { key: data, until: Date.now() + 60000 };
  return data;
}
export function handleDataRequest(request: Request) {
  let requestPlans: Record<string, Entitlement> = {};
  return handleGateway(request, {
    session: async (token) => {
      const session = await requirePlatformSession(token);
      const plans = await weddingPlans(session);
      requestPlans = plans;
      return {
        ...session,
        planHeaders: {
          "x-rovty-plans": JSON.stringify(plans),
          "x-rovty-owner-plan": JSON.stringify(session.entitlement),
        },
      };
    },
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    mediaAccess: async (user, wedding, edit) => {
      if (!requestPlans[wedding]?.features.includes("website")) return false;
      const { data, error } = await supabaseAdmin.rpc("rovty_media_access", {
        _user: user,
        _wedding: wedding,
        _edit: edit,
      });
      if (error) throw new PlatformError("File permissions are unavailable.");
      return data === true;
    },
    key: gatewayKey,
    supabaseUrl: process.env.SUPABASE_URL!,
    publicKey:
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    // Cloudflare's native fetch requires its global receiver. Passing it as a
    // backend method makes handleGateway call it with `this === backend`.
    fetch: (input, init) => fetch(input, init),
  });
}
