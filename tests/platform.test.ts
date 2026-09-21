import assert from "node:assert/strict";
import { test } from "node:test";
import {
  finishHandoff,
  type HandoffBackend,
  type HandoffIdentity,
} from "../src/lib/platform/handoff.ts";
import {
  allowedPath,
  handleGateway,
  type GatewayBackend,
} from "../src/lib/platform/gateway.ts";
import {
  PlatformError,
  tokenSessionId,
} from "../src/lib/platform/contracts.ts";
const identity: HandoffIdentity = {
  user_id: "00000000-0000-4000-8000-000000000001",
  session_id: "00000000-0000-4000-8000-000000000002",
  email: "updated@example.test",
  product: "wed",
  version: 2,
};
function handoff(overrides: Partial<HandoffBackend> = {}) {
  const calls: string[] = [];
  const backend: HandoffBackend = {
    link: async (id, email) => {
      calls.push(`link:${id}:${email}`);
      return "existing-local-user";
    },
    create: async () => {
      calls.push("create");
    },
    updateEmail: async (id, email) => {
      calls.push(`email:${id}:${email}`);
    },
    signIn: async () => ({
      user: { id: "existing-local-user" },
      access_token: "local-jwt",
      refresh_token: "local-refresh",
      expires_in: 3600,
      token_type: "bearer",
    }),
    bind: async (id, token, central) => {
      calls.push(`bind:${id}:${token}:${central.session_id}`);
    },
    recheck: async () => {
      calls.push("recheck");
    },
    ...overrides,
  };
  return { backend, calls };
}
test("permanent platform ID retains the local wedding owner across an email change", async () => {
  const { backend, calls } = handoff();
  const session = await finishHandoff(identity, backend);
  assert.equal(session.user.id, "existing-local-user");
  assert(!calls.includes("create"));
  assert(calls.includes("email:existing-local-user:updated@example.test"));
  assert.equal(calls.at(-1), "recheck");
});
test("first sign-in creates then links, and a concurrent create is safe only with a confirmed unique link", async () => {
  let links = 0;
  const { backend } = handoff({
    link: async () => (++links === 1 ? null : "existing-local-user"),
    create: async () => {
      throw new Error("already exists");
    },
  });
  assert.equal(
    (await finishHandoff(identity, backend)).user.id,
    "existing-local-user",
  );
  const missing = handoff({
    link: async () => null,
    create: async () => {
      throw new Error("failed create");
    },
  });
  await assert.rejects(
    finishHandoff(identity, missing.backend),
    /failed create/,
  );
});
test("email collisions, identity mismatches, and revocation during handoff never return tokens", async () => {
  const collision = handoff({
    updateEmail: async () => {
      throw new Error("email collision");
    },
  });
  await assert.rejects(
    finishHandoff(identity, collision.backend),
    /email collision/,
  );
  const mismatch = handoff({
    signIn: async () => ({
      user: { id: "another-user" },
      access_token: "a",
      refresh_token: "b",
      expires_in: 3600,
      token_type: "bearer",
    }),
  });
  await assert.rejects(
    finishHandoff(identity, mismatch.backend),
    /identity mismatch/,
  );
  assert(!mismatch.calls.some((c) => c.startsWith("bind:")));
  const revoked = handoff({
    recheck: async () => {
      throw new Error("revoked");
    },
  });
  await assert.rejects(finishHandoff(identity, revoked.backend), /revoked/);
});
function gateway(overrides: Partial<GatewayBackend> = {}) {
  const calls: Request[] = [];
  const sequence: string[] = [];
  const backend: GatewayBackend = {
    supabaseUrl: "https://wed-db.example.test",
    publicKey: "public-key",
    serviceKey: "sb_secret_fake",
    mediaAccess: async () => true,
    session: async (token) => {
      assert.equal(token, "verified-user-token");
      sequence.push("authorize");
      return { user: { id: identity.user_id } };
    },
    key: async () => {
      sequence.push("key");
      return "private-gateway-key";
    },
    fetch: async (input, init) => {
      sequence.push("fetch");
      const req = new Request(input, init);
      calls.push(req);
      return new Response('{"ok":true}', {
        headers: {
          "content-type": "application/json",
          "content-range": "0-9/100",
          "x-rovty-gateway": "must-not-leak",
        },
      });
    },
    ...overrides,
  };
  return { backend, calls, sequence };
}
function request(
  path = "/rest/v1/weddings?select=*",
  method = "GET",
  headers: Record<string, string> = {},
  body?: string,
) {
  return new Request(
    `https://wed.example.test/api/data?path=${encodeURIComponent(path)}`,
    {
      method,
      headers: {
        Authorization: "Bearer verified-user-token",
        Origin: "https://wed.example.test",
        ...headers,
      },
      body,
    },
  );
}
test("gateway preserves the user's RLS token and response ranges without exposing private headers", async () => {
  const { backend, calls, sequence } = gateway();
  const response = await handleGateway(request(), backend);
  assert.equal(response.status, 200);
  assert.deepEqual(sequence, ["authorize", "key", "fetch"]);
  assert.equal(
    calls[0].headers.get("authorization"),
    "Bearer verified-user-token",
  );
  assert.equal(calls[0].headers.get("apikey"), "public-key");
  assert.equal(calls[0].headers.get("x-rovty-gateway"), "private-gateway-key");
  assert.equal(response.headers.get("x-rovty-gateway"), null);
  assert.equal(response.headers.get("content-range"), "0-9/100");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});
test("expired sessions, revoked product access and outages fail before any database request", async () => {
  for (const status of [401, 403, 503]) {
    const { backend, calls } = gateway({
      session: async () => {
        throw new PlatformError("Access ended", status, "ACCESS_REVOKED");
      },
    });
    const result = await handleGateway(request(), backend);
    assert.equal(result.status, status);
    assert.equal(calls.length, 0);
  }
});
test("private uploads stream through the same access check and retain file content", async () => {
  const { backend, calls } = gateway();
  const response = await handleGateway(
    request(
      "/storage/v1/object/wedding-media/00000000-0000-4000-8000-000000000003/photo.webp",
      "POST",
      { "Content-Type": "image/webp", "x-upsert": "true" },
      "fake-image-bytes",
    ),
    backend,
  );
  assert.equal(response.status, 200);
  assert.equal(await calls[0].text(), "fake-image-bytes");
  assert.equal(calls[0].headers.get("x-upsert"), "true");
});
test("gateway rejects cross-origin writes, auth endpoints, other buckets, private RPCs, and SSRF paths", async () => {
  for (const path of [
    "/auth/v1/admin/users",
    "//evil.test/rest/v1/weddings",
    "/rest/v1/rpc/rovty_manage",
    "/rest/v1/platform_account_links",
    "/storage/v1/object/another-bucket/x",
    "/rest/v1/%2e%2e/auth/users",
    "/rest/v1/weddings#secret",
  ])
    assert.equal(allowedPath(path), false, path);
  const { backend, calls } = gateway();
  assert.equal(
    (
      await handleGateway(
        request(
          "/rest/v1/guests",
          "POST",
          { Origin: "https://evil.test" },
          "{}",
        ),
        backend,
      )
    ).status,
    403,
  );
  assert.equal(calls.length, 0);
  assert.equal(
    (
      await handleGateway(
        request("/rest/v1/weddings", "GET", { Authorization: "" }),
        backend,
      )
    ).status,
    401,
  );
});
test("session references are required and malformed tokens cannot produce one", () => {
  for (const value of ["bad", "a.bad.b", "a.e30.b"])
    assert.equal(tokenSessionId(value), null);
  const jwt = `a.${Buffer.from(JSON.stringify({ session_id: identity.session_id })).toString("base64url")}.b`;
  assert.equal(tokenSessionId(jwt), identity.session_id);
});

test("media access checks every folder, separates reads from edits, and never grants direct storage authority", async () => {
  const folder = "00000000-0000-4000-8000-000000000003";
  const other = "00000000-0000-4000-8000-000000000004";
  const checks: unknown[] = [];
  const { backend, calls } = gateway({
    mediaAccess: async (user, wedding, edit) => {
      checks.push([user, wedding, edit]);
      return wedding === folder && !edit;
    },
  });
  assert.equal(
    (
      await handleGateway(
        request(
          "/storage/v1/object/list/wedding-media",
          "POST",
          {},
          JSON.stringify({ prefix: folder }),
        ),
        backend,
      )
    ).status,
    200,
  );
  assert.deepEqual(checks, [[identity.user_id, folder, false]]);
  assert.equal(calls[0].headers.get("apikey"), "sb_secret_fake");
  assert.equal(calls[0].headers.get("Authorization"), null);
  assert.equal(
    (
      await handleGateway(
        request(
          `/storage/v1/object/wedding-media/${folder}/photo.webp`,
          "POST",
          {},
          "bytes",
        ),
        backend,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handleGateway(
        request(
          "/storage/v1/object/wedding-media",
          "DELETE",
          {},
          JSON.stringify({
            prefixes: [`${folder}/photo.webp`, `${other}/photo.webp`],
          }),
        ),
        backend,
      )
    ).status,
    403,
  );
  for (const prefix of [
    "",
    `${folder}/../${other}`,
    `${folder}/%2e%2e/${other}`,
    `${folder}\\${other}`,
  ]) {
    assert.notEqual(
      (
        await handleGateway(
          request(
            "/storage/v1/object/list/wedding-media",
            "POST",
            {},
            JSON.stringify({ prefix }),
          ),
          backend,
        )
      ).status,
      200,
    );
  }
  assert.equal(
    (
      await handleGateway(
        request(
          "/storage/v1/object/list/wedding-media",
          "POST",
          {},
          "x".repeat(32769),
        ),
        backend,
      )
    ).status,
    413,
  );
  assert.equal(calls.length, 1);
  assert.equal(
    allowedPath(
      `/storage/v1/object/wedding-media/${folder}/%252e%252e/photo.webp`,
    ),
    false,
  );
});
