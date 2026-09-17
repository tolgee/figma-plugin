import createClient from "openapi-fetch";
import type { paths } from "./schema.generated";

export type TolgeeClient = ReturnType<typeof createTolgeeClient>;

/**
 * Creates a typed Tolgee API client backed by `openapi-fetch`.
 *
 * The trailing slash of `apiUrl` is stripped so that callers can pass either
 * `https://app.tolgee.io` or `https://app.tolgee.io/` without breaking paths.
 */
export function createTolgeeClient(apiUrl: string, apiKey: string) {
  const baseUrl = apiUrl.replace(/\/$/, "");
  return createClient<paths>({
    baseUrl,
    headers: {
      "X-API-Key": apiKey,
      "X-Tolgee-SDK-Type": "Figma",
    },
  });
}
