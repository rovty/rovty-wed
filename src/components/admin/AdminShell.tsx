import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  AdminSection,
  Guest,
  Rsvp,
  SeatingAssignment,
  SeatingTable,
  Wedding,
} from "./types";
import type { GuestFilter } from "./Guests";
import { BottomNav } from "./BottomNav";
import { Dashboard } from "./Dashboard";
import { Guests } from "./Guests";
import { Send } from "./Send";
import { SeatingSection } from "./SeatingSection";
import { DesignSection } from "./DesignSection";
import { MoreSection } from "./MoreSection";
import { AppFrame, ScreenHeader } from "./ui";

export function AdminShell({
  wedding,
  onSignOut,
  onWeddingChange,
}: {
  wedding: Wedding;
  onSignOut: () => void;
  onWeddingChange: (w: Wedding) => void;
}) {
  const [section, setSection] = useState<AdminSection>("home");
  const [guestsView, setGuestsView] = useState<"list" | "send">("list");
  const [guestsFilter, setGuestsFilter] = useState<GuestFilter>("all");
  const [guestsKey, setGuestsKey] = useState(0);
  const [seatingView, setSeatingView] = useState<"list" | "hall">("list");
  const [seatingKey, setSeatingKey] = useState(0);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([]);
  const [seatingPublished, setSeatingPublished] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = `${origin}/${wedding.slug}`;

  const load = useCallback(async () => {
    const [g, r, t, a, cfg] = await Promise.all([
      supabase
        .from("guests")
        .select("*")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("rsvps")
        .select("*")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("seating_tables")
        .select("*")
        .eq("wedding_id", wedding.id)
        .order("table_number"),
      supabase
        .from("seating_assignments")
        .select("*")
        .eq("wedding_id", wedding.id),
      supabase
        .from("seating_config")
        .select("*")
        .eq("wedding_id", wedding.id)
        .maybeSingle(),
    ]);
    setGuests((g.data as Guest[]) ?? []);
    setRsvps((r.data as Rsvp[]) ?? []);
    setTables((t.data as SeatingTable[]) ?? []);
    setAssignments((a.data as SeatingAssignment[]) ?? []);
    setSeatingPublished(cfg.data?.published ?? false);
  }, [wedding.id]);

  useEffect(() => {
    load();
  }, [load]);

  const goTo: Parameters<typeof Dashboard>[0]["goTo"] = (target, opts) => {
    setSection(target);
    if (opts?.guestsView) {
      setGuestsView(opts.guestsView);
    }
    if (opts?.guestsFilter) {
      setGuestsFilter(opts.guestsFilter);
      setGuestsKey((k) => k + 1);
      setGuestsView("list");
    }
    if (opts?.seatingView) {
      setSeatingView(opts.seatingView);
      setSeatingKey((k) => k + 1);
    }
  };

  return (
    <AppFrame>
      {section === "home" && (
        <Dashboard
          wedding={wedding}
          guests={guests}
          rsvps={rsvps}
          tables={tables}
          assignments={assignments}
          inviteUrl={inviteUrl}
          goTo={goTo}
        />
      )}

      {section === "guests" &&
        (guestsView === "send" ? (
          <Send
            wedding={wedding}
            guests={guests}
            reload={load}
            inviteUrl={inviteUrl}
            onBack={() => setGuestsView("list")}
            onEditWording={() => setSection("design")}
          />
        ) : (
          <Guests
            key={guestsKey}
            wedding={wedding}
            guests={guests}
            rsvps={rsvps}
            reload={load}
            inviteUrl={inviteUrl}
            initialFilter={guestsFilter}
            onSend={() => setGuestsView("send")}
          />
        ))}

      {section === "seating" && (
        <SeatingSection
          key={seatingKey}
          wedding={wedding}
          guests={guests}
          rsvps={rsvps}
          tables={tables}
          assignments={assignments}
          published={seatingPublished}
          reload={load}
          inviteUrl={inviteUrl}
          initialView={seatingView}
          onWeddingChange={onWeddingChange}
        />
      )}

      {section === "design" && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ScreenHeader
            title="Design"
            subtitle="Everything here appears on the invitation, whichever template you're using."
          />
          <DesignSection
            wedding={wedding}
            onChange={onWeddingChange}
            inviteUrl={inviteUrl}
          />
        </div>
      )}

      {section === "more" && (
        <MoreSection wedding={wedding} onSignOut={onSignOut} />
      )}

      <BottomNav active={section} onChange={setSection} />
    </AppFrame>
  );
}
