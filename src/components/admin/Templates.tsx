import { useState } from "react";
import { Check, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WEDDING_TEMPLATES, type WeddingTemplate } from "@/lib/wedding";
import type { Wedding } from "./types";
import { AButton, ScreenHeader } from "./ui";

export function Templates({
  wedding,
  onChange,
  onBack,
  inviteUrl,
}: {
  wedding: Wedding;
  onChange: (w: Wedding) => void;
  onBack: () => void;
  inviteUrl: string;
}) {
  const [picked, setPicked] = useState<WeddingTemplate>(
    wedding.template as WeddingTemplate,
  );
  const [busy, setBusy] = useState(false);
  const pickedInfo = WEDDING_TEMPLATES.find((t) => t.id === picked)!;

  const use = async () => {
    if (picked === wedding.template) {
      onBack();
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("weddings")
      .update({ template: picked, updated_at: new Date().toISOString() })
      .eq("id", wedding.id)
      .select("*")
      .single();
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    onChange(data);
    onBack();
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScreenHeader
        title="Choose a design"
        subtitle="Same details, guests, RSVP and seating carry over to any of them. Switch as often as you like until you send."
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          {WEDDING_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setPicked(t.id)}
              className="border-2 bg-[var(--admin-surface)] text-left"
              style={{
                borderColor:
                  picked === t.id ? "var(--admin-accent)" : "var(--admin-ink)",
              }}
            >
              <div
                className={`theme-${t.id} flex h-20 flex-col items-center justify-center gap-1 overflow-hidden`}
              >
                <span className="font-script text-[10px] italic text-rose">
                  Together forever
                </span>
                <span className="font-display text-base text-foreground">
                  N{" "}
                  <span
                    style={{
                      background: "var(--gradient-gold)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    &amp;
                  </span>{" "}
                  K
                </span>
                <span
                  className="h-px w-8"
                  style={{ background: "var(--gradient-gold)" }}
                />
              </div>
              <div
                className="border-t-2 p-2.5"
                style={{
                  borderColor:
                    picked === t.id
                      ? "var(--admin-accent)"
                      : "var(--admin-ink)",
                }}
              >
                <p className="flex items-center gap-1.5 text-[13px] font-bold">
                  {t.label}
                  {picked === t.id && (
                    <Check className="h-3 w-3 text-[var(--admin-accent-active)]" />
                  )}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--admin-muted)]">
                  {t.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2.5 border-t-2 border-[var(--admin-ink)] px-5 py-3.5">
        <AButton
          disabled={!wedding.published}
          title={wedding.published ? "Preview" : "Publish first to preview"}
          onClick={() => window.open(inviteUrl, "_blank", "noreferrer")}
          className="h-[50px] flex-1 text-[12px]"
        >
          <Eye className="h-4 w-4" /> Preview
        </AButton>
        <AButton
          variant="primary"
          onClick={use}
          disabled={busy}
          className="h-[50px] flex-1 text-[12px]"
        >
          <Check className="h-4 w-4" /> Use {pickedInfo.label}
        </AButton>
      </div>
    </div>
  );
}
