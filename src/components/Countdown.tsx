import { useEffect, useState } from "react";

function diff(target: Date) {
  const now = Date.now();
  let d = target.getTime() - now;
  if (d < 0) d = 0;
  const days = Math.floor(d / 86400000);
  const hours = Math.floor((d % 86400000) / 3600000);
  const minutes = Math.floor((d % 3600000) / 60000);
  const seconds = Math.floor((d % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ target }: { target: Date }) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const items: [string, number][] = [
    ["Days", t.days],
    ["Hours", t.hours],
    ["Minutes", t.minutes],
    ["Seconds", t.seconds],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="glass-card rounded-2xl px-2 py-4 text-center sm:py-6"
        >
          <div className="font-display text-3xl text-gradient-gold tabular-nums sm:text-5xl">
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
