import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Layers,
  Link2,
  LockKeyhole,
  Plus,
  Square,
  Trash2,
  Type,
  UnlockKeyhole,
} from "lucide-react";
import {
  CANVAS_FONTS,
  MAX_ELEMENTS,
  constrainFrame,
  newElement,
  stackMobile,
  type CanvasDesign,
  type CanvasElement,
} from "@/lib/studio/canvas";
import { FONT_CHOICES } from "@/lib/studio/design";
import { Field, HexInput } from "./EditorFields";
import type { UploadControl } from "./SectionFields";
import { useState } from "react";
import { safeUrl } from "@/lib/studio/validation";

export function CanvasPanel({
  canvas,
  selected,
  mobile,
  onChange,
  onSelect,
  onElement,
  onDuplicate,
  onRemove,
  uploadControl,
}: {
  canvas: CanvasDesign;
  selected: string | null;
  mobile: boolean;
  onChange: (patch: Partial<CanvasDesign>, discrete?: boolean) => void;
  onSelect: (id: string | null) => void;
  onElement: (
    id: string,
    patch: Partial<CanvasElement>,
    discrete?: boolean,
  ) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  uploadControl: UploadControl;
}) {
  const [arrangeNotice, setArrangeNotice] = useState("");
  const element = canvas.elements.find((e) => e.id === selected);
  const change = (patch: Partial<CanvasElement>, discrete = false) => {
    if (element) onElement(element.id, patch, discrete);
  };
  const frame = element ? (mobile ? element.mobile : element.frame) : null;
  const geometry = (patch: Partial<NonNullable<typeof frame>>) => {
    if (frame)
      change({
        [mobile ? "mobile" : "frame"]: constrainFrame({ ...frame, ...patch }),
      });
  };
  const add = (type: CanvasElement["type"]) => {
    const e = newElement(type),
      n = canvas.elements.length;
    e.frame = constrainFrame({
      ...e.frame,
      x: e.frame.x + (n % 4) * 3,
      y: e.frame.y + (n % 4) * 5,
    });
    e.mobile = constrainFrame({ ...e.mobile, y: e.mobile.y + (n % 4) * 6 });
    onChange({ elements: [...canvas.elements, e] }, true);
    onSelect(e.id);
  };
  const color = (key: "color" | "fill" | "stroke", label: string) =>
    element && (
      <div className="canvas-color-control">
        <span>{label}</span>
        <input
          type="color"
          aria-label={label}
          value={element[key] || "#363c30"}
          onChange={(e) => change({ [key]: e.target.value })}
        />
        <HexInput
          label={`${label} HEX`}
          value={element[key] || ""}
          onChange={(value) => change({ [key]: value })}
        />
        {element[key] && (
          <button
            className="studio-text-button"
            aria-label={`Reset ${label.toLowerCase()}`}
            onClick={() => change({ [key]: "" }, true)}
          >
            Reset
          </button>
        )}
      </div>
    );
  return (
    <div className="canvas-inspector">
      <div className="canvas-add-elements" aria-label="Add design elements">
        {(
          [
            { type: "text", name: "Text", icon: Type },
            { type: "image", name: "Photo", icon: ImagePlus },
            { type: "shape", name: "Shape", icon: Square },
            { type: "button", name: "Button", icon: Link2 },
          ] as const
        ).map((item) => (
          <button
            key={item.type}
            disabled={canvas.elements.length >= MAX_ELEMENTS}
            onClick={() => add(item.type)}
            aria-label={`Add ${item.name.toLowerCase()} element`}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
            <Plus size={10} />
          </button>
        ))}
      </div>
      <div className="canvas-layout-mode">
        <span className="canvas-mode-dot" />
        {mobile ? "Editing the phone layout" : "Editing the desktop layout"}
        <small>Position, size and text size are independent.</small>
      </div>
      {element && frame ? (
        <>
          <div className="canvas-selection-heading">
            <button
              className="studio-text-button"
              onClick={() => onSelect(null)}
            >
              <Layers size={13} /> All layers
            </button>
            <div>
              <button
                className="studio-icon-button"
                aria-label="Duplicate element"
                disabled={canvas.elements.length >= MAX_ELEMENTS}
                onClick={onDuplicate}
              >
                <Copy size={15} />
              </button>
              <button
                className="studio-icon-button"
                aria-label={element.locked ? "Unlock element" : "Lock element"}
                onClick={() => change({ locked: !element.locked }, true)}
              >
                {element.locked ? (
                  <LockKeyhole size={15} />
                ) : (
                  <UnlockKeyhole size={15} />
                )}
              </button>
              <button
                className="studio-icon-button"
                aria-label="Remove element"
                disabled={element.locked}
                onClick={onRemove}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          {element.locked && (
            <p className="editor-help">
              This layer is locked. Unlock it to make changes.
            </p>
          )}
          <fieldset className="canvas-properties" disabled={element.locked}>
            <Field label="Layer name">
              <input
                value={element.name}
                maxLength={80}
                onChange={(e) => change({ name: e.target.value })}
              />
            </Field>
            {(element.type === "text" || element.type === "button") && (
              <>
                <Field
                  label={
                    element.type === "button" ? "Button label" : "Element text"
                  }
                >
                  <textarea
                    rows={3}
                    value={element.text}
                    maxLength={2000}
                    onChange={(e) => change({ text: e.target.value })}
                  />
                </Field>
                <p className="editor-help">
                  You can also double-click the words on your canvas.
                </p>
                <Field label="Element font">
                  <select
                    value={element.font}
                    onChange={(e) => change({ font: e.target.value }, true)}
                  >
                    {CANVAS_FONTS.map((id) => (
                      <option key={id} value={id}>
                        {id === "heading"
                          ? "Your heading font"
                          : id === "body"
                            ? "Your body font"
                            : id === "accent"
                              ? "Your accent font"
                              : FONT_CHOICES.find((f) => f.id === id)?.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="canvas-field-pair">
                  <NumberField
                    label={mobile ? "Phone text size" : "Desktop text size"}
                    value={mobile ? element.mobileFontSize : element.fontSize}
                    min={12}
                    max={mobile ? 100 : 180}
                    onChange={(value) =>
                      change({
                        [mobile ? "mobileFontSize" : "fontSize"]: value,
                      })
                    }
                  />
                  <Field label="Text weight">
                    <select
                      value={element.weight}
                      onChange={(e) =>
                        change({ weight: Number(e.target.value) }, true)
                      }
                    >
                      <option value={400}>Regular</option>
                      <option value={500}>Medium</option>
                      <option value={600}>Semibold</option>
                    </select>
                  </Field>
                </div>
                <div
                  className="canvas-text-options"
                  aria-label="Text alignment"
                >
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      aria-label={`Align text ${align}`}
                      aria-pressed={element.align === align}
                      onClick={() => change({ align }, true)}
                    >
                      {align}
                    </button>
                  ))}
                  <button
                    aria-label="Italic text"
                    aria-pressed={element.italic}
                    onClick={() => change({ italic: !element.italic }, true)}
                  >
                    <i>Italic</i>
                  </button>
                </div>
                {color("color", "Text color")}
              </>
            )}
            {element.type === "button" && (
              <Field label="Button destination">
                <input
                  type="url"
                  placeholder="https://…"
                  value={element.url}
                  onChange={(e) => change({ url: e.target.value })}
                />
                {element.url && !safeUrl(element.url) && (
                  <small>Use a complete https://, mailto: or tel: link.</small>
                )}
              </Field>
            )}
            {element.type === "image" && (
              <>
                {element.image && (
                  <img
                    className="canvas-inspector-photo"
                    src={element.image}
                    alt="Selected photograph"
                  />
                )}
                {uploadControl(
                  element.image
                    ? "Replace element photo"
                    : "Upload element photo",
                  (image) => onElement(element.id, { image }, true),
                )}
                <p className="editor-help">
                  Layer name is also the photo description for guests using a
                  screen reader.
                </p>
                <Field label="Image position horizontally">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={element.photoPosition.x}
                    onChange={(e) =>
                      change({
                        photoPosition: {
                          ...element.photoPosition,
                          x: +e.target.value,
                        },
                      })
                    }
                  />
                </Field>
                <Field label="Image position vertically">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={element.photoPosition.y}
                    onChange={(e) =>
                      change({
                        photoPosition: {
                          ...element.photoPosition,
                          y: +e.target.value,
                        },
                      })
                    }
                  />
                </Field>
              </>
            )}
            {(element.type === "shape" || element.type === "button") &&
              color("fill", "Fill color")}
            <details className="editor-details" open={element.type === "shape"}>
              <summary>Position & size</summary>
              <div className="canvas-field-pair">
                <NumberField
                  label="Horizontal position (%)"
                  value={frame.x}
                  max={100}
                  onChange={(x) => geometry({ x })}
                />
                <NumberField
                  label="Vertical position (%)"
                  value={frame.y}
                  max={100}
                  onChange={(y) => geometry({ y })}
                />
              </div>
              <div className="canvas-field-pair">
                <NumberField
                  label="Element width (%)"
                  value={frame.width}
                  min={4}
                  max={100}
                  onChange={(width) => geometry({ width })}
                />
                <NumberField
                  label="Element height (%)"
                  value={frame.height}
                  min={3}
                  max={100}
                  onChange={(height) => geometry({ height })}
                />
              </div>
              <div className="canvas-align-buttons">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() =>
                      geometry({
                        x:
                          align === "left"
                            ? 0
                            : align === "center"
                              ? (100 - frame.width) / 2
                              : 100 - frame.width,
                      })
                    }
                    aria-label={`Align element ${align}`}
                  >
                    {align}
                  </button>
                ))}
              </div>
              <NumberField
                label="Rotation (degrees)"
                value={element.rotation}
                min={-180}
                max={180}
                onChange={(rotation) => change({ rotation })}
              />
              <p className="editor-help">
                Drag a layer to move it. Use its corner to resize or the round
                handle to rotate. Arrow keys make small adjustments.
              </p>
            </details>
            <details className="editor-details">
              <summary>Appearance & visibility</summary>
              {element.type !== "shape" &&
                element.type !== "button" &&
                color("fill", "Fill color")}
              {color("stroke", "Border color")}
              <div className="canvas-field-pair">
                <NumberField
                  label="Border width"
                  value={element.strokeWidth}
                  max={12}
                  onChange={(strokeWidth) => change({ strokeWidth })}
                />
                <NumberField
                  label="Corner roundness (%)"
                  value={element.radius}
                  max={50}
                  onChange={(radius) => change({ radius })}
                />
              </div>
              <Field label="Opacity">
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={element.opacity}
                  onChange={(e) => change({ opacity: +e.target.value })}
                />
              </Field>
              {(element.type === "text" || element.type === "button") && (
                <div className="canvas-field-pair">
                  <NumberField
                    label="Line height"
                    value={element.lineHeight}
                    min={0.9}
                    max={2}
                    step={0.05}
                    onChange={(lineHeight) => change({ lineHeight })}
                  />
                  <NumberField
                    label="Letter spacing"
                    value={element.letterSpacing}
                    min={-3}
                    max={12}
                    step={0.2}
                    onChange={(letterSpacing) => change({ letterSpacing })}
                  />
                </div>
              )}
              <label className="canvas-check">
                <input
                  type="checkbox"
                  checked={element.hideOnMobile}
                  onChange={(e) =>
                    change({ hideOnMobile: e.target.checked }, true)
                  }
                />{" "}
                Hide this layer on phones
              </label>
            </details>
          </fieldset>
        </>
      ) : (
        <>
          <div className="canvas-layers-heading">
            <span>Layers</span>
            <small>
              {canvas.elements.length} / {MAX_ELEMENTS}
            </small>
          </div>
          <div className="canvas-layer-list">
            {[...canvas.elements].reverse().map((e) => {
              const index = canvas.elements.indexOf(e);
              return (
                <div className="canvas-layer-row" key={e.id}>
                  <button
                    className="canvas-layer-name"
                    aria-label={`Select layer ${e.name}`}
                    onClick={() => onSelect(e.id)}
                  >
                    {e.type === "image" ? (
                      <ImagePlus size={14} />
                    ) : e.type === "shape" ? (
                      <Square size={14} />
                    ) : (
                      <Type size={14} />
                    )}
                    <span>{e.name}</span>
                  </button>
                  <button
                    aria-label={`Move ${e.name} forward`}
                    disabled={index === canvas.elements.length - 1 || e.locked}
                    onClick={() => {
                      const list = [...canvas.elements];
                      [list[index], list[index + 1]] = [
                        list[index + 1],
                        list[index],
                      ];
                      onChange({ elements: list }, true);
                    }}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    aria-label={`Move ${e.name} backward`}
                    disabled={index === 0 || e.locked}
                    onClick={() => {
                      const list = [...canvas.elements];
                      [list[index], list[index - 1]] = [
                        list[index - 1],
                        list[index],
                      ];
                      onChange({ elements: list }, true);
                    }}
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    aria-label={`${e.hidden ? "Show" : "Hide"} layer ${e.name}`}
                    onClick={() => onElement(e.id, { hidden: !e.hidden }, true)}
                  >
                    {e.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    aria-label={`${e.locked ? "Unlock" : "Lock"} layer ${e.name}`}
                    onClick={() => onElement(e.id, { locked: !e.locked }, true)}
                  >
                    {e.locked ? (
                      <LockKeyhole size={13} />
                    ) : (
                      <UnlockKeyhole size={13} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          {!canvas.elements.length && (
            <p className="editor-help">
              Add your first element above. Everything can be moved and styled
              to make it yours.
            </p>
          )}
          <details className="editor-details" open>
            <summary>Canvas settings</summary>
            <NumberField
              label={mobile ? "Phone canvas height" : "Desktop canvas height"}
              value={mobile ? canvas.mobileHeight : canvas.height}
              min={240}
              max={mobile ? 2400 : 1600}
              step={20}
              onChange={(height) =>
                onChange({ [mobile ? "mobileHeight" : "height"]: height })
              }
            />
            <Field label="Canvas background">
              <input
                type="color"
                value={canvas.background || "#f8f7f2"}
                onChange={(e) => onChange({ background: e.target.value })}
              />
            </Field>
            {canvas.background && (
              <button
                className="studio-text-button"
                onClick={() => onChange({ background: "" }, true)}
              >
                Use your template color
              </button>
            )}
            {uploadControl("Choose canvas background photo", (image) =>
              onChange({ image }, true),
            )}
            {canvas.image && (
              <>
                <Field label="Background dimming">
                  <input
                    type="range"
                    min={0}
                    max={90}
                    value={canvas.overlay}
                    onChange={(e) => onChange({ overlay: +e.target.value })}
                  />
                </Field>
                <button
                  className="studio-text-button"
                  onClick={() => onChange({ image: "" }, true)}
                >
                  Remove background photo
                </button>
              </>
            )}
            {mobile && (
              <button
                className="studio-button"
                onClick={() => {
                  const arranged = stackMobile(canvas);
                  if (arranged) {
                    onChange(arranged, true);
                    setArrangeNotice(
                      "Phone layout arranged. Your desktop layout is unchanged.",
                    );
                  } else
                    setArrangeNotice(
                      canvas.elements.some(
                        (e) =>
                          e.locked &&
                          !e.hidden &&
                          !e.hideOnMobile &&
                          e.type !== "shape",
                      )
                        ? "Unlock your text and photo layers before arranging them."
                        : "These layers need more room. Move some to another canvas or shorten the text, then try again.",
                    );
                }}
              >
                Arrange layers for a phone
              </button>
            )}
            {mobile && arrangeNotice && (
              <p className="editor-help" role="status">
                {arrangeNotice}
              </p>
            )}
            <p className="editor-help">
              A phone has its own composition. Switch preview sizes to move and
              resize layers for each screen.
            </p>
          </details>
        </>
      )}
    </div>
  );
}
function NumberField({
  label,
  value,
  min = 0,
  max,
  step = 0.5,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Math.round(value * 100) / 100}
        onChange={(e) => {
          if (e.target.value !== "" && Number.isFinite(e.target.valueAsNumber))
            onChange(Math.max(min, Math.min(max, e.target.valueAsNumber)));
        }}
      />
    </Field>
  );
}
