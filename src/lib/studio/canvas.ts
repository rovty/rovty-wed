import { clamp, isHexColor, object, safeUrl, str } from "./validation.ts";

export type CanvasFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type CanvasElement = {
  id: string;
  name: string;
  type: "text" | "image" | "shape" | "button";
  text: string;
  image: string;
  url: string;
  frame: CanvasFrame;
  mobile: CanvasFrame;
  font: string;
  fontSize: number;
  mobileFontSize: number;
  weight: number;
  italic: boolean;
  align: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
  color: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  hideOnMobile: boolean;
  photoPosition: { x: number; y: number };
};
export type CanvasDesign = {
  height: number;
  mobileHeight: number;
  background: string;
  image: string;
  overlay: number;
  elements: CanvasElement[];
};
export const MAX_ELEMENTS = 24;
export const CANVAS_FONTS = [
  "heading",
  "body",
  "accent",
  "instrument",
  "cormorant",
  "playfair",
  "manrope",
  "inter",
  "jost",
];
export const emptyCanvas = (): CanvasDesign => ({
  height: 700,
  mobileHeight: 680,
  background: "",
  image: "",
  overlay: 0,
  elements: [],
});
export function constrainFrame(frame: Partial<CanvasFrame>): CanvasFrame {
  const width = clamp(frame.width, 40, 4, 100),
    height = clamp(frame.height, 20, 3, 100);
  return {
    x: clamp(frame.x, 10, 0, 100 - width),
    y: clamp(frame.y, 10, 0, 100 - height),
    width,
    height,
  };
}
export function newElement(
  type: CanvasElement["type"],
  id: string = crypto.randomUUID(),
): CanvasElement {
  return {
    id,
    type,
    name:
      type === "text"
        ? "Your words"
        : type === "image"
          ? "Photograph"
          : type === "button"
            ? "Link button"
            : "Shape",
    text:
      type === "text"
        ? "A little more us."
        : type === "button"
          ? "Discover more"
          : "",
    image: "",
    url: "",
    frame: {
      x: 10,
      y: 15,
      width: type === "text" ? 65 : 35,
      height: type === "image" ? 65 : 25,
    },
    mobile: { x: 8, y: 15, width: 84, height: type === "image" ? 50 : 25 },
    font: "heading",
    fontSize: type === "button" ? 18 : 64,
    mobileFontSize: type === "button" ? 16 : 38,
    weight: 400,
    italic: false,
    align: "left",
    lineHeight: 1.15,
    letterSpacing: 0,
    color: "",
    fill: type === "shape" ? "#d5d8c8" : "",
    stroke: "",
    strokeWidth: 0,
    radius: 0,
    rotation: 0,
    opacity: 100,
    locked: false,
    hidden: false,
    hideOnMobile: false,
    photoPosition: { x: 50, y: 50 },
  };
}
export function normalizeCanvas(value: unknown): CanvasDesign {
  const v = object(value),
    ids = new Set<string>();
  const color = (v: unknown) => (isHexColor(v) ? v : "");
  return {
    height: clamp(v.height, 700, 240, 1600),
    mobileHeight: clamp(v.mobileHeight, 680, 240, 2400),
    background: color(v.background),
    image: safeUrl(v.image, true),
    overlay: clamp(v.overlay, 0, 0, 90),
    elements: (Array.isArray(v.elements) ? v.elements : [])
      .slice(0, MAX_ELEMENTS)
      .flatMap((raw, index) => {
        const e = object(raw);
        if (!["text", "image", "shape", "button"].includes(String(e.type)))
          return [];
        let id = str(e.id, 80) || `element-${index}`;
        while (ids.has(id)) id = `${id}-${index}`;
        ids.add(id);
        return [
          {
            id,
            type: e.type as CanvasElement["type"],
            name: str(e.name, 80) || String(e.type),
            text: str(e.text, 2000),
            image: safeUrl(e.image, true),
            url: safeUrl(e.url),
            frame: constrainFrame(object(e.frame)),
            mobile: constrainFrame(object(e.mobile)),
            font: CANVAS_FONTS.includes(String(e.font))
              ? String(e.font)
              : "heading",
            fontSize: clamp(e.fontSize, 64, 12, 180),
            mobileFontSize: clamp(e.mobileFontSize, 38, 12, 100),
            weight: clamp(e.weight, 400, 400, 600),
            italic: e.italic === true,
            align:
              e.align === "center" || e.align === "right" ? e.align : "left",
            lineHeight: clamp(e.lineHeight, 1.15, 0.9, 2),
            letterSpacing: clamp(e.letterSpacing, 0, -3, 12),
            color: color(e.color),
            fill: color(e.fill),
            stroke: color(e.stroke),
            strokeWidth: clamp(e.strokeWidth, 0, 0, 12),
            radius: clamp(e.radius, 0, 0, 50),
            rotation: clamp(e.rotation, 0, -180, 180),
            opacity: clamp(e.opacity, 100, 5, 100),
            locked: e.locked === true,
            hidden: e.hidden === true,
            hideOnMobile: e.hideOnMobile === true,
            photoPosition: {
              x: clamp(object(e.photoPosition).x, 50, 0, 100),
              y: clamp(object(e.photoPosition).y, 50, 0, 100),
            },
          },
        ];
      }),
  };
}

/** Percent-based frames use the actual board viewport, including inside scaled previews. */
export function moveElement(
  frame: CanvasFrame,
  dx: number,
  dy: number,
  others: CanvasFrame[],
  snap = true,
) {
  let { x, y } = constrainFrame({ ...frame, x: frame.x + dx, y: frame.y + dy });
  const guides: { x?: number; y?: number } = {};
  if (snap) {
    for (const axis of ["x", "y"] as const) {
      const size = axis === "x" ? "width" : "height";
      const anchors = [
        0,
        50,
        100,
        ...others.flatMap((f) => [
          f[axis],
          f[axis] + f[size] / 2,
          f[axis] + f[size],
        ]),
      ];
      const position = axis === "x" ? x : y;
      let distance = 0.8,
        best = position;
      for (const target of anchors)
        for (const offset of [0, frame[size] / 2, frame[size]]) {
          const delta = target - position - offset;
          if (Math.abs(delta) < distance) {
            distance = Math.abs(delta);
            best = position + delta;
            guides[axis] = target;
          }
        }
      if (axis === "x") x = best;
      else y = best;
    }
  }
  return { frame: constrainFrame({ ...frame, x, y }), guides };
}
export function duplicateElement(
  element: CanvasElement,
  id: string = crypto.randomUUID(),
): CanvasElement {
  return {
    ...element,
    id,
    name: `${element.name} copy`.slice(0, 80),
    locked: false,
    frame: constrainFrame({
      ...element.frame,
      x: element.frame.x + 3,
      y: element.frame.y + 3,
    }),
    mobile: constrainFrame({
      ...element.mobile,
      x: element.mobile.x + 3,
      y: element.mobile.y + 3,
    }),
  };
}
/** A one-click mobile starting point; desktop geometry stays intact. */
export function stackMobile(canvas: CanvasDesign): CanvasDesign | null {
  let cursor = 36;
  const boxes = new Map<string, { top: number; height: number }>();
  for (const e of canvas.elements) {
    if (e.hidden || e.hideOnMobile || e.type === "shape") continue;
    if (e.locked) return null;
    const lines = e.text
      .split("\n")
      .reduce(
        (total, line) =>
          total +
          Math.max(
            1,
            Math.ceil(line.length / (320 / (e.mobileFontSize * 0.55))),
          ),
        0,
      );
    const height =
      e.type === "image"
        ? 320
        : e.type === "button"
          ? Math.max(54, lines * e.mobileFontSize * e.lineHeight + 20)
          : Math.max(80, lines * e.mobileFontSize * e.lineHeight + 12);
    const radians = (e.rotation * Math.PI) / 180;
    const extra = Math.max(
      0,
      (height * Math.abs(Math.cos(radians)) +
        336 * Math.abs(Math.sin(radians)) -
        height) /
        2,
    );
    boxes.set(e.id, { top: cursor + extra, height });
    cursor += height + extra * 2 + 28;
  }
  // Refuse an arrangement that would silently overlap or shrink readable text.
  if (cursor + 12 > 2400) return null;
  const height = Math.max(360, cursor + 12);
  return {
    ...canvas,
    mobileHeight: height,
    elements: canvas.elements.map((e) => {
      const b = boxes.get(e.id);
      return b
        ? {
            ...e,
            mobile: constrainFrame({
              x: 8,
              y: (b.top / height) * 100,
              width: 84,
              height: (b.height / height) * 100,
            }),
          }
        : e;
    }),
  };
}

export type CanvasPreset = "blank" | "note" | "collage" | "poster";
export const CANVAS_PRESETS: {
  id: CanvasPreset;
  name: string;
  description: string;
}[] = [
  {
    id: "blank",
    name: "Blank canvas",
    description: "Your idea, from the very beginning",
  },
  {
    id: "note",
    name: "A love note",
    description: "Thoughtful words and a beautiful photograph",
  },
  {
    id: "collage",
    name: "Memory board",
    description: "Layered photographs with handwritten details",
  },
  {
    id: "poster",
    name: "The after party",
    description: "Big type for a little extra celebration",
  },
];
export function createCanvas(preset: CanvasPreset, photo = ""): CanvasDesign {
  const canvas = emptyCanvas();
  if (preset === "blank") return canvas;
  const make = (
    type: CanvasElement["type"],
    patch: Partial<CanvasElement>,
  ) => ({ ...newElement(type), ...patch });
  if (preset === "note")
    return {
      ...canvas,
      elements: [
        make("shape", {
          name: "Sage backdrop",
          frame: { x: 4, y: 8, width: 42, height: 80 },
          mobile: { x: 5, y: 4, width: 86, height: 46 },
          fill: "#dee2d6",
          locked: true,
        }),
        make("image", {
          image: photo,
          frame: { x: 8, y: 12, width: 38, height: 76 },
          mobile: { x: 10, y: 7, width: 80, height: 42 },
          rotation: -3,
        }),
        make("text", {
          name: "Our note",
          text: "Of all the days,\nthis one is ours.",
          frame: { x: 54, y: 25, width: 40, height: 36 },
          mobile: { x: 8, y: 55, width: 84, height: 25 },
          fontSize: 68,
          mobileFontSize: 36,
          italic: true,
        }),
        make("text", {
          name: "Little details",
          text: "A celebration of the life we are building together.",
          font: "body",
          fontSize: 18,
          mobileFontSize: 16,
          frame: { x: 54, y: 65, width: 35, height: 18 },
          mobile: { x: 8, y: 82, width: 84, height: 14 },
        }),
      ],
    };
  if (preset === "collage")
    return {
      ...canvas,
      background: "#f0e9df",
      elements: [
        make("image", {
          image: photo,
          frame: { x: 7, y: 10, width: 40, height: 67 },
          mobile: { x: 6, y: 6, width: 59, height: 48 },
          rotation: -5,
          stroke: "#ffffff",
          strokeWidth: 10,
        }),
        make("image", {
          image: photo,
          frame: { x: 49, y: 22, width: 42, height: 68 },
          mobile: { x: 38, y: 37, width: 55, height: 47 },
          rotation: 6,
          stroke: "#ffffff",
          strokeWidth: 10,
          photoPosition: { x: 65, y: 35 },
        }),
        make("text", {
          name: "Handwritten caption",
          text: "our kind of forever",
          font: "accent",
          fontSize: 72,
          mobileFontSize: 38,
          color: "#70452f",
          frame: { x: 9, y: 76, width: 64, height: 20 },
          mobile: { x: 8, y: 83, width: 84, height: 14 },
          rotation: -4,
        }),
      ],
    };
  return {
    ...canvas,
    background: "#262b26",
    elements: [
      make("shape", {
        name: "The spotlight",
        fill: "#bfc6a5",
        radius: 50,
        frame: { x: 68, y: 12, width: 24, height: 34 },
        mobile: { x: 67, y: 7, width: 26, height: 17 },
        locked: true,
      }),
      make("text", {
        name: "The invitation",
        text: "LET’S\nDANCE.",
        font: "manrope",
        color: "#f5f3e9",
        weight: 600,
        fontSize: 128,
        mobileFontSize: 70,
        frame: { x: 8, y: 16, width: 84, height: 53 },
        mobile: { x: 8, y: 21, width: 84, height: 38 },
      }),
      make("text", {
        name: "Party details",
        text: "One more song. One more memory.\nJoin us after the celebration.",
        font: "body",
        color: "#f5f3e9",
        fontSize: 22,
        mobileFontSize: 18,
        frame: { x: 9, y: 76, width: 75, height: 18 },
        mobile: { x: 8, y: 68, width: 84, height: 23 },
      }),
    ],
  };
}
