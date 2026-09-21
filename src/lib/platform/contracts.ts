export class PlatformError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 503, code = "PLATFORM_UNAVAILABLE") {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const isId = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export function tokenSessionId(token: string): string | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const value = JSON.parse(
      atob(part.padEnd(Math.ceil(part.length / 4) * 4, "=")),
    );
    return isId(value.session_id) ? value.session_id : null;
  } catch {
    return null;
  }
}

export function bearer(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (\S+)$/)?.[1];
  if (!token)
    throw new PlatformError(
      "Sign in to your Rovty account.",
      401,
      "SESSION_EXPIRED",
    );
  return token;
}
export function platformFailure(error: unknown) {
  const issue =
    error instanceof PlatformError
      ? error
      : new PlatformError(
          "Rovty is temporarily unavailable. Please try again.",
        );
  return Response.json(
    { error: issue.message, message: issue.message, code: issue.code },
    {
      status: issue.status,
      headers: { "Cache-Control": "private, no-store", Vary: "Authorization" },
    },
  );
}
export function requireSameOrigin(request: Request) {
  if (
    request.headers.get("origin") !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new PlatformError(
      "Open this page on Rovty Wed before continuing.",
      403,
      "WRONG_ORIGIN",
    );
}
