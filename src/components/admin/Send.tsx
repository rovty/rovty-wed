import { useState } from "react";
import { MessageCircle, Pencil, Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Guest, Wedding } from "./types";
import { defaultInvitationMessage, whatsappHref } from "./utils";
import { AButton, ScreenHeader, EmptyState, Kicker } from "./ui";

// Sending is inherently one WhatsApp tab per guest (wa.me only ever
// prefills one conversation) — "Send N selected" below opens them in
// sequence from the same click, which browsers allow without popup
// blocking since it's all one user gesture, and marks all N as sent in a
// single update once the tabs are open.
export function Send({
  wedding,
  guests,
  reload,
  inviteUrl,
  onBack,
  onEditWording,
}: {
  wedding: Wedding;
  guests: Guest[];
  reload: () => Promise<void>;
  inviteUrl: string;
  onBack: () => void;
  onEditWording: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const sent = guests.filter((g) => g.invited_at);
  const notSent = guests.filter((g) => !g.invited_at);
  const progress =
    guests.length > 0 ? Math.round((sent.length / guests.length) * 100) : 0;

  const messageFor = (g: Guest) => {
    const url = `${inviteUrl}?code=${g.code}`;
    const before = wedding.invite_message_before?.trim();
    const after = wedding.invite_message_after?.trim();
    return before || after
      ? [before, url, after].filter(Boolean).join("\n\n")
      : defaultInvitationMessage(wedding, url);
  };

  const markSent = async (codes: string[]) => {
    await supabase
      .from("guests")
      .update({ invited_at: new Date().toISOString() })
      .eq("wedding_id", wedding.id)
      .in("code", codes);
    await reload();
  };

  const sendOne = async (g: Guest) => {
    if (!g.phone) return;
    window.open(whatsappHref(g.phone, messageFor(g)), "_blank", "noopener");
    await markSent([g.code]);
  };

  // For a guest with no number on file — copying here counts as sending,
  // same as Guests.tsx's own "Copy" action, since it's the only way this
  // screen can hand them an invitation at all without a phone to open
  // WhatsApp with.
  const copyOne = async (g: Guest) => {
    await navigator.clipboard.writeText(messageFor(g));
    setCopiedCode(g.code);
    setTimeout(() => setCopiedCode((c) => (c === g.code ? null : c)), 2000);
    await markSent([g.code]);
  };

  const sendSelected = async () => {
    const targets = notSent.filter((g) => selected.has(g.code) && g.phone);
    if (targets.length === 0) return;
    setBusy(true);
    for (const g of targets)
      window.open(whatsappHref(g.phone!, messageFor(g)), "_blank", "noopener");
    await markSent(targets.map((g) => g.code));
    setSelected(new Set());
    setBusy(false);
  };

  const toggle = (code: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const selectableCount = notSent.filter((g) => g.phone).length;
  const allSelected = selectableCount > 0 && selected.size === selectableCount;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader title="Send invitations" onBack={onBack} />
      <div className="px-5 pt-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
            {sent.length} of {guests.length} sent
          </span>
          <span className="text-[13px] font-extrabold text-[var(--admin-accent-active)]">
            {progress}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-[var(--admin-line-soft)]">
          <div
            className="h-2 bg-[var(--admin-accent)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-[var(--admin-line-soft)] px-5 py-4">
          <Kicker>Message preview</Kicker>
          <div className="mt-2.5 whitespace-pre-line border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] p-3.5 text-[12.5px] leading-relaxed">
            {guests[0]
              ? messageFor(guests[0])
              : defaultInvitationMessage(wedding, inviteUrl)}
          </div>
          <AButton
            onClick={onEditWording}
            className="mt-2.5 h-[38px] text-[11px]"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit wording
          </AButton>
        </div>

        <div className="flex items-center justify-between px-5 pt-4">
          <span className="text-[13px] font-extrabold uppercase tracking-[0.08em]">
            Not sent yet · {notSent.length}
          </span>
          {selectableCount > 0 && (
            <button
              onClick={() =>
                setSelected(
                  allSelected
                    ? new Set()
                    : new Set(
                        notSent.filter((g) => g.phone).map((g) => g.code),
                      ),
                )
              }
              className="text-[11px] font-semibold text-[var(--admin-accent-active)]"
            >
              {allSelected ? "Clear" : "Select all"}
            </button>
          )}
        </div>

        <div className="mt-2.5 border-t-2 border-[var(--admin-ink)]">
          {notSent.length === 0 ? (
            <EmptyState>Everyone's been sent an invitation.</EmptyState>
          ) : (
            notSent.map((g) => (
              <div
                key={g.code}
                className="flex items-center gap-3 border-b border-[var(--admin-line-soft)] px-5 py-3"
              >
                <button
                  onClick={() => g.phone && toggle(g.code)}
                  disabled={!g.phone}
                  className="grid h-5 w-5 shrink-0 place-items-center border-2 border-[var(--admin-ink)] disabled:opacity-30"
                  style={
                    selected.has(g.code)
                      ? {
                          // -active, not the pale base -accent — the
                          // white checkmark on top needs the contrast.
                          background: "var(--admin-accent-active)",
                          borderColor: "var(--admin-accent-active)",
                        }
                      : undefined
                  }
                >
                  {selected.has(g.code) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-bold">
                    {g.title ? `${g.title} ` : ""}
                    {g.name}
                  </div>
                  {g.phone && (
                    <div className="mt-0.5 text-[11px] text-[var(--admin-muted)]">
                      {g.phone}
                    </div>
                  )}
                </div>
                {g.phone ? (
                  <AButton
                    onClick={() => sendOne(g)}
                    className="h-[34px] shrink-0 px-2.5 text-[10px]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Send
                  </AButton>
                ) : (
                  <AButton
                    onClick={() => copyOne(g)}
                    className="h-[34px] shrink-0 px-2.5 text-[10px]"
                  >
                    {copiedCode === g.code ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedCode === g.code ? "Copied" : "Copy message"}
                  </AButton>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-t-2 border-[var(--admin-ink)] px-5 py-3.5">
        <AButton
          variant="primary"
          onClick={sendSelected}
          disabled={busy || selected.size === 0}
          className="h-[52px] w-full justify-between"
        >
          <span>Send {selected.size} selected</span>
          <MessageCircle className="h-[18px] w-[18px]" />
        </AButton>
        <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--admin-muted)]">
          Opens WhatsApp for each guest with their own link already in the
          message. Marked as sent once the tabs open.
        </p>
      </div>
    </div>
  );
}
