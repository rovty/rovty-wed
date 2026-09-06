import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

// The mobile screens (Dashboard/Guests/Seating/Design/More, Onboarding)
// are built edge-to-edge on purpose — that's the actual product, run from
// a phone. Left to stretch across a desktop browser, that same markup
// just reads as "a phone screen blown up too wide", not a desktop app.
// Rather than build a second desktop layout, this frames the exact same
// screen the way the original designs themselves were presented: a
// fixed-width bordered panel on a neutral canvas — so desktop gets an
// intentional-looking app window instead of a stretched phone. Mobile
// (below `md`) is untouched: the inner panel just fills the viewport.
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="admin-portal min-h-[100dvh] md:flex md:min-h-[100dvh] md:items-center md:justify-center md:bg-[var(--admin-canvas)] md:p-8">
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--admin-paper)] md:h-[min(880px,calc(100dvh-4rem))] md:w-[440px] md:border-2 md:border-[var(--admin-ink)] md:shadow-[var(--admin-shadow-lg)]">
        {children}
      </div>
    </div>
  );
}

// Shared building blocks for the admin portal's "Modernist" look: hard 2px
// ink borders, zero radius, uppercase Archivo labels, one warm-red accent.
// Kept deliberately plain (no variants explosion) — every admin screen
// composes these same handful of primitives rather than hand-rolling
// Tailwind strings per screen.

export function AButton({
  variant = "secondary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 font-bold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-colors";
  const styles =
    variant === "primary"
      ? "a-btn-primary border-0"
      : variant === "ghost"
        ? "a-btn-secondary border-0 text-[var(--admin-accent-active)] font-semibold"
        : "a-btn-secondary border-2 border-[var(--admin-ink)] bg-transparent";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function AInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-[50px] w-full border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-3.5 text-[15px] text-[var(--admin-ink)] outline-none focus-visible:border-[var(--admin-accent)] ${className}`}
      {...props}
    />
  );
}

export function ATextarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-3.5 py-3 text-[15px] text-[var(--admin-ink)] outline-none focus-visible:border-[var(--admin-accent)] ${className}`}
      {...props}
    />
  );
}

export function ALabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
      {children}
    </label>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-faint)]">
      {children}
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  meta,
  onBack,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  onBack?: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 border-b-2 border-[var(--admin-ink)] bg-[var(--admin-paper)] px-5 pb-3.5 pt-4">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[var(--admin-ink)] bg-transparent"
              aria-label="Back"
            >
              <ChevronLeftIcon />
            </button>
          )}
          <h2 className="text-[28px] font-extrabold leading-none tracking-tight">
            {title}
          </h2>
        </div>
        {meta && (
          <span className="pb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)]">
            {meta}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs leading-relaxed text-[var(--admin-muted)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function Tag({
  tone = "neutral",
  children,
}: {
  tone?: "accent" | "neutral" | "outline" | "dashed" | "ink";
  children: ReactNode;
}) {
  const styles = {
    accent:
      "bg-[var(--admin-accent-soft)] text-[var(--admin-accent-active)] border-0",
    neutral: "border border-[var(--admin-line)] text-[var(--admin-muted)]",
    outline:
      "border-2 border-[var(--admin-accent-active)] text-[var(--admin-accent-active)]",
    dashed:
      "border border-dashed border-[var(--admin-line)] text-[var(--admin-faint)]",
    ink: "bg-[var(--admin-ink)] text-white border-0",
  }[tone];
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${styles}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="px-5 py-10 text-center text-sm text-[var(--admin-muted)]">
      {children}
    </p>
  );
}

export function StatCell({
  value,
  label,
  tone = "ink",
}: {
  value: ReactNode;
  label: string;
  tone?: "ink" | "accent";
}) {
  return (
    <div className="px-3 py-3.5">
      <div
        className="text-[26px] font-extrabold leading-none tracking-tight"
        style={{
          color: tone === "accent" ? "var(--admin-accent-active)" : undefined,
        }}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">
        {label}
      </div>
    </div>
  );
}
