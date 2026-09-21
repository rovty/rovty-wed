import { ManagementError, record, validateRequest } from "./schema.ts";

export type ManagementBackend = {
  user: (token: string) => Promise<string | null>;
  run: (
    actor: string,
    action: string,
    params: Record<string, unknown>,
  ) => Promise<{
    data: unknown;
    error: { code?: string; message: string } | null;
  }>;
};
const headers = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers });
async function boundedJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ManagementError("Send a JSON request.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new ManagementError("Missing request body.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 65536) {
        await reader.cancel();
        throw new ManagementError("The edit is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return record(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    throw new ManagementError("Invalid JSON request.");
  }
}
export async function handleManagement(
  request: Request,
  backend: ManagementBackend,
): Promise<Response> {
  try {
    const write = request.method === "PATCH";
    if (request.method !== "GET" && !write)
      return reply({ error: "Method not allowed." }, 405);
    const token = request.headers
      .get("Authorization")
      ?.match(/^Bearer ([^\s]+)$/)?.[1];
    if (!token) return reply({ error: "Sign in to your Rovty account." }, 401);
    if (
      write &&
      (request.headers.get("origin") !== new URL(request.url).origin ||
        request.headers.get("sec-fetch-site") === "cross-site")
    )
      return reply(
        { error: "Open management on Rovty Wed before saving." },
        403,
      );
    const actor = await backend.user(token);
    if (!actor)
      return reply({ error: "Your session expired. Sign in again." }, 401);
    // Deny before parsing edits or looking up any wedding, even for malformed requests.
    const access = await backend.run(actor, "access", {});
    if (access.error) return rpcError(access.error);
    if (write && record(access.data).role !== "admin")
      return reply({ error: "Editing requires Rovty admin access." }, 403);
    let action: string;
    let params: Record<string, unknown>;
    if (write) {
      const body = await boundedJson(request);
      if (
        Object.keys(body).some((k) => !["action", "params"].includes(k)) ||
        typeof body.action !== "string"
      )
        throw new ManagementError("Invalid request.");
      action = body.action;
      params = validateRequest(action, body.params, true);
    } else {
      const query = new URL(request.url).searchParams;
      if ([...query.keys()].some((key) => query.getAll(key).length > 1))
        throw new ManagementError("Duplicate request parameter.");
      action = query.get("action") ?? "access";
      const p: Record<string, unknown> = Object.fromEntries(query);
      delete p.action;
      if (p.page !== undefined)
        p.page = /^\d+$/.test(String(p.page)) ? Number(p.page) : NaN;
      params = validateRequest(action, p, false);
    }
    if (action === "access") return reply(access.data);
    const result = await backend.run(actor, action, params);
    return result.error ? rpcError(result.error) : reply(result.data);
  } catch (error) {
    return error instanceof ManagementError
      ? reply({ error: error.message }, error.status)
      : reply(
          {
            error: "Management is temporarily unavailable. Try again shortly.",
          },
          503,
        );
  }
}
function rpcError(error: { code?: string; message: string }) {
  if (error.code === "42501")
    return reply({ error: "Rovty team access required." }, 403);
  if (error.code === "P0002")
    return reply({ error: "This record no longer exists." }, 404);
  if (error.code === "40001")
    return reply(
      {
        error:
          "This record changed since you opened it. Reload the latest details before saving.",
      },
      409,
    );
  if (error.code === "23505")
    return reply(
      { error: "That username or team membership already exists." },
      409,
    );
  if (error.code === "P0001") return reply({ error: error.message }, 400);
  if (error.code?.startsWith("22") || error.code?.startsWith("23"))
    return reply({ error: "Check the entered values and try again." }, 400);
  return reply(
    {
      error:
        "Management is unavailable. Check the wedding management migration and server configuration.",
    },
    503,
  );
}
