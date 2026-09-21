import { supabase } from "@/integrations/supabase/client";
import { ManagementError } from "./schema";

export async function management<T>(
  action: string,
  params: Record<string, unknown> = {},
  write = false,
  signal?: AbortSignal,
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session)
    throw new ManagementError("Sign in to your Rovty account.", 401);
  const query = new URLSearchParams({ action });
  if (!write)
    for (const [key, value] of Object.entries(params))
      query.set(key, String(value));
  const response = await fetch(`/api/manage${write ? "" : `?${query}`}`, {
    method: write ? "PATCH" : "GET",
    signal,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      ...(write ? { "Content-Type": "application/json" } : {}),
    },
    ...(write ? { body: JSON.stringify({ action, params }) } : {}),
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new ManagementError(
      "Management is unavailable. Please try again.",
      503,
    );
  }
  if (!response.ok)
    throw new ManagementError(
      body.error ?? "Could not load management.",
      response.status,
    );
  return body as T;
}
