// Wedding event constants — single source of truth.
export const WEDDING = {
  bride: "Asha",
  groom: "Iresh",
  // Poruwa ceremony start (local Sri Lanka time, UTC+5:30)
  date: new Date("2026-08-26T09:07:00+05:30"),
  endDate: new Date("2026-08-26T14:00:00+05:30"),
  // Reception
  receptionDate: new Date("2026-08-26T09:00:00+05:30"),
  receptionEnd: new Date("2026-08-26T16:00:00+05:30"),
  venue: "The Epitome Hotel",
  hall: "Crown Ballroom",
  address: "The Epitome Hotel, Crown Ballroom",
  title: "Iresh & Asha Wedding",
  description:
    "Join us as we celebrate the wedding of Iresh & Asha. Poruwa Ceremony at 9:07 AM, Reception from 9:00 AM onwards at The Epitome Hotel - Crown Ballroom.",
};

function toICSDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildICS() {
  const dtStart = toICSDate(WEDDING.date);
  const dtEnd = toICSDate(WEDDING.endDate);
  const uid = "iresh-asha-wedding-2026@invite";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Iresh & Asha//Wedding//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${WEDDING.title}`,
    `DESCRIPTION:${WEDDING.description.replace(/,/g, "\\,")}`,
    `LOCATION:${WEDDING.address.replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadICS(filename = "iresh-asha-wedding.ics") {
  const blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function googleCalendarUrl() {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: WEDDING.title,
    dates: `${fmt(WEDDING.date)}/${fmt(WEDDING.endDate)}`,
    details: WEDDING.description,
    location: WEDDING.address,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl() {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: WEDDING.title,
    startdt: WEDDING.date.toISOString(),
    enddt: WEDDING.endDate.toISOString(),
    body: WEDDING.description,
    location: WEDDING.address,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
