import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { PlatformError, isId, tokenSessionId } from "./contracts.ts";
export {
  PlatformError,
  isId,
  tokenSessionId,
  bearer,
  platformFailure,
  requireSameOrigin,
} from "./contracts.ts";
export function workerCredential() {
  const secret =
    process.env.WED_WORKER_SECRET || process.env.TEAM_GRANT_SHARED_SECRET;
  if (!secret) throw new PlatformError("Rovty sign-in is not configured.");
  return secret;
}
export function dashboardOrigin() {
  return new URL(
    process.env.ROVTY_DASHBOARD_ORIGIN ||
      process.env.DASHBOARD_SSO_RESOLVE_URL ||
      "https://dash.rovty.com",
  ).origin;
}
export async function platformCall(
  path: string,
  body: Record<string, unknown>,
) {
  let response: Response;
  try {
    response = await fetch(`${dashboardOrigin()}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${workerCredential()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new PlatformError(
      "Couldn't reach Rovty. Your changes have not been sent. Please try again.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new PlatformError(
      "Rovty returned an unexpected response. Please try again.",
    );
  }
  if (!response.ok)
    throw new PlatformError(
      data.error || "Your Rovty session has ended.",
      response.status,
      data.code ||
        (response.status === 401 ? "SESSION_EXPIRED" : "PLATFORM_UNAVAILABLE"),
    );
  return data;
}
export async function productSession(token: string) {
  // Supabase validates the signature before we read session_id. A refreshed
  // product token remains attached to the same central login, never a new one.
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error && (!error.status || error.status >= 500 || error.status === 429))
    throw new PlatformError("Authentication is temporarily unavailable.");
  if (error || !data.user)
    throw new PlatformError(
      "Sign in to your Rovty account.",
      401,
      "SESSION_EXPIRED",
    );
  const session = tokenSessionId(token);
  if (!session)
    throw new PlatformError(
      "Open Rovty Wed from your dashboard to reconnect.",
      401,
      "RECONNECT_REQUIRED",
    );
  const result = await supabaseAdmin.rpc("rovty_platform_session", {
    _user: data.user.id,
    _session: session,
  });
  if (result.error)
    throw new PlatformError(
      "Your account connection is unavailable. Please try again.",
    );
  const binding = result.data as {
    user_id?: string;
    session_id?: string;
  } | null;
  if (!binding || !isId(binding.user_id) || !isId(binding.session_id))
    throw new PlatformError(
      "Open Rovty Wed from your dashboard to reconnect.",
      401,
      "RECONNECT_REQUIRED",
    );
  return {
    user: data.user,
    token,
    sessionId: session,
    platformUserId: binding.user_id,
    platformSessionId: binding.session_id,
  };
}
export async function requirePlatformSession(token: string) {
  const session = await productSession(token);
  const identity = await platformCall("/api/product-session/check", {
    product: "wed",
    user_id: session.platformUserId,
    session_id: session.platformSessionId,
  });
  // Keep email-based staff authorization aligned with the current central
  // account. Reopening through SSO updates the local email by permanent UUID.
  if (typeof identity.email !== "string")
    throw new PlatformError("Your account connection is unavailable.");
  if (identity.email.toLowerCase() !== session.user.email?.toLowerCase())
    throw new PlatformError(
      "Your account email changed. Reconnect with Rovty to continue.",
      401,
      "RECONNECT_REQUIRED",
    );
  if (!identity.entitlement || !Array.isArray(identity.entitlement.features))
    throw new PlatformError("Product plans are unavailable. Please try again.");
  return {
    ...session,
    entitlement: identity.entitlement as import("./plans.server").Entitlement,
  };
}
