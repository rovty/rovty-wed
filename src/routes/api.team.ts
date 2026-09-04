// Invite/remove endpoints for wedding_members — kept server-side (rather
// than direct PostgREST calls from the client) because that table only
// grants `authenticated` a select policy (see the wedding_members
// migration's own comment): owner-only invite/remove is enforced here,
// not by RLS, and inviting needs the service-role key to call Supabase
// Auth's admin API in the first place.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

async function requireOwner(request: Request, weddingId: string) {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: wedding, error } = await supabaseAdmin
    .from("weddings")
    .select("id, owner_id")
    .eq("id", weddingId)
    .maybeSingle();
  if (error || !wedding || wedding.owner_id !== userData.user.id) return null;
  return { userId: userData.user.id };
}

export const Route = createFileRoute("/api/team")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { wedding_id?: unknown; email?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body" }, { status: 400 });
        }
        const weddingId = typeof body.wedding_id === "string" ? body.wedding_id : null;
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
        if (!weddingId || !email) {
          return Response.json({ error: "Missing wedding_id or email" }, { status: 400 });
        }

        const owner = await requireOwner(request, weddingId);
        if (!owner) return Response.json({ error: "Not authorized" }, { status: 403 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const origin = new URL(request.url).origin;
        // inviteUserByEmail both creates the auth user (if new) and sends
        // Supabase's own "you've been invited" email — no email sending of
        // our own to build or configure.
        const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          email,
          { redirectTo: `${origin}/admin` },
        );
        if (inviteError || !invited.user) {
          const alreadyExists = /already registered|already exists/i.test(inviteError?.message ?? "");
          return Response.json(
            {
              error: alreadyExists
                ? "That person already has a Rovty account — they may already have access, or contact us to add them."
                : (inviteError?.message ?? "Could not send invite"),
            },
            { status: 400 },
          );
        }

        const { error: memberError } = await supabaseAdmin.from("wedding_members").insert({
          wedding_id: weddingId,
          user_id: invited.user.id,
          email,
          invited_by: owner.userId,
        });
        if (memberError) {
          return Response.json(
            { error: memberError.code === "23505" ? "They're already on your team." : memberError.message },
            { status: 400 },
          );
        }
        return Response.json({ ok: true });
      },
      DELETE: async ({ request }) => {
        let body: { wedding_id?: unknown; member_id?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body" }, { status: 400 });
        }
        const weddingId = typeof body.wedding_id === "string" ? body.wedding_id : null;
        const memberId = typeof body.member_id === "string" ? body.member_id : null;
        if (!weddingId || !memberId) {
          return Response.json({ error: "Missing wedding_id or member_id" }, { status: 400 });
        }

        const owner = await requireOwner(request, weddingId);
        if (!owner) return Response.json({ error: "Not authorized" }, { status: 403 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("wedding_members")
          .delete()
          .eq("id", memberId)
          .eq("wedding_id", weddingId);
        if (error) return Response.json({ error: error.message }, { status: 400 });
        return Response.json({ ok: true });
      },
    },
  },
});
