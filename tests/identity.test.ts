import assert from "node:assert/strict";
import { test } from "node:test";
import {
  identitySupportUrl,
  preserveWeddingIdentity,
} from "../src/lib/wedding-identity.ts";

test("draft import preserves names and username while keeping editable content", () => {
  const identity = { bride: "Alex", groom: "Sam", slug: "alex-and-sam" };
  const imported = {
    bride: "Another",
    groom: "Couple",
    slug: "other-wedding",
    venue: "New venue",
  };
  assert.deepEqual(preserveWeddingIdentity(imported, identity), {
    ...identity,
    venue: "New venue",
  });
  assert.equal(imported.bride, "Another");
});

test("support link includes only wedding identity in a private fragment", () => {
  const wedding = {
    id: "00000000-0000-4000-8000-000000000001",
    bride: "Alex & 李",
    groom: "Sam",
    slug: "alex-and-sam",
    owner_id: "private-owner",
    guest_code: "secret",
  };
  const url = new URL(identitySupportUrl("https://rovty.com", wedding));
  assert.equal(
    url.origin + url.pathname + url.search,
    "https://rovty.com/contact",
  );
  assert.deepEqual(JSON.parse(decodeURIComponent(url.hash.split("=")[1])), {
    id: wedding.id,
    bride: wedding.bride,
    groom: wedding.groom,
    slug: wedding.slug,
  });
  assert.ok(
    !url.href.includes("private-owner") && !url.href.includes("secret"),
  );
});
