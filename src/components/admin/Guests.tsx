import { useState, type FormEvent } from "react";
import { Search, UserPlus, Copy, Check, Trash2, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Guest, Rsvp, Wedding } from "./types";
import { randCode, defaultInvitationMessage } from "./utils";
import { AButton, AInput, ALabel, EmptyState } from "./ui";

export type GuestFilter = "all" | "pending" | "yes" | "no";
type Filter = GuestFilter;

// Same traffic-light colors as the filter chips below, so a guest's RSVP
// status reads from the chip you tapped to see them rather than needing
// its own repeated badge on every row (which is what used to sit here).
const FILTER_COLOR: Record<Filter, string> = {
  all: "var(--admin-ink)",
  pending: "#b45309",
  yes: "#1a7f37",
  no: "var(--admin-accent-active)",
};

// The three titles that cover the vast majority of a guest list — quick
// tap-to-select instead of typing. Not exhaustive (no "Dr.", no "Mr. &
// Mrs.") on purpose: title is optional, so anyone who doesn't fit one of
// these three just leaves it blank rather than typing a one-off value.
const GUEST_TITLES = ["Mr.", "Mrs.", "Ms."] as const;

export function Guests({
  wedding,
  guests,
  rsvps,
  reload,
  inviteUrl,
  initialFilter,
  onSend,
}: {
  wedding: Wedding;
  guests: Guest[];
  rsvps: Rsvp[];
  reload: () => Promise<void>;
  inviteUrl: string;
  initialFilter?: Filter;
  onSend: () => void;
}) {
  const [filter, setFilter] = useState<Filter>(initialFilter ?? "all");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const latestRsvp = (code: string) =>
    [...rsvps]
      .filter((r) => r.guest_code === code)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

  const pending = guests.filter((g) => !latestRsvp(g.code));
  const yes = guests.filter((g) => latestRsvp(g.code)?.attending);
  const no = guests.filter(
    (g) => latestRsvp(g.code) && !latestRsvp(g.code)?.attending,
  );
  const totalSeats = guests.reduce((s, g) => s + g.seats, 0);

  const byFilter =
    filter === "pending"
      ? pending
      : filter === "yes"
        ? yes
        : filter === "no"
          ? no
          : guests;
  const q = search.trim().toLowerCase();
  const visible = q
    ? byFilter.filter(
        (g) =>
          g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q),
      )
    : byFilter;

  const removeGuest = async (code: string) => {
    // Native confirm() rather than deleting on the first tap — a guest row
    // sits right next to Copy, and one accidental tap should never be able
    // to silently remove someone from the list.
    if (!confirm(`Delete guest ${code}? Their RSVPs will also be removed.`))
      return;
    await supabase
      .from("guests")
      .delete()
      .eq("wedding_id", wedding.id)
      .eq("code", code);
    await reload();
  };

  const copyInvitation = async (code: string) => {
    const url = `${inviteUrl}?code=${code}`;
    const before = wedding.invite_message_before?.trim();
    const after = wedding.invite_message_after?.trim();
    const message =
      before || after
        ? [before, url, after].filter(Boolean).join("\n\n")
        : defaultInvitationMessage(wedding, url);
    await navigator.clipboard.writeText(message);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 2000);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="px-5 pb-3 pt-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[28px] font-extrabold leading-none tracking-tight">
            Guests
          </h2>
          <span className="pb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
            {guests.length} · {totalSeats} seats
          </span>
        </div>
        <div className="mt-3 flex h-11 items-center gap-2 border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-3">
          <Search className="h-4 w-4 shrink-0 text-[var(--admin-faint)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or code"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--admin-faint)]"
          />
        </div>
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto">
          {(
            [
              ["all", `All ${guests.length}`],
              ["pending", `Pending ${pending.length}`],
              ["yes", `Yes ${yes.length}`],
              ["no", `No ${no.length}`],
            ] as [Filter, string][]
          ).map(([id, label]) => {
            const color = FILTER_COLOR[id];
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="h-[34px] shrink-0 whitespace-nowrap border-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
                style={{
                  borderColor: color,
                  background: active ? color : "transparent",
                  color: active ? "#fff" : color,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-t-2 border-[var(--admin-ink)] pb-24">
        {visible.length === 0 ? (
          <EmptyState>
            {guests.length === 0
              ? "No guests yet. Add your first guest below."
              : "No guests match."}
          </EmptyState>
        ) : (
          visible.map((g) => (
            <div
              key={g.code}
              className="flex items-center gap-3 border-b border-[var(--admin-line-soft)] px-5 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">
                  {g.title ? `${g.title} ` : ""}
                  {g.name}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--admin-muted)]">
                  <span className="font-mono">{g.code}</span>
                  <span className="h-2.5 w-px bg-[var(--admin-line)]" />
                  <span>{g.seats} seats</span>
                </div>
              </div>
              <button
                onClick={() => copyInvitation(g.code)}
                className="grid h-[34px] w-[34px] shrink-0 place-items-center border-2 border-[var(--admin-ink)]"
                title="Copy invitation message"
              >
                {copiedCode === g.code ? (
                  <Check className="h-[15px] w-[15px]" />
                ) : (
                  <Copy className="h-[15px] w-[15px]" />
                )}
              </button>
              <button
                onClick={() => removeGuest(g.code)}
                className="grid h-[34px] w-[34px] shrink-0 place-items-center border-2 border-[var(--admin-ink)] text-[var(--admin-accent-active)]"
                title="Delete guest"
              >
                <Trash2 className="h-[15px] w-[15px]" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="absolute inset-x-5 bottom-5 flex gap-2.5">
        <AButton
          variant="primary"
          onClick={() => setAdding(true)}
          className="h-[52px] flex-1 shadow-[var(--admin-shadow-lg)]"
        >
          <UserPlus className="h-[17px] w-[17px]" /> Add guest
        </AButton>
        <AButton
          onClick={onSend}
          className="h-[52px] w-[52px] bg-[var(--admin-paper)] shadow-[var(--admin-shadow-lg)]"
          title="Send invitations"
        >
          <Send className="h-[18px] w-[18px]" />
        </AButton>
      </div>

      {adding && (
        <AddGuestSheet
          wedding={wedding}
          onClose={() => setAdding(false)}
          onAdded={reload}
        />
      )}
    </div>
  );
}

function AddGuestSheet({
  wedding,
  onClose,
  onAdded,
}: {
  wedding: Wedding;
  onClose: () => void;
  onAdded: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [seats, setSeats] = useState(1);
  const [code, setCode] = useState(randCode());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("guests").insert({
      wedding_id: wedding.id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      title: title.trim() || null,
      phone: phone.trim() || null,
      seats,
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
        className="flex max-h-[85%] flex-col gap-3 border-t-2 border-[var(--admin-ink)] bg-[var(--admin-paper)] p-5 pb-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Add guest</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center border-2 border-[var(--admin-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>
          <ALabel>Name *</ALabel>
          <AInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <ALabel>Title</ALabel>
          <div className="grid grid-cols-3 gap-2">
            {GUEST_TITLES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTitle((cur) => (cur === t ? "" : t))}
                className="h-[46px] border-2 border-[var(--admin-ink)] text-sm font-bold"
                style={
                  title === t
                    ? { background: "var(--admin-ink)", color: "#fff" }
                    : undefined
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <ALabel>Seats</ALabel>
            <AInput
              type="number"
              min={1}
              max={20}
              value={seats}
              onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <ALabel>WhatsApp (optional)</ALabel>
            <AInput
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+94 77 000 0000"
            />
          </div>
        </div>
        <div>
          <ALabel>Code</ALabel>
          <div className="flex gap-2">
            <AInput
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
            <AButton
              type="button"
              onClick={() => setCode(randCode())}
              title="Regenerate code"
              className="w-[50px] shrink-0 px-0"
            >
              ↻
            </AButton>
          </div>
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
          {busy ? "Adding…" : "Add guest"}
        </AButton>
      </form>
    </div>
  );
}
