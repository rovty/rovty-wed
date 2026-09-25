import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PublicWedding } from "@/lib/wedding";

type Guest = {
  code: string;
  name: string;
  title: string | null;
  seats: number;
};
export type OpenerPhase = "intro" | "leave" | "gone";

/**
 * Shared state machine behind every signature template's opener: each one
 * has its own bespoke animation (see the source mockups this collection was
 * built from), but all of them share the same shape — an intro that
 * auto-dismisses on its own after a couple of seconds, can be skipped early
 * with a tap, honors prefers-reduced-motion, and greets a guest arriving via
 * their personal `?code=` link the same way InvitationOpener.tsx does for
 * every other template.
 */
export function useSignatureOpener(
  wedding: PublicWedding,
  { autoMs = 2700, leaveMs = 1500 }: { autoMs?: number; leaveMs?: number } = {},
) {
  const [phase, setPhase] = useState<OpenerPhase>("intro");
  const [guest, setGuest] = useState<Guest | null>(null);
  const t1 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t2 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const leave = useCallback(() => {
    setPhase((p) => {
      if (p !== "intro") return p;
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      clearTimeout(t1.current);
      t2.current = setTimeout(() => setPhase("gone"), leaveMs);
      return "leave";
    });
  }, [leaveMs]);

  const schedule = useCallback(() => {
    clearTimeout(t1.current);
    clearTimeout(t2.current);
    t1.current = setTimeout(leave, autoMs);
  }, [autoMs, leave]);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("gone");
      return;
    }
    schedule();
    return () => {
      clearTimeout(t1.current);
      clearTimeout(t2.current);
    };
  }, [schedule]);

  useEffect(() => {
    if (phase === "gone") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;
    supabase
      .rpc("get_guest_by_code", { _slug: wedding.slug, _code: code })
      .then(({ data, error }) => {
        if (!error && data && (data as Guest[]).length > 0) {
          setGuest((data as Guest[])[0]);
        }
      });
  }, [wedding.slug]);

  const greeting = guest
    ? `${guest.title ? `${guest.title} ` : ""}${guest.name}`
    : "Honored Guest";

  return {
    phase,
    guest,
    greeting,
    leave,
    replay: () => {
      setPhase("intro");
      schedule();
    },
  };
}
