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

type Panel = "content" | "style" | "sections" | "photos" | "templates";
const PANELS = [
  { id: "content", label: "Content", icon: Type },
  { id: "style", label: "Style", icon: PaletteIcon },
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
  const template = getTemplate(draft.wedding.template);
  const currentSection = draft.design.sections.find(
    (s) => s.id === selectedSection,
  );
  const update = useCallback((next: StudioDraft, discrete = false) => {
    const now = Date.now();
    const previous = draftRef.current;
    if (discrete || now - editTime.current > 650)
      setHistory((h) => [...h.slice(-59), previous]);
    editTime.current = now;
    draftRef.current = next;
    setDraft(next);
    setFuture([]);
    setError("");
    setStatus("");
  }, []);
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
        sections: draft.design.sections.map((s) =>
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
            maxLength={80}
            onChange={(e) => wedding({ bride: e.target.value })}
          />
        </Field>
        <Field label="Partner two">
          <input
            value={draft.wedding.groom}
            maxLength={80}
            onChange={(e) => wedding({ groom: e.target.value })}
          />
        </Field>
      </div>
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
                setSelectedSection(null);
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
                    <SectionFields
                      section={currentSection}
                      onChange={(patch) => section(currentSection.id, patch)}
                      uploadControl={uploadControl}
                    />
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
                            onClick={() => setSelectedSection(s.id)}
                          >
                            {SECTION_LABELS[s.type]}
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
            <DeviceToggle device={device} onChange={setDevice} />
            <span className="editor-canvas-hint">Made for every screen</span>
          </div>
          <div className="editor-canvas-frame">
            <PreviewFrame
              key={replay}
              wedding={draft.wedding}
              design={draft.design}
              device={device}
              onSectionSelect={(id) => {
                setSelectedSection(id);
                setPanel("sections");
                setMobileView("edit");
              }}
            />
          </div>
          <p className="editor-canvas-note">
            A little more you, with every change.
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
