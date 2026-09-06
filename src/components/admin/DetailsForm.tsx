import { useState } from "react";
import { Music2, Image as ImageIcon, Check, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadWeddingMedia, type WeddingMediaKind } from "@/lib/wedding";
import type { Wedding } from "./types";
import { toDatetimeLocalValue } from "./utils";
import { AButton, AInput, ATextarea, ALabel, Kicker } from "./ui";

function toOptionalDatetimeLocalValue(iso: string | null) {
  return iso ? toDatetimeLocalValue(iso) : "";
}

export function DetailsForm({
  wedding,
  onChange,
}: {
  wedding: Wedding;
  onChange: (w: Wedding) => void;
}) {
  const [form, setForm] = useState({
    bride: wedding.bride,
    groom: wedding.groom,
    event_date: toDatetimeLocalValue(wedding.event_date),
    event_end: toOptionalDatetimeLocalValue(wedding.event_end),
    reception_date: toOptionalDatetimeLocalValue(wedding.reception_date),
    reception_end: toOptionalDatetimeLocalValue(wedding.reception_end),
    venue: wedding.venue ?? "",
    hall: wedding.hall ?? "",
    address: wedding.address ?? "",
    description: wedding.description ?? "",
    invite_message_before: wedding.invite_message_before ?? "",
    invite_message_after: wedding.invite_message_after ?? "",
    seating_message_before: wedding.seating_message_before ?? "",
    seating_message_after: wedding.seating_message_after ?? "",
    maps_url: wedding.maps_url ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<WeddingMediaKind | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Supabase's typed .update() rejects a computed `{ [column]: value }` key
  // (it can't verify it against the row type) — this builds the same
  // {column: value} shape through a switch instead, so each branch assigns
  // a literal, statically-known column name.
  const mediaUpdate = (kind: WeddingMediaKind, value: string | null) => {
    switch (kind) {
      case "couple":
        return { couple_photo_url: value };
      case "venue":
        return { venue_photo_url: value };
      case "music":
        return { music_url: value };
      case "floor_plan":
        return { floor_plan_url: value };
    }
  };

  const upload = async (kind: WeddingMediaKind, file: File) => {
    setUploading(kind);
    setUploadError(null);
    try {
      const url = await uploadWeddingMedia(wedding.id, kind, file);
      const { data, error } = await supabase
        .from("weddings")
        .update({
          ...mediaUpdate(kind, url),
          updated_at: new Date().toISOString(),
        })
        .eq("id", wedding.id)
        .select("*")
        .single();
      if (error) throw error;
      onChange(data);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const removeMedia = async (kind: WeddingMediaKind) => {
    const { data, error } = await supabase
      .from("weddings")
      .update({
        ...mediaUpdate(kind, null),
        updated_at: new Date().toISOString(),
      })
      .eq("id", wedding.id)
      .select("*")
      .single();
    if (error) {
      setUploadError(error.message);
      return;
    }
    onChange(data);
  };

  const save = async () => {
    setBusy(true);
    setSaved(false);
    const { data, error } = await supabase
      .from("weddings")
      .update({
        bride: form.bride.trim(),
        groom: form.groom.trim(),
        event_date: new Date(form.event_date).toISOString(),
        event_end: form.event_end
          ? new Date(form.event_end).toISOString()
          : null,
        reception_date: form.reception_date
          ? new Date(form.reception_date).toISOString()
          : null,
        reception_end: form.reception_end
          ? new Date(form.reception_end).toISOString()
          : null,
        venue: form.venue.trim() || null,
        hall: form.hall.trim() || null,
        address: form.address.trim() || null,
        description: form.description.trim() || null,
        invite_message_before: form.invite_message_before.trim() || null,
        invite_message_after: form.invite_message_after.trim() || null,
        seating_message_before: form.seating_message_before.trim() || null,
        seating_message_after: form.seating_message_after.trim() || null,
        maps_url: form.maps_url.trim() || null,
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const field = (
    key: keyof typeof form,
    label: string,
    opts?: { type?: string; placeholder?: string },
  ) => (
    <div>
      <ALabel>{label}</ALabel>
      <AInput
        type={opts?.type ?? "text"}
        value={form[key]}
        placeholder={opts?.placeholder}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="h-[46px]"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-5 pb-6">
      <section>
        <Kicker>Couple</Kicker>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {field("bride", "Bride")}
          {field("groom", "Groom")}
        </div>
      </section>

      <section>
        <Kicker>Ceremony</Kicker>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {field("event_date", "Start", { type: "datetime-local" })}
          {field("event_end", "End (optional)", { type: "datetime-local" })}
        </div>
        <div className="mt-2.5">{field("venue", "Venue")}</div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {field("hall", "Hall")}
          {field("maps_url", "Maps link", {
            placeholder: "Paste a Google Maps link",
          })}
        </div>
        <div className="mt-2.5">{field("address", "Address")}</div>
      </section>

      <section>
        <Kicker>Reception (optional)</Kicker>
        <p className="mt-1 text-[11px] text-[var(--admin-muted)]">
          Leave blank if it's the same event as the ceremony.
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {field("reception_date", "Start", { type: "datetime-local" })}
          {field("reception_end", "End", { type: "datetime-local" })}
        </div>
      </section>

      <section>
        <Kicker>Description</Kicker>
        <div className="mt-2.5">
          <ATextarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
      </section>

      <section>
        <Kicker>Photos &amp; music</Kicker>
        <p className="mt-1 text-[11px] text-[var(--admin-muted)]">
          Uploads save immediately.
        </p>
        <div className="mt-2.5 flex flex-col gap-2.5">
          <MediaRow
            label="Couple photo"
            accept="image/*"
            kind="couple"
            url={wedding.couple_photo_url}
            uploading={uploading === "couple"}
            onUpload={(f) => upload("couple", f)}
            onRemove={() => removeMedia("couple")}
          />
          <MediaRow
            label="Venue photo"
            accept="image/*"
            kind="venue"
            url={wedding.venue_photo_url}
            uploading={uploading === "venue"}
            onUpload={(f) => upload("venue", f)}
            onRemove={() => removeMedia("venue")}
          />
          <MediaRow
            label="Background music"
            accept="audio/*"
            kind="music"
            url={wedding.music_url}
            uploading={uploading === "music"}
            onUpload={(f) => upload("music", f)}
            onRemove={() => removeMedia("music")}
          />
        </div>
        {uploadError && (
          <p className="mt-2 text-xs text-[var(--admin-accent-active)]">
            {uploadError}
          </p>
        )}
      </section>

      <section>
        <Kicker>WhatsApp invitation message</Kicker>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--admin-muted)]">
          The guest's personal link is always inserted between these two — leave
          both blank to use the default message.
        </p>
        <div className="mt-2.5 flex flex-col gap-2">
          <ATextarea
            rows={2}
            value={form.invite_message_before}
            onChange={(e) =>
              setForm((f) => ({ ...f, invite_message_before: e.target.value }))
            }
            placeholder="Message before the link"
          />
          <div className="border border-dashed border-[var(--admin-line)] px-3 py-2 text-center text-xs text-[var(--admin-muted)]">
            🔗 Guest's personal invitation link (added automatically)
          </div>
          <ATextarea
            rows={2}
            value={form.invite_message_after}
            onChange={(e) =>
              setForm((f) => ({ ...f, invite_message_after: e.target.value }))
            }
            placeholder="Message after the link"
          />
        </div>
      </section>

      <section>
        <Kicker>WhatsApp seating message</Kicker>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--admin-muted)]">
          What "Copy seating message" (Seating → a guest's table) sends. The
          guest's personal seating link is always inserted between these two —
          leave both blank to use the default message.
        </p>
        <div className="mt-2.5 flex flex-col gap-2">
          <ATextarea
            rows={2}
            value={form.seating_message_before}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                seating_message_before: e.target.value,
              }))
            }
            placeholder="Message before the link"
          />
          <div className="border border-dashed border-[var(--admin-line)] px-3 py-2 text-center text-xs text-[var(--admin-muted)]">
            🔗 Guest's personal seating link (added automatically)
          </div>
          <ATextarea
            rows={2}
            value={form.seating_message_after}
            onChange={(e) =>
              setForm((f) => ({ ...f, seating_message_after: e.target.value }))
            }
            placeholder="Message after the link"
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <AButton
          variant="primary"
          onClick={save}
          disabled={busy}
          className="h-[50px] flex-1"
        >
          {busy ? (
            "Saving…"
          ) : (
            <>
              <Check className="h-4 w-4" /> Save changes
            </>
          )}
        </AButton>
        {saved && (
          <span className="text-xs font-semibold text-[var(--admin-accent-active)]">
            Saved.
          </span>
        )}
      </div>
    </div>
  );
}

function MediaRow({
  label,
  accept,
  kind,
  url,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  accept: string;
  kind: WeddingMediaKind;
  url: string | null;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputId = `media-upload-${kind}`;
  return (
    <div className="flex items-center gap-3 border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] p-2.5">
      {kind === "music" ? (
        <div className="grid h-11 w-11 shrink-0 place-items-center border-2 border-[var(--admin-ink)]">
          <Music2 className="h-4 w-4" />
        </div>
      ) : url ? (
        <img
          src={url}
          alt=""
          className="h-11 w-11 shrink-0 border-2 border-[var(--admin-ink)] object-cover"
        />
      ) : (
        <div className="grid h-11 w-11 shrink-0 place-items-center border-2 border-[var(--admin-ink)]">
          <ImageIcon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="truncate text-xs text-[var(--admin-muted)]">
          {uploading ? "Uploading…" : url ? "Uploaded" : "Using the default"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <label
          htmlFor={inputId}
          className="cursor-pointer border-2 border-[var(--admin-ink)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em]"
        >
          {url ? "Change" : "Upload"}
        </label>
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onUpload(file);
          }}
        />
        {url && (
          <button
            onClick={onRemove}
            className="grid h-8 w-8 place-items-center border-2 border-[var(--admin-ink)] text-[var(--admin-accent-active)]"
            title={`Remove ${label.toLowerCase()}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
