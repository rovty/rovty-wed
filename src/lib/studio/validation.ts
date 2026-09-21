export const object = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
export const str = (v: unknown, max = 5000) =>
  typeof v === "string" ? v.slice(0, max) : "";
export const clamp = (
  v: unknown,
  fallback: number,
  min: number,
  max: number,
) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.max(min, Math.min(max, v))
    : fallback;
export const isHexColor = (v: unknown): v is string =>
  typeof v === "string" && /^#[\da-f]{6}$/i.test(v);
export function safeUrl(value: unknown, media = false): string {
  if (typeof value !== "string") return "";
  // Relative bundled assets and local preview blobs are also valid media.
  if (media && (/^\/(?!\/)/.test(value) || value.startsWith("blob:")))
    return value;
  try {
    const url = new URL(value);
    return ["https:", "http:", ...(media ? [] : ["mailto:", "tel:"])].includes(
      url.protocol,
    )
      ? value
      : "";
  } catch {
    return "";
  }
}
