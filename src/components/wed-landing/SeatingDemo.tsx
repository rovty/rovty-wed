import { useState } from "react";
import seatingImg from "@/assets/seating.png";

interface Seat {
  id: string;
  name: string;
  token: string;
  table: string;
  tableName: string;
  hall: string;
  x: number;
  y: number;
  mates: string[];
}

const SEATS: Seat[] = [
  {
    id: "a",
    name: "Mrs. Nimali Perera",
    token: "nimali-p",
    table: "04",
    tableName: "Table 04 · Family",
    hall: "Grand Ballroom · near the band",
    x: 10.7,
    y: 11,
    mates: [
      "Mr. & Mrs. Perera",
      "Mrs. Nimali Perera",
      "Dr. Sunil Perera",
      "Ms. Tharushi Perera",
      "Mr. Ravi Jayasuriya",
    ],
  },
  {
    id: "b",
    name: "Mr. Dinuka Silva",
    token: "dinuka-s",
    table: "09",
    tableName: "Table 09 · Friends",
    hall: "Grand Ballroom · near the bar",
    x: 29.8,
    y: 86.8,
    mates: [
      "Mr. Dinuka Silva",
      "Ms. Hasini Fernando",
      "Mr. Kasun Weerasinghe",
      "Ms. Amaya de Silva",
    ],
  },
  {
    id: "c",
    name: "Ms. Ishara Bandara",
    token: "ishara-b",
    table: "12",
    tableName: "Table 12 · Office",
    hall: "Grand Ballroom · near the entrance",
    x: 60.8,
    y: 58.9,
    mates: [
      "Ms. Ishara Bandara",
      "Mr. Chamath Rathnayake",
      "Ms. Dilini Gunawardena",
      "Mr. Nuwan Alwis",
      "Ms. Sachini Peiris",
      "Mr. Ashen Herath",
    ],
  },
];

const initialOf = (name: string) =>
  name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/, "").charAt(0);

// Interactive "find your seat" demo — the same page a guest's personalised
// link opens, driven by the product's own seating-plan artwork.
export function SeatingDemo() {
  const [activeId, setActiveId] = useState("a");
  const g = SEATS.find((s) => s.id === activeId) ?? SEATS[0];

  return (
    <div className="grid border-2 border-wl-ink bg-white text-wl-ink lg:grid-cols-2">
      <div className="min-w-0 border-b-2 border-wl-ink p-6 lg:border-b-0 lg:border-r-2">
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#605d5d]">
          Guest side
        </p>
        <h3 className="font-archivo mt-2.5 text-2xl font-extrabold leading-tight tracking-[-0.02em]">
          Their link already knows who they are
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-[#605d5d]">
          Every guest gets their own personalised link on WhatsApp. It opens the
          invitation with their name on it and their table already on the page —
          nothing to type, nothing to remember at the door.
        </p>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#605d5d]">
          Open a guest&rsquo;s link
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {SEATS.map((s) => {
            const on = s.id === g.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                className={`flex w-full cursor-pointer items-center gap-3 border-2 px-3 py-[11px] text-left font-archivo transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-wed ${
                  on
                    ? "border-wl-ink bg-wl-ink text-wl-paper"
                    : "border-wl-ink bg-white text-wl-ink hover:bg-wed-soft"
                }`}
              >
                <span
                  className="grid h-[30px] w-[30px] flex-shrink-0 place-items-center text-[13px] font-extrabold"
                  style={{
                    background: on ? "#fbd9d3" : "#f3f2f2",
                    color: "#201e1d",
                  }}
                >
                  {initialOf(s.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold leading-tight">
                    {s.name}
                  </span>
                  <span
                    className={`mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] ${on ? "text-wl-paper/75" : "text-[#605d5d]"}`}
                  >
                    wed.rovty.com/amara-kavin/{s.token}
                  </span>
                </span>
                <span
                  className={`flex-shrink-0 text-sm font-bold ${on ? "text-wl-paper" : "text-wed"}`}
                >
                  →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 bg-wl-paper p-6">
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#605d5d]">
          Welcome, {g.name}
        </p>
        <div className="mt-2.5 flex items-end gap-3.5 border-b-2 border-wl-ink pb-3.5">
          <span className="text-6xl font-extrabold leading-[0.85] tracking-[-0.04em]">
            {g.table}
          </span>
          <span className="pb-1.5 text-[13px] font-semibold">
            {g.tableName}
            <br />
            <span className="font-medium text-[#605d5d]">{g.hall}</span>
          </span>
        </div>
        <p className="mt-[18px] text-[10px] font-bold uppercase tracking-[0.22em] text-[#605d5d]">
          You&rsquo;re seated with
        </p>
        <ul className="m-0 mt-2.5 flex list-none flex-col p-0">
          {g.mates.map((m) => {
            const you = m === g.name;
            return (
              <li
                key={m}
                className="flex items-center gap-2.5 border-t border-[rgba(32,30,29,.14)] px-2.5 py-[9px] text-[13px]"
                style={{
                  fontWeight: you ? 700 : 500,
                  background: you ? "#fbd9d3" : "transparent",
                }}
              >
                <span
                  className="h-1.5 w-1.5 flex-shrink-0"
                  style={{
                    background: you ? "#ec3013" : "#201e1d",
                    opacity: you ? 1 : 0.4,
                  }}
                />
                {m}
                {you && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-[0.18em] text-wed-deep">
                    You
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="relative mt-[18px] border-2 border-wl-ink bg-white">
          <img
            src={seatingImg}
            alt="Reception seating plan"
            className="block h-auto w-full"
            style={{ filter: "grayscale(1) contrast(1.05)" }}
          />
          <div
            className="absolute rounded-full"
            style={{
              left: `${g.x}%`,
              top: `${g.y}%`,
              width: "13%",
              aspectRatio: "1",
              transform: "translate(-50%,-50%)",
              border: "3px solid #ec3013",
              boxShadow: "0 0 0 3px rgba(255,255,255,.8)",
            }}
          />
        </div>
        <p className="mt-2.5 text-[11px] text-[#605d5d]">
          Their table is marked on the hall plan.
        </p>
      </div>
    </div>
  );
}
