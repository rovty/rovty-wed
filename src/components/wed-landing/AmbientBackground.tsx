// The blurred colour wash the whole "Rovty Wed Home" redesign sits over —
// one absolutely-positioned layer behind every section (not just the
// hero), so the glass panels throughout the page have something to blur.
// Positions are percentages of the page's own height rather than the
// design canvas's fixed 3200px, since real copy makes the page a different
// height than the mockup.
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute h-[760px] w-[760px] rounded-full opacity-50 blur-[120px]"
        style={{ left: -240, top: "-6%", background: "#c98aa6" }}
      />
      <div
        className="absolute h-[640px] w-[640px] rounded-full opacity-30 blur-[130px]"
        style={{ right: -160, top: "2%", background: "var(--color-wed)" }}
      />
      <div
        className="absolute h-[420px] w-[560px] rounded-full opacity-55 blur-[120px]"
        style={{ left: "26%", top: "19%", background: "#e8cfa4" }}
      />
      <div
        className="absolute h-[620px] w-[620px] rounded-full opacity-65 blur-[120px]"
        style={{ left: -160, top: "39%", background: "#f0c9d6" }}
      />
      <div
        className="absolute h-[560px] w-[620px] rounded-full opacity-65 blur-[130px]"
        style={{ right: -160, top: "53%", background: "#e4d2ea" }}
      />
      <div
        className="absolute h-[600px] w-[700px] rounded-full opacity-55 blur-[130px]"
        style={{ left: "12%", top: "78%", background: "#ecd6ae" }}
      />
      <div
        className="absolute h-[520px] w-[520px] rounded-full opacity-45 blur-[130px]"
        style={{ right: -100, top: "81%", background: "#c98aa6" }}
      />
    </div>
  );
}
