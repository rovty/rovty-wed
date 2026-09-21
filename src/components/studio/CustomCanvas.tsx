import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { LockKeyhole, RotateCw } from "lucide-react";
import { FONT_CHOICES } from "@/lib/studio/design";
import {
  constrainFrame,
  moveElement,
  type CanvasDesign,
  type CanvasElement,
  type CanvasFrame,
} from "@/lib/studio/canvas";
import { safeUrl } from "@/lib/studio/validation";
import { studioImageSources } from "@/lib/studio/images";

export type CanvasEditing = {
  selected: string | null;
  grid: boolean;
  snap: boolean;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<CanvasElement>) => void;
  onGesture: () => void;
};
export function CustomCanvas({
  canvas,
  editing,
  label,
}: {
  canvas: CanvasDesign;
  editing?: CanvasEditing;
  label: string;
}) {
  const board = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [typing, setTyping] = useState<string | null>(null);
  const drag = useRef<{
    id: string;
    pointer: number;
    mode: "move" | "resize" | "rotate";
    x: number;
    y: number;
    frame: CanvasFrame;
    mobile: boolean;
    width: number;
    height: number;
    rotation: number;
    angle: number;
    center: { x: number; y: number };
  } | null>(null);
  const start = (
    event: PointerEvent<HTMLElement>,
    e: CanvasElement,
    mode: "move" | "resize" | "rotate",
  ) => {
    if (!editing || event.button !== 0 || !board.current) return;
    if ((event.target as HTMLElement).closest("textarea, .canvas-fit-text"))
      return;
    event.stopPropagation();
    editing.onSelect(e.id);
    if (e.locked) return;
    // Let the first click select text without stealing focus from its inspector.
    event.currentTarget.focus({ preventScroll: true });
    const rect = board.current.getBoundingClientRect();
    const mobile = board.current.ownerDocument.defaultView!.innerWidth <= 650;
    const frame = mobile ? e.mobile : e.frame;
    const center = {
      x: rect.left + ((frame.x + frame.width / 2) / 100) * rect.width,
      y: rect.top + ((frame.y + frame.height / 2) / 100) * rect.height,
    };
    drag.current = {
      id: e.id,
      pointer: event.pointerId,
      mode,
      x: event.clientX,
      y: event.clientY,
      frame,
      mobile,
      width: rect.width,
      height: rect.height,
      rotation: e.rotation,
      angle: Math.atan2(event.clientY - center.y, event.clientX - center.x),
      center,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    editing.onGesture();
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || !editing || event.pointerId !== d.pointer) return;
    event.stopPropagation();
    const dx = ((event.clientX - d.x) / d.width) * 100,
      dy = ((event.clientY - d.y) / d.height) * 100;
    if (Math.abs(dx) + Math.abs(dy) < 0.15) return;
    if (d.mode === "rotate") {
      let rotation =
        d.rotation +
        ((Math.atan2(event.clientY - d.center.y, event.clientX - d.center.x) -
          d.angle) *
          180) /
          Math.PI;
      if (event.shiftKey) rotation = Math.round(rotation / 15) * 15;
      editing.onChange(d.id, { rotation: ((rotation + 540) % 360) - 180 });
      return;
    }
    const result =
      d.mode === "move"
        ? moveElement(
            d.frame,
            dx,
            dy,
            canvas.elements
              .filter(
                (e) =>
                  e.id !== d.id && !e.hidden && (!d.mobile || !e.hideOnMobile),
              )
              .map((e) => (d.mobile ? e.mobile : e.frame)),
            editing.snap && !event.altKey,
          )
        : {
            frame: constrainFrame({
              ...d.frame,
              width: Math.max(4, Math.min(100 - d.frame.x, d.frame.width + dx)),
              height: Math.max(
                3,
                Math.min(100 - d.frame.y, d.frame.height + dy),
              ),
            }),
            guides: {},
          };
    setGuides(result.guides);
    editing.onChange(d.id, { [d.mobile ? "mobile" : "frame"]: result.frame });
  };
  const finish = () => {
    drag.current = null;
    setGuides({});
    editing?.onGesture();
  };
  const variables = {
    "--canvas-height": canvas.height,
    "--canvas-mobile-height": canvas.mobileHeight,
    backgroundColor: canvas.background || "var(--site-paper)",
  } as CSSProperties;
  return (
    <section
      className={`custom-canvas ${editing ? "canvas-editing" : ""}`}
      aria-label={label}
    >
      <div
        ref={board}
        className={`canvas-board ${editing?.grid ? "canvas-grid" : ""}`}
        style={variables}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            editing?.onSelect(null);
            setTyping(null);
          }
        }}
      >
        {canvas.image && (
          <img
            className="canvas-background"
            src={safeUrl(canvas.image, true)}
            alt=""
            loading="lazy"
            decoding="async"
          />
        )}
        {canvas.image && canvas.overlay > 0 && (
          <span
            className="canvas-overlay"
            style={{ opacity: canvas.overlay / 100 }}
          />
        )}
        {canvas.elements
          .filter((e) => !e.hidden)
          .map((e) => {
            const selected = editing?.selected === e.id;
            const font =
              FONT_CHOICES.find((f) => f.id === e.font)?.css ||
              `var(--site-${e.font === "body" ? "body" : e.font === "accent" ? "script" : "heading"})`;
            const style = {
              "--element-x": `${e.frame.x}%`,
              "--element-y": `${e.frame.y}%`,
              "--element-width": `${e.frame.width}%`,
              "--element-height": `${e.frame.height}%`,
              "--element-mobile-x": `${e.mobile.x}%`,
              "--element-mobile-y": `${e.mobile.y}%`,
              "--element-mobile-width": `${e.mobile.width}%`,
              "--element-mobile-height": `${e.mobile.height}%`,
              "--element-font": `${e.fontSize / 10}cqw`,
              "--element-mobile-font": `${e.mobileFontSize / 4}cqw`,
              "--element-rotation": `${e.rotation}deg`,
              fontFamily: font,
              fontWeight: e.weight,
              fontStyle: e.italic ? "italic" : "normal",
              textAlign: e.align,
              lineHeight: e.lineHeight,
              letterSpacing: `${e.letterSpacing / 10}cqw`,
              color: e.color || "var(--site-ink)",
            } as CSSProperties;
            const bodyStyle = {
              background:
                e.fill ||
                (e.type === "shape" ? "var(--site-secondary)" : "transparent"),
              border: e.strokeWidth
                ? `${e.strokeWidth}px solid ${e.stroke || "currentColor"}`
                : undefined,
              borderRadius: `${e.radius}%`,
              opacity: e.opacity / 100,
            };
            const content =
              e.type === "image" ? (
                e.image ? (
                  <img
                    src={safeUrl(e.image, true)}
                    srcSet={studioImageSources(e.image)}
                    sizes="(max-width:650px) 90vw, 50vw"
                    alt={e.name}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    style={{
                      objectPosition: `${e.photoPosition.x}% ${e.photoPosition.y}%`,
                    }}
                  />
                ) : (
                  <span className="canvas-image-placeholder">
                    Your photograph
                  </span>
                )
              ) : e.type === "text" ? (
                <CanvasText
                  text={e.text}
                  inspect={Boolean(selected && !e.locked)}
                  onFit={(textHeight) => {
                    if (!board.current || !editing) return;
                    const mobile =
                      board.current.ownerDocument.defaultView!.innerWidth <=
                      650;
                    const frame = mobile ? e.mobile : e.frame;
                    const height = Math.min(
                      100,
                      ((textHeight + 8) / board.current.clientHeight) * 100,
                    );
                    editing.onGesture();
                    editing.onChange(e.id, {
                      [mobile ? "mobile" : "frame"]: constrainFrame({
                        ...frame,
                        height,
                      }),
                    });
                    editing.onGesture();
                  }}
                />
              ) : e.type === "button" ? (
                editing || !safeUrl(e.url) ? (
                  <span className="canvas-link">
                    {e.text} <span aria-hidden="true">↗</span>
                  </span>
                ) : (
                  <a
                    className="canvas-link"
                    href={safeUrl(e.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {e.text} <span aria-hidden="true">↗</span>
                  </a>
                )
              ) : null;
            return (
              <div
                key={e.id}
                className={`canvas-element element-${e.type} ${selected ? "element-selected" : ""} ${e.hideOnMobile ? "element-desktop-only" : ""} ${e.locked ? "element-locked" : ""}`}
                data-element-id={e.id}
                style={style}
                tabIndex={editing ? 0 : undefined}
                role={editing ? "group" : undefined}
                aria-label={
                  editing
                    ? `${e.name}, ${e.type} layer${e.locked ? ", locked" : ""}`
                    : undefined
                }
                onFocus={() => editing?.onSelect(e.id)}
                onPointerDown={(event) => start(event, e, "move")}
                onPointerMove={move}
                onPointerUp={finish}
                onPointerCancel={finish}
                onDoubleClick={() => {
                  if (
                    editing &&
                    !e.locked &&
                    (e.type === "text" || e.type === "button")
                  )
                    setTyping(e.id);
                }}
                onKeyDown={(event) => {
                  if (
                    !editing ||
                    e.locked ||
                    (event.target as HTMLElement).tagName === "TEXTAREA"
                  )
                    return;
                  if (
                    event.key === "Enter" &&
                    (e.type === "text" || e.type === "button")
                  ) {
                    event.preventDefault();
                    setTyping(e.id);
                  }
                  if (
                    ![
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(event.key)
                  )
                    return;
                  event.preventDefault();
                  const mobile =
                    event.currentTarget.ownerDocument.defaultView!.innerWidth <=
                    650;
                  const step = (event.shiftKey ? 10 : 1) / (mobile ? 4 : 10),
                    f = mobile ? e.mobile : e.frame;
                  editing.onChange(e.id, {
                    [mobile ? "mobile" : "frame"]: constrainFrame({
                      ...f,
                      x:
                        f.x +
                        (event.key === "ArrowLeft"
                          ? -step
                          : event.key === "ArrowRight"
                            ? step
                            : 0),
                      y:
                        f.y +
                        (event.key === "ArrowUp"
                          ? -step
                          : event.key === "ArrowDown"
                            ? step
                            : 0),
                    }),
                  });
                }}
              >
                <div className="canvas-element-content" style={bodyStyle}>
                  {typing === e.id && editing ? (
                    <textarea
                      autoFocus
                      aria-label={`Edit ${e.name} on canvas`}
                      value={e.text}
                      maxLength={2000}
                      onChange={(event) =>
                        editing.onChange(e.id, { text: event.target.value })
                      }
                      onBlur={() => {
                        setTyping(null);
                        editing.onGesture();
                      }}
                      onKeyDown={(event) => {
                        event.stopPropagation();
                        if (event.key === "Escape") setTyping(null);
                      }}
                    />
                  ) : (
                    content
                  )}
                </div>
                {selected && (
                  <>
                    <span className="canvas-element-label">
                      {e.locked && <LockKeyhole size={10} />}
                      {e.name}
                    </span>
                    {!e.locked && (
                      <>
                        <button
                          className="canvas-resize"
                          aria-label={`Resize ${e.name}`}
                          onPointerDown={(event) => start(event, e, "resize")}
                          onPointerMove={move}
                          onPointerUp={(event) => {
                            event.stopPropagation();
                            finish();
                          }}
                          onPointerCancel={finish}
                        />
                        <button
                          className="canvas-rotate"
                          aria-label={`Rotate ${e.name}`}
                          onPointerDown={(event) => start(event, e, "rotate")}
                          onPointerMove={move}
                          onPointerUp={(event) => {
                            event.stopPropagation();
                            finish();
                          }}
                          onPointerCancel={finish}
                        >
                          <RotateCw size={12} />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
        {editing && canvas.elements.length === 0 && (
          <div className="canvas-empty">
            <span>Make room for your imagination.</span>
            <small>Add text, a photograph, or a shape from Elements.</small>
          </div>
        )}
        {guides.x !== undefined && (
          <span
            className="canvas-guide guide-x"
            style={{ left: `${guides.x}%` }}
          />
        )}
        {guides.y !== undefined && (
          <span
            className="canvas-guide guide-y"
            style={{ top: `${guides.y}%` }}
          />
        )}
      </div>
    </section>
  );
}

function CanvasText({
  text,
  inspect,
  onFit,
}: {
  text: string;
  inspect: boolean;
  onFit: (height: number) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!inspect || !node?.parentElement) return;
    const container = node.parentElement;
    const check = () =>
      setOverflow(node.scrollHeight > container.clientHeight + 2);
    const observer = new ResizeObserver(check);
    observer.observe(node);
    observer.observe(container);
    check();
    return () => observer.disconnect();
  }, [inspect]);
  return (
    <>
      <span ref={ref} className="canvas-text">
        {text}
      </span>
      {inspect && overflow && (
        <button
          type="button"
          className="canvas-fit-text"
          title="Text extends beyond this box. Make it taller, shorten the text or reduce the font size."
          onClick={(event) => {
            event.stopPropagation();
            if (ref.current) onFit(ref.current.scrollHeight);
          }}
        >
          Fit text box
        </button>
      )}
    </>
  );
}
