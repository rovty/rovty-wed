import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Image as ImageIcon, CirclePlus, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadWeddingMedia } from "@/lib/wedding";
import type { Guest, SeatingTable, Wedding } from "./types";
import { AButton, AInput, ALabel } from "./ui";

type Rect = { width: number; height: number; offsetX: number; offsetY: number };

// The floor plan photo is shown in full (object-fit: contain, never
// cropped) rather than as a cropped `background-size: cover` fill — so on
// a container whose aspect ratio doesn't match the photo's, there's
// letterboxing on two sides. table_number/map_x/map_y are stored as a
// percentage *of the photo's own content*, not of the surrounding
// container box: computing that content rectangle here (and converting
// every pointer position through it) is what keeps a table's position
// anchored to the same physical point on the floor plan regardless of
// how wide or tall the browser showing it happens to be — which is
// exactly what broke before (positions were percentages of the
// container, so the same table landed somewhere else on a phone than on
// a desktop, since the two containers crop/frame the photo differently).
function containedImageRect(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
): Rect | null {
  if (!containerW || !containerH || !naturalW || !naturalH) return null;
  const containerRatio = containerW / containerH;
  const imageRatio = naturalW / naturalH;
  let width: number;
  let height: number;
  if (containerRatio > imageRatio) {
    height = containerH;
    width = height * imageRatio;
  } else {
    width = containerW;
    height = width / imageRatio;
  }
  return {
    width,
    height,
    offsetX: (containerW - width) / 2,
    offsetY: (containerH - height) / 2,
  };
}

export function HallPlan({
  wedding,
  guests,
  tables,
  published,
  reload,
  onWeddingChange,
  seatsUsed,
}: {
  wedding: Wedding;
  guests: Guest[];
  tables: SeatingTable[];
  published: boolean;
  reload: () => Promise<void>;
  onWeddingChange: (w: Wedding) => void;
  seatsUsed: (tableId: string) => number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const movedRef = useRef(false);

  // Re-measured on every resize (window resize, sidebar showing/hiding at
  // the `md` breakpoint, device rotation) so the image-rect math below is
  // always working off the container's *current* box, not a stale one.
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset so a freshly-uploaded photo doesn't briefly render markers
  // against the previous one's aspect ratio before it loads.
  useEffect(() => {
    setNaturalSize(null);
  }, [wedding.floor_plan_url]);

  const imageRect =
    wedding.floor_plan_url && naturalSize
      ? containedImageRect(
          containerSize.width,
          containerSize.height,
          naturalSize.width,
          naturalSize.height,
        )
      : null;

  // map_x/map_y (0–100) → container-relative pixels, for rendering.
  const toPx = (xPct: number, yPct: number) => {
    if (imageRect) {
      return {
        x: imageRect.offsetX + (xPct / 100) * imageRect.width,
        y: imageRect.offsetY + (yPct / 100) * imageRect.height,
      };
    }
    return {
      x: (xPct / 100) * containerSize.width,
      y: (yPct / 100) * containerSize.height,
    };
  };

  // Container-relative pixels → map_x/map_y (0–100), for saving a drag.
  // Clamped to the photo's own content box (or the container, without a
  // photo) so a table can never be dropped out in the letterboxed margin.
  const fromPx = (px: number, py: number) => {
    if (imageRect) {
      const x = ((px - imageRect.offsetX) / imageRect.width) * 100;
      const y = ((py - imageRect.offsetY) / imageRect.height) * 100;
      return {
        x: Math.min(98, Math.max(2, x)),
        y: Math.min(98, Math.max(2, y)),
      };
    }
    const x = (px / containerSize.width) * 100;
    const y = (py / containerSize.height) * 100;
    return { x: Math.min(96, Math.max(4, x)), y: Math.min(96, Math.max(4, y)) };
  };

  const posFor = (t: SeatingTable) =>
    positions[t.id] ?? { x: t.map_x, y: t.map_y };

  const uploadFloorPlan = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadWeddingMedia(wedding.id, "floor_plan", file);
      const { data, error } = await supabase
        .from("weddings")
        .update({ floor_plan_url: url, updated_at: new Date().toISOString() })
        .eq("id", wedding.id)
        .select("*")
        .single();
      if (error) throw error;
      onWeddingChange(data);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onPointerDown = (t: SeatingTable) => (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    movedRef.current = false;
    setDragId(t.id);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragId || !mapRef.current) return;
    movedRef.current = true;
    const rect = mapRef.current.getBoundingClientRect();
    const pos = fromPx(e.clientX - rect.left, e.clientY - rect.top);
    setPositions((prev) => ({ ...prev, [dragId]: pos }));
  };

  const onPointerUp = (t: SeatingTable) => async (e: ReactPointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragId(null);
    if (!movedRef.current) {
      setSelected((s) => (s === t.id ? null : t.id));
      return;
    }
    const pos = positions[t.id];
    if (!pos) return;
    await supabase
      .from("seating_tables")
      .update({
        map_x: Math.round(pos.x * 10) / 10,
        map_y: Math.round(pos.y * 10) / 10,
        updated_at: new Date().toISOString(),
      })
      .eq("id", t.id);
    await reload();
  };

  const addTable = async () => {
    setBusy(true);
    const nextNumber = (tables.at(-1)?.table_number ?? 0) + 1;
    await supabase.from("seating_tables").insert({
      wedding_id: wedding.id,
      table_number: nextNumber,
      capacity: 10,
      map_x: 50,
      map_y: 50,
    });
    await reload();
    setBusy(false);
  };

  const togglePublish = async () => {
    setBusy(true);
    await supabase.from("seating_config").upsert({
      wedding_id: wedding.id,
      published: !published,
      updated_at: new Date().toISOString(),
    });
    await reload();
    setBusy(false);
  };

  const selectedTable = tables.find((t) => t.id === selected) ?? null;

  const markerStyle = (t: SeatingTable) => {
    const used = seatsUsed(t.id);
    const over = used > t.capacity;
    const full = used >= t.capacity && !over;
    if (over)
      return {
        background: "var(--admin-accent)",
        borderColor: "var(--admin-accent)",
        color: "#fff",
      };
    if (full)
      return {
        background: "var(--admin-ink)",
        borderColor: "var(--admin-ink)",
        color: "#fff",
      };
    return {
      background: "var(--admin-surface)",
      borderColor: "var(--admin-ink)",
      color: "var(--admin-ink)",
    };
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="mx-5 mt-3.5 flex items-center gap-2.5 border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-3 py-2">
        <ImageIcon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-xs">
          {wedding.floor_plan_url
            ? "Floor plan uploaded"
            : "No floor plan uploaded — using a blank grid"}
        </span>
        <label className="shrink-0 cursor-pointer text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--admin-accent-active)]">
          {uploading
            ? "Uploading…"
            : wedding.floor_plan_url
              ? "Replace"
              : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) uploadFloorPlan(file);
            }}
          />
        </label>
      </div>
      {uploadError && (
        <p className="mx-5 mt-1.5 text-[11px] text-[var(--admin-accent-active)]">
          {uploadError}
        </p>
      )}

      <div
        ref={mapRef}
        onPointerMove={onPointerMove}
        className="relative mx-5 mt-3 flex-1 touch-none overflow-hidden border-2 border-[var(--admin-ink)]"
        style={
          wedding.floor_plan_url
            ? undefined
            : {
                background:
                  "linear-gradient(to right, var(--admin-line-soft) 1px, transparent 1px) 0 0/24px 24px, linear-gradient(to bottom, var(--admin-line-soft) 1px, transparent 1px) 0 0/24px 24px, var(--admin-surface)",
              }
        }
      >
        {wedding.floor_plan_url && (
          // Plain <img> with object-contain (not a CSS background-image
          // with background-size: cover) so the whole photo is always
          // visible — cover was silently cropping whichever edges didn't
          // match the container's aspect ratio.
          <img
            key={wedding.floor_plan_url}
            src={wedding.floor_plan_url}
            alt="Venue floor plan"
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              setNaturalSize({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            }}
            className="absolute inset-0 h-full w-full select-none bg-[var(--admin-surface)] object-contain"
          />
        )}
        {tables.map((t) => {
          const pos = posFor(t);
          const { x, y } = toPx(pos.x, pos.y);
          return (
            <div
              key={t.id}
              onPointerDown={onPointerDown(t)}
              onPointerUp={onPointerUp(t)}
              className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full border-2 text-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] active:cursor-grabbing"
              style={{ left: x, top: y, ...markerStyle(t) }}
            >
              <span className="text-[13px] font-extrabold leading-none">
                {t.table_number}
              </span>
              <span className="text-[8px] font-semibold leading-none tracking-[0.04em]">
                {seatsUsed(t.id)}/{t.capacity}
              </span>
            </div>
          );
        })}
        <div className="absolute bottom-2 left-2 bg-[var(--admin-ink)] px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
          Drag a table to move it
        </div>
      </div>

      <div className="mx-5 mt-3 flex flex-wrap gap-3">
        <Legend swatch={{ background: "var(--admin-ink)" }} label="Full" />
        <Legend
          swatch={{
            background: "var(--admin-surface)",
            border: "2px solid var(--admin-ink)",
          }}
          label="Space left"
        />
        <Legend
          swatch={{ background: "var(--admin-accent)" }}
          label="Over"
          accent
        />
      </div>

      {selectedTable && (
        <div className="mx-5 mt-3 border-t-2 border-[var(--admin-ink)] pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-extrabold uppercase tracking-[0.08em]">
              Table {selectedTable.table_number}
              {selectedTable.table_name ? ` · ${selectedTable.table_name}` : ""}
            </span>
            <span
              className="text-[11px] font-semibold"
              style={{
                color:
                  seatsUsed(selectedTable.id) > selectedTable.capacity
                    ? "var(--admin-accent-active)"
                    : "var(--admin-muted)",
              }}
            >
              {seatsUsed(selectedTable.id)} / {selectedTable.capacity}
            </span>
          </div>
          <TableEditor table={selectedTable} onSaved={reload} />
        </div>
      )}

      <div className="flex gap-2.5 px-5 py-3.5">
        <AButton
          onClick={addTable}
          disabled={busy}
          className="h-[50px] flex-1 text-[12px]"
        >
          <CirclePlus className="h-4 w-4" /> Add table
        </AButton>
        <AButton
          variant="primary"
          onClick={togglePublish}
          disabled={busy}
          className="h-[50px] flex-1 text-[12px]"
        >
          {published ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          {published ? "Published" : "Publish plan"}
        </AButton>
      </div>
    </div>
  );
}

function Legend({
  swatch,
  label,
  accent,
}: {
  swatch: React.CSSProperties;
  label: string;
  accent?: boolean;
}) {
  return (
    <span
      className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{
        color: accent ? "var(--admin-accent-active)" : "var(--admin-muted)",
      }}
    >
      <span className="h-3 w-3 rounded-full" style={swatch} /> {label}
    </span>
  );
}

function TableEditor({
  table,
  onSaved,
}: {
  table: SeatingTable;
  onSaved: () => Promise<void>;
}) {
  const [capacity, setCapacity] = useState(table.capacity);
  const [name, setName] = useState(table.table_name ?? "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    await supabase
      .from("seating_tables")
      .update({
        capacity,
        table_name: name.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", table.id);
    await onSaved();
    setBusy(false);
  };

  return (
    <div className="mt-2.5 flex items-end gap-2">
      <div className="w-20">
        <ALabel>Seats</ALabel>
        <AInput
          type="number"
          min={1}
          max={30}
          value={capacity}
          onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
          className="h-10"
        />
      </div>
      <div className="flex-1">
        <ALabel>Name on the plan</ALabel>
        <AInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10"
        />
      </div>
      <AButton onClick={save} disabled={busy} className="h-10 text-[11px]">
        Save
      </AButton>
    </div>
  );
}
