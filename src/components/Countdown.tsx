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

// Quiet, typographic countdown: four numbers separated by hairline rules,
// styled entirely by the template's tokens (.tpl-countdown in styles.css).
// No boxes — boxes were what made every template look like the same
// dashboard widget.
export function Countdown({ target }: { target: Date }) {
  const [t, setT] = useState(() => diff(target));
  const [live, setLive] = useState(false);
  useEffect(() => {
    setT(diff(target));
    setLive(true);
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const past =
    t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0 && live;
  if (past) {
    return (
      <p className="font-kicker text-rose" aria-live="polite">
        Today is the day
      </p>
    );
  }

  const items: [string, number][] = [
    ["Days", t.days],
    ["Hours", t.hours],
    ["Min", t.minutes],
    ["Sec", t.seconds],
  ];

  return (
    <div
      className="tpl-countdown"
      role="timer"
      aria-live="off"
      aria-label="Countdown to the wedding"
    >
      {items.map(([label, value], i) => (
        <div key={label} className="tpl-countdown__cell">
          {i > 0 && <span className="tpl-countdown__rule" aria-hidden="true" />}
          <div className="tpl-countdown__num font-display tabular-nums">
            {String(value).padStart(2, "0")}
          </div>
          <div className="tpl-countdown__label font-kicker">{label}</div>
        </div>
      ))}
    </div>
  );
}
