import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { templateFontsHref, type PublicWedding } from "@/lib/wedding";
import { isSignatureTemplate } from "@/lib/wedding-signature";
import { customFontHref, type DesignConfig } from "@/lib/studio/design";
import { StudioWeddingSite } from "./StudioWeddingSite";
import { SignatureWeddingSite } from "@/components/wedding-templates";
import appCss from "@/styles.css?url";
import studioCss from "./studio.css?url";
import type { CanvasEditing } from "./CustomCanvas";

const FRAME_DOCUMENT =
  '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;min-height:100%;scroll-behavior:smooth}body{overflow-x:hidden}*{box-sizing:border-box}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}</style></head><body></body></html>';
export type PreviewDevice = "desktop" | "mobile" | "tablet";

/** A real viewport, scaled outside the iframe. React updates its portal without reloading. */
export function PreviewFrame({
  wedding,
  design,
  device,
  onSectionSelect,
  selectedSection,
  canvasEditing,
  onKeyDown,
  zoom = null,
  label = "Wedding website preview",
}: {
  wedding: PublicWedding;
  design: DesignConfig;
  device: PreviewDevice;
  onSectionSelect?: (id: string) => void;
  selectedSection?: string | null;
  canvasEditing?: CanvasEditing;
  onKeyDown?: (event: KeyboardEvent) => void;
  zoom?: number | null;
  label?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({ width: 800, height: 700 });
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const doc = frame?.contentDocument;
    if (!doc || !onKeyDown) return;
    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [frame, onKeyDown]);
  useEffect(() => {
    const doc = frame?.contentDocument;
    if (!doc) return;
    // srcdoc resolves fragment links against the embedding page's URL.
    // Handle local anchors here so they never load the editor into the iframe.
    const navigateSection = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const anchor = (event.target as Element | null)?.closest?.(
        'a[href^="#"]',
      );
      const href = anchor?.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      let id: string;
      try {
        id = decodeURIComponent(href.slice(1));
      } catch {
        return;
      }
      const target = doc.getElementById(id);
      if (!target) return;
      const reduced =
        design.motion === "none" ||
        doc.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.scrollIntoView({
        block: "start",
        behavior: reduced ? "instant" : "smooth",
      });
    };
    doc.addEventListener("click", navigateSection);
    return () => doc.removeEventListener("click", navigateSection);
  }, [frame, design.motion]);
  useEffect(() => {
    if (!ready || !selectedSection) return;
    const target = Array.from(
      frame?.contentDocument?.querySelectorAll<HTMLElement>(
        "[data-section-id]",
      ) || [],
    ).find((el) => el.dataset.sectionId === selectedSection);
    target?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [frame, selectedSection, ready, size.width, size.height, device]);
  const width = device === "mobile" ? 389 : device === "tablet" ? 768 : 1100;
  const scale = zoom ?? Math.min(size.width / width, 1);
  const height = Math.max(300, size.height / Math.max(scale, 0.1));
  const signature = isSignatureTemplate(wedding.template);
  const fontHref = signature ? undefined : customFontHref(design);
  return (
    <div className="preview-frame" ref={container} data-device={device}>
      {!ready && (
        <div className="preview-skeleton" role="status">
          <span>Preparing your preview…</span>
        </div>
      )}
      <div
        className="preview-frame-stage"
        style={{
          width: Math.max(size.width, width * scale),
          height: size.height,
        }}
      >
        <div
          className="preview-frame-inner"
          style={{
            width,
            height,
            left: Math.max(0, (size.width - width * scale) / 2),
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            title={label}
            srcDoc={FRAME_DOCUMENT}
            onLoad={(e) => setFrame(e.currentTarget)}
            style={{ height: device === "mobile" ? height - 14 : height }}
          />
        </div>
      </div>
      {frame?.contentDocument && (
        <>
          {createPortal(
            <>
              <link rel="stylesheet" href={appCss} />
              <link
                rel="stylesheet"
                href={studioCss}
                onLoad={() => setReady(true)}
              />
              <link
                rel="stylesheet"
                href={templateFontsHref(wedding.template)}
              />
              {fontHref && <link rel="stylesheet" href={fontHref} />}
            </>,
            frame.contentDocument.head,
          )}
          {createPortal(
            signature ? (
              <SignatureWeddingSite wedding={wedding} />
            ) : (
              <StudioWeddingSite
                wedding={wedding}
                design={design}
                preview
                onSectionSelect={onSectionSelect}
                selectedSection={selectedSection}
                canvasEditing={canvasEditing}
              />
            ),
            frame.contentDocument.body,
          )}
        </>
      )}
    </div>
  );
}
