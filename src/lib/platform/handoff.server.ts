import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { finishHandoff, type HandoffIdentity } from "./handoff";
import { platformCall, tokenSessionId } from "./session.server";

export async function establishProductSession(identity: HandoffIdentity) {
  return finishHandoff(identity, {
    link: async (user, email) => {
      const { data, error } = await supabaseAdmin.rpc("rovty_link_account", {
        _platform_user: user,
        _email: email,
      });
      if (error) throw error;
      return data;
    },
    create: async (email) => {
      const { error } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (error) throw error;
    },
    updateEmail: async (user, email) => {
      const existing = await supabaseAdmin.auth.admin.getUserById(user);
      if (existing.error) throw existing.error;
      if (
        existing.data.user.email?.toLowerCase() === email.toLowerCase() &&
        existing.data.user.email_confirmed_at
      )
        return;
      // Auth enforces email uniqueness. Never merge an account on a collision.
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user, {
        email,
        email_confirm: true,
      });
      if (error) throw error;
    },
    signIn: async (email) => {
      const link = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      if (link.error || !link.data.properties?.hashed_token)
        throw link.error || new Error("Session link unavailable");
      // Never sign in on the shared service client: that would replace its
      // service authorization with a user's token for subsequent requests.
      const client = createClient(
        process.env.SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          process.env.SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        },
      );
      const { data, error } = await client.auth.verifyOtp({
        token_hash: link.data.properties.hashed_token,
        type: "magiclink",
      });
      if (error || !data.session)
        throw error || new Error("Session unavailable");
      return data.session;
    },
    bind: async (user, token, resolved) => {
      const session = tokenSessionId(token);
      if (!session) throw new Error("Session reference unavailable");
      const { error } = await supabaseAdmin.rpc("rovty_bind_session", {
        _user: user,
        _session: session,
        _platform_user: resolved.user_id,
        _platform_session: resolved.session_id,
      });
      if (error) throw error;
    },
    recheck: async (resolved) => {
      await platformCall("/api/product-session/check", {
        product: "wed",
        user_id: resolved.user_id,
        session_id: resolved.session_id,
      });
    },
  });
}
