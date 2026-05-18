import { QueryClient } from "@tanstack/svelte-query";

/**
 * Shared TanStack Query client.
 *
 * Defaults are tuned for a Figma plugin context: short-lived stale time so
 * UI navigations re-fetch reasonably fresh data, retries kept low because
 * the user-facing UI surfaces error states explicitly, and
 * `refetchOnWindowFocus` disabled because focus events fire constantly
 * while interacting with the Figma canvas.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
