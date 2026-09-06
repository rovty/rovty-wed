import { Bell, ExternalLink, Send, Clock, Grid2x2, Eye } from "lucide-react";
import type {
  AdminSection,
  Guest,
  Rsvp,
  SeatingTable,
  SeatingAssignment,
  Wedding,
} from "./types";
import { daysUntil, shortRelativeTime } from "./utils";
import { RSVP_COLOR, RSVP_TINT } from "./rsvp-colors";

export function Dashboard({
  wedding,
  guests,
  rsvps,
  tables,
  assignments,
  inviteUrl,
  goTo,
}: {
  wedding: Wedding;
  guests: Guest[];
  rsvps: Rsvp[];
  tables: SeatingTable[];
  assignments: SeatingAssignment[];
  inviteUrl: string;
  goTo: (
    section: AdminSection,
    opts?: {
      guestsView?: "list" | "send";
      guestsFilter?: "pending";
      seatingView?: "list" | "hall";
    },
  ) => void;
}) {
  const latestRsvpByCode = new Map<string, Rsvp>();
  for (const r of [...rsvps].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  )) {
    latestRsvpByCode.set(r.guest_code, r);
  }
  const accepted = guests.filter(
    (g) => latestRsvpByCode.get(g.code)?.attending,
  );
  const seatsHeld = guests.reduce((sum, g) => sum + g.seats, 0);
  const assignedCodes = new Set(assignments.map((a) => a.guest_code));

  const notSent = guests.filter((g) => !g.invited_at);
  const pending = guests.filter((g) => !latestRsvpByCode.has(g.code));
  const acceptedUnseated = accepted.filter((g) => !assignedCodes.has(g.code));
  const tablesFilled = tables.filter((t) => {
    const used = assignments
      .filter((a) => a.table_id === t.id)
      .reduce(
        (s, a) => s + (guests.find((g) => g.code === a.guest_code)?.seats ?? 0),
        0,
      );
    return used >= t.capacity && t.capacity > 0;
  }).length;

  const days = daysUntil(wedding.event_date);
  const eventDate = new Date(wedding.event_date);

  const nextUp = [
    notSent.length > 0 && {
      key: "send",
      icon: Send,
      title: `${notSent.length} invitation${notSent.length === 1 ? "" : "s"} not sent yet`,
      subtitle: "Ready to send on WhatsApp",
      cta: "Send",
      action: () => goTo("guests", { guestsView: "send" }),
    },
    pending.length > 0 && {
      key: "chase",
      icon: Clock,
      title: `${pending.length} guest${pending.length === 1 ? "" : "s"} haven't replied`,
      subtitle: "No RSVP yet",
      cta: "Chase",
      action: () => goTo("guests", { guestsFilter: "pending" }),
    },
    acceptedUnseated.length > 0 && {
      key: "seat",
      icon: Grid2x2,
      title: `${acceptedUnseated.length} accepted guest${acceptedUnseated.length === 1 ? "" : "s"} unseated`,
      subtitle:
        tables.length > 0
          ? `${tablesFilled} of ${tables.length} tables filled`
          : "No tables yet",
      cta: "Seat",
      action: () => goTo("seating", { seatingView: "list" }),
    },
  ].filter(Boolean) as {
    key: string;
    icon: typeof Send;
    title: string;
    subtitle: string;
    cta: string;
    action: () => void;
  }[];

  const latestReplies = [...rsvps]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="border-b-2 border-[var(--admin-ink)] px-5 py-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-faint)]">
            Live
          </div>
          <div className="mt-1 truncate text-[19px] font-extrabold tracking-tight">
            {wedding.bride} &amp; {wedding.groom}
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <a
            href={inviteUrl}
            target="_blank"
            rel="noreferrer"
            className="grid h-10 w-10 place-items-center border-2 border-[var(--admin-ink)]"
            title="View invitation"
          >
            <ExternalLink className="h-[17px] w-[17px]" />
          </a>
          <button
            className="grid h-10 w-10 place-items-center border-2 border-[var(--admin-ink)]"
            title="Notifications"
            disabled
          >
            <Bell className="h-[17px] w-[17px]" />
          </button>
        </div>
      </div>

      <div className="bg-[var(--admin-accent)] px-5 py-5 text-[var(--admin-ink)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-85">
          {eventDate.toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          ·{" "}
          {eventDate.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-[56px] font-extrabold leading-[0.9] tracking-tight">
            {days >= 0 ? days : 0}
          </span>
          <span className="pb-1.5 text-[15px] font-semibold">
            {days > 0 ? "days to go" : days === 0 ? "today!" : "has passed"}
          </span>
        </div>
        <div className="mt-3.5 h-0.5 bg-[var(--admin-ink)]/20" />
        <div className="mt-3 flex items-center justify-between text-xs font-semibold">
          <span>
            {wedding.published ? "Invitation published" : "Not published yet"}
          </span>
          {wedding.published ? (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />{" "}
              {inviteUrl.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <button
              onClick={() => goTo("design")}
              className="flex items-center gap-1.5"
            >
              Publish it →
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 border-b-2 border-[var(--admin-ink)]">
        <div className="border-r border-[var(--admin-line-soft)] px-3 py-3.5">
          <div className="text-[26px] font-extrabold leading-none tracking-tight">
            {guests.length}
          </div>
          <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
            Invited
          </div>
        </div>
        <div className="border-r border-[var(--admin-line-soft)] px-3 py-3.5">
          <div className="text-[26px] font-extrabold leading-none tracking-tight text-[var(--admin-accent-active)]">
            {accepted.length}
          </div>
          <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
            Accepted
          </div>
        </div>
        <div className="px-3 py-3.5">
          <div className="text-[26px] font-extrabold leading-none tracking-tight">
            {seatsHeld}
          </div>
          <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
            Seats held
          </div>
        </div>
      </div>

      {nextUp.length > 0 && (
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-extrabold uppercase tracking-[0.01em]">
              Next up
            </h3>
            <span className="text-[11px] font-semibold text-[var(--admin-faint)]">
              {nextUp.length} open
            </span>
          </div>
          <div className="mt-2.5 h-0.5 bg-[var(--admin-ink)]" />
          {nextUp.map(({ key, icon: Icon, title, subtitle, cta, action }) => (
            <button
              key={key}
              onClick={action}
              className="flex w-full items-center gap-3 border-b border-[var(--admin-line-soft)] py-3.5 text-left"
            >
              <span className="grid h-[34px] w-[34px] shrink-0 place-items-center border-2 border-[var(--admin-ink)]">
                <Icon className="h-[17px] w-[17px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-tight">
                  {title}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--admin-muted)]">
                  {subtitle}
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold text-[var(--admin-accent-active)]">
                {cta}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pt-4 pb-6">
        <h3 className="text-[15px] font-extrabold uppercase tracking-[0.01em]">
          Latest replies
        </h3>
        <div className="mt-2.5 h-0.5 bg-[var(--admin-ink)]" />
        {latestReplies.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--admin-muted)]">
            No RSVPs yet.
          </p>
        ) : (
          latestReplies.map((r) => {
            const guest = guests.find((g) => g.code === r.guest_code);
            return (
              <div
                key={r.id}
                className="flex items-center gap-2.5 border-b border-[var(--admin-line-soft)] py-3 last:border-b-0"
              >
                <span className="min-w-0 flex-1 truncate text-[13px]">
                  {guest
                    ? `${guest.title ? guest.title + " " : ""}${guest.name}`
                    : r.guest_code}
                </span>
                <span
                  className="inline-flex items-center px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{
                    background: r.attending ? RSVP_TINT.yes : RSVP_TINT.no,
                    color: r.attending ? RSVP_COLOR.yes : RSVP_COLOR.no,
                  }}
                >
                  {r.attending ? `+${guest?.seats ?? "?"} seats` : "Declined"}
                </span>
                <span className="shrink-0 text-[11px] text-[var(--admin-faint)]">
                  {shortRelativeTime(r.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
