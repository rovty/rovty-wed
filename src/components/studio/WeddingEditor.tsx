import { CanvasPanel } from "./CanvasPanel";
import {
  CANVAS_PRESETS,
  createCanvas,
  duplicateElement,
  emptyCanvas,
  MAX_ELEMENTS,
  type CanvasDesign,
  type CanvasElement,
  type CanvasPreset,
} from "@/lib/studio/canvas";
import { IdentityNotice } from "@/components/admin/IdentityNotice";
import { preserveWeddingIdentity } from "@/lib/wedding-identity";
import { useBlocker } from "@tanstack/react-router";
import { PanelHeading, Field, HexInput } from "./EditorFields";
import { SectionFields } from "./SectionFields";
import { ReviewDialog, ConfirmLeave } from "./EditorDialogs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  Eye,
  Grid2X2,
  Magnet,
  MousePointer2,
  Copy,
  ImagePlus,
  Layers,
  LayoutTemplate,
  Monitor,
  Palette as PaletteIcon,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2,
  Type,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import {
  DRAFT_KEY,
  TEMPLATE_CATALOG,
  getTemplate,
  parseDraft,
  switchTemplate,
  type StudioDraft,
} from "@/lib/studio/catalog";
import {
  FONT_CHOICES,
  FONT_PAIRINGS,
  PALETTES,
  SECTION_LABELS,
  SECTION_TYPES,
  isHexColor,
  newSection,
  safeUrl,
  type ColorKey,
  type DesignSection,
  type SectionType,
} from "@/lib/studio/design";
import { prepareStudioImage, uploadStudioMedia } from "@/lib/studio/media";
import { PreviewFrame, type PreviewDevice } from "./PreviewFrame";
import { DeviceToggle, TemplateMiniature } from "./TemplateDiscovery";

type Panel =
  "content" | "style" | "sections" | "photos" | "templates" | "elements";
const PANELS = [
  { id: "content", label: "Content", icon: Type },
  { id: "style", label: "Style", icon: PaletteIcon },
  { id: "elements", label: "Elements", icon: MousePointer2 },
  { id: "sections", label: "Sections", icon: Layers },
  { id: "photos", label: "Photos", icon: ImagePlus },
  { id: "templates", label: "Designs", icon: LayoutTemplate },
] as const;

export default function WeddingEditor({
  initialDraft,
  onBack,
  onSave,
  onDraftChange,
  weddingId,
  published = false,
  initiallyUnsaved = false,
}: {
  initialDraft: StudioDraft;
  onBack: () => void;
  onSave?: (draft: StudioDraft, publish: boolean) => Promise<void>;
  onDraftChange?: (draft: StudioDraft) => void;
  weddingId?: string;
  published?: boolean;
  initiallyUnsaved?: boolean;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [saved, setSaved] = useState(
    initiallyUnsaved ? "" : JSON.stringify(initialDraft),
  );
  const [history, setHistory] = useState<StudioDraft[]>([]);
  const [future, setFuture] = useState<StudioDraft[]>([]);
  const [panel, setPanel] = useState<Panel>("content");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [grid, setGrid] = useState(false);
  const [snap, setSnap] = useState(true);
  const [zoom, setZoom] = useState<number | null>(null);
  const copiedElement = useRef<CanvasElement | null>(null);
  const keyboardRef = useRef<(event: KeyboardEvent) => void>(() => {});
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [review, setReview] = useState(false);
  const [leave, setLeave] = useState(false);
  const [importDraft, setImportDraft] = useState<StudioDraft | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [dragged, setDragged] = useState<string | null>(null);
  const [replay, setReplay] = useState(0);
  const blobs = useRef<string[]>([]);
  const draftRef = useRef(draft);
  const editTime = useRef(0);
  const dirty = JSON.stringify(draft) !== saved;
  useBlocker({
    shouldBlockFn: () =>
      Boolean(dirty && onSave) &&
      !window.confirm("You have unsaved design changes. Leave this editor?"),
    enableBeforeUnload: false,
  });
  const template = getTemplate(draft.wedding.template);
  const currentSection = draft.design.sections.find(
    (s) => s.id === selectedSection,
  );
  const update = useCallback(
    (next: StudioDraft, discrete = false) => {
      const now = Date.now();
      const previous = draftRef.current;
      if (discrete || now - editTime.current > 650)
        setHistory((h) => [...h.slice(-59), previous]);
      editTime.current = now;
      const safe = weddingId
        ? {
            ...next,
            wedding: preserveWeddingIdentity(
              next.wedding,
              initialDraft.wedding,
            ),
          }
        : next;
      draftRef.current = safe;
      setDraft(safe);
      setFuture([]);
      setError("");
      setStatus("");
    },
    [weddingId, initialDraft.wedding],
  );
  const undo = () => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setFuture((f) => [draft, ...f]);
    setHistory((h) => h.slice(0, -1));
    draftRef.current = previous;
    setDraft(previous);
    editTime.current = 0;
  };
  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory((h) => [...h, draft]);
    setFuture((f) => f.slice(1));
    draftRef.current = next;
    setDraft(next);
    editTime.current = 0;
  };
  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);
  useEffect(() => {
    if (weddingId) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setStatus("Draft saved on this device");
      } catch {
        setStatus("Device storage is unavailable. Keep this tab open.");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [draft, weddingId]);
  useEffect(() => {
    if (!weddingId) return;
    try {
      setImportDraft(parseDraft(localStorage.getItem(DRAFT_KEY)));
    } catch {
      /* optional import */
    }
  }, [weddingId]);
  useEffect(() => {
    if (!dirty || !onSave) return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty, onSave]);
  useEffect(
    () => () => blobs.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );
  const wedding = (patch: Partial<PublicWedding>) =>
    update({
      ...draftRef.current,
      wedding: { ...draftRef.current.wedding, ...patch },
    });
  const design = (patch: Partial<StudioDraft["design"]>, discrete = false) =>
    update(
      { ...draftRef.current, design: { ...draftRef.current.design, ...patch } },
      discrete,
    );
  const section = (
    id: string,
    patch: Partial<DesignSection>,
    discrete = false,
  ) =>
    design(
      {
        sections: draftRef.current.design.sections.map((s) =>
          s.id === id ? { ...s, ...patch } : s,
        ),
      },
      discrete,
    );
  const moveSection = (id: string, to: number) => {
    const list = [...draft.design.sections];
    const index = list.findIndex((s) => s.id === id);
    if (index < 0 || to < 0 || to >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(to, 0, item);
    design({ sections: list }, true);
  };
  const upload = async (file: File, assign: (url: string) => void) => {
    setUploading(true);
    setError("");
    try {
      let url: string;
      if (weddingId) url = await uploadStudioMedia(weddingId, file);
      else {
        if (
          file.type.startsWith("video/") &&
          (!["video/mp4", "video/webm"].includes(file.type) ||
            file.size > 20 * 1024 * 1024)
        )
          throw new Error("Choose an MP4 or WebM smaller than 20 MB.");
        const prepared = file.type.startsWith("video/")
          ? file
          : await prepareStudioImage(file);
        url = URL.createObjectURL(prepared);
        blobs.current.push(url);
      }
      assign(url);
      setStatus(
        weddingId
          ? "Media ready. Save to apply it to your website."
          : "Preview added. Sign in to save your photos permanently.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };
  const save = async (publish = false) => {
    if (!onSave) {
      setReview(true);
      return;
    }
    if (
      !draft.wedding.bride.trim() ||
      !draft.wedding.groom.trim() ||
      !Number.isFinite(draft.wedding.date.getTime())
    ) {
      setError("Add both names and a valid wedding date before saving.");
      return;
    }
    const saving = draft;
    setBusy(true);
    setError("");
    try {
      await onSave(saving, publish);
      setSaved(JSON.stringify(saving));
      setStatus(
        publish
          ? "Your wedding website is published."
          : "Your design is saved.",
      );
      setReview(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "We couldn’t save your design. Your changes are still here.",
      );
    } finally {
      setBusy(false);
    }
  };
  const setColor = (key: ColorKey, color: string) => {
    if (!isHexColor(color)) return;
    design({ colors: { ...draft.design.colors, [key]: color } });
    setRecent((old) => [color, ...old.filter((c) => c !== color)].slice(0, 6));
  };
  const uploadControl = (
    label: string,
    assign: (url: string) => void,
    video = false,
  ) => (
    <label className="editor-upload-button">
      <Upload size={14} />
      {uploading ? "Preparing media…" : label}
      <input
        type="file"
        accept={
          video ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"
        }
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file, assign);
          e.target.value = "";
        }}
      />
    </label>
  );
  const currentCanvas =
    currentSection?.type === "canvas"
      ? currentSection.canvas || emptyCanvas()
      : null;
  const addCanvas = (preset: CanvasPreset) => {
    if (
      draftRef.current.design.sections.filter((s) => s.type === "canvas")
        .length >= 8
    ) {
      setError("Your website can have up to eight custom canvases.");
      return;
    }
    const s = {
      ...newSection("canvas", crypto.randomUUID()),
      title: CANVAS_PRESETS.find((p) => p.id === preset)!.name,
      canvas: createCanvas(preset, draft.wedding.couplePhotoUrl || ""),
    };
    const list = [...draftRef.current.design.sections];
    const after = selectedSection
      ? list.findIndex((x) => x.id === selectedSection)
      : list.findIndex((x) => x.type === "hero");
    list.splice(after + 1, 0, s);
    design({ sections: list }, true);
    setSelectedSection(s.id);
    setSelectedElement(null);
    setPanel("elements");
  };
  const changeCanvas = (patch: Partial<CanvasDesign>, discrete = false) => {
    if (!currentSection || !currentCanvas) return;
    const latest =
      draftRef.current.design.sections.find((s) => s.id === currentSection.id)
        ?.canvas || emptyCanvas();
    section(currentSection.id, { canvas: { ...latest, ...patch } }, discrete);
  };
  const changeElement = (
    id: string,
    patch: Partial<CanvasElement>,
    discrete = false,
  ) => {
    const latest = draftRef.current.design.sections.find(
      (s) => s.id === selectedSection,
    )?.canvas;
    if (latest)
      changeCanvas(
        {
          elements: latest.elements.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        },
        discrete,
      );
  };
  const duplicateSelected = (source?: CanvasElement) => {
    const element =
      source || currentCanvas?.elements.find((e) => e.id === selectedElement);
    if (
      !element ||
      !currentCanvas ||
      currentCanvas.elements.length >= MAX_ELEMENTS
    )
      return;
    const copy = duplicateElement(element);
    changeCanvas({ elements: [...currentCanvas.elements, copy] }, true);
    setSelectedElement(copy.id);
  };
  const removeSelected = () => {
    const element = currentCanvas?.elements.find(
      (e) => e.id === selectedElement,
    );
    if (!element || element.locked || !currentCanvas) return;
    changeCanvas(
      {
        elements: currentCanvas.elements.filter(
          (e) => e.id !== selectedElement,
        ),
      },
      true,
    );
    setSelectedElement(null);
  };
  useEffect(() => {
    keyboardRef.current = (event) => {
      if (event.defaultPrevented || review || leave || uploading) return;
      const target = event.target as HTMLElement;
      if (target?.closest?.("input, textarea, select, [contenteditable=true]"))
        return;
      const command = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (command && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (command && key === "y") {
        event.preventDefault();
        redo();
      } else if (command && key === "s") {
        event.preventDefault();
        if (onSave) void save();
      } else if (command && key === "d" && selectedElement) {
        event.preventDefault();
        duplicateSelected();
      } else if (command && key === "c" && selectedElement) {
        copiedElement.current =
          currentCanvas?.elements.find((e) => e.id === selectedElement) || null;
        if (copiedElement.current) {
          event.preventDefault();
          setStatus("Element copied. Paste it into any custom canvas.");
        }
      } else if (
        command &&
        key === "v" &&
        currentCanvas &&
        copiedElement.current
      ) {
        event.preventDefault();
        duplicateSelected(copiedElement.current);
      } else if ((key === "delete" || key === "backspace") && selectedElement) {
        event.preventDefault();
        removeSelected();
      } else if (key === "escape") setSelectedElement(null);
    };
  });
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => keyboardRef.current(event),
    [],
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  const elementsPanel = (
    <>
      <PanelHeading
        eyebrow="Your imagination, invited"
        title="Make something yours."
        text="Compose your own section with words, photos and little details."
      />
      {draft.design.sections.some((s) => s.type === "canvas") && (
        <Field label="Choose a custom canvas">
          <select
            value={currentCanvas ? selectedSection || "" : ""}
            onChange={(e) => {
              setSelectedSection(e.target.value || null);
              setSelectedElement(null);
            }}
          >
            <option value="">Choose a canvas…</option>
            {draft.design.sections
              .filter((s) => s.type === "canvas")
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
          </select>
        </Field>
      )}
      {currentSection && currentCanvas ? (
        <>
          <Field label="Canvas title">
            <input
              value={currentSection.title}
              maxLength={200}
              onChange={(e) =>
                section(currentSection.id, { title: e.target.value })
              }
            />
          </Field>
          <CanvasPanel
            canvas={currentCanvas}
            selected={selectedElement}
            mobile={device === "mobile"}
            onChange={changeCanvas}
            onSelect={setSelectedElement}
            onElement={changeElement}
            onDuplicate={() => duplicateSelected()}
            onRemove={removeSelected}
            uploadControl={uploadControl}
          />
          <div className="canvas-section-actions">
            <button
              className="studio-text-button"
              disabled={
                draft.design.sections.filter((s) => s.type === "canvas")
                  .length >= 8
              }
              onClick={() => {
                const copy = {
                  ...currentSection,
                  id: crypto.randomUUID(),
                  title: currentSection.title + " copy",
                  canvas: {
                    ...currentCanvas,
                    elements: currentCanvas.elements.map((e) => ({
                      ...e,
                      id: crypto.randomUUID(),
                    })),
                  },
                };
                const list = [...draft.design.sections];
                list.splice(
                  list.findIndex((s) => s.id === currentSection.id) + 1,
                  0,
                  copy,
                );
                design({ sections: list }, true);
                setSelectedSection(copy.id);
                setSelectedElement(null);
              }}
            >
              <Copy size={13} /> Duplicate canvas
            </button>
            <button
              className="studio-text-button"
              onClick={() => {
                design(
                  {
                    sections: draft.design.sections.filter(
                      (s) => s.id !== currentSection.id,
                    ),
                  },
                  true,
                );
                setSelectedSection(null);
                setSelectedElement(null);
              }}
            >
              <Trash2 size={13} /> Remove canvas
            </button>
          </div>
        </>
      ) : (
        <div className="canvas-preset-grid">
          {CANVAS_PRESETS.map((p) => (
            <button
              key={p.id}
              className={`canvas-preset preset-${p.id}`}
              onClick={() => addCanvas(p.id)}
            >
              <span className="canvas-preset-art" aria-hidden="true">
                <i />
                <b>
                  {p.id === "blank"
                    ? "+"
                    : p.id === "poster"
                      ? "LET’S DANCE."
                      : p.id === "note"
                        ? "dear love,"
                        : "always us"}
                </b>
              </span>
              <strong>{p.name}</strong>
              <small>{p.description}</small>
            </button>
          ))}
        </div>
      )}
      {currentCanvas && (
        <button
          className="studio-button canvas-new-button"
          onClick={() => {
            setSelectedSection(null);
            setSelectedElement(null);
          }}
        >
          <Plus size={14} /> Add another canvas
        </button>
      )}
      <p className="editor-help canvas-shortcut-help">
        ⌘ / Ctrl + Z to undo · D to duplicate · C / V to copy and paste layers
        in the studio.
      </p>
    </>
  );
  const detailsPanel = (
    <>
      <PanelHeading
        eyebrow="The two of you"
        title="Your story starts here."
        text="A few details. A little personality. All you."
      />
      {importDraft && (
        <div className="editor-import">
          <p>You have a design from the collection.</p>
          <button
            className="studio-text-button"
            onClick={() => {
              update(
                {
                  wedding: { ...importDraft.wedding, slug: draft.wedding.slug },
                  design: importDraft.design,
                },
                true,
              );
              setImportDraft(null);
            }}
          >
            Bring in your draft <ArrowRight size={13} />
          </button>
          <button
            className="studio-text-button"
            onClick={() => setImportDraft(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="editor-field-grid">
        <Field label="Partner one">
          <input
            value={draft.wedding.bride}
            readOnly={Boolean(weddingId)}
            maxLength={80}
            onChange={(e) => wedding({ bride: e.target.value })}
          />
        </Field>
        <Field label="Partner two">
          <input
            value={draft.wedding.groom}
            readOnly={Boolean(weddingId)}
            maxLength={80}
            onChange={(e) => wedding({ groom: e.target.value })}
          />
        </Field>
      </div>
      {weddingId && (
        <IdentityNotice wedding={{ id: weddingId, ...initialDraft.wedding }} />
      )}
      <Field label="Wedding date & time">
        <input
          type="datetime-local"
          value={localDateInput(draft.wedding.date)}
          onChange={(e) => {
            const d = parseVenueDate(e.target.value);
            if (d) wedding({ date: d });
          }}
        />
        <small>Venue time · Sri Lanka (UTC+05:30)</small>
      </Field>
      <Field label="Your welcome note">
        <textarea
          rows={4}
          value={draft.wedding.description}
          maxLength={5000}
          onChange={(e) => wedding({ description: e.target.value })}
        />
      </Field>
      <div className="editor-divider" />
      <p className="editor-group-title">A place to celebrate</p>
      <Field label="Venue name">
        <input
          value={draft.wedding.venue || ""}
          onChange={(e) => wedding({ venue: e.target.value })}
        />
      </Field>
      <Field label="Hall or ceremony space">
        <input
          value={draft.wedding.hall || ""}
          onChange={(e) => wedding({ hall: e.target.value })}
        />
      </Field>
      <Field label="Address">
        <textarea
          rows={2}
          value={draft.wedding.address || ""}
          onChange={(e) => wedding({ address: e.target.value })}
        />
      </Field>
      <details className="editor-details">
        <summary>
          Family, reception & directions <ChevronDown size={14} />
        </summary>
        <Field label="Partner one’s family">
          <input
            value={draft.wedding.brideParentsNames || ""}
            onChange={(e) => wedding({ brideParentsNames: e.target.value })}
          />
        </Field>
        <Field label="Partner two’s family">
          <input
            value={draft.wedding.groomParentsNames || ""}
            onChange={(e) => wedding({ groomParentsNames: e.target.value })}
          />
        </Field>
        <Field label="Reception date & time">
          <input
            type="datetime-local"
            value={
              draft.wedding.receptionDate
                ? localDateInput(draft.wedding.receptionDate)
                : ""
            }
            onChange={(e) =>
              wedding({ receptionDate: parseVenueDate(e.target.value) })
            }
          />
        </Field>
        <Field label="Google Maps link">
          <input
            type="url"
            placeholder="https://maps.google.com/…"
            value={draft.wedding.mapsUrl || ""}
            onChange={(e) => wedding({ mapsUrl: e.target.value })}
          />
        </Field>
      </details>
    </>
  );
  return (
    <div className="studio-shell editor-shell" data-mobile-view={mobileView}>
      <header className="editor-header">
        <div className="editor-header-start">
          <button
            className="studio-icon-button"
            aria-label="Back to designs"
            onClick={() => (dirty && onSave ? setLeave(true) : onBack())}
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <span className="editor-project-title">
              {draft.wedding.bride || "You"} &{" "}
              {draft.wedding.groom || "Your love"}
            </span>
            <span className="editor-save-state">
              {onSave
                ? dirty
                  ? "Unsaved changes"
                  : "All changes saved"
                : "Your personal design studio"}
            </span>
          </div>
        </div>
        <div className="editor-header-actions">
          <div className="editor-history">
            <button
              className="studio-icon-button"
              aria-label="Undo"
              disabled={!history.length}
              onClick={undo}
            >
              <Undo2 size={16} />
            </button>
            <button
              className="studio-icon-button"
              aria-label="Redo"
              disabled={!future.length}
              onClick={redo}
            >
              <Redo2 size={16} />
            </button>
          </div>
          {onSave && (
            <button
              className="studio-button editor-save"
              disabled={busy || uploading || !dirty}
              onClick={() => void save()}
            >
              <Save size={14} />
              {busy
                ? "Saving…"
                : published
                  ? "Save to live site"
                  : "Save draft"}
            </button>
          )}
          <button
            className="studio-button primary"
            disabled={uploading}
            onClick={() => setReview(true)}
          >
            <Eye size={14} />
            <span>Preview & publish</span>
          </button>
        </div>
      </header>
      <div className="editor-mobile-switch">
        <button
          aria-pressed={mobileView === "edit"}
          onClick={() => setMobileView("edit")}
        >
          <SlidersHorizontal size={15} /> Edit your website
        </button>
        <button
          aria-pressed={mobileView === "preview"}
          onClick={() => {
            setMobileView("preview");
            setDevice("mobile");
          }}
        >
          <Eye size={15} /> Live preview
        </button>
      </div>
      <div className="editor-workspace">
        <nav className="editor-rail" aria-label="Editor panels">
          {PANELS.map((p) => (
            <button
              key={p.id}
              aria-pressed={panel === p.id}
              onClick={() => {
                setPanel(p.id);
                if (p.id !== "elements") {
                  setSelectedSection(null);
                  setSelectedElement(null);
                }
                setMobileView("edit");
              }}
            >
              <p.icon size={19} />
              <span>{p.label}</span>
            </button>
          ))}
        </nav>
        <aside className="editor-panel">
          <fieldset className="editor-panel-fields" disabled={uploading}>
            {panel === "content" && detailsPanel}
            {panel === "elements" && elementsPanel}
            {panel === "style" && (
              <>
                <PanelHeading
                  eyebrow="Make it feel like you"
                  title="Set the mood."
                  text="Thoughtful combinations, with room to play."
                />
                <p className="editor-group-title">Curated palettes</p>
                <div className="editor-palettes">
                  {PALETTES.map((p) => (
                    <button
                      key={p.name}
                      aria-label={`Apply ${p.name} palette`}
                      onClick={() => design({ colors: p.colors }, true)}
                    >
                      <span>
                        {Object.values(p.colors).map((color, i) => (
                          <i key={i} style={{ background: color }} />
                        ))}
                      </span>
                      <small>{p.name}</small>
                    </button>
                  ))}
                </div>
                <details className="editor-details">
                  <summary>
                    Fine-tune your colors <ChevronDown size={14} />
                  </summary>
                  {(
                    [
                      "primary",
                      "secondary",
                      "accent",
                      "background",
                      "text",
                    ] as ColorKey[]
                  ).map((key) => (
                    <div className="editor-color-row" key={key}>
                      <label htmlFor={`color-${key}`}>{key}</label>
                      <input
                        id={`color-${key}`}
                        aria-label={`${key} color`}
                        type="color"
                        value={
                          draft.design.colors[key] || template.palette[key]
                        }
                        onChange={(e) => setColor(key, e.target.value)}
                      />
                      <HexInput
                        label={`${key} HEX`}
                        value={
                          draft.design.colors[key] || template.palette[key]
                        }
                        onChange={(v) => setColor(key, v)}
                      />
                    </div>
                  ))}
                  {recent.length > 0 && (
                    <div className="editor-recent">
                      <small>Recently used · apply as primary</small>
                      <div>
                        {recent.map((c) => (
                          <button
                            key={c}
                            style={{ background: c }}
                            aria-label={`Use ${c} as primary`}
                            onClick={() => setColor("primary", c)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </details>
                <button
                  className="studio-text-button"
                  onClick={() => design({ colors: {} }, true)}
                >
                  <RotateCcw size={12} /> Restore original palette
                </button>
                <div className="editor-divider" />
                <p className="editor-group-title">Typography</p>
                <div className="editor-font-pairings">
                  {FONT_PAIRINGS.map((pair) => (
                    <button
                      key={pair.id}
                      aria-pressed={draft.design.typography.pairing === pair.id}
                      onClick={() =>
                        design(
                          {
                            typography: {
                              ...draft.design.typography,
                              pairing: pair.id,
                              heading: pair.heading,
                              body: pair.body,
                              accent: pair.accent,
                            },
                          },
                          true,
                        )
                      }
                    >
                      <span
                        style={{
                          fontFamily:
                            FONT_CHOICES.find((f) => f.id === pair.heading)
                              ?.css || template.fonts.heading,
                        }}
                      >
                        Aa
                      </span>
                      <span>
                        {pair.label}
                        <small>{pair.description}</small>
                      </span>
                      {draft.design.typography.pairing === pair.id && (
                        <Check size={14} />
                      )}
                    </button>
                  ))}
                </div>
                <details className="editor-details">
                  <summary>
                    Fine-tune typography <ChevronDown size={14} />
                  </summary>
                  {(["heading", "body", "accent"] as const).map((key) => (
                    <Field
                      key={key}
                      label={`${key[0].toUpperCase() + key.slice(1)} font`}
                    >
                      <select
                        value={draft.design.typography[key]}
                        onChange={(e) =>
                          design({
                            typography: {
                              ...draft.design.typography,
                              pairing: "custom",
                              [key]: e.target.value,
                            },
                          })
                        }
                      >
                        <option value="">Template original</option>
                        {FONT_CHOICES.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  ))}
                  <Field
                    label={`Heading size · ${Math.round(draft.design.typography.scale * 100)}%`}
                  >
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={draft.design.typography.scale}
                      onChange={(e) =>
                        design({
                          typography: {
                            ...draft.design.typography,
                            scale: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </Field>
                  <Field label="Heading weight">
                    <select
                      value={draft.design.typography.weight}
                      onChange={(e) =>
                        design({
                          typography: {
                            ...draft.design.typography,
                            weight: Number(e.target.value),
                          },
                        })
                      }
                    >
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semibold</option>
                    </select>
                  </Field>
                </details>
                <div className="editor-divider" />
                <Field label="Animation style">
                  <select
                    value={draft.design.motion}
                    onChange={(e) =>
                      design(
                        {
                          motion: e.target
                            .value as StudioDraft["design"]["motion"],
                        },
                        true,
                      )
                    }
                  >
                    <option value="gentle">Soft arrival</option>
                    <option value="expressive">A little more movement</option>
                    <option value="none">Still & serene</option>
                  </select>
                </Field>
                <button
                  className="studio-text-button"
                  onClick={() => setReplay((n) => n + 1)}
                >
                  Replay the entrance <RotateCcw size={12} />
                </button>
              </>
            )}
            {panel === "sections" && (
              <>
                <PanelHeading
                  eyebrow="Tell it your way"
                  title="Every chapter, yours."
                  text="Arrange your page. Keep what you love."
                />
                {currentSection ? (
                  <>
                    <button
                      className="studio-text-button"
                      onClick={() => setSelectedSection(null)}
                    >
                      <ArrowLeft size={13} /> All sections
                    </button>
                    {currentSection.type === "canvas" ? (
                      <button
                        className="studio-button"
                        onClick={() => setPanel("elements")}
                      >
                        Edit canvas elements <ArrowRight size={14} />
                      </button>
                    ) : (
                      <SectionFields
                        section={currentSection}
                        onChange={(patch) => section(currentSection.id, patch)}
                        uploadControl={uploadControl}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <div className="editor-section-list">
                      {draft.design.sections.map((s, i) => (
                        <div
                          key={s.id}
                          className="editor-section-row"
                          draggable
                          onDragStart={() => setDragged(s.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (dragged) moveSection(dragged, i);
                            setDragged(null);
                          }}
                        >
                          <span className="editor-section-index">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <button
                            className="editor-section-name"
                            onClick={() => {
                              setSelectedSection(s.id);
                              setSelectedElement(null);
                              if (s.type === "canvas") setPanel("elements");
                            }}
                          >
                            {s.type === "canvas"
                              ? s.title
                              : SECTION_LABELS[s.type]}
                            <small>
                              {s.enabled
                                ? "Click to customize"
                                : "Hidden from your website"}
                            </small>
                          </button>
                          <div className="editor-section-order">
                            <button
                              aria-label={`Move ${SECTION_LABELS[s.type]} up`}
                              disabled={i === 0}
                              onClick={() => moveSection(s.id, i - 1)}
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              aria-label={`Move ${SECTION_LABELS[s.type]} down`}
                              disabled={i === draft.design.sections.length - 1}
                              onClick={() => moveSection(s.id, i + 1)}
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                          <input
                            className="editor-toggle"
                            type="checkbox"
                            aria-label={`Show ${SECTION_LABELS[s.type]}`}
                            checked={s.enabled}
                            onChange={(e) =>
                              section(s.id, { enabled: e.target.checked }, true)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <Field label="Add a section">
                      <select
                        value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          if (e.target.value === "canvas") {
                            addCanvas("blank");
                            return;
                          }
                          const s = newSection(e.target.value as SectionType);
                          design(
                            { sections: [...draft.design.sections, s] },
                            true,
                          );
                          setSelectedSection(s.id);
                        }}
                      >
                        <option value="">Choose your next chapter…</option>
                        {SECTION_TYPES.filter(
                          (type) =>
                            type === "canvas" ||
                            !draft.design.sections.some((s) => s.type === type),
                        ).map((type) => (
                          <option key={type} value={type}>
                            {SECTION_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <p className="editor-help">
                      Drag to rearrange, or use the arrows. Hidden sections keep
                      all their content.
                    </p>
                  </>
                )}
              </>
            )}
            {panel === "photos" && (
              <>
                <PanelHeading
                  eyebrow="The moments that matter"
                  title="Picture your forever."
                  text="Drop in a memory. Watch it become your story."
                />
                <div
                  className="editor-photo-preview"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f && !uploading)
                      void upload(f, (url) => wedding({ couplePhotoUrl: url }));
                  }}
                >
                  {draft.wedding.couplePhotoUrl && (
                    <img
                      src={draft.wedding.couplePhotoUrl}
                      alt="Couple photo preview"
                      style={{
                        objectPosition: `${draft.design.photoPosition.x}% ${draft.design.photoPosition.y}%`,
                      }}
                    />
                  )}
                </div>
                {uploadControl("Replace couple photo", (url) =>
                  wedding({ couplePhotoUrl: url }),
                )}
                <p className="editor-help">
                  Drop a photo above, or choose one. JPG, PNG or WebP, up to 20
                  MB. We’ll optimize it for you.
                </p>
                <Field label="Photo position · left to right">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draft.design.photoPosition.x}
                    onChange={(e) =>
                      design({
                        photoPosition: {
                          ...draft.design.photoPosition,
                          x: Number(e.target.value),
                        },
                      })
                    }
                  />
                </Field>
                <Field label="Photo position · top to bottom">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draft.design.photoPosition.y}
                    onChange={(e) =>
                      design({
                        photoPosition: {
                          ...draft.design.photoPosition,
                          y: Number(e.target.value),
                        },
                      })
                    }
                  />
                </Field>
                <div className="editor-divider" />
                <p className="editor-group-title">Your venue</p>
                {draft.wedding.venuePhotoUrl && (
                  <img
                    className="editor-venue-preview"
                    src={draft.wedding.venuePhotoUrl}
                    alt="Venue preview"
                  />
                )}
                {uploadControl("Replace venue photo", (url) =>
                  wedding({ venuePhotoUrl: url }),
                )}
                <div className="editor-divider" />
                <button
                  className="studio-button"
                  onClick={() => {
                    let s = draft.design.sections.find(
                      (s) => s.type === "gallery",
                    );
                    if (!s) {
                      s = newSection("gallery");
                      design({ sections: [...draft.design.sections, s] }, true);
                    }
                    setPanel("sections");
                    setSelectedSection(s.id);
                  }}
                >
                  Build your photo gallery <ArrowRight size={14} />
                </button>
                {!weddingId && (
                  <p className="editor-help">
                    Photos here are temporary. Sign in, then upload your photos
                    to keep them with your wedding.
                  </p>
                )}
              </>
            )}
            {panel === "templates" && (
              <>
                <PanelHeading
                  eyebrow="A fresh perspective"
                  title="Find another feeling."
                  text="Your words, photos and sections come with you. Colors and fonts follow the new design."
                />
                <div className="editor-template-grid">
                  {TEMPLATE_CATALOG.map((t) => (
                    <button
                      key={t.id}
                      aria-label={`Switch to ${t.name}`}
                      aria-pressed={draft.wedding.template === t.id}
                      onClick={() => update(switchTemplate(draft, t.id), true)}
                    >
                      <div>
                        <TemplateMiniature template={t} />
                      </div>
                      <span>
                        {t.name}
                        {draft.wedding.template === t.id && <Check size={13} />}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </fieldset>
        </aside>
        <section className="editor-canvas">
          <div className="editor-canvas-toolbar">
            <span>
              <i /> {template.name}
              <span className="editor-canvas-label"> · Live preview</span>
            </span>
            <DeviceToggle
              device={device}
              onChange={(next) => {
                setDevice(next);
                setZoom(null);
              }}
            />
            <div className="editor-canvas-tools">
              {currentCanvas && (
                <>
                  <button
                    className="studio-icon-button"
                    aria-label="Show alignment grid"
                    aria-pressed={grid}
                    onClick={() => setGrid((v) => !v)}
                  >
                    <Grid2X2 size={15} />
                  </button>
                  <button
                    className="studio-icon-button"
                    aria-label="Snap to alignment guides"
                    aria-pressed={snap}
                    onClick={() => setSnap((v) => !v)}
                  >
                    <Magnet size={15} />
                  </button>
                </>
              )}
              <select
                aria-label="Canvas zoom"
                value={zoom ?? "fit"}
                onChange={(e) =>
                  setZoom(
                    e.target.value === "fit" ? null : Number(e.target.value),
                  )
                }
              >
                <option value="fit">Fit</option>
                <option value={0.5}>50%</option>
                <option value={0.75}>75%</option>
                <option value={1}>100%</option>
                <option value={1.25}>125%</option>
              </select>
            </div>
          </div>
          <div className="editor-canvas-frame">
            <PreviewFrame
              key={replay}
              wedding={draft.wedding}
              design={draft.design}
              device={device}
              zoom={zoom}
              selectedSection={selectedSection}
              onKeyDown={handleKeyDown}
              canvasEditing={
                currentCanvas
                  ? {
                      selected: selectedElement,
                      grid,
                      snap,
                      onSelect: setSelectedElement,
                      onChange: changeElement,
                      onGesture: () => {
                        editTime.current = 0;
                      },
                    }
                  : undefined
              }
              onSectionSelect={(id) => {
                setSelectedSection(id);
                setSelectedElement(null);
                setPanel(
                  draft.design.sections.find((s) => s.id === id)?.type ===
                    "canvas"
                    ? "elements"
                    : "sections",
                );
                setMobileView("edit");
              }}
            />
          </div>
          <p className="editor-canvas-note">
            {currentCanvas ? (
              <>
                Drag to arrange · Double-click to edit text · Hold Alt to move
                without snapping
                <button
                  className="canvas-mobile-inspect"
                  onClick={() => setMobileView("edit")}
                >
                  Edit selected element <ArrowRight size={12} />
                </button>
              </>
            ) : (
              "Select a section on the preview to make it yours."
            )}
          </p>
        </section>
      </div>
      {(error || status) && (
        <div
          className={`editor-notice ${error ? "error" : ""}`}
          role={error ? "alert" : "status"}
        >
          {error || status}
          <button
            aria-label="Dismiss message"
            onClick={() => {
              setError("");
              setStatus("");
            }}
          >
            <X size={13} />
          </button>
        </div>
      )}
      {review && (
        <ReviewDialog
          draft={draft}
          device={device}
          onDevice={setDevice}
          onClose={() => setReview(false)}
          onPublish={onSave ? () => void save(!published) : undefined}
          busy={busy}
          published={published}
          error={error}
        />
      )}
      {leave && (
        <ConfirmLeave onClose={() => setLeave(false)} onLeave={onBack} />
      )}
    </div>
  );
}

function localDateInput(date: Date) {
  return new Date(date.getTime() + 330 * 60 * 1000).toISOString().slice(0, 16);
}
function parseVenueDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}:00+05:30`);
  return Number.isFinite(date.getTime()) ? date : null;
}
