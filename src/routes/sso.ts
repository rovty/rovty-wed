import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Redemption side of the dashboard's cross-Worker SSO hand-off (see
// rovty-dashboard/worker/index.ts's /api/sso/mint and /api/sso/resolve —
// that file is the authoritative description of the whole flow and the
// security properties it's meant to have).
//
// This route never verifies the token itself — it doesn't hold the signing
// secret and never will. It forwards the opaque token to the dashboard's
// /api/sso/resolve, which is the only place that checks the signature,
// claims the one-time-use nonce, and re-verifies product_access live. This
// route's only job is: given a dashboard-confirmed email, establish a real
// session in *this* Supabase project for that person.
const DASHBOARD_SSO_RESOLVE_URL =
  process.env.DASHBOARD_SSO_RESOLVE_URL ??
  `${process.env.ROVTY_DASHBOARD_ORIGIN || "https://dash.rovty.com"}/api/sso/resolve`;

// One-use sign-in redirects must never be reused by a browser or edge cache.
function redirect(location: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export const Route = createFileRoute("/sso")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const origin = url.origin;
        const failure = (reason: string) =>
          redirect(`${origin}/auth?sso_error=${encodeURIComponent(reason)}`);

        if (!token) return failure("missing_token");

        // /api/sso/resolve requires proof that the caller is a Rovty product
        // Worker, not whoever happened to see the token URL in a log or
        // browser history. Same static secret /api/team already presents to
        // the dashboard's grant endpoint.
        const workerSecret =
          process.env.WED_WORKER_SECRET || process.env.TEAM_GRANT_SHARED_SECRET;
        if (!workerSecret) return failure("server_misconfigured");

        let resolved: {
          email?: string;
          product?: string;
          error?: string;
          user_id?: string;
          session_id?: string;
          version?: number;
        };
        try {
          const res = await fetch(DASHBOARD_SSO_RESOLVE_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${workerSecret}`,
            },
            body: JSON.stringify({ token }),
            signal: AbortSignal.timeout(8000),
          });
          resolved = await res.json();
          if (!res.ok || !resolved.email) {
            return failure(resolved.error ?? "resolve_failed");
          }
          if (resolved.product !== "wed") return failure("wrong_product");
        } catch {
          return failure("resolve_unreachable");
        }

        const id =
          /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
        if (
          resolved.version !== 2 ||
          !resolved.user_id ||
          !id.test(resolved.user_id) ||
          !resolved.session_id ||
          !id.test(resolved.session_id)
        )
          return failure("identity_upgrade_required");
        try {
          const { establishProductSession } =
            await import("@/lib/platform/handoff.server");
          const session = await establishProductSession({
            user_id: resolved.user_id,
            session_id: resolved.session_id,
            email: resolved.email!,
            product: "wed",
            version: 2,
          });
          // Tokens stay in the fragment, never in a request query or referrer.
          // The existing Supabase browser client consumes and clears this fragment.
          const fragment = new URLSearchParams({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: String(session.expires_in),
            token_type: session.token_type,
            type: "magiclink",
          });
          return redirect(`${origin}/admin#${fragment}`);
        } catch {
          return failure("account_connection_failed");
        }
      },
    },
  },
});
