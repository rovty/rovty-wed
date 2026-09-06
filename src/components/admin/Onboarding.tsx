import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WEDDING_TEMPLATES, type WeddingTemplate } from "@/lib/wedding";
import type { Wedding } from "./types";
import { slugify } from "./utils";
import { AButton, AInput, ALabel } from "./ui";

const STEP_LABELS = ["Names", "Date & venue", "Design"];

// First-time setup, three steps: who's getting married (+ their public
// link), when/where, and which invitation design to start with — mirrors
// screen 02 of the admin-portal redesign. All three still land in one
// `weddings` insert on the final step; nothing is saved until "Create
// wedding" so an abandoned wizard leaves no partial row behind.
export function Onboarding({
  onCreated,
  onSignOut,
}: {
  onCreated: (w: Wedding) => void;
  onSignOut: () => void;
}) {
  const [step, setStep] = useState(1);
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [hall, setHall] = useState("");
  const [address, setAddress] = useState("");
  const [template, setTemplate] = useState<WeddingTemplate>("classic");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched && bride && groom)
      setSlug(slugify(`${bride}-and-${groom}`));
  }, [bride, groom, slugTouched]);

  const step1Valid = bride.trim() && groom.trim() && slug.trim();
  const step2Valid = Boolean(eventDate);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("weddings")
      .insert({
        owner_id: userData.user!.id,
        bride: bride.trim(),
        groom: groom.trim(),
        slug: slugify(slug),
        event_date: new Date(eventDate).toISOString(),
        venue: venue.trim() || null,
        hall: hall.trim() || null,
        address: address.trim() || null,
        template,
      })
      .select("*")
      .single();
    setBusy(false);
    if (error) {
      setError(
        error.code === "23505"
          ? "That link is already taken — try another."
          : error.message,
      );
      return;
    }
    onCreated(data);
  };

  return (
    <main className="admin-portal flex min-h-[100dvh] flex-col">
      <div className="border-b-2 border-[var(--admin-ink)] px-5 pb-3.5 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
            Set up
          </span>
          <span className="text-[11px] font-semibold tracking-[0.12em] text-[var(--admin-accent-active)]">
            STEP {step} / 3
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-1"
              style={{
                background:
                  n <= step ? "var(--admin-accent)" : "var(--admin-line-soft)",
              }}
            />
          ))}
        </div>
      </div>

      <form
        onSubmit={create}
        className="flex flex-1 flex-col overflow-y-auto px-5 py-6"
      >
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-[28px] font-extrabold leading-[1.08] tracking-tight">
                Who's getting married?
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--admin-muted)]">
                Names print on the invitation exactly as you type them.
              </p>
            </div>
            <div>
              <ALabel>Bride</ALabel>
              <AInput
                value={bride}
                onChange={(e) => setBride(e.target.value)}
                placeholder="Bride's name"
                required
              />
            </div>
            <div>
              <ALabel>Groom</ALabel>
              <AInput
                value={groom}
                onChange={(e) => setGroom(e.target.value)}
                placeholder="Groom's name"
                required
              />
            </div>
            <div>
              <ALabel>Your public link</ALabel>
              <div className="flex h-[50px] items-center gap-0.5 border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-3.5">
                <span className="shrink-0 text-sm text-[var(--admin-faint)]">
                  wed.rovty.com/
                </span>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(slugify(e.target.value));
                    setSlugTouched(true);
                  }}
                  placeholder="emily-and-james"
                  required
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none"
                />
              </div>
              {slug && (
                <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--admin-accent-active)]">
                  <Check className="h-3 w-3" /> Yours until the wedding
                </span>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-[28px] font-extrabold leading-[1.08] tracking-tight">
                When and where?
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--admin-muted)]">
                You can change all of this later from Design.
              </p>
            </div>
            <div>
              <ALabel>Date &amp; time</ALabel>
              <AInput
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div>
              <ALabel>Venue</ALabel>
              <AInput
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Shangri-La Colombo"
              />
            </div>
            <div>
              <ALabel>Hall / room</ALabel>
              <AInput
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                placeholder="Grand Ballroom"
              />
            </div>
            <div>
              <ALabel>Address</ALabel>
              <AInput
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-1 flex-col">
            <div>
              <h1 className="text-[28px] font-extrabold leading-[1.08] tracking-tight">
                Choose a design
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--admin-muted)]">
                Switch anytime from Design — nothing here is final.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {WEDDING_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className="border-2 bg-[var(--admin-surface)] p-3 text-left"
                  style={{
                    borderColor:
                      template === t.id
                        ? "var(--admin-accent)"
                        : "var(--admin-ink)",
                  }}
                >
                  <p className="flex items-center gap-1.5 text-[13px] font-bold">
                    {t.label}
                    {template === t.id && (
                      <Check className="h-3 w-3 text-[var(--admin-accent-active)]" />
                    )}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--admin-muted)]">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
            {error && (
              <p className="mt-4 text-center text-xs text-[var(--admin-accent-active)]">
                {error}
              </p>
            )}
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="mb-3.5 h-0.5 bg-[var(--admin-ink)]" />
          <div className="flex gap-2.5">
            {step > 1 ? (
              <AButton type="button" onClick={back} className="flex-1 h-[52px]">
                Back
              </AButton>
            ) : (
              <AButton
                type="button"
                onClick={onSignOut}
                className="flex-1 h-[52px]"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </AButton>
            )}
            {step < 3 ? (
              <AButton
                type="button"
                variant="primary"
                disabled={step === 1 ? !step1Valid : !step2Valid}
                onClick={next}
                className="flex-[2] h-[52px] justify-between text-left"
              >
                <span>{step === 1 ? "Date & venue" : "Design"}</span>
                <ArrowRight className="h-[18px] w-[18px]" />
              </AButton>
            ) : (
              <AButton
                type="submit"
                variant="primary"
                disabled={busy}
                className="flex-[2] h-[52px]"
              >
                {busy ? "Creating…" : "Create wedding"}
              </AButton>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}
