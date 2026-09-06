import { useState, type FormEvent } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type {
  Guest,
  Rsvp,
  SeatingAssignment,
  SeatingTable,
  Wedding,
} from "./types";
import { defaultSeatingMessage } from "./utils";
import { AButton, AInput, ALabel, EmptyState } from "./ui";

export function SeatingList({
  wedding,
  guests,
  rsvps,
  tables,
  assignments,
  published,
  reload,
  inviteUrl,
  seatsUsed,
}: {
  wedding: Wedding;
  guests: Guest[];
  rsvps: Rsvp[];
  tables: SeatingTable[];
  assignments: SeatingAssignment[];
  published: boolean;
  reload: () => Promise<void>;
  inviteUrl: string;
  seatsUsed: (tableId: string) => number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addingTable, setAddingTable] = useState(false);
  const [assigning, setAssigning] = useState<{ tableId?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const confirmedGuests = guests.filter((g) =>
    rsvps.some((r) => r.guest_code === g.code && r.attending),
  );
  const assignedCodes = new Set(assignments.map((a) => a.guest_code));
  const unassigned = guests.filter((g) => !assignedCodes.has(g.code));

  const togglePublish = async () => {
    setBusy(true);
    await supabase.from("seating_config").upsert({
      wedding_id: wedding.id,
      published: !published,
      updated_at: new Date().toISOString(),
    });
    await reload();
    setBusy(false);
  };

  const removeTable = async (id: string) => {
    if (!confirm("Delete this table and all its assignments?")) return;
    await supabase.from("seating_tables").delete().eq("id", id);
    await reload();
  };

  const unassignGuest = async (guestCode: string) => {
    await supabase
      .from("seating_assignments")
      .delete()
      .eq("wedding_id", wedding.id)
      .eq("guest_code", guestCode);
    await reload();
  };

  const moveGuest = async (guestCode: string, newTableId: string) => {
    const guest = guests.find((g) => g.code === guestCode);
    const table = tables.find((t) => t.id === newTableId);
    if (!guest || !table) return;
    if (seatsUsed(table.id) + guest.seats > table.capacity) {
      alert(`Table ${table.table_number} would exceed capacity`);
      return;
    }
    await supabase
      .from("seating_assignments")
      .update({ table_id: newTableId, updated_at: new Date().toISOString() })
      .eq("wedding_id", wedding.id)
      .eq("guest_code", guestCode);
    await reload();
  };

  const copySeatingMessage = async (guestCode: string) => {
    const url = `${inviteUrl}/seating?code=${guestCode}`;
    await navigator.clipboard.writeText(defaultSeatingMessage(wedding, url));
    setCopiedCode(guestCode);
    setTimeout(() => setCopiedCode((c) => (c === guestCode ? null : c)), 2000);
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5">
        <AButton
          onClick={togglePublish}
          disabled={busy}
          className="h-10 flex-1 text-[11px]"
        >
          {published ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
          {published ? "Published to guests" : "Unpublished"}
        </AButton>
        <AButton
          onClick={() => setAddingTable(true)}
          className="h-10 text-[11px]"
        >
          <Plus className="h-3.5 w-3.5" /> Table
        </AButton>
      </div>

      <div className="flex-1 overflow-y-auto border-t-2 border-[var(--admin-ink)] pb-4">
        {tables.length === 0 ? (
          <EmptyState>No tables yet. Add your first table above.</EmptyState>
        ) : (
          tables.map((t) => {
            const used = seatsUsed(t.id);
            const over = used > t.capacity;
            const isOpen = expanded === t.id;
            const tAssignments = assignments.filter((a) => a.table_id === t.id);
            return (
              <div
                key={t.id}
                className="border-b border-[var(--admin-line-soft)]"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
                >
                  <span
                    className="grid h-[38px] w-[38px] shrink-0 place-items-center border-2 border-[var(--admin-ink)] text-sm font-extrabold"
                    style={{
                      background: over
                        ? "var(--admin-accent)"
                        : "var(--admin-ink)",
                      color: "#fff",
                      borderColor: over
                        ? "var(--admin-accent)"
                        : "var(--admin-ink)",
                    }}
                  >
                    {t.table_number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold">
                      {t.table_name || `Table ${t.table_number}`}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="block h-1.5 flex-1 bg-[var(--admin-line-soft)]">
                        <span
                          className="block h-1.5"
                          style={{
                            width: `${Math.min(100, (used / (t.capacity || 1)) * 100)}%`,
                            background: over
                              ? "var(--admin-accent)"
                              : "var(--admin-ink)",
                          }}
                        />
                      </span>
                      <span
                        className="shrink-0 text-[11px] font-semibold"
                        style={{
                          color: over
                            ? "var(--admin-accent-active)"
                            : "var(--admin-muted)",
                        }}
                      >
                        {used} / {t.capacity}
                      </span>
                    </span>
                  </span>
                  {isOpen ? (
                    <ChevronDown className="h-[15px] w-[15px] shrink-0" />
                  ) : (
                    <ChevronRight className="h-[15px] w-[15px] shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pl-[62px]">
                    {tAssignments.length === 0 ? (
                      <p className="text-xs text-[var(--admin-muted)]">
                        No one seated here yet.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {tAssignments.map((a) => {
                          const g = guests.find(
                            (gg) => gg.code === a.guest_code,
                          );
                          return (
                            <div
                              key={a.id}
                              className="flex items-center gap-2 border border-[var(--admin-line)] bg-[var(--admin-surface)] px-2.5 py-1.5 text-xs"
                            >
                              <span className="min-w-0 flex-1 truncate">
                                {g ? g.name : a.guest_code}
                                <span className="ml-1 text-[var(--admin-muted)]">
                                  ({g?.seats ?? "?"})
                                </span>
                              </span>
                              <button
                                onClick={() => copySeatingMessage(a.guest_code)}
                                title="Copy seating message"
                              >
                                {copiedCode === a.guest_code ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 text-[var(--admin-muted)]" />
                                )}
                              </button>
                              <select
                                value={a.table_id}
                                onChange={(e) =>
                                  moveGuest(a.guest_code, e.target.value)
                                }
                                className="border border-[var(--admin-line)] bg-transparent px-1 py-0.5 text-[11px]"
                              >
                                {tables
                                  .filter((tt) => tt.is_active)
                                  .map((tt) => (
                                    <option key={tt.id} value={tt.id}>
                                      T{tt.table_number}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => unassignGuest(a.guest_code)}
                                title="Remove"
                              >
                                <X className="h-3.5 w-3.5 text-[var(--admin-accent-active)]" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-2.5 flex items-center gap-2">
                      <AButton
                        onClick={() => setAssigning({ tableId: t.id })}
                        className="h-9 flex-1 text-[11px]"
                      >
                        <Plus className="h-3.5 w-3.5" /> Seat a guest here
                      </AButton>
                      <button
                        onClick={() => removeTable(t.id)}
                        className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[var(--admin-ink)] text-[var(--admin-accent-active)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {unassigned.length > 0 && (
        <div className="border-t-2 border-[var(--admin-ink)] bg-[var(--admin-accent-soft)] px-5 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--admin-accent-active)]">
              {unassigned.reduce((s, g) => s + g.seats, 0)} seats unassigned
            </span>
            <button
              onClick={() => setAssigning({})}
              className="text-[11px] font-semibold text-[var(--admin-accent-active)]"
            >
              Assign
            </button>
          </div>
          <div className="mt-2.5 flex gap-1.5 overflow-x-auto">
            {unassigned.slice(0, 6).map((g) => (
              <button
                key={g.code}
                onClick={() => setAssigning({})}
                className="shrink-0 whitespace-nowrap border-2 border-[var(--admin-accent-active)] px-2 py-1.5 text-[11px] font-semibold text-[var(--admin-accent-active)]"
              >
                {g.name.split(" ")[0]} · {g.seats}
              </button>
            ))}
          </div>
        </div>
      )}

      {addingTable && (
        <AddTableSheet
          weddingId={wedding.id}
          nextNumber={(tables.at(-1)?.table_number ?? 0) + 1}
          onClose={() => setAddingTable(false)}
          onAdded={reload}
        />
      )}
      {assigning && (
        <AssignSheet
          wedding={wedding}
          guests={guests}
          confirmedGuests={confirmedGuests}
          unassigned={unassigned}
          tables={tables}
          seatsUsed={seatsUsed}
          initialTableId={assigning.tableId}
          onClose={() => setAssigning(null)}
          onAssigned={reload}
        />
      )}
    </div>
  );
}

function AddTableSheet({
  weddingId,
  nextNumber,
  onClose,
  onAdded,
}: {
  weddingId: string;
  nextNumber: number;
  onClose: () => void;
  onAdded: () => Promise<void>;
}) {
  const [tableNumber, setTableNumber] = useState(String(nextNumber));
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tableNumber) return;
    setBusy(true);
    const { error } = await supabase.from("seating_tables").insert({
      wedding_id: weddingId,
      table_number: parseInt(tableNumber),
      table_name: tableName.trim() || null,
      capacity,
      map_x: 50,
      map_y: 50,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await onAdded();
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-3 border-t-2 border-[var(--admin-ink)] bg-[var(--admin-paper)] p-5 pb-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Add table</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center border-2 border-[var(--admin-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <ALabel>Table #</ALabel>
            <AInput
              type="number"
              min={1}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <ALabel>Capacity</ALabel>
            <AInput
              type="number"
              min={1}
              max={30}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 10)}
            />
          </div>
        </div>
        <div>
          <ALabel>Name on the plan (optional)</ALabel>
          <AInput
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Head table, Groom's family…"
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--admin-accent-active)]">{error}</p>
        )}
        <AButton
          type="submit"
          variant="primary"
          disabled={busy}
          className="h-[52px]"
        >
          {busy ? "Adding…" : "Add table"}
        </AButton>
      </form>
    </div>
  );
}

function AssignSheet({
  wedding,
  guests,
  confirmedGuests,
  unassigned,
  tables,
  seatsUsed,
  initialTableId,
  onClose,
  onAssigned,
}: {
  wedding: Wedding;
  guests: Guest[];
  confirmedGuests: Guest[];
  unassigned: Guest[];
  tables: SeatingTable[];
  seatsUsed: (tableId: string) => number;
  initialTableId?: string;
  onClose: () => void;
  onAssigned: () => Promise<void>;
}) {
  const unassignedConfirmed = confirmedGuests.filter((g) =>
    unassigned.includes(g),
  );
  const unassignedOther = unassigned.filter(
    (g) => !unassignedConfirmed.includes(g),
  );
  const [code, setCode] = useState(
    unassignedConfirmed[0]?.code ?? unassignedOther[0]?.code ?? "",
  );
  const [tableId, setTableId] = useState(initialTableId ?? tables[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const table = tables.find((t) => t.id === tableId);
    const guest = guests.find((g) => g.code === code);
    if (!table || !guest) return;
    if (seatsUsed(table.id) + guest.seats > table.capacity) {
      setError(
        `Table ${table.table_number} would exceed capacity (${seatsUsed(table.id) + guest.seats}/${table.capacity}).`,
      );
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("seating_assignments")
      .insert({ wedding_id: wedding.id, guest_code: code, table_id: tableId });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await onAssigned();
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-3 border-t-2 border-[var(--admin-ink)] bg-[var(--admin-paper)] p-5 pb-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Seat a guest</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center border-2 border-[var(--admin-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>
          <ALabel>Guest</ALabel>
          <select
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-[50px] w-full border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-3.5 text-sm"
          >
            <option value="">Select guest…</option>
            <optgroup label="Confirmed">
              {unassignedConfirmed.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.name} ({g.code}) — {g.seats} seats
                </option>
              ))}
            </optgroup>
            <optgroup label="Other">
              {unassignedOther.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.name} ({g.code}) — {g.seats} seats
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <ALabel>Table</ALabel>
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className="h-[50px] w-full border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-3.5 text-sm"
          >
            <option value="">Select table…</option>
            {tables
              .filter((t) => t.is_active)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.table_number} ({seatsUsed(t.id)}/{t.capacity})
                </option>
              ))}
          </select>
        </div>
        {error && (
          <p className="text-xs text-[var(--admin-accent-active)]">{error}</p>
        )}
        <AButton
          type="submit"
          variant="primary"
          disabled={busy || !code || !tableId}
          className="h-[52px]"
        >
          {busy ? "Seating…" : "Seat guest"}
        </AButton>
      </form>
    </div>
  );
}
