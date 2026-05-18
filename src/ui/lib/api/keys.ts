import type { TolgeeClient } from "$ui/lib/api/client";

/**
 * Search result entry returned by `searchKeys`.
 *
 * Mirrors the subset of `KeySearchSearchResultModel` from the generated
 * OpenAPI schema that the UI cares about.
 */
export type KeySearchResult = {
  id: number;
  name: string;
  namespace: string | null;
  description?: string;
  translation?: string;
  baseTranslation?: string;
  plural?: boolean;
};

/**
 * Calls `GET /v2/projects/keys/search` and normalizes the response into a
 * lightweight list of result entries.
 *
 * Returns an empty array when:
 *   - `query` is empty/whitespace-only
 *   - the request fails (callers shouldn't crash on search errors)
 */
export async function searchKeys(
  client: TolgeeClient,
  query: string,
  languageTag: string | undefined,
  size = 20,
): Promise<KeySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data, error } = await client.GET("/v2/projects/keys/search", {
    params: {
      query: {
        search: trimmed,
        size,
        languageTag,
      },
    },
  });

  if (error || !data) return [];

  const keys = data._embedded?.keys ?? [];
  return keys.map((k) => ({
    id: k.id,
    name: k.name,
    namespace: k.namespace ?? null,
    description: k.description,
    translation: k.translation,
    baseTranslation: k.baseTranslation,
    plural: k.plural,
  }));
}
