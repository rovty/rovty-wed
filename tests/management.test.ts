import assert from "node:assert/strict";
import { test } from "node:test";
import {
  handleManagement,
  type ManagementBackend,
} from "../src/lib/management/handler.server.ts";
import { validateRequest } from "../src/lib/management/schema.ts";
const id = "00000000-0000-4000-8000-000000000001";
const version = "2026-09-21T10:00:00.123456+00:00";
const params = {
  weddingId: id,
  version,
  reason: "Couple confirmed the correction",
  changes: { bride: "Alexandra" },
};
function backend(role = "admin") {
  const calls: {
    actor: string;
    action: string;
    params: Record<string, unknown>;
  }[] = [];
  const api: ManagementBackend = {
    user: async (token) =>
      token === "verified-token"
        ? id
        : token === "ordinary-token"
          ? "ordinary-user"
          : null,
    run: async (actor, action, params) => {
      calls.push({ actor, action, params });
      if (actor !== id)
        return {
          data: null,
          error: { code: "42501", message: "not approved" },
        };
      return {
        data:
          action === "access"
            ? { email: "ireshek@gmail.com", role }
            : { ok: true },
        error: null,
      };
    },
  };
  return { api, calls };
}
function request(body?: unknown, extra: Record<string, string> = {}) {
  return new Request("https://wed.example.test/api/manage", {
    method: body ? "PATCH" : "GET",
    headers: {
      Authorization: "Bearer verified-token",
      Origin: "https://wed.example.test",
      "Content-Type": "application/json",
      ...extra,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
test("a validated staff actor is derived from the token and responses are never cached", async () => {
  const { api, calls } = backend();
  const response = await handleManagement(
    request({ action: "wedding", params }),
    api,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("vary"), "Authorization");
  assert.deepEqual(
    calls.map((c) => [c.actor, c.action]),
    [
      [id, "access"],
      [id, "wedding"],
    ],
  );
  assert.deepEqual(calls[1].params, params);
});
test("anonymous, invalid and ordinary account tokens cannot read or edit weddings", async () => {
  for (const [token, status] of [
    ["", 401],
    ["Bearer forged-token", 401],
    ["Bearer ordinary-token", 403],
  ] as const) {
    const { api, calls } = backend();
    const response = await handleManagement(
      request({ action: "wedding", params }, { Authorization: token }),
      api,
    );
    assert.equal(response.status, status);
    assert(!calls.some((c) => c.action === "wedding"));
  }
});
test("viewer can read but cannot mutate", async () => {
  const { api, calls } = backend("viewer");
  assert.equal(
    (
      await handleManagement(
        new Request(
          `https://wed.example.test/api/manage?action=detail&weddingId=${id}`,
          { headers: { Authorization: "Bearer verified-token" } },
        ),
        api,
      )
    ).status,
    200,
  );
  assert.equal(
    (await handleManagement(request({ action: "wedding", params }), api))
      .status,
    403,
  );
  assert(!calls.some((c) => c.action === "wedding"));
});
test("spoofed actor, role and privileged fields cannot reach the mutation RPC", async () => {
  for (const body of [
    { action: "wedding", params, actor: id },
    { action: "wedding", params: { ...params, actor: id } },
    { action: "wedding", params: { ...params, role: "admin" } },
    { action: "wedding", params: { ...params, changes: { owner_id: id } } },
    {
      action: "wedding",
      params: { ...params, changes: { design: { version: 1 } } },
    },
    { action: "delete", params },
    { action: "__proto__", params },
  ]) {
    const { api, calls } = backend();
    assert.equal((await handleManagement(request(body), api)).status, 400);
    assert.equal(calls.length, 1);
  }
});
test("writes require same-origin, bounded JSON; GET cannot execute write actions", async () => {
  const { api, calls } = backend();
  for (const headers of [
    { Origin: "https://evil.test" },
    { Origin: "" },
    { "Sec-Fetch-Site": "cross-site" },
  ])
    assert.equal(
      (
        await handleManagement(
          request({ action: "wedding", params }, headers),
          api,
        )
      ).status,
      403,
    );
  assert.equal(calls.length, 0);
  assert.equal(
    (
      await handleManagement(
        request(
          { action: "wedding", params },
          { "Content-Type": "text/plain" },
        ),
        api,
      )
    ).status,
    415,
  );
  assert.equal(
    (
      await handleManagement(
        request({
          action: "wedding",
          params: { ...params, reason: "x".repeat(66000) },
        }),
        api,
      )
    ).status,
    413,
  );
  assert.equal(
    (
      await handleManagement(
        new Request("https://wed.example.test/api/manage?action=wedding", {
          headers: { Authorization: "Bearer verified-token" },
        }),
        api,
      )
    ).status,
    400,
  );
  assert(!calls.some((c) => c.action === "wedding"));
});
test("invalid paging, duplicate parameters, unsafe media URLs, null values and missing versions are rejected", async () => {
  for (const value of ["-1", "0.5", "bad", "100001", ""]) {
    assert.equal(
      (
        await handleManagement(
          new Request(
            `https://wed.example.test/api/manage?action=list&page=${value}`,
            { headers: { Authorization: "Bearer verified-token" } },
          ),
          backend().api,
        )
      ).status,
      400,
    );
  }
  assert.equal(
    (
      await handleManagement(
        new Request(
          "https://wed.example.test/api/manage?action=list&action=access",
          { headers: { Authorization: "Bearer verified-token" } },
        ),
        backend().api,
      )
    ).status,
    400,
  );
  for (const changes of [
    { maps_url: "javascript:alert(1)" },
    { music_url: "http://example.test/a.mp3" },
    { couple_photo_url: "https://user:secret@example.test/x" },
    { bride: null },
    { published: null },
    { event_date: "tomorrow" },
    { slug: "admin" },
    { template: { value: "classic" } },
  ])
    assert.throws(() =>
      validateRequest("wedding", { ...params, changes }, true),
    );
  assert.throws(() =>
    validateRequest("wedding", { ...params, version: null }, true),
  );
  assert.throws(() =>
    validateRequest("wedding", { ...params, reason: "ok" }, true),
  );
  assert.throws(() =>
    validateRequest(
      "guest",
      {
        weddingId: id,
        guestId: id,
        reason: "Correction",
        expected: {},
        changes: { seats: 0 },
      },
      true,
    ),
  );
  assert.doesNotThrow(() =>
    validateRequest(
      "wedding",
      {
        ...params,
        changes: {
          maps_url: "https://maps.google.com/?q=Colombo",
          reception_date: null,
          published: false,
        },
      },
      true,
    ),
  );
});
test("database conflicts are recoverable and internal database failures do not leak records", async () => {
  for (const [code, status] of [
    ["40001", 409],
    ["23505", 409],
    ["P0002", 404],
    ["PGRST202", 503],
    ["23514", 400],
  ]) {
    const { api } = backend();
    const original = api.run;
    api.run = async (a, b, c) =>
      b === "access"
        ? original(a, b, c)
        : {
            data: null,
            error: { code, message: "raw internal database record and SQL" },
          };
    const response = await handleManagement(
      request({ action: "wedding", params }),
      api,
    );
    assert.equal(response.status, status);
    assert(!(await response.text()).includes("raw internal"));
  }
});
test("network or configuration failure is reported without exposing server values", async () => {
  const { api } = backend();
  api.user = async () => {
    throw new Error("private configuration");
  };
  const response = await handleManagement(request(), api);
  assert.equal(response.status, 503);
  assert(!(await response.text()).includes("private configuration"));
});
