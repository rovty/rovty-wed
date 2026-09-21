import { supabase } from "@/integrations/supabase/client";
import { SITE_ORIGIN } from "@/lib/platform";
export type SessionIssue = { message: string; status: number; code?: string };
export const SESSION_EVENT = "rovty:session-issue";
export let signingOut = false;
export async function checkPlatformSession(signal?: AbortSignal) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  const response = await fetch("/api/session", {
    headers: { Authorization: `Bearer ${data.session.access_token}` },
    cache: "no-store",
    signal,
  });
  const body = await response
    .json()
    .catch(() => ({ error: "Couldn't verify your account. Try again." }));
  if (!response.ok)
    throw {
      message: body.error,
      status: response.status,
      code: body.code,
    } satisfies SessionIssue;
  return data.session;
}
export async function platformSignOut() {
  if (signingOut) return;
  signingOut = true;
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const response = await fetch("/api/session", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok && response.status !== 401)
        throw new Error("Couldn't finish signing out. Please try again.");
    }
    await supabase.auth.signOut({ scope: "local" });
    const { data: remaining } = await supabase.auth.getSession();
    if (remaining.session)
      throw new Error("Couldn't clear this session. Please try again.");
    window.location.replace(SITE_ORIGIN);
  } catch (error) {
    signingOut = false;
    window.dispatchEvent(
      new CustomEvent(SESSION_EVENT, {
        detail: {
          message:
            error instanceof Error
              ? error.message
              : "Couldn't sign out. Try again.",
          status: 503,
        },
      }),
    );
  }
}
