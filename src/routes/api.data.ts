import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
async function handle({ request }: { request: Request }) {
  const { handleDataRequest } = await import("@/lib/platform/gateway.server");
  return handleDataRequest(request);
}
export const Route = createFileRoute("/api/data")({
  server: {
    handlers: {
      GET: handle,
      HEAD: handle,
      POST: handle,
      PATCH: handle,
      PUT: handle,
      DELETE: handle,
    },
  },
});
