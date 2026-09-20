import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { Route } from "../src/routes/sso.ts";

const get = (
  Route.options as unknown as {
    server: {
      handlers: { GET: (args: { request: Request }) => Promise<Response> };
    };
  }
).server.handlers.GET;

function workerSecret(t: TestContext) {
  const before = process.env.TEAM_GRANT_SHARED_SECRET;
  process.env.TEAM_GRANT_SHARED_SECRET = "local-test-only";
  t.after(() => {
    if (before === undefined) delete process.env.TEAM_GRANT_SHARED_SECRET;
    else process.env.TEAM_GRANT_SHARED_SECRET = before;
  });
}

test("missing sign-in links are redirected without caching", async () => {
  const response = await get({
    request: new Request("https://wed.example.test/sso"),
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(
    response.headers.get("location"),
    "https://wed.example.test/auth?sso_error=missing_token",
  );
});

test("another product's resolved token cannot create a Wed session", async (t) => {
  workerSecret(t);
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ email: "alex@example.test", product: "another-app" }),
  );
  const response = await get({
    request: new Request("https://wed.example.test/sso?token=test"),
  });
  assert.equal(
    response.headers.get("location"),
    "https://wed.example.test/auth?sso_error=wrong_product",
  );
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("unreachable sign-in service produces a recoverable auth screen", async (t) => {
  workerSecret(t);
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("offline");
  });
  const response = await get({
    request: new Request("https://wed.example.test/sso?token=test"),
  });
  assert.equal(
    response.headers.get("location"),
    "https://wed.example.test/auth?sso_error=resolve_unreachable",
  );
});
