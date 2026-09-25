import { themeArtworkStyle } from "@/lib/studio/theme-art";
import { templateClasses } from "@/lib/wedding-themes";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  Columns2,
  Eye,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  X,
} from "lucide-react";
import { templateFontsHref, type WeddingTemplate } from "@/lib/wedding";
import { SIGNATURE_TEMPLATES } from "@/lib/wedding-signature";
import {
  COLLECTIONS,
  DEMO_WEDDING,
  DRAFT_KEY,
  TEMPLATE_CATALOG,
  createDesign,
  getTemplate,
  sampleWedding,
  parseDraft,
  type Collection,
  type StudioDraft,
  type TemplateDefinition,
} from "@/lib/studio/catalog";
import { designVariables } from "@/lib/studio/design";
import { TemplateHero } from "./TemplateHero";
import { PreviewFrame, type PreviewDevice } from "./PreviewFrame";
const WeddingEditor = lazy(() => import("./WeddingEditor"));

export function TemplateDiscovery({
  onChoose,
  onBack,
  weddingDraft,
}: {
  onChoose?: (id: WeddingTemplate) => void;
  onBack?: () => void;
  weddingDraft?: StudioDraft;
}) {
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<Collection>("All designs");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<WeddingTemplate[]>([]);
  const [compared, setCompared] = useState<WeddingTemplate[]>([]);
  const [editor, setEditor] = useState<StudioDraft | null>(null);
  const [resume, setResume] = useState<StudioDraft | null>(null);
  useEffect(() => {
    setReady(true);
    try {
      setResume(parseDraft(localStorage.getItem(DRAFT_KEY)));
    } catch {
      /* Storage may be disabled. */
    }
  }, []);
  const choose = (template: WeddingTemplate) => {
    setPreview([]);
    if (onChoose) {
      onChoose(template);
      return;
    }
    setEditor({
      wedding: { ...(resume?.wedding || sampleWedding(template)), template },
      design: resume?.design || createDesign(template),
    });
  };
  const filtered = TEMPLATE_CATALOG.filter(
    (t) =>
      (category === "All designs" || category === t.collection) &&
      `${t.name} ${t.note} ${t.collection}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (editor)
    return (
      <Suspense
        fallback={
          <div className="studio-shell studio-loading">
            Opening your studio…
          </div>
        }
      >
        <WeddingEditor
          initialDraft={editor}
          onBack={() => {
            setResume(editor);
            setEditor(null);
          }}
          onDraftChange={setEditor}
        />
      </Suspense>
    );
  return (
    <div className="studio-shell" data-ready={ready}>
      <header className="studio-header">
        <a href="/" className="studio-logo">
          <i />
          rovty<span>wed</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="/templates" aria-current="page">
            The collection
          </a>
          <a className="optional-nav" href="/#how">
            How it works
          </a>
          <a className="optional-nav" href="/#pricing">
            Pricing
          </a>
          {onBack ? (
            <button className="studio-button" onClick={onBack}>
              <ArrowLeft size={14} /> Back to design
            </button>
          ) : (
            <a className="studio-button" href="/auth">
              Your wedding <ArrowUpRight size={14} />
            </a>
          )}
        </nav>
      </header>
      <section className="discovery-intro">
        <div>
          <p className="studio-eyebrow">
            A little inspiration. A beautiful beginning.
          </p>
          <h1>
            Your love story.
            <br />
            <em>Your kind of beautiful.</em>
          </h1>
        </div>
        <aside>
          <p>
            Thoughtfully designed wedding websites.
            <br />
            Find the one that feels like you, then make every little detail your
            own.
          </p>
          <span className="discovery-assurance">
            <CheckCheck size={14} /> All designs included. Endlessly yours.
          </span>
        </aside>
      </section>
      <main className="discovery-collection">
        <div className="discovery-toolbar">
          <div className="discovery-filters" aria-label="Template collections">
            {COLLECTIONS.map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="discovery-search">
            <Search size={14} />
            <input
              aria-label="Search designs"
              placeholder="Find your style"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="template-compare-button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>
        </div>
        <div className="discovery-count">
          <span>
            {filtered.length} considered designs · Made to be made your own
          </span>
          {resume && !onChoose && (
            <button
              className="studio-text-button"
              onClick={() => setEditor(resume)}
            >
              Continue your draft <ArrowRight size={12} />
            </button>
          )}
        </div>
        <div className="discovery-grid">
          {filtered.map((t) => (
            <article className="template-card" key={t.id}>
              <button
                className="template-card-image"
                aria-label={`Preview ${t.name}`}
                onClick={() => setPreview([t.id])}
              >
                <TemplateMiniature template={t} />
                <span className="template-card-hover">
                  <Eye size={13} /> Explore this design{" "}
                  <ArrowUpRight size={12} />
                </span>
              </button>
              <div className="template-card-meta">
                <div>
                  <h2>{t.name}</h2>
                  <p>
                    {t.collection} · {t.note}
                  </p>
                </div>
                <div className="template-card-tools">
                  <span className="template-swatches" aria-hidden="true">
                    {[
                      t.palette.primary,
                      t.palette.background,
                      t.palette.accent,
                    ].map((c, i) => (
                      <i key={i} style={{ background: c }} />
                    ))}
                  </span>
                  <button
                    className="template-compare-button"
                    aria-label={`Compare ${t.name}`}
                    aria-pressed={compared.includes(t.id)}
                    disabled={compared.length === 2 && !compared.includes(t.id)}
                    onClick={() =>
                      setCompared((ids) =>
                        ids.includes(t.id)
                          ? ids.filter((id) => id !== t.id)
                          : [...ids, t.id],
                      )
                    }
                  >
                    {compared.includes(t.id) ? (
                      <Check size={14} />
                    ) : (
                      <Columns2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!filtered.length && (
            <div className="discovery-empty">
              <h2>No designs found</h2>
              <p>Try another style or explore the full collection.</p>
              <button
                className="studio-button"
                onClick={() => {
                  setQuery("");
                  setCategory("All designs");
                }}
              >
                Show all designs
              </button>
            </div>
          )}
        </div>
        {category === "All designs" && (
          <SignatureCollection query={query} onChoose={onChoose} />
        )}
      </main>
      <section className="discovery-ending">
        <p className="studio-eyebrow">The template is only the beginning</p>
        <h2>A starting point. A world of possibilities.</h2>
        <p>
          Your colors, your photographs, your words. Beautifully, unmistakably
          you.
        </p>
      </section>
      <footer className="discovery-footer">
        <a href="/" className="studio-logo">
          rovty<span>wed</span>
        </a>
        <span>For the moments that become forever.</span>
        <a href="/theme-artwork-credits.html" target="_blank" rel="noreferrer">
          Artwork credits
        </a>
        <span>© {new Date().getFullYear()} Rovty</span>
      </footer>
      {compared.length > 0 && (
        <div className="comparison-tray">
          <span>
            {compared.length === 1
              ? "Choose one more design to compare"
              : compared.map((id) => getTemplate(id).name).join(" + ")}
          </span>
          <button
            className="studio-button primary"
            disabled={compared.length !== 2}
            onClick={() => setPreview(compared)}
          >
            Compare <Columns2 size={14} />
          </button>
          <button
            className="studio-icon-button"
            aria-label="Clear comparison"
            onClick={() => setCompared([])}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {preview.length > 0 && (
        <TemplatePreviewModal
          templates={preview}
          draft={weddingDraft}
          onClose={() => setPreview([])}
          onChoose={choose}
        />
      )}
    </div>
  );
}

// The 16 designs in wedding-signature.ts: each is a fully bespoke page, not
// a palette built on the Studio's shared hero/section primitives, so unlike
// the grid above they can't get a live TemplateMiniature preview from
// createDesign()+TemplateHero — there's no DesignConfig to build one from.
// A color-and-type card stands in for that; choosing one saves the template
// directly (Templates.tsx intercepts it before it would ever reach
// DesignStudio, which assumes every template has Studio section data).
function SignatureCollection({
  query,
  onChoose,
}: {
  query: string;
  onChoose?: (id: WeddingTemplate) => void;
}) {
  const filtered = SIGNATURE_TEMPLATES.filter((t) =>
    `${t.label} ${t.note}`.toLowerCase().includes(query.toLowerCase()),
  );
  if (!filtered.length) return null;
  return (
    <div className="discovery-signature">
      <div className="discovery-count">
        <span>
          Signature collection · {filtered.length} fully custom designs
        </span>
      </div>
      <div className="discovery-grid">
        {filtered.map((t) => (
          <article className="template-card" key={t.id}>
            <button
              className="template-card-image"
              aria-label={`Choose ${t.label}`}
              onClick={() =>
                onChoose ? onChoose(t.id) : (window.location.href = "/auth")
              }
            >
              <div
                className="template-miniature"
                style={{
                  background: t.swatch.background,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  textAlign: "center",
                  padding: "0 16px",
                }}
                aria-hidden="true"
              >
                <span
                  style={{
                    color: t.swatch.ink,
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: 30,
                  }}
                >
                  {t.label}
                </span>
                <span
                  style={{
                    width: 28,
                    height: 2,
                    background: t.swatch.accent,
                  }}
                />
              </div>
              <span className="template-card-hover">
                <Eye size={13} /> Choose this design <ArrowUpRight size={12} />
              </span>
            </button>
            <div className="template-card-meta">
              <div>
                <h2>{t.label}</h2>
                <p>Signature · {t.note}</p>
              </div>
              <div className="template-card-tools">
                <span className="template-swatches" aria-hidden="true">
                  {[t.swatch.background, t.swatch.ink, t.swatch.accent].map(
                    (c, i) => (
                      <i key={i} style={{ background: c }} />
                    ),
                  )}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function TemplateMiniature({
  template,
}: {
  template: TemplateDefinition;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(330);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!root.current) return;
    const resize = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    resize.observe(root.current);
    const intersection = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          intersection.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    intersection.observe(root.current);
    return () => {
      resize.disconnect();
      intersection.disconnect();
    };
  }, []);
  return (
    <div
      ref={root}
      className="template-miniature"
      style={{
        ...themeArtworkStyle(template.id),
        ...designVariables(
          createDesign(template.id),
          template.palette,
          template.fonts,
        ),
      }}
      aria-hidden="true"
    >
      {visible && (
        <>
          <link rel="stylesheet" href={templateFontsHref(template.id)} />
          <div
            className={`template-miniature-inner wedding-design wedding-stationery collection-design ${templateClasses(template.id)} experience-${template.id}`}
            data-motion="none"
            style={{ transform: `scale(${width / 1100})` }}
          >
            <TemplateHero wedding={sampleWedding(template.id)} miniature />
          </div>
        </>
      )}
    </div>
  );
}

export function DeviceToggle({
  device,
  onChange,
}: {
  device: PreviewDevice;
  onChange: (device: PreviewDevice) => void;
}) {
  return (
    <div className="studio-device-toggle" aria-label="Preview size">
      <button
        aria-label="Desktop preview"
        aria-pressed={device === "desktop"}
        onClick={() => onChange("desktop")}
      >
        <Monitor size={16} />
      </button>
      <button
        aria-label="Tablet preview"
        aria-pressed={device === "tablet"}
        onClick={() => onChange("tablet")}
      >
        <Tablet size={16} />
      </button>
      <button
        aria-label="Mobile preview"
        aria-pressed={device === "mobile"}
        onClick={() => onChange("mobile")}
      >
        <Smartphone size={16} />
      </button>
    </div>
  );
}

export function TemplatePreviewModal({
  templates,
  draft,
  onClose,
  onChoose,
}: {
  templates: WeddingTemplate[];
  draft?: StudioDraft;
  onClose: () => void;
  onChoose: (template: WeddingTemplate) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  useEffect(() => {
    const el = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    el?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      className="studio-modal studio-shell"
      ref={dialog}
      onCancel={onClose}
      aria-label={
        templates.length > 1
          ? "Compare wedding designs"
          : `${getTemplate(templates[0]).name} preview`
      }
    >
      <div className="studio-modal-content">
        <header className="studio-modal-header">
          <div>
            <h2>
              {templates.length > 1
                ? "Two possibilities. One beautiful story."
                : getTemplate(templates[0]).name}
            </h2>
            <p>
              {templates.length > 1
                ? "Scroll each design to explore the full experience."
                : getTemplate(templates[0]).note}
            </p>
          </div>
          <div className="studio-modal-header-actions">
            <DeviceToggle device={device} onChange={setDevice} />
            {templates.length === 1 && (
              <button
                className="studio-button primary"
                onClick={() => onChoose(templates[0])}
              >
                Make it yours <ArrowRight size={14} />
              </button>
            )}
            <button
              className="studio-icon-button"
              aria-label="Close preview"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </header>
        <div
          className={`studio-modal-previews ${templates.length > 1 ? "compare" : ""}`}
        >
          {templates.map((id) => (
            <div className="studio-preview-column" key={id}>
              {templates.length > 1 && (
                <header>
                  <span>{getTemplate(id).name}</span>
                  <button
                    className="studio-button"
                    onClick={() => onChoose(id)}
                  >
                    Choose design <ArrowRight size={14} />
                  </button>
                </header>
              )}
              <PreviewFrame
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    onClose();
                  }
                }}
                wedding={{
                  ...(draft?.wedding || sampleWedding(id)),
                  template: id,
                }}
                design={draft?.design || createDesign(id)}
                device={device}
                label={`${getTemplate(id).name} live preview`}
              />
            </div>
          ))}
        </div>
      </div>
    </dialog>
  );
}
