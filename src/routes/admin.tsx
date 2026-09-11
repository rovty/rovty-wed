import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Onboarding } from "@/components/admin/Onboarding";
import { AdminShell } from "@/components/admin/AdminShell";
import { AButton } from "@/components/admin/ui";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Wedding Admin | Rovty Wed" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Wedding = Tables<"weddings">;

function AdminPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  // Distinct from "wedding === null (genuinely no row — first-time owner,
  // show onboarding)": this is "the query itself failed", e.g. an RLS bug
  // that should show an error, not silently push someone into "create a
  // wedding" as if they'd never had access to begin with.
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadWedding = useCallback(async () => {
    const { data, error } = await supabase
      .from("weddings")
      .select("*")
      .maybeSingle();
    if (error) {
      setLoadError(error.message);
      return;
    }
    setLoadError(null);
    setWedding(data);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      await loadWedding();
      setReady(true);
    })();
  }, [navigate, loadWedding]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (!ready) {
    return (
      <main className="admin-portal grid min-h-[100dvh] place-items-center text-sm text-[var(--admin-muted)]">
        Loading…
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="admin-portal grid min-h-[100dvh] place-items-center px-5 text-center">
        <div className="w-full max-w-sm border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] p-7">
          <h1 className="text-2xl font-extrabold">
            Couldn't load your account
          </h1>
          <p className="mt-3 text-sm text-[var(--admin-muted)]">{loadError}</p>
          <AButton
            variant="primary"
            onClick={() => {
              setReady(false);
              loadWedding().then(() => setReady(true));
            }}
            className="mt-5 h-11 w-full"
          >
            Try again
          </AButton>
        </div>
      </main>
    );
  }

  if (!wedding) {
    return <Onboarding onCreated={setWedding} onSignOut={signOut} />;
  }

  return (
    <AdminShell
      wedding={wedding}
      onSignOut={signOut}
      onWeddingChange={setWedding}
    />
  );
}
