import { createServerFn } from "@tanstack/react-start";
// A browser receives only availability. Account IDs and billing credentials stay server-side.
export const hostingAvailable = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (
      typeof slug !== "string" ||
      slug.length > 120 ||
      !/^[a-z0-9-]+$/.test(slug)
    )
      throw new Error("Invalid wedding link.");
    return slug;
  })
  .handler(async ({ data: slug }) => {
    const { checkHosting } = await import("./hosting.server");
    return checkHosting(slug);
  });
