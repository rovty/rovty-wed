import { useState } from "react";
import {
  Link2,
  Bell,
  Send,
  Clock,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

const TARGET = new Date("2027-02-14T17:00:00+05:30");

const BULLETS = [
  {
    n: "01",
    text: "Add guests once: each one gets a code and a personal link automatically.",
  },
  {
    n: "02",
    text: "Send on WhatsApp from the dashboard, one prefilled chat at a time.",
  },
  {
    n: "03",
    text: "RSVPs land here as guests reply, with seat counts attached.",
  },
  {
    n: "04",
    text: "Lay out tables, assign guests, publish the seating plan when you're ready.",
  },
];

const TABS = [
  { id: "next", label: "Next up", title: "Next up", meta: "3 open" },
  {
    id: "replies",
    label: "Replies",
    title: "Latest replies",
    meta: "128 total",
  },
  { id: "send", label: "Send", title: "Send invitations", meta: "86% sent" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const NEXT: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tag: string;
}[] = [
  {
    icon: Send,
    title: "24 invitations not sent yet",
    subtitle: "Ready to send on WhatsApp",
    tag: "Send",
  },
  {
    icon: Clock,
    title: "31 guests haven't replied",
    subtitle: "No RSVP yet",
    tag: "Chase",
  },
  {
    icon: LayoutGrid,
    title: "12 accepted guests unseated",
    subtitle: "9 of 14 tables filled",
    tag: "Seat",
  },
];

const REPLIES = [
  { title: "Mrs. Nimali Perera", tag: "+2 seats", yes: true, time: "2m" },
  { title: "Mr. Dinuka Silva", tag: "+1 seat", yes: true, time: "18m" },
  { title: "Ms. Ishara Bandara", tag: "Declined", yes: false, time: "1h" },
  { title: "Dr. Sunil Perera", tag: "+4 seats", yes: true, time: "3h" },
];

const SEND = [
  {
    title: "Mr. & Mrs. Fernando",
    subtitle: "+94 77 123 4567 · code F02",
    tag: "Sent",
  },
  {
    title: "Ms. Hasini Fernando",
    subtitle: "+94 71 998 2210 · code B04",
    tag: "Sent",
  },
  {
    title: "Mr. Kasun Weerasinghe",
    subtitle: "No number on file · code B09",
    tag: "Copy",
  },
  {
    title: "Ms. Amaya de Silva",
    subtitle: "+94 76 445 1120 · code B11",
    tag: "Send",
  },
];

// Interactive dashboard preview — the screen couples live in for the month
// before the wedding.
export function AdminDemo() {
  const [tab, setTab] = useState<TabId>("next");
  const days = Math.max(0, Math.ceil((TARGET.getTime() - Date.now()) / 864e5));
  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="grid items-start gap-8 text-wl-ink lg:grid-cols-2">
      <div className="min-w-0">
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#605d5d]">
          Couple side
        </p>
        <h3 className="font-archivo mt-2.5 text-2xl font-extrabold leading-tight tracking-[-0.02em]">
          Your dashboard does the chasing
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#605d5d]">
          The same screen you&rsquo;ll live in for the month before the wedding:
          who hasn&rsquo;t been sent an invitation, who hasn&rsquo;t replied,
          who&rsquo;s accepted but has no table yet.
        </p>
        <ul className="m-0 mt-5 flex list-none flex-col p-0">
          {BULLETS.map((b) => (
            <li
              key={b.n}
              className="flex gap-3 border-t border-[rgba(32,30,29,.14)] py-3 text-[13.5px] leading-relaxed"
            >
              <span className="pt-0.5 text-[11px] font-bold text-wed-deep">
                {b.n}
              </span>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-w-0 justify-start">
        <div
          className="w-full max-w-[360px] border-2 border-wl-ink bg-wl-paper"
          style={{ boxShadow: "12px 12px 0 #201e1d" }}
        >
          <div className="flex items-end justify-between gap-3 border-b-2 border-wl-ink px-4 py-3">
            <div className="min-w-0">
              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#9b9797]">
                Live
              </div>
              <div className="mt-[3px] text-lg font-extrabold tracking-[-0.02em]">
                Amara &amp; Kavin
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-1.5">
              <span className="grid h-8 w-8 place-items-center border-2 border-wl-ink">
                <Link2
                  className="h-[15px] w-[15px]"
                  strokeWidth={2}
                  aria-hidden
                />
              </span>
              <span className="grid h-8 w-8 place-items-center border-2 border-wl-ink">
                <Bell
                  className="h-[15px] w-[15px]"
                  strokeWidth={2}
                  aria-hidden
                />
              </span>
            </div>
          </div>

          <div className="p-4" style={{ background: "#fbd9d3" }}>
            <div className="text-[9px] font-bold uppercase tracking-[0.22em] opacity-85">
              14 February 2027 · 5:00 PM
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[52px] font-extrabold leading-[0.9] tracking-[-0.03em]">
                {days}
              </span>
              <span className="pb-1.5 text-sm font-semibold">days to go</span>
            </div>
            <div
              className="mt-3 h-0.5"
              style={{ background: "rgba(32,30,29,.2)" }}
            />
            <div className="mt-2.5 flex items-center justify-between text-[11.5px] font-semibold">
              <span>Invitation published</span>
              <span>wed.rovty.com/amara-kavin</span>
            </div>
          </div>

          <div className="grid grid-cols-3 border-b-2 border-wl-ink">
            {[
              { value: "128", label: "Invited", accent: false },
              { value: "97", label: "Accepted", accent: true },
              { value: "184", label: "Seats held", accent: false },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`p-3 ${i < 2 ? "border-r border-[rgba(32,30,29,.14)]" : ""}`}
              >
                <div
                  className="text-2xl font-extrabold leading-none tracking-[-0.02em]"
                  style={{ color: s.accent ? "#b3240c" : "#201e1d" }}
                >
                  {s.value}
                </div>
                <div className="mt-[5px] text-[8.5px] font-bold uppercase tracking-[0.16em] text-[#605d5d]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex border-b-2 border-wl-ink">
            {TABS.map((tItem) => (
              <button
                key={tItem.id}
                type="button"
                onClick={() => setTab(tItem.id)}
                aria-pressed={tItem.id === tab}
                className={`flex-1 cursor-pointer border-none border-r border-[rgba(32,30,29,.14)] px-3 py-[11px] font-archivo text-[11px] font-bold uppercase tracking-[0.14em] transition-colors last:border-r-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-wed ${
                  tItem.id === tab
                    ? "bg-wl-ink text-wl-paper"
                    : "bg-transparent text-[#605d5d] hover:bg-wed-soft hover:text-wl-ink"
                }`}
              >
                {tItem.label}
              </button>
            ))}
          </div>

          <div className="px-4 pb-[18px] pt-3.5" style={{ minHeight: 214 }}>
            <div className="flex items-center justify-between">
              <h4 className="font-archivo text-sm font-extrabold uppercase tracking-[0.01em]">
                {activeTab.title}
              </h4>
              <span className="text-[10.5px] font-semibold text-[#9b9797]">
                {activeTab.meta}
              </span>
            </div>
            <div className="mt-[9px] h-0.5 bg-wl-ink" />

            {tab === "next" &&
              NEXT.map((r) => (
                <div
                  key={r.title}
                  className="flex items-center gap-2.5 border-b border-[rgba(32,30,29,.14)] py-[11px]"
                >
                  <span className="grid h-[30px] w-[30px] flex-shrink-0 place-items-center border-2 border-wl-ink">
                    <r.icon
                      className="h-[15px] w-[15px]"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-bold leading-tight">
                      {r.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#605d5d]">
                      {r.subtitle}
                    </span>
                  </span>
                  <span className="flex-shrink-0 bg-wl-ink px-[7px] py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-wl-paper">
                    {r.tag}
                  </span>
                </div>
              ))}

            {tab === "replies" &&
              REPLIES.map((r) => (
                <div
                  key={r.title}
                  className="flex items-center gap-2.5 border-b border-[rgba(32,30,29,.14)] py-[11px]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-bold leading-tight">
                      {r.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#605d5d]">
                      {r.yes ? "Attending" : "Not attending"}
                    </span>
                  </span>
                  <span
                    className="flex-shrink-0 px-[7px] py-1 text-[9.5px] font-bold uppercase tracking-[0.1em]"
                    style={{
                      background: r.yes ? "#fbd9d3" : "rgba(32,30,29,.08)",
                      color: r.yes ? "#b3240c" : "#605d5d",
                    }}
                  >
                    {r.tag}
                  </span>
                  <span className="flex-shrink-0 text-[10.5px] text-[#9b9797]">
                    {r.time}
                  </span>
                </div>
              ))}

            {tab === "send" &&
              SEND.map((r) => (
                <div
                  key={r.title}
                  className="flex items-center gap-2.5 border-b border-[rgba(32,30,29,.14)] py-[11px]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-bold leading-tight">
                      {r.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#605d5d]">
                      {r.subtitle}
                    </span>
                  </span>
                  <span
                    className="flex-shrink-0 px-[7px] py-1 text-[9.5px] font-bold uppercase tracking-[0.1em]"
                    style={{
                      background:
                        r.tag === "Sent" ? "rgba(32,30,29,.08)" : "#201e1d",
                      color: r.tag === "Sent" ? "#605d5d" : "#f3f2f2",
                    }}
                  >
                    {r.tag}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
