import { useEffect, useState } from "react";
const origin = new URL(
  import.meta.env.VITE_ROVTY_DASHBOARD_ORIGIN || "https://dash.rovty.com",
).origin;
interface Price {
  code: string;
  price_cents: number;
  months: number;
}
export function useWedPricing() {
  const [plans, setPlans] = useState<Price[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    fetch(`${origin}/api/billing/catalog?product=wed`, { signal: c.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        if (!Array.isArray(d.plans)) throw new Error();
        if (!c.signal.aborted) setPlans(d.plans);
      })
      .catch(() => {
        if (!c.signal.aborted) setFailed(true);
      });
    return () => c.abort();
  }, []);
  return {
    available: (name: string) =>
      !plans || plans.some((p) => p.code === name.toLowerCase()),
    price: (name: string) => {
      const p = plans?.find((p) => p.code === name.toLowerCase());
      return p
        ? new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 2,
          }).format(p.price_cents / 100)
        : failed
          ? "View current pricing"
          : "Loading price…";
    },
    months: (name: string) =>
      plans?.find((p) => p.code === name.toLowerCase())?.months,
    href: (name: string) =>
      `${origin}/billing/wed?plan=${encodeURIComponent(name.toLowerCase())}`,
  };
}
