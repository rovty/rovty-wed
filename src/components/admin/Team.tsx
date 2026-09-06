import { useCallback, useEffect, useState, type FormEvent } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { MemberRole, Wedding, WeddingMember } from "./types";
import { initials } from "./utils";
import { AButton, AInput, Tag } from "./ui";

export function Team({ wedding }: { wedding: Wedding }) {
  const [members, setMembers] = useState<WeddingMember[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("admin");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invited, setInvited] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    const [{ data: userData }, { data: memberRows, error: membersError }] =
      await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("wedding_members")
          .select("id, email, role, created_at")
          .eq("wedding_id", wedding.id)
          .order("created_at", { ascending: false }),
      ]);
    const owner = userData.user?.id === wedding.owner_id;
    setIsOwner(owner);
    if (owner) setOwnerEmail(userData.user?.email ?? null);
    if (membersError) setLoadError(membersError.message);
    else setMembers(memberRows ?? []);
    setLoading(false);
  }, [wedding.id, wedding.owner_id]);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async (e: FormEvent) => {
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
      body: JSON.stringify({
        wedding_id: wedding.id,
        email: email.trim(),
        role,
      }),
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
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, role: nextRole } : m)),
    );
    const { data: session } = await supabase.auth.getSession();
    const res = await fetch("/api/team", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        wedding_id: wedding.id,
        member_id: member.id,
        role: nextRole,
      }),
    });
    if (!res.ok) await load();
  };

  const remove = async (member: WeddingMember) => {
    if (
      !confirm(
        `Remove ${member.email} from your team? They'll lose access immediately.`,
      )
    )
      return;
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

  return (
    <div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-faint)]">
          Invite someone
        </div>
        {isOwner ? (
          <form onSubmit={invite} className="mt-2.5 flex flex-col gap-2.5">
            <AInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="their@email.com"
              className="h-12"
            />
            <div className="grid grid-cols-2 border-2 border-[var(--admin-ink)]">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className="h-11 text-[11px] font-bold uppercase tracking-[0.1em]"
                style={
                  role === "admin"
                    ? { background: "var(--admin-ink)", color: "#fff" }
                    : undefined
                }
              >
                Admin — can edit
              </button>
              <button
                type="button"
                onClick={() => setRole("view")}
                className="h-11 border-l-2 border-[var(--admin-ink)] text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={
                  role === "view"
                    ? { background: "var(--admin-ink)", color: "#fff" }
                    : undefined
                }
              >
                View only
              </button>
            </div>
            <AButton
              type="submit"
              variant="primary"
              disabled={inviting}
              className="h-12"
            >
              <span>{inviting ? "Sending…" : "Send invite"}</span>
              <UserPlus className="h-[17px] w-[17px]" />
            </AButton>
          </form>
        ) : (
          <p className="mt-2.5 text-xs text-[var(--admin-muted)]">
            Only the wedding owner can invite, remove, or change roles for team
            members.
          </p>
        )}
        {error && (
          <p className="mt-2 text-xs text-[var(--admin-accent-active)]">
            {error}
          </p>
        )}
        {invited && (
          <p className="mt-2 text-xs text-[var(--admin-accent-active)]">
            Invite sent.
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-extrabold uppercase tracking-[0.08em]">
            Members · {members.length + (isOwner ? 1 : 0)}
          </span>
        </div>
        <div className="mt-2.5 h-0.5 bg-[var(--admin-ink)]" />
        {loading ? (
          <p className="py-6 text-center text-sm text-[var(--admin-muted)]">
            Loading…
          </p>
        ) : loadError ? (
          <p className="py-6 text-center text-sm text-[var(--admin-accent-active)]">
            Couldn't load your team: {loadError}
          </p>
        ) : (
          <>
            {isOwner && ownerEmail && (
              <div className="flex items-center gap-3 border-b border-[var(--admin-line-soft)] py-3.5">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[var(--admin-ink)] text-xs font-extrabold"
                  style={{ background: "var(--admin-ink)", color: "#fff" }}
                >
                  {initials(ownerEmail)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold">
                    {ownerEmail}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--admin-muted)]">
                    Owner
                  </div>
                </div>
                <Tag tone="ink">Owner</Tag>
              </div>
            )}
            {members.length === 0 && !isOwner ? (
              <p className="py-6 text-center text-sm text-[var(--admin-muted)]">
                No one else has access yet.
              </p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 border-b border-[var(--admin-line-soft)] py-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[var(--admin-ink)] text-xs font-extrabold">
                    {initials(m.email)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold">
                      {m.email}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[var(--admin-muted)]">
                      Added {new Date(m.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {isOwner ? (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={m.role}
                        onChange={(e) =>
                          changeRole(m, e.target.value as MemberRole)
                        }
                        className="border-2 border-[var(--admin-ink)] bg-transparent px-2 py-1.5 text-[11px] font-semibold"
                      >
                        <option value="admin">Admin</option>
                        <option value="view">View</option>
                      </select>
                      <button
                        onClick={() => remove(m)}
                        className="grid h-8 w-8 place-items-center border-2 border-[var(--admin-ink)] text-[var(--admin-accent-active)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Tag tone={m.role === "admin" ? "accent" : "neutral"}>
                      {m.role}
                    </Tag>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
