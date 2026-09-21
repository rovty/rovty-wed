// Run after `npm run build`. The workspace dashboard's Wrangler installation
// provides Miniflare; every outbound request is intercepted with local fixtures.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { Miniflare, convertV4MiniflareOptions } = require(
  require.resolve("miniflare", {
    paths: [root, resolve(root, "../rovty-dashboard")],
  }),
);
const server = resolve(root, ".output/server");
const user = "00000000-0000-4000-8000-000000000001";
const session = "00000000-0000-4000-8000-000000000002";
const wedding = "00000000-0000-4000-8000-000000000003";
const token = `a.${Buffer.from(JSON.stringify({ sub: user, session_id: session })).toString("base64url")}.b`;
const plan = {
  active: true,
  plan: "essential",
  features: ["website", "templates", "rsvp", "guests"],
  source: "manual",
  expires_at: "2030-01-01T00:00:00+00:00",
};

test("built wedding gateway works in Cloudflare with native fetch", async (t) => {
  let existing = false;
  let accessStatus = 200;
  let forwarded = [];
  let calls = [];
  const options = {
    name: "wed-gateway-regression",
    cf: false,
    modules: [
      { type: "ESModule", path: resolve(server, "index.mjs") },
      ...readdirSync(server, { recursive: true })
        .filter((p) => p.endsWith(".mjs") && p !== "index.mjs")
        .map((p) => ({ type: "ESModule", path: resolve(server, p) })),
    ],
    compatibilityDate: "2026-06-07",
    compatibilityFlags: ["nodejs_compat"],
    bindings: {
      SUPABASE_URL: "https://wed-db.example.test",
      SUPABASE_SERVICE_ROLE_KEY: "sb_secret_local_fixture",
      WED_WORKER_SECRET: "local-fixture-credential",
      ROVTY_DASHBOARD_ORIGIN: "https://dash.example.test",
    },
    outboundService: async (request) => {
      const path = new URL(request.url).pathname;
      calls.push(path);
      if (path === "/auth/v1/user")
        return Response.json({
          id: user,
          email: "couple@example.test",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: "2026-01-01T00:00:00Z",
        });
      if (path === "/rest/v1/rpc/rovty_platform_session")
        return Response.json({ user_id: user, session_id: session });
      if (path === "/api/product-session/check")
        return accessStatus === 200
          ? Response.json({
              active: true,
              user_id: user,
              session_id: session,
              email: "couple@example.test",
              entitlement: plan,
            })
          : Response.json(
              {
                error: "Product access is unavailable.",
                code:
                  accessStatus === 403
                    ? "ACCESS_REVOKED"
                    : "PLATFORM_UNAVAILABLE",
              },
              { status: accessStatus },
            );
      if (path === "/rest/v1/rpc/rovty_billing_weddings")
        return Response.json(
          existing ? [{ id: wedding, owner: user, legacy: false }] : [],
        );
      if (path === "/rest/v1/rpc/rovty_gateway_secret")
        return Response.json("local-gateway-secret");
      if (path === "/rest/v1/weddings") {
        forwarded.push({
          headers: request.headers,
          method: request.method,
          body: request.method === "POST" ? await request.json() : null,
        });
        return Response.json(existing ? [{ id: wedding }] : []);
      }
      assert.fail(`Unexpected outbound request: ${path}`);
    },
  };
  const mf = new Miniflare(
    convertV4MiniflareOptions ? convertV4MiniflareOptions(options) : options,
  );
  const load = (method = "GET", body) =>
    mf.dispatchFetch(
      `https://wed.example.test/api/data?path=${encodeURIComponent("/rest/v1/weddings?select=*")}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Origin: "https://wed.example.test",
          "Content-Type": "application/json",
          "x-rovty-plans": "untrusted-browser-value",
        },
        body: body && JSON.stringify(body),
      },
    );
  try {
    await t.test("first-time paid account can reach onboarding", async () => {
      const response = await load();
      assert.equal(response.status, 200, await response.clone().text());
      assert.deepEqual(await response.json(), []);
      assert.equal(forwarded.length, 1);
      const headers = forwarded[0].headers;
      assert.equal(headers.get("authorization"), `Bearer ${token}`);
      assert.equal(headers.get("x-rovty-gateway"), "local-gateway-secret");
      assert.deepEqual(JSON.parse(headers.get("x-rovty-owner-plan")), plan);
      assert.deepEqual(JSON.parse(headers.get("x-rovty-plans")), {});
      assert.equal(response.headers.get("x-rovty-gateway"), null);
    });
    await t.test(
      "wedding creation forwards content and verified plan",
      async () => {
        forwarded = [];
        const content = { bride: "Alex", groom: "Sam", slug: "alex-sam" };
        const response = await load("POST", content);
        assert.equal(response.status, 200, await response.clone().text());
        assert.deepEqual(forwarded[0].body, content);
        assert.equal(forwarded[0].method, "POST");
      },
    );
    await t.test(
      "existing weddings retain their owner plan and data",
      async () => {
        existing = true;
        forwarded = [];
        const response = await load();
        assert.equal(response.status, 200, await response.clone().text());
        assert.deepEqual(await response.json(), [{ id: wedding }]);
        assert.deepEqual(
          JSON.parse(forwarded[0].headers.get("x-rovty-plans")),
          { [wedding]: plan },
        );
      },
    );
    for (const status of [403, 503]) {
      await t.test(
        `access failure ${status} stops private data requests`,
        async () => {
          accessStatus = status;
          calls = [];
          forwarded = [];
          const response = await load();
          assert.equal(response.status, status);
          assert.equal(forwarded.length, 0);
          assert(!calls.includes("/rest/v1/rpc/rovty_billing_weddings"));
        },
      );
    }
  } finally {
    await mf.dispose();
  }
});
