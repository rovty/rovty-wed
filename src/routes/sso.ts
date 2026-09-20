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
  "https://dash.rovty.com/api/sso/resolve";

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
        const workerSecret = process.env.TEAM_GRANT_SHARED_SECRET;
        if (!workerSecret) return failure("server_misconfigured");

        let resolved: { email?: string; product?: string; error?: string };
        try {
          const res = await fetch(DASHBOARD_SSO_RESOLVE_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${workerSecret}`,
            },
            body: JSON.stringify({ token }),
          });
          resolved = await res.json();
          if (!res.ok || !resolved.email) {
            return failure(resolved.error ?? "resolve_failed");
          }
          if (resolved.product !== "wed") return failure("wrong_product");
        } catch {
          return failure("resolve_unreachable");
        }

        // Server-only client, loaded dynamically per client.server.ts's own
        // convention — a top-level import here would ship the service_role
        // key into the client bundle, since route files aren't .server.ts.
        const { supabaseAdmin } =
          await import("@/integrations/supabase/client.server");

        // generateLink creates the user if this email has never signed in
        // here before — no separate find-or-create step needed. This is the
        // one Supabase call in the whole flow that ever sees the email; the
        // dashboard's token never carried it.
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: resolved.email,
          options: { redirectTo: `${origin}/admin` },
        });
        if (error || !data.properties?.action_link) {
          return failure("session_creation_failed");
        }

        // Following this link is what actually establishes the session —
        // Supabase verifies the embedded one-time code and redirects to
        // redirectTo with the session in the URL fragment, which the client
        // SDK picks up automatically (detectSessionInUrl, on by default).
        return redirect(data.properties.action_link);
      },
    },
  },
});
