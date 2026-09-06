import { useState } from "react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WEDDING_TEMPLATES } from "@/lib/wedding";
import type { Wedding } from "./types";
import { slugify } from "./utils";
import { AButton, AInput } from "./ui";
import { DetailsForm } from "./DetailsForm";
import { Templates } from "./Templates";

// "Design" = how the invitation looks (template) and is reached (publish
// state + public link) + what it says (Details). The redesign's mock
// treats Details and Templates as two full screens; here the publish/link
// controls that used to open the old "Details" tab live at the top of this
// one, since there's no dedicated screen for them in the mock and this is
// the closest fit.
export function DesignSection({
  wedding,
  onChange,
  inviteUrl,
}: {
  wedding: Wedding;
  onChange: (w: Wedding) => void;
  inviteUrl: string;
}) {
  const [pickingTemplate, setPickingTemplate] = useState(false);

  if (pickingTemplate) {
    return (
      <Templates
        wedding={wedding}
        onChange={onChange}
        onBack={() => setPickingTemplate(false)}
        inviteUrl={inviteUrl}
      />
    );
  }

  const currentTemplate = WEDDING_TEMPLATES.find(
    (t) => t.id === wedding.template,
  );

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
      <PublishCard
        wedding={wedding}
        onChange={onChange}
        inviteUrl={inviteUrl}
      />

      <button
        onClick={() => setPickingTemplate(true)}
        className="mt-4 flex items-center justify-between border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-4 py-3.5 text-left"
      >
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-faint)]">
            Design
          </span>
          <span className="mt-1 block text-sm font-bold">
            {currentTemplate?.label ?? wedding.template}
          </span>
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--admin-accent-active)]">
          Change
        </span>
      </button>

      <div className="mt-5">
        <DetailsForm wedding={wedding} onChange={onChange} />
      </div>
    </div>
  );
}

function PublishCard({
  wedding,
  onChange,
  inviteUrl,
}: {
  wedding: Wedding;
  onChange: (w: Wedding) => void;
  inviteUrl: string;
}) {
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState(wedding.slug);
  const [slugBusy, setSlugBusy] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const togglePublish = async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("weddings")
      .update({
        published: !wedding.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wedding.id)
      .select("*")
      .single();
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    onChange(data);
  };

  const startEditSlug = () => {
    setSlugInput(wedding.slug);
    setSlugError(null);
    setEditingSlug(true);
  };

  const saveSlug = async () => {
    const next = slugify(slugInput);
    if (!next) {
      setSlugError("Enter a link.");
      return;
    }
    if (next === wedding.slug) {
      setEditingSlug(false);
      return;
    }
    if (
      wedding.published &&
      !confirm(
        `Change your public link to wed.rovty.com/${next}? Anyone using the current link (wed.rovty.com/${wedding.slug}) — including any invitations already sent — will stop being able to open your invitation there.`,
      )
    )
      return;
    setSlugBusy(true);
    setSlugError(null);
    const { data, error } = await supabase
      .from("weddings")
      .update({ slug: next, updated_at: new Date().toISOString() })
      .eq("id", wedding.id)
      .select("*")
      .single();
    setSlugBusy(false);
    if (error) {
      setSlugError(
        error.code === "23505"
          ? "That link is already taken — try another."
          : error.message,
      );
      return;
    }
    onChange(data);
    setEditingSlug(false);
  };

  return (
    <div className="border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-faint)]">
          Publish
        </span>
        <div className="flex items-center gap-2">
          {wedding.published && (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--admin-accent-active)]"
            >
              View site
            </a>
          )}
          <AButton
            onClick={togglePublish}
            disabled={busy}
            className="h-9 text-[11px]"
          >
            {wedding.published ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            {wedding.published ? "Published" : "Unpublished"}
          </AButton>
        </div>
      </div>

      {editingSlug ? (
        <div className="mt-3">
          <div className="flex h-11 items-center gap-1.5 border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-3 font-mono text-sm">
            <span className="text-[var(--admin-faint)]">wed.rovty.com/</span>
            <input
              autoFocus
              value={slugInput}
              onChange={(e) => setSlugInput(slugify(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveSlug();
                }
                if (e.key === "Escape") setEditingSlug(false);
              }}
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </div>
          {slugError && (
            <p className="mt-1.5 text-xs text-[var(--admin-accent-active)]">
              {slugError}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <AButton
              variant="primary"
              onClick={saveSlug}
              disabled={slugBusy}
              className="h-9 text-[11px]"
            >
              {slugBusy ? "Saving…" : "Save link"}
            </AButton>
            <AButton
              onClick={() => setEditingSlug(false)}
              className="h-9 text-[11px]"
            >
              Cancel
            </AButton>
          </div>
        </div>
      ) : (
        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--admin-muted)]">
          <span className="font-mono">wed.rovty.com/{wedding.slug}</span>
          <button
            onClick={startEditSlug}
            className="inline-flex items-center gap-1 text-[var(--admin-accent-active)]"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
        </p>
      )}
    </div>
  );
}
