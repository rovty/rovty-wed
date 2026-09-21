import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  platformCall,
  PlatformError,
  type requirePlatformSession,
} from "./session.server";
export interface Entitlement {
  plan?: string;
  active: boolean;
  features: string[];
  expires_at?: string;
  source?: string;
}
const legacy: Entitlement = {
  plan: "studio",
  active: true,
  features: [
    "website",
    "templates",
    "rsvp",
    "guests",
    "seating",
    "team",
    "canvas",
  ],
  source: "legacy",
};
export async function weddingPlans(
  session: Awaited<ReturnType<typeof requirePlatformSession>>,
) {
  const { data, error } = await supabaseAdmin.rpc("rovty_billing_weddings", {
    _user: session.user.id,
  });
  if (error || !Array.isArray(data))
    throw new PlatformError("Plan permissions are unavailable.");
  const weddings = data as {
    id: string;
    owner: string | null;
    legacy: boolean;
  }[];
  const users = [
    ...new Set(
      weddings
        .map((w) => w.owner)
        .filter((u): u is string => Boolean(u) && u !== session.platformUserId),
    ),
  ];
  // The session check already returned the signed-in owner's current plan.
  // Only invited members need another central lookup for a different owner.
  const access: Record<string, Entitlement> = {
    [session.platformUserId]: session.entitlement,
    ...(users.length
      ? await platformCall("/api/billing/entitlements", {
          product: "wed",
          users,
        })
      : {}),
  };
  return Object.fromEntries(
    weddings.map((w) => [
      w.id,
      w.owner
        ? access[w.owner]
        : w.legacy
          ? legacy
          : { active: false, features: [] },
    ]),
  ) as Record<string, Entitlement>;
}
export async function requireWeddingFeature(
  session: Awaited<ReturnType<typeof requirePlatformSession>>,
  wedding: string,
  feature: string,
) {
  const plans = await weddingPlans(session);
  if (!plans[wedding]?.features.includes(feature))
    throw new PlatformError(
      `This feature requires ${feature === "canvas" ? "Studio" : "Complete or Studio"}. View plans in your Rovty dashboard.`,
      403,
      "PLAN_REQUIRED",
    );
}
