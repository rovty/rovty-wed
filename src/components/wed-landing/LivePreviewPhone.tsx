import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fontLinks } from "@/lib/wedding";
import {
  signatureFontsHref,
  type SignatureTemplateId,
} from "@/lib/wedding-signature";
import { sampleWedding } from "@/lib/studio/catalog";
import { SignatureWeddingSite } from "@/components/wedding-templates";
import { MusicDisabledProvider } from "@/components/MusicPlayer";
import appCss from "@/styles.css?url";

const FRAME_DOCUMENT =
  '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;min-height:100%}body{overflow-x:hidden}*{box-sizing:border-box}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}</style></head><body></body></html>';

const NATURAL_WIDTH = 390;

/**
 * The actual live invitation, rendered at full size in an isolated iframe
 * and scaled down to fit the phone chassis — not a screenshot or a
 * re-implementation. Scaling the <iframe> element itself (rather than its
 * contents) keeps each template's fixed-position opener/music-player
 * correctly contained to the phone screen instead of escaping to the real
 * page, since "fixed" inside a frame is always relative to that frame's own
 * viewport regardless of how the frame element is transformed from outside.
 */
export function LivePreviewPhone({
  id,
  replayKey,
  width,
  height,
}: {
  id: SignatureTemplateId;
  replayKey: number;
  width: number;
  height: number;
}) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const scale = width / NATURAL_WIDTH;
  const wedding = sampleWedding(id);

  useEffect(() => {
    setFrame(null);
  }, [replayKey]);

  // A srcDoc iframe can finish loading (and fire its native "load" event)
  // before React attaches the onLoad listener during commit, on top of
  // being mounted fresh each replay via `key`. The ref callback runs
  // synchronously on mount/unmount, so re-checking readyState there catches
  // the case onLoad alone misses; onLoad stays as the normal-timing path.
  const refCallback = (node: HTMLIFrameElement | null) => {
    if (node) setFrame(node);
  };

  return (
    <div style={{ width, height, overflow: "hidden" }}>
      <iframe
        key={replayKey}
        ref={refCallback}
        title={`${id} invitation preview`}
        srcDoc={FRAME_DOCUMENT}
        tabIndex={-1}
        aria-hidden="true"
        onLoad={(e) => setFrame(e.currentTarget)}
        style={{
          width: NATURAL_WIDTH,
          height: height / scale,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      />
      {frame?.contentDocument &&
        createPortal(
          <>
            <link rel="stylesheet" href={appCss} />
            {fontLinks(signatureFontsHref(id)).map((l, i) => (
              <link key={i} {...l} />
            ))}
          </>,
          frame.contentDocument.head,
        )}
      {frame?.contentDocument &&
        createPortal(
          <MusicDisabledProvider value={true}>
            <SignatureWeddingSite wedding={wedding} />
          </MusicDisabledProvider>,
          frame.contentDocument.body,
        )}
    </div>
  );
}
