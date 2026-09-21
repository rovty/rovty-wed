import { Context, useWeddingPlan, type Plan } from "@/lib/billing-plan";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ORIGIN } from "@/lib/platform";
export function PlanProvider({
  wedding,
  children,
}: {
  wedding?: string;
  children: ReactNode;
}) {
  const [plan, setPlan] = useState<Plan>();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const r = await fetch("/api/plan", {
          headers: { Authorization: `Bearer ${data.session?.access_token}` },
          signal: c.signal,
          cache: "no-store",
        });
        const result = await r.json();
        if (!r.ok)
          throw new Error(result.error || "Could not check your plan.");
        if (!c.signal.aborted) {
          setPlan(
            wedding
              ? result.weddings[wedding] || { active: false, features: [] }
              : result.own,
          );
          setError("");
        }
      } catch (e) {
        if (!c.signal.aborted) {
          setPlan(undefined);
          setError((e as Error).message);
        }
      }
    };
    void load();
    const refresh = () => {
      if (!document.hidden) void load();
    };
    const timer = setInterval(refresh, 60000);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      c.abort();
      clearInterval(timer);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [wedding, attempt]);
  if (!plan)
    return (
      <div className="p-8" role={error ? "alert" : "status"}>
        {error || "Checking your plan…"}
        {error && (
          <button
            className="ml-4 underline"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Try again
          </button>
        )}
      </div>
    );
  return (
    <Context.Provider value={plan}>
      {!plan.features.includes("website") ? (
        <PlanGate feature="website">{children}</PlanGate>
      ) : (
        children
      )}
    </Context.Provider>
  );
}
export function PlanGate({
  feature,
  children,
}: {
  feature: string;
  children: ReactNode;
}) {
  const plan = useWeddingPlan();
  if (!plan || plan.features.includes(feature)) return <>{children}</>;
  return (
    <section className="m-5 border border-stone-300 bg-stone-50 p-6">
      <p className="text-xs uppercase tracking-widest text-stone-500">
        Your Rovty Wed plan
      </p>
      <h2 className="mt-3 text-2xl font-semibold">
        {feature === "canvas"
          ? "Create freely with Studio"
          : feature === "website"
            ? "Choose a plan to get started"
            : "More possibilities with Complete"}
      </h2>
      <p className="my-4 text-sm leading-relaxed text-stone-600">
        {feature === "canvas"
          ? "Design custom sections with movable text, photos and shapes."
          : feature === "website"
            ? "An active wedding plan is required. Team invitations give access to the owner's wedding, and cannot be used to create another wedding."
            : "Seating and wedding team tools are included in Complete and Studio."}
      </p>
      <a
        className="inline-block bg-stone-900 px-5 py-3 text-sm font-semibold text-white"
        href={`${DASHBOARD_ORIGIN}/billing/wed`}
      >
        View plans ↗
      </a>
    </section>
  );
}
