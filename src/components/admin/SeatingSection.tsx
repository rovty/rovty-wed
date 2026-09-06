import { useState } from "react";
import type {
  Guest,
  Rsvp,
  SeatingAssignment,
  SeatingTable,
  Wedding,
} from "./types";
import { SeatingList } from "./SeatingList";
import { HallPlan } from "./HallPlan";

export function SeatingSection({
  wedding,
  guests,
  rsvps,
  tables,
  assignments,
  published,
  reload,
  inviteUrl,
  initialView,
  onWeddingChange,
}: {
  wedding: Wedding;
  guests: Guest[];
  rsvps: Rsvp[];
  tables: SeatingTable[];
  assignments: SeatingAssignment[];
  published: boolean;
  reload: () => Promise<void>;
  inviteUrl: string;
  initialView?: "list" | "hall";
  onWeddingChange: (w: Wedding) => void;
}) {
  const [view, setView] = useState<"list" | "hall">(initialView ?? "list");

  const seatsUsed = (tableId: string) =>
    assignments
      .filter((a) => a.table_id === tableId)
      .reduce(
        (sum, a) =>
          sum + (guests.find((g) => g.code === a.guest_code)?.seats ?? 0),
        0,
      );
  const totalCapacitySeated = assignments.reduce(
    (sum, a) => sum + (guests.find((g) => g.code === a.guest_code)?.seats ?? 0),
    0,
  );
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="px-5 pb-0 pt-3.5">
        <div className="flex items-end justify-between">
          <h2 className="text-[28px] font-extrabold leading-none tracking-tight">
            Seating
          </h2>
          <span className="pb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
            {totalCapacitySeated} / {totalCapacity || 0} seated
          </span>
        </div>
        <div className="mt-3.5 grid grid-cols-2 border-2 border-[var(--admin-ink)]">
          <button
            onClick={() => setView("list")}
            className="h-[42px] text-[12px] font-bold uppercase tracking-[0.12em]"
            style={
              view === "list"
                ? { background: "var(--admin-ink)", color: "#fff" }
                : undefined
            }
          >
            List
          </button>
          <button
            onClick={() => setView("hall")}
            className="h-[42px] border-l-2 border-[var(--admin-ink)] text-[12px] font-semibold uppercase tracking-[0.12em]"
            style={
              view === "hall"
                ? { background: "var(--admin-ink)", color: "#fff" }
                : undefined
            }
          >
            Hall plan
          </button>
        </div>
      </div>

      {view === "list" ? (
        <SeatingList
          wedding={wedding}
          guests={guests}
          rsvps={rsvps}
          tables={tables}
          assignments={assignments}
          published={published}
          reload={reload}
          inviteUrl={inviteUrl}
          seatsUsed={seatsUsed}
        />
      ) : (
        <HallPlan
          wedding={wedding}
          guests={guests}
          tables={tables}
          published={published}
          reload={reload}
          onWeddingChange={onWeddingChange}
          seatsUsed={seatsUsed}
        />
      )}
    </div>
  );
}
