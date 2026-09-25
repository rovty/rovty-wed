import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  WEDDING_THEMES,
  LEGACY_TEMPLATE_IDS,
  baseTemplate,
} from "../src/lib/wedding-themes.ts";

test("the 21-theme collection leads with Rose and Lotus without renaming persisted IDs", () => {
  assert.equal(WEDDING_THEMES.length, 21);
  assert.deepEqual(
    WEDDING_THEMES.slice(0, 2).map((t) => [t.id, t.label]),
    [
      ["classic", "Rose"],
      ["lotus", "Lotus"],
    ],
  );
  assert.equal(new Set(WEDDING_THEMES.map((t) => t.id)).size, 21);
  for (const id of LEGACY_TEMPLATE_IDS) assert.equal(baseTemplate(id), id);
  for (const theme of WEDDING_THEMES)
    assert.ok(LEGACY_TEMPLATE_IDS.includes(baseTemplate(theme.id)));
});

test("the migration accepts every new theme and every previously saved template", () => {
  const sql = readFileSync(
    new URL(
      "../supabase/migrations/20260925000000_wedding_nature_themes.sql",
      import.meta.url,
    ),
    "utf8",
  );
  const allowed = [...sql.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const supported = [
    ...new Set([...LEGACY_TEMPLATE_IDS, ...WEDDING_THEMES.map((t) => t.id)]),
  ];
  assert.deepEqual(allowed.sort(), supported.sort());
  assert.doesNotMatch(sql, /\b(update|delete|truncate)\b/i);
});

function luminance(hex: string) {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
test("default invitation text and primary buttons meet WCAG normal-text contrast", () => {
  for (const { id, palette } of WEDDING_THEMES) {
    for (const color of [palette.text, palette.primary]) {
      const a = luminance(color),
        b = luminance(palette.background);
      assert.ok(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5,
        `${id}: ${color}`,
      );
    }
  }
});
