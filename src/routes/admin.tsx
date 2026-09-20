import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Onboarding } from "@/components/admin/Onboarding";
import { AdminShell } from "@/components/admin/AdminShell";
import { AButton } from "@/components/admin/ui";
import { UI_FONTS_HREF, fontLinks } from "@/lib/wedding";
import { adminSearch, DASHBOARD_ORIGIN } from "@/lib/platform";
import { PlatformBar } from "@/components/admin/PlatformBar";

export const Route = createFileRoute("/admin")({
  ssr: false,
  validateSearch: adminSearch,
  head: () => ({
    meta: [
      { title: "Wedding Admin | Rovty Wed" },
      { name: "robots", content: "noindex" },
    ],
    // The studio requests fonts for visible and selected templates on demand.
    links: [
      { rel: "preconnect", href: DASHBOARD_ORIGIN },
      ...fontLinks(UI_FONTS_HREF),
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
  }),
  component: AdminPage,
});

type Wedding = Tables<"weddings">;

function AdminPage() {
  const navigate = useNavigate();
  const { section = "home" } = Route.useSearch();
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
    let active = true;
    const restore = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      await loadWedding();
      if (active) setReady(true);
    };
    void restore();
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void restore();
    };
    window.addEventListener("pageshow", onPageShow);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") void navigate({ to: "/auth", replace: true });
    });
    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [navigate, loadWedding]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
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
    return (
      <div className="flex h-dvh flex-col">
        <PlatformBar />
        <div className="min-h-0 flex-1">
          <Onboarding onCreated={setWedding} onSignOut={signOut} />
        </div>
      </div>
    );
  }

  return (
    <AdminShell
      wedding={wedding}
      onSignOut={signOut}
      onWeddingChange={setWedding}
      section={section}
      onSectionChange={(next) =>
        void navigate({
          to: "/admin",
          search: next === "home" ? {} : { section: next },
          resetScroll: false,
        })
      }
    />
  );
}
