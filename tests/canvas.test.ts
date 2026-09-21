import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizeDesign,
  newSection,
  customFontHref,
} from "../src/lib/studio/design.ts";
import {
  createCanvas,
  duplicateElement,
  emptyCanvas,
  moveElement,
  newElement,
  normalizeCanvas,
  stackMobile,
} from "../src/lib/studio/canvas.ts";

test("untrusted canvas JSON cannot inject styles, links or unbounded geometry", () => {
  const canvas = normalizeCanvas({
    height: Infinity,
    mobileHeight: 999999,
    background: "url(https://bad.test)",
    image: "javascript:alert(1)",
    elements: [
      {
        ...newElement("text"),
        font: "evil-font",
        color: "red;display:none",
        url: "javascript:alert(1)",
        fontSize: -100,
        rotation: 999,
        frame: { x: 99, y: -50, width: 30, height: 20 },
        mobile: { width: NaN },
        text: "x".repeat(3000),
      },
      { type: "iframe" },
    ],
  });
  assert.equal(canvas.elements.length, 1);
  assert.equal(canvas.height, 700);
  assert.equal(canvas.mobileHeight, 2400);
  assert.equal(canvas.background, "");
  assert.equal(canvas.image, "");
  const e = canvas.elements[0];
  assert.equal(e.font, "heading");
  assert.equal(e.color, "");
  assert.equal(e.url, "");
  assert.equal(e.fontSize, 12);
  assert.equal(e.text.length, 2000);
  assert.deepEqual(e.frame, { x: 70, y: 0, width: 30, height: 20 });
  assert.ok(Object.values(e.mobile).every(Number.isFinite));
});

test("multiple custom sections survive storage while RSVP remains unique", () => {
  const sections = Array.from({ length: 10 }, (_, i) => ({
    ...newSection("canvas", i === 2 ? "same-1" : "same"),
    canvas: createCanvas("note", "/assets/photo.webp"),
  }));
  const design = normalizeDesign({
    version: 1,
    sections: [
      newSection("hero"),
      ...sections,
      newSection("rsvp"),
      newSection("rsvp", "again"),
    ],
  })!;
  assert.equal(design.sections.filter((s) => s.type === "canvas").length, 8);
  assert.equal(design.sections.filter((s) => s.type === "rsvp").length, 1);
  assert.equal(
    new Set(design.sections.map((s) => s.id)).size,
    design.sections.length,
  );
  assert.equal(
    design.sections[1].canvas!.elements[1].image,
    "/assets/photo.webp",
  );
  assert.deepEqual(normalizeDesign(JSON.parse(JSON.stringify(design))), design);
});

test("canvas identifiers stay unique even when an input anticipates generated IDs", () => {
  const elements = ["a", "a-2", "a", "a"].map((id) => newElement("text", id));
  const normalized = normalizeCanvas({ elements });
  assert.equal(
    new Set(normalized.elements.map((e) => e.id)).size,
    elements.length,
  );
  assert.equal(
    normalizeCanvas({ elements: Array(100).fill(newElement("text")) }).elements
      .length,
    24,
  );
});

test("dragging snaps to edges or centers and stays inside the canvas", () => {
  const frame = { x: 10, y: 10, width: 20, height: 20 };
  assert.equal(moveElement(frame, 29.6, 0, []).frame.x, 40);
  assert.equal(moveElement(frame, 29.6, 0, [], false).frame.x, 39.6);
  const target = { x: 75, y: 30, width: 15, height: 20 };
  assert.equal(moveElement(frame, 44.5, 0, [target]).frame.x, 55);
  assert.deepEqual(moveElement(frame, 999, -999, []).frame, {
    x: 80,
    y: 0,
    width: 20,
    height: 20,
  });
});

test("duplication preserves styling and both layouts without mutating the source", () => {
  const source = {
    ...newElement("image", "one"),
    locked: true,
    rotation: -12,
    mobile: { x: 50, y: 65, width: 45, height: 30 },
  };
  const before = structuredClone(source);
  const copy = duplicateElement(source, "two");
  assert.equal(copy.id, "two");
  assert.equal(copy.locked, false);
  assert.equal(copy.rotation, -12);
  assert.equal(copy.mobile.x, 53);
  assert.deepEqual(source, before);
});

test("phone auto-arrangement preserves desktop and refuses unsafe overflow or locked content", () => {
  const canvas = createCanvas("note", "/assets/photo.webp");
  const before = structuredClone(canvas);
  const arranged = stackMobile(canvas)!;
  assert.ok(arranged);
  assert.deepEqual(
    arranged.elements.map((e) => e.frame),
    before.elements.map((e) => e.frame),
  );
  assert.deepEqual(
    arranged.elements.map((e) => e.rotation),
    before.elements.map((e) => e.rotation),
  );
  const content = arranged.elements.filter((e) => e.type !== "shape");
  for (let i = 1; i < content.length; i++)
    assert.ok(
      content[i].mobile.y >=
        content[i - 1].mobile.y + content[i - 1].mobile.height,
    );
  const long = {
    ...emptyCanvas(),
    elements: [{ ...newElement("text"), text: "Many lines\n".repeat(100) }],
  };
  assert.equal(stackMobile(long), null);
  assert.equal(
    stackMobile({
      ...emptyCanvas(),
      elements: [{ ...newElement("image"), locked: true }],
    }),
    null,
  );
  assert.deepEqual(canvas, before);
});

test("all presets round-trip with safe responsive geometry", () => {
  for (const preset of ["blank", "note", "collage", "poster"] as const) {
    const canvas = createCanvas(preset, "https://example.com/photo.webp");
    assert.deepEqual(normalizeCanvas(canvas), canvas);
    for (const e of canvas.elements)
      for (const f of [e.frame, e.mobile]) {
        assert.ok(
          f.x >= 0 && f.y >= 0 && f.x + f.width <= 100 && f.y + f.height <= 100,
        );
      }
  }
});

test("section layout remains optional and canvas fonts are loaded on demand", () => {
  const hero = newSection("hero");
  const canvas = createCanvas("poster");
  const design = normalizeDesign({
    version: 1,
    sections: [
      hero,
      { ...newSection("canvas"), canvas },
      {
        ...newSection("story"),
        layout: { alignment: "center", width: "wide", visibility: "mobile" },
      },
    ],
  })!;
  assert.equal(design.sections[0].layout, undefined);
  assert.equal(design.sections[2].layout!.photoPosition, undefined);
  assert.equal(design.sections[2].layout!.visibility, "mobile");
  assert.match(customFontHref(design)!, /Manrope/);
});
