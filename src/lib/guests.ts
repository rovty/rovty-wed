// Guest registry — maps invitation code to guest info.
// Share unique URLs like: /rsvp?code=ABC123
export type Guest = {
  name: string;
  title?: "Mr" | "Ms" | "Mrs" | "Dr" | "Miss";
  seats?: number;
};

export const GUESTS: Record<string, Guest> = {
  ABC123: { name: "Nimal Perera", title: "Mr", seats: 2 },
  DEF456: { name: "Anjali Fernando", title: "Ms", seats: 1 },
  GHI789: { name: "Sanjay & Priya Silva", title: "Mr", seats: 2 },
  JKL012: { name: "Kavindu Jayasinghe", title: "Mr", seats: 2 },
  DEMO: { name: "Honored Guest", title: "Ms", seats: 2 },
};

export function findGuest(code: string | undefined | null): Guest | null {
  if (!code) return null;
  const k = code.trim().toUpperCase();
  return GUESTS[k] ?? null;
}
