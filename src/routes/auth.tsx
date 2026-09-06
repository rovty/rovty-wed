import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
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
// /sso redirect. The admin-portal redesign's sign-in mock (an email input,
// "email me a sign-in link") was deliberately not carried over for that
// reason — same SSO-only flow, just restyled to match.

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
    <main className="admin-portal grid min-h-[100dvh] place-items-center px-5 py-10">
      <div className="w-full max-w-sm border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-lg)]">
        <div className="p-7">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold tracking-tight">ROVTY</span>
            {/* -accent itself is too pale to read as text on white — this
                wordmark needs the darker step of the same pink. */}
            <span className="text-xl font-extrabold tracking-tight text-[var(--admin-accent-hover)]">
              WED
            </span>
          </div>
          <div className="my-4 h-0.5 bg-[var(--admin-ink)]" />

          <h1 className="text-[28px] font-extrabold leading-[1.05] tracking-tight">
            Sign in to your wedding
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--admin-muted)]">
            Rovty Wed accounts are managed through your Rovty dashboard —
            there's no separate sign-up here. Sign in there, then open Rovty Wed
            from your Products list.
          </p>

          {ssoError && (
            <p className="mt-4 border-2 border-[var(--admin-accent-active)] bg-[var(--admin-accent-softer)] px-4 py-3 text-xs text-[var(--admin-accent-active)]">
              {describeSsoError(ssoError)}
            </p>
          )}

          <a
            href="https://dash.rovty.com"
            className="a-btn-primary mt-6 flex h-[52px] w-full items-center justify-between px-4 text-[15px] font-bold"
          >
            <span>Go to Rovty Dashboard</span>
            <ArrowRight className="h-[18px] w-[18px]" />
          </a>

          <div className="mt-6 border-t-2 border-[var(--admin-ink)] pt-3.5">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-[var(--admin-muted)]">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Invited by the couple as a planner or family member? Sign in with
              the same email your invite was sent to — your access is already
              waiting.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
