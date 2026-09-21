import { PlatformSessionGate } from "@/components/admin/PlatformSessionGate";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import studioCss from "../components/studio/studio.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Something didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    // Site-wide defaults — each page overrides title/description/og:* with its
    // own wedding's data (see index.tsx, rsvp.tsx, seating.tsx loaders); this
    // is only what shows before that resolves, or on a page that doesn't set
    // its own. Deliberately generic, not any one customer's names/domain/photo.
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Wedding Invitation" },
        {
          name: "description",
          content:
            "You're invited: RSVP and find everything you need for the big day.",
        },
        { name: "theme-color", content: "#f7e9d7" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        // Same mark as rovty.com and dash.rovty.com — this is a Rovty
        // product, not a one-off brand, so the tab icon should read as part
        // of that same suite rather than something wedding-specific.
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        { rel: "stylesheet", href: appCss },
        { rel: "stylesheet", href: studioCss },
        // Fonts are declared per route (see fontLinks() in lib/wedding.ts):
        // guest pages load only their template's families, the admin and
        // landing load the UI face. Nothing font-related is site-wide.
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const privatePage =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  return (
    <QueryClientProvider client={queryClient}>
      {privatePage ? (
        <PlatformSessionGate>
          <Outlet />
        </PlatformSessionGate>
      ) : (
        <Outlet />
      )}
    </QueryClientProvider>
  );
}
