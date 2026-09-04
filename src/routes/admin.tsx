import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Check,
  X,
  Trash2,
  Plus,
  LogOut,
  Copy,
  Heart,
  Eye,
  EyeOff,
  Users,
  ArrowRight,
  Settings,
  Pencil,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { WEDDING_TEMPLATES } from "@/lib/wedding";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Wedding Admin — Rovty Wed" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Wedding = Tables<"weddings">;
type Guest = {
  code: string;
  name: string;
  title: string | null;
  seats: number;
  created_at: string;
};
type Rsvp = {
  id: string;
  guest_code: string;
  attending: boolean;
  message: string | null;
  created_at: string;
};
type SeatingTable = {
  id: string;
  table_number: number;
  table_name: string | null;
  capacity: number;
  map_x: number;
  map_y: number;
  is_active: boolean;
};
type SeatingAssignment = { id: string; guest_code: string; table_id: string };

function randCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

// Used by copyInvitation() only until the owner writes their own wording in
// the Details tab (invite_message_before/after) — keeps the copy button
// useful before anyone's customized anything.
function defaultInvitationMessage(wedding: Wedding, url: string) {
  const eventDate = new Date(wedding.event_date);
  return `*We're getting married!* 💍

With joyful hearts, we invite you to celebrate our wedding.

🗓️ *${eventDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}*
🕘 *${eventDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} onwards*
${wedding.venue ? `📍 *${wedding.venue}*\n` : ""}
💌 *View your invitation & RSVP:*
${url}

We can't wait to celebrate with you!

*${wedding.bride} & ${wedding.groom}* 💕`;
}

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
    const { data, error } = await supabase.from("weddings").select("*").maybeSingle();
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
      <main className="admin-portal grid min-h-[100svh] place-items-center text-sm text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="admin-portal grid min-h-[100svh] place-items-center px-5 text-center">
        <div className="glass-card max-w-sm rounded-3xl p-8">
          <h1 className="font-display text-2xl">Couldn't load your account</h1>
          <p className="mt-3 text-sm text-muted-foreground">{loadError}</p>
          <button
            onClick={() => {
              setReady(false);
              loadWedding().then(() => setReady(true));
            }}
            className="mt-5 rounded-full px-5 py-2 text-sm font-medium text-white shadow-gold"
            style={{ background: "var(--gradient-gold)" }}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!wedding) {
    return <CreateWeddingForm onCreated={setWedding} onSignOut={signOut} />;
  }

  return (
    <WeddingAdmin
      wedding={wedding}
      onSignOut={signOut}
      onWeddingChange={setWedding}
    />
  );
}

/* ── Onboarding: no wedding row yet ──────────────────────────────── */

function CreateWeddingForm({
  onCreated,
  onSignOut,
}: {
  onCreated: (w: Wedding) => void;
  onSignOut: () => void;
}) {
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched && bride && groom)
      setSlug(slugify(`${bride}-and-${groom}`));
  }, [bride, groom, slugTouched]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!bride.trim() || !groom.trim() || !eventDate || !slug.trim()) return;
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("weddings")
      .insert({
        owner_id: userData.user!.id,
        bride: bride.trim(),
        groom: groom.trim(),
        slug: slugify(slug),
        event_date: new Date(eventDate).toISOString(),
      })
      .select("*")
      .single();
    setBusy(false);
    if (error) {
      setError(
        error.code === "23505"
          ? "That link is already taken — try another."
          : error.message,
      );
      return;
    }
    onCreated(data);
  };

  return (
    <main className="admin-portal grid min-h-[100svh] place-items-center px-5 py-10">
      <div className="glass-card w-full max-w-md rounded-3xl p-7">
        <div className="text-center">
          <div
            className="mx-auto grid h-12 w-12 place-items-center rounded-full text-white"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Heart className="h-5 w-5" />
          </div>
          <h1 className="mt-3 font-display text-2xl">Set up your wedding</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            The basics — you can change all of this later.
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Bride's name"
              value={bride}
              onChange={(e) => setBride(e.target.value)}
              required
              className="rounded-2xl border border-input bg-white px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 ring-ring/40"
            />
            <input
              placeholder="Groom's name"
              value={groom}
              onChange={(e) => setGroom(e.target.value)}
              required
              className="rounded-2xl border border-input bg-white px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 ring-ring/40"
            />
          </div>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 ring-ring/40"
          />
          <div>
            <div className="flex items-center rounded-2xl border border-input bg-white px-4 py-3 focus-within:border-ring focus-within:ring-2 ring-ring/40">
              <span className="shrink-0 text-xs text-muted-foreground">
                wed.rovty.com/
              </span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                required
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="emily-and-james"
              />
            </div>
            <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
              Your invitation's public link — shareable once you publish.
            </p>
          </div>
          {error && (
            <p className="text-center text-xs text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full py-3 text-sm font-medium text-white shadow-gold disabled:opacity-50"
            style={{ background: "var(--gradient-gold)" }}
          >
            {busy ? "Creating…" : "Create wedding"}
          </button>
        </form>

        <button
          type="button"
          onClick={onSignOut}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}

/* ── Main admin, once a wedding exists ───────────────────────────── */

function WeddingAdmin({
  wedding,
  onSignOut,
  onWeddingChange,
}: {
  wedding: Wedding;
  onSignOut: () => void;
  onWeddingChange: (w: Wedding) => void;
}) {
  const [tab, setTab] = useState<"details" | "guests" | "seating" | "team">("guests");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [seats, setSeats] = useState(1);
  const [code, setCode] = useState(randCode());
  const [busy, setBusy] = useState(false);
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([]);
  const [seatingPublished, setSeatingPublished] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
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

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("guests").insert({
      wedding_id: wedding.id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      title: title.trim() || null,
      seats,
    });
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    setName("");
    setTitle("");
    setSeats(1);
    setCode(randCode());
    await load();
  };

  const removeGuest = async (code: string) => {
    if (!confirm(`Delete guest ${code}? Their RSVPs will also be removed.`))
      return;
    await supabase
      .from("guests")
      .delete()
      .eq("wedding_id", wedding.id)
      .eq("code", code);
    await load();
  };

  const copyInvitation = async (code: string) => {
    const url = `${inviteUrl}?code=${code}`;
    const before = wedding.invite_message_before?.trim();
    const after = wedding.invite_message_after?.trim();
    // The link is always spliced in here, never part of either saved field —
    // that's what makes it a fixed placeholder rather than editable text.
    // Until the owner sets their own wording (Details tab), fall back to the
    // built-in template so this button keeps working out of the box.
    const message =
      before || after
        ? [before, url, after].filter(Boolean).join("\n\n")
        : defaultInvitationMessage(wedding, url);
    await navigator.clipboard.writeText(message);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 2000);
  };

  const guestByCode = (c: string) => guests.find((g) => g.code === c);
  const accepted = rsvps.filter((r) => r.attending);
  const declined = rsvps.filter((r) => !r.attending);
  const acceptedSeats = accepted.reduce(
    (sum, r) => sum + (guestByCode(r.guest_code)?.seats ?? 0),
    0,
  );

  return (
    <div className="admin-portal flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-white px-4 py-6">
        <div className="px-2">
          <h1 className="truncate font-display text-lg">
            {wedding.bride} &amp; {wedding.groom}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            wed.rovty.com/{wedding.slug}
          </p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          <NavItem active={tab === "details"} onClick={() => setTab("details")} icon={Settings}>
            Details
          </NavItem>
          <NavItem active={tab === "guests"} onClick={() => setTab("guests")} icon={Users}>
            Guests &amp; RSVPs
          </NavItem>
          <NavItem active={tab === "seating"} onClick={() => setTab("seating")} icon={Eye}>
            Seating Plan
          </NavItem>
          <NavItem active={tab === "team"} onClick={() => setTab("team")} icon={UserPlus}>
            Team
          </NavItem>
        </nav>

        <div className="flex flex-col gap-1.5 border-t border-border pt-4">
          {wedding.published && (
            // Plain <a>, not <Link>: the public /$slug route is the next
            // phase of this build (see admin.tsx's header comment) and
            // doesn't exist in the route tree yet, so TanStack Router's
            // type-checked <Link to> can't reference it.
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border bg-white px-4 py-2 text-center text-xs hover:bg-slate-50"
            >
              View site
            </a>
          )}
          <button
            onClick={onSignOut}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
      {tab === "details" && (
        <DetailsAdmin wedding={wedding} onChange={onWeddingChange} inviteUrl={inviteUrl} />
      )}

      {tab === "team" && <TeamAdmin wedding={wedding} />}

      {tab === "guests" && (
        <>
          <section className="grid grid-cols-3 gap-3">
            <Stat label="Total guests" value={guests.length} />
            <Stat
              label="Accepted"
              value={`${accepted.length} (${acceptedSeats} seats)`}
              accent="emerald"
            />
            <Stat label="Declined" value={declined.length} accent="rose" />
          </section>

          <section className="glass-card mt-6 rounded-3xl p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg">
              <Plus className="h-4 w-4" /> Add guest
            </h2>
            <form
              onSubmit={addGuest}
              className="grid grid-cols-1 gap-3 sm:grid-cols-5"
            >
              <input
                placeholder="Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="sm:col-span-2 rounded-xl border border-input bg-white px-3 py-2 text-sm"
              />
              <input
                placeholder="Title (Mr/Ms…)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl border border-input bg-white px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={1}
                max={20}
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                className="rounded-xl border border-input bg-white px-3 py-2 text-sm"
                placeholder="Seats"
              />
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm font-mono"
                  placeholder="Code"
                />
                <button
                  type="button"
                  onClick={() => setCode(randCode())}
                  className="rounded-xl border border-border bg-white px-2 text-xs hover:bg-slate-50"
                  title="Regenerate code"
                >
                  ↻
                </button>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="sm:col-span-5 rounded-full py-2.5 text-sm font-medium text-white shadow-gold disabled:opacity-50"
                style={{ background: "var(--gradient-gold)" }}
              >
                {busy ? "Adding…" : "Add guest"}
              </button>
            </form>
          </section>

          <section className="glass-card mt-6 overflow-hidden rounded-3xl">
            <header className="border-b border-border/60 px-5 py-3">
              <h2 className="font-display text-lg">Guests ({guests.length})</h2>
            </header>
            {guests.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No guests yet. Add your first guest above.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {guests.map((g) => {
                  const guestRsvps = rsvps.filter(
                    (r) => r.guest_code === g.code,
                  );
                  const latest = guestRsvps[0];
                  return (
                    <li
                      key={g.code}
                      className="flex flex-wrap items-center gap-3 px-5 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {g.title ? `${g.title} ` : ""}
                          {g.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-mono">{g.code}</span> ·{" "}
                          {g.seats} seats
                        </p>
                      </div>
                      <div>
                        {latest ? (
                          <StatusPill attending={latest.attending} />
                        ) : (
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Pending
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => copyInvitation(g.code)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          copiedCode === g.code
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-border bg-white hover:bg-slate-50"
                        }`}
                        title="Copy invitation message"
                      >
                        {copiedCode === g.code ? (
                          <>
                            <Check className="h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Message
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => removeGuest(g.code)}
                        className="rounded-full border border-border bg-white p-1.5 text-destructive hover:bg-slate-50"
                        title="Delete guest"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="glass-card mt-6 overflow-hidden rounded-3xl">
            <header className="border-b border-border/60 px-5 py-3">
              <h2 className="font-display text-lg">
                Responses ({rsvps.length})
              </h2>
            </header>
            {rsvps.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No responses yet.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {rsvps.map((r) => {
                  const g = guestByCode(r.guest_code);
                  return (
                    <li key={r.id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {g
                              ? `${g.title ? g.title + " " : ""}${g.name}`
                              : r.guest_code}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-mono">{r.guest_code}</span> ·{" "}
                            {new Date(r.created_at).toLocaleString()}
                          </p>
                        </div>
                        <StatusPill attending={r.attending} />
                      </div>
                      {r.message && (
                        <p className="mt-2 rounded-2xl bg-white px-3 py-2 text-xs italic text-muted-foreground">
                          "{r.message}"
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      {tab === "seating" && (
        <SeatingAdmin
          wedding={wedding}
          guests={guests}
          rsvps={rsvps}
          tables={tables}
          assignments={assignments}
          published={seatingPublished}
          inviteUrl={inviteUrl}
          reload={load}
        />
      )}

      <p className="mt-8 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
        Made with <Heart className="h-3 w-3 text-rose" /> — Rovty
      </p>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        active ? "text-white shadow-gold" : "text-foreground hover:bg-slate-50"
      }`}
      style={active ? { background: "var(--gradient-gold)" } : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" /> {children}
    </button>
  );
}

/* ── Details tab ──────────────────────────────────────────────────── */

// `wedding.event_date` from the DB is a UTC ISO string; a <input
// type="datetime-local"> needs "YYYY-MM-DDTHH:MM" in the *browser's* local
// time. Truncating the UTC string directly (`.slice(0, 16)`) silently shows
// the wrong clock time whenever the browser isn't in UTC — this converts
// properly using local getters, the same way the round trip back to
// `.toISOString()` on save is already correct.
function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function DetailsAdmin({
  wedding,
  onChange,
  inviteUrl,
}: {
  wedding: Wedding;
  onChange: (w: Wedding) => void;
  inviteUrl: string;
}) {
  const [form, setForm] = useState({
    bride: wedding.bride,
    groom: wedding.groom,
    event_date: toDatetimeLocalValue(wedding.event_date),
    venue: wedding.venue ?? "",
    hall: wedding.hall ?? "",
    address: wedding.address ?? "",
    description: wedding.description ?? "",
    invite_message_before: wedding.invite_message_before ?? "",
    invite_message_after: wedding.invite_message_after ?? "",
    template: wedding.template,
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    const { data, error } = await supabase
      .from("weddings")
      .update({
        bride: form.bride.trim(),
        groom: form.groom.trim(),
        event_date: new Date(form.event_date).toISOString(),
        venue: form.venue.trim() || null,
        hall: form.hall.trim() || null,
        address: form.address.trim() || null,
        description: form.description.trim() || null,
        invite_message_before: form.invite_message_before.trim() || null,
        invite_message_after: form.invite_message_after.trim() || null,
        template: form.template,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wedding.id)
      .select("*")
      .single();
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    onChange(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const togglePublish = async () => {
    const { data, error } = await supabase
      .from("weddings")
      .update({
        published: !wedding.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wedding.id)
      .select("*")
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    onChange(data);
  };

  // The slug is set once at creation (CreateWeddingForm) and never follows
  // bride/groom edits afterward — this is the one deliberate, explicit way
  // to change it, separate from editing names, because it's the URL anyone
  // already sent the invitation to is using.
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState(wedding.slug);
  const [slugBusy, setSlugBusy] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const startEditSlug = () => {
    setSlugInput(wedding.slug);
    setSlugError(null);
    setEditingSlug(true);
  };

  const saveSlug = async () => {
    const next = slugify(slugInput);
    if (!next) {
      setSlugError("Enter a link.");
      return;
    }
    if (next === wedding.slug) {
      setEditingSlug(false);
      return;
    }
    if (
      wedding.published &&
      !confirm(
        `Change your public link to wed.rovty.com/${next}? Anyone using the current link (wed.rovty.com/${wedding.slug}) — including any invitations already sent — will stop being able to open your invitation there.`,
      )
    ) {
      return;
    }
    setSlugBusy(true);
    setSlugError(null);
    const { data, error } = await supabase
      .from("weddings")
      .update({ slug: next, updated_at: new Date().toISOString() })
      .eq("id", wedding.id)
      .select("*")
      .single();
    setSlugBusy(false);
    if (error) {
      setSlugError(
        error.code === "23505" ? "That link is already taken — try another." : error.message,
      );
      return;
    }
    onChange(data);
    setEditingSlug(false);
  };

  const field = (
    key: keyof typeof form,
    label: string,
    opts?: { type?: string; textarea?: boolean },
  ) => (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {opts?.textarea ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          rows={3}
          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
        />
      ) : (
        <input
          type={opts?.type ?? "text"}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
        />
      )}
    </div>
  );

  return (
    <>
      <section className="glass-card rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg">Publish</h2>
          <div className="flex items-center gap-2">
            {wedding.published && (
              // Plain <a>, not <Link>: the public /$slug route is type-safe
              // now, but this stays a plain anchor so it always opens
              // whatever's actually live rather than a client-side route
              // match that could disagree with it.
              <a
                href={inviteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-medium hover:bg-slate-50"
              >
                <ArrowRight className="h-3.5 w-3.5" /> View site
              </a>
            )}
            <button
              onClick={togglePublish}
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium shadow-sm transition-colors ${
                wedding.published
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border border-border bg-white hover:bg-slate-50"
              }`}
            >
              {wedding.published ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              {wedding.published
                ? "Published — guests can see it"
                : "Unpublished"}
            </button>
          </div>
        </div>
        {editingSlug ? (
          <div>
            <div className="flex items-center gap-1.5 rounded-xl border border-input bg-white px-3 py-2 text-sm">
              <span className="text-muted-foreground">wed.rovty.com/</span>
              <input
                autoFocus
                value={slugInput}
                onChange={(e) => setSlugInput(slugify(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveSlug();
                  }
                  if (e.key === "Escape") setEditingSlug(false);
                }}
                className="min-w-0 flex-1 bg-transparent font-mono outline-none"
              />
            </div>
            {slugError && (
              <p className="mt-1.5 text-xs text-destructive">{slugError}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={saveSlug}
                disabled={slugBusy}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-white shadow-gold disabled:opacity-50"
                style={{ background: "var(--gradient-gold)" }}
              >
                {slugBusy ? "Saving…" : "Save link"}
              </button>
              <button
                type="button"
                onClick={() => setEditingSlug(false)}
                className="rounded-full border border-border bg-white px-4 py-1.5 text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Public link:{" "}
            <span className="font-mono">wed.rovty.com/{wedding.slug}</span>
            <button
              type="button"
              onClick={startEditSlug}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2 py-0.5 hover:bg-slate-50"
              title="Change public link"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
          </p>
        )}
      </section>

      <form
        onSubmit={save}
        className="glass-card mt-6 space-y-4 rounded-3xl p-5"
      >
        <h2 className="font-display text-lg">Wedding details</h2>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Invitation template
          </label>
          <p className="mb-3 text-xs text-muted-foreground">
            Same RSVP, seating, and calendar links either way — just a
            different look for your public invitation page.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {WEDDING_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, template: t.id }))}
                className={`overflow-hidden rounded-2xl border-2 text-left transition-colors ${
                  form.template === t.id
                    ? "border-[var(--admin-accent)]"
                    : "border-border hover:border-[var(--admin-accent)]/50"
                }`}
              >
                <div className={`theme-${t.id} flex h-24 w-full flex-col items-center justify-center gap-1`}>
                  <span className="font-script text-[10px] italic text-rose">
                    Together forever
                  </span>
                  <span className="font-display text-base text-foreground">
                    A{" "}
                    <span
                      style={{
                        background: "var(--gradient-gold)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      &amp;
                    </span>{" "}
                    B
                  </span>
                  <span className="h-px w-8" style={{ background: "var(--gradient-gold)" }} />
                </div>
                <div className="p-2.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    {t.label}
                    {form.template === t.id && (
                      <Check className="h-3 w-3 text-[var(--admin-accent)]" />
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {field("bride", "Bride's name")}
          {field("groom", "Groom's name")}
        </div>
        {field("event_date", "Date & time", { type: "datetime-local" })}
        <div className="grid grid-cols-2 gap-3">
          {field("venue", "Venue")}
          {field("hall", "Hall / room")}
        </div>
        {field("address", "Address")}
        {field("description", "Description", { textarea: true })}

        <div className="border-t border-border pt-4">
          <h3 className="font-display text-base">WhatsApp invitation message</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            What the "Message" button on a guest copies to your clipboard.
            Their personal invitation link is always inserted between these
            two — it isn't part of either box and can't be edited here.
          </p>
          <div className="mt-3 space-y-2">
            {field("invite_message_before", "Message before the link", { textarea: true })}
            <div className="rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
              🔗 Guest's personal invitation link (added automatically)
            </div>
            {field("invite_message_after", "Message after the link", { textarea: true })}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Leave both blank to use our default WhatsApp message instead.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full px-6 py-2.5 text-sm font-medium text-white shadow-gold disabled:opacity-50"
            style={{ background: "var(--gradient-gold)" }}
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
          {saved && <span className="text-xs text-emerald-600">Saved.</span>}
        </div>
      </form>
    </>
  );
}

/* ── Team tab ──────────────────────────────────────────────────────── */

type MemberRole = "admin" | "view";
type WeddingMember = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

function TeamAdmin({ wedding }: { wedding: Wedding }) {
  const [members, setMembers] = useState<WeddingMember[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("admin");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invited, setInvited] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    const [{ data: userData }, { data: memberRows, error: membersError }] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("wedding_members")
        .select("id, email, role, created_at")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false }),
    ]);
    setIsOwner(userData.user?.id === wedding.owner_id);
    if (membersError) {
      setLoadError(membersError.message);
    } else {
      setMembers(memberRows ?? []);
    }
    setLoading(false);
  }, [wedding.id, wedding.owner_id]);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    setError(null);
    setInvited(false);
    const { data: session } = await supabase.auth.getSession();
    const res = await fetch("/api/team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({ wedding_id: wedding.id, email: email.trim(), role }),
    });
    const body = await res.json();
    setInviting(false);
    if (!res.ok) {
      setError(body.error ?? "Could not send invite.");
      return;
    }
    setEmail("");
    setInvited(true);
    setTimeout(() => setInvited(false), 3000);
    await load();
  };

  const changeRole = async (member: WeddingMember, nextRole: MemberRole) => {
    if (nextRole === member.role) return;
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: nextRole } : m)));
    const { data: session } = await supabase.auth.getSession();
    const res = await fetch("/api/team", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({ wedding_id: wedding.id, member_id: member.id, role: nextRole }),
    });
    if (!res.ok) await load(); // roll back to the real state if it didn't save
  };

  const remove = async (member: WeddingMember) => {
    if (!confirm(`Remove ${member.email} from your team? They'll lose access immediately.`)) return;
    const { data: session } = await supabase.auth.getSession();
    await fetch("/api/team", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({ wedding_id: wedding.id, member_id: member.id }),
    });
    await load();
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl p-5">
        <h2 className="font-display text-lg">Team</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Invite the groom, bride, or your planner to this wedding — they
          sign in with their own email, no shared login needed. Choose{" "}
          <strong>Admin</strong> for full editing access, or{" "}
          <strong>View</strong> if they should only be able to look, not
          change anything.
        </p>

        {isOwner ? (
          <form onSubmit={invite} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="their@email.com"
              className="min-w-0 flex-1 rounded-xl border border-input bg-white px-3 py-2 text-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRole)}
              className="rounded-xl border border-input bg-white px-3 py-2 text-sm"
            >
              <option value="admin">Admin — can edit</option>
              <option value="view">View — read only</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2 text-xs font-medium text-white shadow-gold disabled:opacity-50"
              style={{ background: "var(--gradient-gold)" }}
            >
              <UserPlus className="h-3.5 w-3.5" /> {inviting ? "Sending…" : "Send invite"}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            Only the wedding owner can invite, remove, or change roles for team members.
          </p>
        )}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        {invited && <p className="mt-2 text-xs text-emerald-600">Invite sent.</p>}
      </section>

      <section className="glass-card overflow-hidden rounded-3xl">
        <header className="border-b border-border/60 px-5 py-3">
          <h2 className="font-display text-lg">Members ({members.length})</h2>
        </header>
        {loadError ? (
          <p className="p-6 text-center text-sm text-destructive">
            Couldn't load your team: {loadError}
          </p>
        ) : members.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Just you so far — invite someone above to give them access.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isOwner ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m, e.target.value as MemberRole)}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      <option value="admin">Admin</option>
                      <option value="view">View</option>
                    </select>
                    <button
                      onClick={() => remove(m)}
                      className="rounded-full border border-border bg-white p-1.5 text-destructive hover:bg-slate-50"
                      title="Remove from team"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="rounded-full border border-border bg-white px-3 py-1 text-xs capitalize">
                    {m.role}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ── Seating Admin ─────────────────────────────────────────────── */

function SeatingAdmin({
  wedding,
  guests,
  rsvps,
  tables,
  assignments,
  published,
  inviteUrl,
  reload,
}: {
  wedding: Wedding;
  guests: Guest[];
  rsvps: Rsvp[];
  tables: SeatingTable[];
  assignments: SeatingAssignment[];
  published: boolean;
  inviteUrl: string;
  reload: () => Promise<void>;
}) {
  const [addingTable, setAddingTable] = useState(false);
  const [tblNum, setTblNum] = useState("");
  const [tblCap, setTblCap] = useState(10);
  const [tblX, setTblX] = useState(50);
  const [tblY, setTblY] = useState(50);
  const [busy, setBusy] = useState(false);
  const [assignCode, setAssignCode] = useState("");
  const [assignTableId, setAssignTableId] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [copiedSeatingCode, setCopiedSeatingCode] = useState<string | null>(null);

  const confirmedGuests = guests.filter((g) =>
    rsvps.some((r) => r.guest_code === g.code && r.attending),
  );
  const assignedCodes = new Set(assignments.map((a) => a.guest_code));
  const unassigned = guests.filter((g) => !assignedCodes.has(g.code));
  const unassignedConfirmed = confirmedGuests.filter(
    (g) => !assignedCodes.has(g.code),
  );
  const unassignedOther = unassigned.filter(
    (g) => !confirmedGuests.includes(g),
  );

  const assignmentsForTable = (tableId: string) =>
    assignments.filter((a) => a.table_id === tableId);
  const seatsUsed = (tableId: string) =>
    assignmentsForTable(tableId).reduce(
      (sum, a) =>
        sum + (guests.find((g) => g.code === a.guest_code)?.seats ?? 0),
      0,
    );

  const overCapacity = tables.filter((t) => seatsUsed(t.id) > t.capacity);
  const totalAssigned = assignments.reduce(
    (sum, a) => sum + (guests.find((g) => g.code === a.guest_code)?.seats ?? 0),
    0,
  );

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

  const addTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tblNum) return;
    setBusy(true);
    const { error } = await supabase.from("seating_tables").insert({
      wedding_id: wedding.id,
      table_number: parseInt(tblNum),
      capacity: tblCap,
      map_x: tblX,
      map_y: tblY,
    });
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    setTblNum("");
    setTblCap(10);
    setTblX(50);
    setTblY(50);
    setAddingTable(false);
    await reload();
  };

  const removeTable = async (id: string) => {
    if (!confirm("Delete this table and all its assignments?")) return;
    await supabase.from("seating_tables").delete().eq("id", id);
    await reload();
  };

  const assignGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCode || !assignTableId) return;
    const table = tables.find((t) => t.id === assignTableId);
    const guest = guests.find((g) => g.code === assignCode);
    if (!table || !guest) return;
    if (seatsUsed(table.id) + guest.seats > table.capacity) {
      alert(
        `Table ${table.table_number} would exceed capacity (${seatsUsed(table.id) + guest.seats}/${table.capacity})`,
      );
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("seating_assignments").insert({
      wedding_id: wedding.id,
      guest_code: assignCode,
      table_id: assignTableId,
    });
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    setAssignCode("");
    setAssignTableId("");
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
    const eventDate = new Date(wedding.event_date);
    const msg = `❤️ We're almost there!

Your reception table is ready 🪑
Easily find your table & seating companions:

👉 ${url}

🗓️ ${eventDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}

Can't wait to celebrate with you! ❤️
${wedding.bride} & ${wedding.groom}`;
    await navigator.clipboard.writeText(msg);
    setCopiedSeatingCode(guestCode);
    setTimeout(() => setCopiedSeatingCode((c) => (c === guestCode ? null : c)), 2000);
  };

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Confirmed" value={confirmedGuests.length} />
        <Stat
          label="Assigned"
          value={`${assignments.length} (${totalAssigned} seats)`}
          accent="emerald"
        />
        <Stat
          label="Unassigned"
          value={unassigned.length}
          accent={unassigned.length > 0 ? "rose" : undefined}
        />
        <Stat
          label="Over capacity"
          value={overCapacity.length}
          accent={overCapacity.length > 0 ? "rose" : undefined}
        />
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={togglePublish}
          disabled={busy}
          className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium shadow-sm transition-colors ${
            published
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-border bg-white hover:bg-slate-50"
          }`}
        >
          {published ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
          {published
            ? "Published — Guests can see seating"
            : "Unpublished — Hidden from guests"}
        </button>

        <div className="flex items-center gap-1.5">
          <input
            placeholder="Code to preview"
            value={previewCode}
            onChange={(e) => setPreviewCode(e.target.value.toUpperCase())}
            className="w-28 rounded-xl border border-input bg-white px-3 py-1.5 text-xs font-mono"
          />
          <a
            href={
              previewCode ? `${inviteUrl}/seating?code=${previewCode}` : "#"
            }
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs hover:bg-slate-50 ${!previewCode ? "pointer-events-none opacity-40" : ""}`}
          >
            <Eye className="h-3 w-3" /> Preview
          </a>
        </div>
      </div>

      <section className="glass-card mt-6 rounded-3xl p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg">
          <ArrowRight className="h-4 w-4" /> Assign Guest to Table
        </h2>
        <form onSubmit={assignGuest} className="flex flex-wrap gap-3">
          <select
            value={assignCode}
            onChange={(e) => setAssignCode(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-white px-3 py-2 text-sm"
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
          <select
            value={assignTableId}
            onChange={(e) => setAssignTableId(e.target.value)}
            className="w-40 rounded-xl border border-input bg-white px-3 py-2 text-sm"
          >
            <option value="">Table…</option>
            {tables
              .filter((t) => t.is_active)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.table_number} ({seatsUsed(t.id)}/{t.capacity})
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={busy || !assignCode || !assignTableId}
            className="rounded-full px-5 py-2 text-sm font-medium text-white shadow-gold disabled:opacity-50"
            style={{ background: "var(--gradient-gold)" }}
          >
            Assign
          </button>
        </form>
      </section>

      <section className="glass-card mt-6 overflow-hidden rounded-3xl">
        <header className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <h2 className="font-display text-lg">Tables ({tables.length})</h2>
          <button
            onClick={() => setAddingTable(!addingTable)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
          >
            <Plus className="h-3 w-3" /> Add table
          </button>
        </header>

        {addingTable && (
          <form
            onSubmit={addTable}
            className="border-b border-border/60 px-5 py-4"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <input
                type="number"
                min={1}
                placeholder="Table #"
                value={tblNum}
                onChange={(e) => setTblNum(e.target.value)}
                required
                className="rounded-xl border border-input bg-white px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={1}
                max={20}
                placeholder="Capacity"
                value={tblCap}
                onChange={(e) => setTblCap(parseInt(e.target.value) || 10)}
                className="rounded-xl border border-input bg-white px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                placeholder="Map X %"
                value={tblX}
                onChange={(e) => setTblX(parseFloat(e.target.value) || 0)}
                className="rounded-xl border border-input bg-white px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                placeholder="Map Y %"
                value={tblY}
                onChange={(e) => setTblY(parseFloat(e.target.value) || 0)}
                className="rounded-xl border border-input bg-white px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-3 rounded-full px-5 py-2 text-sm font-medium text-white shadow-gold disabled:opacity-50"
              style={{ background: "var(--gradient-gold)" }}
            >
              {busy ? "Adding…" : "Add table"}
            </button>
          </form>
        )}

        {tables.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No tables yet. Add your first table above.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {tables.map((t) => {
              const tAssignments = assignmentsForTable(t.id);
              const used = seatsUsed(t.id);
              const over = used > t.capacity;
              return (
                <li key={t.id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        Table {t.table_number}
                        {t.table_name && (
                          <span className="ml-1.5 text-muted-foreground">
                            — {t.table_name}
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-xs ${over ? "font-semibold text-rose-600" : "text-muted-foreground"}`}
                      >
                        {used} / {t.capacity} seats
                        {over && " ⚠ Over capacity"}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      ({t.map_x}%, {t.map_y}%)
                    </span>
                    <button
                      onClick={() => removeTable(t.id)}
                      className="rounded-full border border-border bg-white p-1.5 text-destructive hover:bg-slate-50"
                      title="Delete table"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {tAssignments.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {tAssignments.map((a) => {
                        const g = guests.find((g) => g.code === a.guest_code);
                        return (
                          <li
                            key={a.id}
                            className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs"
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {g ? g.name : a.guest_code}
                              <span className="ml-1 text-muted-foreground">
                                ({g?.seats ?? "?"} seats)
                              </span>
                            </span>
                            <button
                              onClick={() => copySeatingMessage(a.guest_code)}
                              className={`inline-flex items-center gap-0.5 ${
                                copiedSeatingCode === a.guest_code
                                  ? "text-emerald-600"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                              title="Copy seating WhatsApp message"
                            >
                              {copiedSeatingCode === a.guest_code ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                            <select
                              value={a.table_id}
                              onChange={(e) =>
                                moveGuest(a.guest_code, e.target.value)
                              }
                              className="rounded border border-input bg-white px-1.5 py-0.5 text-[11px]"
                              title="Move to table"
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
                              className="text-destructive hover:text-destructive/70"
                              title="Remove assignment"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {unassigned.length > 0 && (
        <section className="glass-card mt-6 overflow-hidden rounded-3xl">
          <header className="border-b border-border/60 px-5 py-3">
            <h2 className="font-display text-lg text-rose-600">
              Unassigned Guests ({unassigned.length})
            </h2>
          </header>
          <ul className="divide-y divide-border/60">
            {unassigned.map((g) => (
              <li key={g.code} className="flex items-center gap-3 px-5 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{g.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{g.code}</span> · {g.seats}{" "}
                    seats
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "emerald" | "rose";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-600"
      : accent === "rose"
        ? "text-rose-600"
        : "text-foreground";
  return (
    <div className="glass-card rounded-2xl p-4 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-display text-xl ${color}`}>{value}</p>
    </div>
  );
}

function StatusPill({ attending }: { attending: boolean }) {
  return attending ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
      <Check className="h-3 w-3" /> Accepted
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-medium text-rose-700">
      <X className="h-3 w-3" /> Declined
    </span>
  );
}
