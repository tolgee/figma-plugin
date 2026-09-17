import type { TolgeeClient } from "$ui/lib/api/client";

export type TaggableKey = {
  name: string;
  namespace?: string;
};

/**
 * Existing tag names in the project (`GET /v2/projects/tags`), for the "Add
 * tags" autocomplete. Optional `search` filters server-side. Returns an empty
 * array on any failure so the picker just shows no suggestions.
 */
export async function fetchProjectTags(
  client: TolgeeClient,
  search = "",
  size = 20,
): Promise<string[]> {
  const { data, error } = await client.GET("/v2/projects/tags", {
    params: { query: { search: search.trim() || undefined, size } },
  });
  if (error || !data) return [];
  return (data._embedded?.tags ?? [])
    .map((t) => t.name)
    .filter((n): n is string => Boolean(n));
}

/**
 * Apply a fixed set of tags to a list of keys via `PUT /v2/projects/tag-complex`.
 *
 * Mirrors the call shape used in the legacy plugin: we use the
 * `filterKeys` + `tagFiltered` combo so only the explicitly listed keys are
 * tagged. The endpoint accepts an optional `branch` query parameter.
 *
 * Throws if the API returns an error so the caller can surface it; if you
 * want partial-failure tolerance, handle it at the call site.
 */
export async function applyTags(
  client: TolgeeClient,
  tagFiltered: string[],
  keys: TaggableKey[],
  branch?: string,
): Promise<void> {
  if (tagFiltered.length === 0 || keys.length === 0) return;

  const { error, response } = await client.PUT("/v2/projects/tag-complex", {
    params: {
      query: branch ? { branch } : {},
    },
    body: {
      tagFiltered,
      filterKeys: keys.map((k) => ({
        name: k.name,
        namespace: k.namespace || undefined,
      })),
    },
  });

  if (error) {
    throw new Error(`Failed to apply tags (status ${response?.status ?? "?"})`);
  }
}
