import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Rovty Wed" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

// There is deliberately no email/password form here, and no signUp() call
// anywhere in this app. product_access (in the dashboard's Supabase project)
// is the single source of truth for who gets a Rovty Wed account; the only
// way to get one is:
//
//   Rovty Dashboard → active product_access → signed SSO hand-off
//   → /sso → verified entitlement → session here
//
// (see /sso and rovty-dashboard/worker/index.ts for the rest of that flow).
// A local signup/sign-in form here would let anyone create an account with
// no product_access check at all — this page exists only to send people
// back to the dashboard, and to explain why if they arrived via a failed
// /sso redirect.

// Keyed by every reason string /sso's failure() can be called with — both
// its own local checks (missing_token, resolve_unreachable,
// session_creation_failed) and whatever /api/sso/resolve returns verbatim
// (e.g. "Token already used", "Invalid or expired token"). Deliberately not
// shown to the person as-is: those are backend/implementation language
// ("token", "nonce", "resolve") that means nothing to someone signing in to
// look at their wedding site, so every known reason gets mapped to plain
// copy here, and the fallback below is generic rather than an echo.
const SSO_ERROR_MESSAGES: Record<string, string> = {
  missing_token:
    "That link looks incomplete — try opening Rovty Wed from your dashboard again.",
  "Invalid or expired token":
    "That link has expired — go back to your dashboard and open Rovty Wed again.",
  "Token already used":
    "That link has already been used — go back to your dashboard and open Rovty Wed again.",
  "Not active for this product":
    "Your account doesn't currently have Rovty Wed access. Check your dashboard, or contact us if that looks wrong.",
  "User not found":
    "We couldn't find your account. Try signing in again from your dashboard.",
  "Account has no email":
    "We couldn't find your account. Try signing in again from your dashboard.",
  resolve_unreachable:
    "Couldn't reach Rovty to verify your access. Try again in a moment.",
  session_creation_failed:
    "Something went wrong setting up your session. Try again from your dashboard.",
};

function describeSsoError(reason: string): string {
  return (
    SSO_ERROR_MESSAGES[reason] ??
    "Something went wrong signing you in. Go back to your dashboard and open Rovty Wed again."
  );
}

function AuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // A live session (from a previous SSO hand-off) still gets in without
    // going through the dashboard again — that's just normal session
    // persistence, not a second account-creation path.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  // Read only after mount, not inline in the render body — this route is
  // server-rendered, and the server has no `window`/query string to read at
  // all. Branching the render on `typeof window !== "undefined"` (the
  // previous approach) makes the very first client render disagree with
  // what the server sent whenever ?sso_error is actually present, which is
  // exactly React hydration error #418: the server's HTML has no error
  // banner, the client's first pass wants one. Starting both at null and
  // filling it in after hydration via an effect keeps them in sync.
  const [ssoError, setSsoError] = useState<string | null>(null);
  useEffect(() => {
    setSsoError(new URLSearchParams(window.location.search).get("sso_error"));
  }, []);

  return (
    <main className="grid min-h-[100svh] place-items-center px-5 py-10">
      <div className="glass-card w-full max-w-sm rounded-3xl p-7 text-center">
        <div
          className="mx-auto grid h-12 w-12 place-items-center rounded-full text-white"
          style={{ background: "var(--gradient-gold)" }}
        >
          <Heart className="h-5 w-5" />
        </div>
        <h1 className="mt-3 font-display text-2xl">Sign in via Rovty</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Rovty Wed accounts are managed through your Rovty dashboard — there's
          no separate sign-up here.
        </p>

        {ssoError && (
          <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            {describeSsoError(ssoError)}
          </p>
        )}

        <a
          href="https://dash.rovty.com"
          className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-3 text-sm font-medium text-white shadow-gold"
          style={{ background: "var(--gradient-gold)" }}
        >
          Go to Rovty Dashboard <ArrowRight className="h-3.5 w-3.5" />
        </a>
        <p className="mt-3 text-xs text-muted-foreground">
          Sign in there, then open Rovty Wed from your Products list.
        </p>
      </div>
    </main>
  );
}
