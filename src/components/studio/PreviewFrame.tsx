import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { templateFontsHref, type PublicWedding } from "@/lib/wedding";
import { customFontHref, type DesignConfig } from "@/lib/studio/design";
import { StudioWeddingSite } from "./StudioWeddingSite";
import appCss from "@/styles.css?url";
import studioCss from "./studio.css?url";

const FRAME_DOCUMENT =
  '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;min-height:100%;scroll-behavior:smooth}body{overflow-x:hidden}*{box-sizing:border-box}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}</style></head><body></body></html>';
export type PreviewDevice = "desktop" | "mobile";

/** A real viewport, scaled outside the iframe. React updates its portal without reloading. */
export function PreviewFrame({
  wedding,
  design,
  device,
  onSectionSelect,
  label = "Wedding website preview",
}: {
  wedding: PublicWedding;
  design: DesignConfig;
  device: PreviewDevice;
  onSectionSelect?: (id: string) => void;
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
  const width = device === "mobile" ? 389 : 1100;
  const scale = Math.min(size.width / width, 1);
  const height = Math.max(300, size.height / Math.max(scale, 0.1));
  const fontHref = customFontHref(design);
  return (
    <div className="preview-frame" ref={container} data-device={device}>
      {!ready && (
        <div className="preview-skeleton" role="status">
          <span>Preparing your preview…</span>
        </div>
      )}
      <div
        className="preview-frame-inner"
        style={{ width, height, transform: `translateX(-50%) scale(${scale})` }}
      >
        <iframe
          title={label}
          srcDoc={FRAME_DOCUMENT}
          onLoad={(e) => setFrame(e.currentTarget)}
          style={{ height: device === "mobile" ? height - 14 : height }}
        />
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
            <StudioWeddingSite
              wedding={wedding}
              design={design}
              preview
              onSectionSelect={onSectionSelect}
            />,
            frame.contentDocument.body,
          )}
        </>
      )}
    </div>
  );
}
