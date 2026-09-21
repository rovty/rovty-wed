/* eslint-disable no-control-regex -- Reject control characters in untrusted storage paths. */
import {
  bearer,
  requireSameOrigin,
  platformFailure,
  PlatformError,
  isId,
} from "./contracts.ts";
export interface GatewayBackend {
  session(
    token: string,
  ): Promise<{ user: { id: string }; planHeaders?: Record<string, string> }>;
  mediaAccess(user: string, wedding: string, edit: boolean): Promise<boolean>;
  serviceKey: string;
  key(): Promise<string>;
  supabaseUrl: string;
  publicKey: string;
  fetch: typeof fetch;
}
const tables = new Set([
  "weddings",
  "guests",
  "rsvps",
  "wedding_members",
  "seating_config",
  "seating_tables",
  "seating_assignments",
]);
const publicRpcs = new Set([
  "get_guest_by_code",
  "get_seating_by_code",
  "get_seating_by_tables",
  "submit_rsvp",
]);
export function allowedPath(path: string): boolean {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /[\\#\u0000-\u0020]/.test(path)
  )
    return false;
  let decoded;
  try {
    decoded = decodeURIComponent(path.split("?")[0]);
  } catch {
    return false;
  }
  if (
    /[\\%\u0000-\u001f]/.test(decoded) ||
    decoded.split("/").some((s) => s === ".." || s === ".")
  )
    return false;
  const parts = decoded.split("/").filter(Boolean);
  if (parts[0] === "rest" && parts[1] === "v1")
    return (
      (parts.length === 3 && tables.has(parts[2])) ||
      (parts.length === 4 && parts[2] === "rpc" && publicRpcs.has(parts[3]))
    );
  if (parts[0] !== "storage" || parts[1] !== "v1" || parts[2] !== "object")
    return false;
  // Keep operations under the existing wedding-media bucket. No bucket creation,
  // admin endpoints, signed upload URLs, arbitrary hosts or auth endpoints.
  return (
    parts[3] === "wedding-media" ||
    (["list", "info"].includes(parts[3]) && parts[4] === "wedding-media")
  );
}
async function readStorageBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new PlatformError("Choose wedding files.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 32768) {
        await reader.cancel();
        throw new PlatformError("Too many files in one request.", 413);
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
    const value = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error();
    return value;
  } catch {
    throw new PlatformError("Choose valid wedding files.", 400);
  }
}
function safeObjectPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    !/[\\%\u0000-\u001f]/.test(value) &&
    !value.split("/").some((part) => part === "." || part === "..")
  );
}
export async function handleGateway(
  request: Request,
  backend: GatewayBackend,
): Promise<Response> {
  try {
    const path = new URL(request.url).searchParams.get("path") || "";
    if (!allowedPath(path))
      throw new PlatformError("Unknown data operation.", 400, "INVALID_PATH");
    if (
      !["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE"].includes(
        request.method,
      )
    )
      throw new PlatformError("Method not allowed.", 405);
    if (!["GET", "HEAD"].includes(request.method)) requireSameOrigin(request);
    const token = bearer(request);
    const session = await backend.session(token);
    const upstream = new URL(path, backend.supabaseUrl);
    if (upstream.origin !== new URL(backend.supabaseUrl).origin)
      throw new PlatformError("Invalid data destination.", 400);
    let body: BodyInit | null | undefined = ["GET", "HEAD"].includes(
      request.method,
    )
      ? undefined
      : request.body;
    const storage = upstream.pathname.startsWith("/storage/v1/");
    let headers: Headers;
    if (storage) {
      const parts = decodeURIComponent(upstream.pathname)
        .split("/")
        .filter(Boolean);
      let folders: string[];
      let edit = !["GET", "HEAD"].includes(request.method);
      if (
        (parts[3] === "list" && request.method === "POST") ||
        (parts[3] === "wedding-media" &&
          parts.length === 4 &&
          request.method === "DELETE")
      ) {
        const value = await readStorageBody(request);
        if (parts[3] === "list") {
          if (!safeObjectPath(value.prefix))
            throw new PlatformError("Choose a wedding folder.", 400);
          folders = [value.prefix.split("/")[0]];
          edit = false;
        } else {
          if (
            !Array.isArray(value.prefixes) ||
            !value.prefixes.length ||
            value.prefixes.length > 100 ||
            value.prefixes.some((p: unknown) => !safeObjectPath(p))
          )
            throw new PlatformError("Choose valid wedding files.", 400);
          folders = value.prefixes.map((p: string) => p.split("/")[0]);
        }
        body = JSON.stringify(value);
      } else {
        folders = [parts[3] === "wedding-media" ? parts[4] : parts[5]];
      }
      for (const folder of new Set(folders)) {
        if (
          !isId(folder) ||
          !(await backend.mediaAccess(session.user.id, folder, edit))
        )
          throw new PlatformError(
            "You don't have access to these wedding files.",
            403,
            "MEDIA_FORBIDDEN",
          );
      }
      headers = new Headers({ apikey: backend.serviceKey });
      if (!backend.serviceKey.startsWith("sb_secret_"))
        headers.set("Authorization", `Bearer ${backend.serviceKey}`);
    } else {
      if (!backend.publicKey)
        throw new PlatformError("The data connection is not configured.");
      headers = new Headers({
        apikey: backend.publicKey,
        Authorization: `Bearer ${token}`,
        "x-rovty-gateway": await backend.key(),
        ...session.planHeaders,
      });
    }
    for (const name of [
      "content-type",
      "prefer",
      "accept",
      "range",
      "range-unit",
      "content-range",
      "x-upsert",
      "cache-control",
      "x-client-info",
    ]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    // Stream uploads instead of buffering images or videos in Worker memory.
    const response = await backend.fetch(upstream, {
      method: request.method,
      headers,
      body,
      signal: request.signal,
      duplex: "half",
      redirect: "manual",
    } as RequestInit);
    const out = new Headers();
    for (const name of [
      "content-type",
      "content-range",
      "range-unit",
      "preference-applied",
      "etag",
    ]) {
      const value = response.headers.get(name);
      if (value) out.set(name, value);
    }
    out.set("Cache-Control", "private, no-store");
    out.set("Vary", "Authorization");
    return new Response(response.body, {
      status: response.status,
      headers: out,
    });
  } catch (error) {
    return platformFailure(error);
  }
}
