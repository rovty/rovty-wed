import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { platformCall, PlatformError } from "./session.server";
const cache = new Map<string, { until: number; active: boolean }>();
export async function checkHosting(slug: string) {
  const cached = cache.get(slug);
  if (cached && cached.until > Date.now()) return cached.active;
  const { data, error } = await supabaseAdmin.rpc("rovty_hosting_owner", {
    _slug: slug,
  });
  if (error)
    throw new PlatformError("This invitation is temporarily unavailable.");
  const owner = data as { owner: string | null; legacy: boolean } | null;
  let active = false;
  if (owner?.owner) {
    const access = await platformCall("/api/billing/entitlements", {
      product: "wed",
      users: [owner.owner],
    });
    active =
      access[owner.owner]?.active === true &&
      access[owner.owner]?.features?.includes("website");
  } else active = owner?.legacy === true;
  if (cache.size > 500) cache.clear();
  cache.set(slug, { active, until: Date.now() + 30000 });
  return active;
}
