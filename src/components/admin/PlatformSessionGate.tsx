import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ORIGIN, WED_SIGN_IN_URL } from "@/lib/platform";
import {
  checkPlatformSession,
  SESSION_EVENT,
  signingOut,
  type SessionIssue,
} from "@/lib/platform/session";

export function PlatformSessionGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false),
    [issue, setIssue] = useState<SessionIssue | null>(null),
    [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const readyRef = useRef(false);
  useEffect(() => {
    let active = true,
      checking = false,
      terminated = false;
    const controller = new AbortController();
    const fail = (problem: SessionIssue) => {
      if (!active || signingOut) return;
      setIssue(problem);
      if ((problem.status === 401 || problem.status === 403) && !terminated) {
        terminated = true;
        readyRef.current = false;
        setReady(false);
        queryClient.clear();
        // This product's cached tokens cannot reconnect themselves after a
        // central logout. The user's next action starts a fresh SSO handoff.
        void supabase.auth.signOut({ scope: "local" });
      }
    };
    const verify = async () => {
      if (checking || signingOut || terminated) return;
      checking = true;
      try {
        const session = await checkPlatformSession(controller.signal);
        if (!active) return;
        if (!session) {
          if (readyRef.current)
            fail({ message: "Your Rovty session has ended.", status: 401 });
          else if (!issue) void navigate({ to: "/auth", replace: true });
          return;
        }
        setIssue(null);
        setReady(true);
        readyRef.current = true;
      } catch (error) {
        if (!controller.signal.aborted)
          fail(
            error && typeof error === "object" && "status" in error
              ? (error as SessionIssue)
              : {
                  message: "Couldn't reach Rovty. Please try again.",
                  status: 503,
                },
          );
      } finally {
        checking = false;
      }
    };
    const receive = (event: Event) =>
      fail((event as CustomEvent<SessionIssue>).detail);
    const visible = () => {
      if (document.visibilityState === "visible") void verify();
    };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && !signingOut && readyRef.current)
        fail({ message: "Your Rovty session has ended.", status: 401 });
    });
    void verify();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void verify();
    }, 15000);
    window.addEventListener(SESSION_EVENT, receive);
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("pageshow", visible);
    return () => {
      subscription.unsubscribe();
      active = false;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener(SESSION_EVENT, receive);
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("pageshow", visible);
    };
    // Readiness and errors are state of this check, not triggers for another one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, navigate, queryClient]);
  if (!ready)
    return (
      <main className="admin-portal grid min-h-dvh place-items-center px-6">
        <div className="w-full max-w-md border-2 border-black p-7">
          <h1 className="text-2xl font-bold">
            {issue
              ? issue.status === 503
                ? "Connection interrupted"
                : "Reconnect with Rovty"
              : "Opening Rovty Wed…"}
          </h1>
          {issue && (
            <>
              <p className="my-4 text-sm" role="alert">
                {issue.message}
              </p>
              <div className="flex flex-wrap gap-3">
                {issue.status === 503 ? (
                  <button
                    className="border-2 border-black px-4 py-3 font-semibold"
                    onClick={() => setAttempt((v) => v + 1)}
                  >
                    Try again
                  </button>
                ) : (
                  <a
                    className="bg-black px-4 py-3 font-semibold text-white"
                    href={WED_SIGN_IN_URL}
                  >
                    Continue with Rovty
                  </a>
                )}
                <a className="px-4 py-3 underline" href={DASHBOARD_ORIGIN}>
                  Your apps
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    );
  return (
    <>
      {issue && (
        <div
          className="admin-portal fixed inset-x-4 bottom-4 z-[200] mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 border-2 border-black bg-[#eee7d8] px-5 py-3 text-sm"
          role="alert"
        >
          <span>{issue.message}</span>
          <button
            className="font-bold underline"
            onClick={() => setAttempt((v) => v + 1)}
          >
            Try again
          </button>
        </div>
      )}
      {children}
    </>
  );
}
