import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizeDesign,
  newSection,
  safeUrl,
} from "../src/lib/studio/design.ts";

test("legacy and future design records fall back safely", () => {
  assert.equal(normalizeDesign(null), null);
  assert.equal(normalizeDesign({ version: 2, sections: [] }), null);
  assert.equal(normalizeDesign({ version: 1, sections: "invalid" }), null);
});
test("stored styles cannot inject CSS or active links", () => {
  const design = normalizeDesign({
    version: 1,
    colors: {
      primary: "red; background:url(https://example.com)",
      accent: "#aabbcc",
    },
    typography: { heading: "evil-font", scale: 999, weight: NaN },
    photoPosition: { x: -20, y: 400 },
    sections: [
      {
        ...newSection("story"),
        image: "javascript:alert(1)",
        link: "data:text/html,test",
        background: "url(https://example.com)",
      },
    ],
  })!;
  assert.deepEqual(design.colors, { accent: "#aabbcc" });
  assert.equal(design.typography.heading, "");
  assert.equal(design.typography.scale, 1.3);
  assert.equal(design.typography.weight, 400);
  assert.deepEqual(design.photoPosition, { x: 0, y: 100 });
  assert.equal(design.sections[0].image, "");
  assert.equal(design.sections[0].link, "");
  assert.equal(design.sections[0].background, "");
});
test("visibility, section order and custom content survive normalization", () => {
  const sections = [
    {
      ...newSection("gallery"),
      enabled: false,
      title: "Our moments",
      items: [
        {
          id: "x",
          title: "Us",
          text: "A memory",
          image: "https://example.com/photo.webp",
          url: "",
          time: "",
        },
      ],
    },
    { ...newSection("story"), body: "Our own words" },
  ];
  const design = normalizeDesign({ version: 1, sections })!;
  assert.deepEqual(
    design.sections.map((s) => s.type),
    ["gallery", "story"],
  );
  assert.equal(design.sections[0].enabled, false);
  assert.equal(design.sections[0].items[0].text, "A memory");
  assert.equal(design.sections[1].body, "Our own words");
});
test("duplicate interactive sections and unknown section types are removed", () => {
  const design = normalizeDesign({
    version: 1,
    sections: [
      newSection("rsvp"),
      newSection("rsvp", "again"),
      { type: "script" },
      newSection("seating"),
    ],
  })!;
  assert.deepEqual(
    design.sections.map((s) => s.type),
    ["rsvp", "seating"],
  );
});
test("links allow supported schemes and local media only in media contexts", () => {
  assert.equal(safeUrl("https://example.com"), "https://example.com");
  assert.equal(
    safeUrl("mailto:couple@example.com"),
    "mailto:couple@example.com",
  );
  assert.equal(safeUrl("/assets/photo.webp", true), "/assets/photo.webp");
  assert.equal(safeUrl("//external.example/picture", true), "");
  assert.equal(safeUrl("blob:local", true), "blob:local");
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("/admin"), "");
});
