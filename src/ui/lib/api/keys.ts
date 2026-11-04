import type { TolgeeClient } from "$ui/lib/api/client";
import type { NodeInfo } from "$shared/types";
import { inferPluralCount } from "$shared/interpolate";

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
  branch?: string,
): Promise<KeySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data, error } = await client.GET("/v2/projects/keys/search", {
    params: {
      query: {
        search: trimmed,
        size,
        languageTag,
        // Scope the search to the configured branch (branching projects only) —
        // otherwise a key that lives on the working branch wouldn't be found,
        // and a default-branch key would wrongly match. Omitted when empty.
        branch: branch || undefined,
      },
    },
  });

  if (error || !data) return [];

  // The search endpoint also returns RECENTLY DELETED keys (they carry
  // `deletedAt`). Drop them, or callers (auto-connect, Connect) would match and
  // link to a key that no longer exists.
  const keys = (data._embedded?.keys ?? []).filter((k) => !k.deletedAt);
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

export type PhraseSearchResult = {
  results: KeySearchResult[];
  /** How many keys contain the phrase in total (may exceed `results`). */
  total: number;
};

const PHRASE_PAGE_SIZE = 100;

/**
 * Keys whose key name, namespace, description or text (design language or
 * base language) CONTAINS
 * `query` as one piece (case-insensitive, accent-sensitive) — the same search
 * the Tolgee web app's translation list uses (`GET /v2/projects/translations`
 * with `search`). Unlike the fuzzy `searchKeys`, every hit really contains the
 * phrase, so the exact string can be found among them reliably; the caller
 * ranks them (`rankKeySearch`).
 *
 * Fetches the first page, then — only when there are more — the remaining
 * pages up to `maxResults`, in parallel. `total` reports the full count so the
 * UI can ask the user to narrow a too-common phrase down.
 */
export async function searchKeysByPhrase(
  client: TolgeeClient,
  query: string,
  opts: {
    /** The design's language — its text is returned as `translation`. */
    language: string | undefined;
    /** Project base language — also searched, returned as `baseTranslation`
     *  (like the fuzzy `searchKeys`). Omit when unknown. */
    baseLanguage?: string;
    branch?: string;
    maxResults?: number;
  },
): Promise<PhraseSearchResult> {
  const trimmed = query.trim();
  const languageTag = opts.language;
  if (!trimmed || !languageTag) return { results: [], total: 0 };
  const { baseLanguage, branch, maxResults = 3 * PHRASE_PAGE_SIZE } = opts;
  const languages = [...new Set([languageTag, baseLanguage].filter((l): l is string => !!l))];

  const fetchPage = async (page: number) => {
    const { data, error } = await client.GET("/v2/projects/translations", {
      params: {
        query: {
          search: trimmed,
          languages,
          page,
          size: PHRASE_PAGE_SIZE,
          // Stable order across pages; relevance is decided client-side.
          sort: ["keyId"],
          branch: branch || undefined,
        },
      },
    });
    if (error || !data) throw new Error("Phrase search failed");
    const keys = data._embedded?.keys ?? [];
    return {
      total: data.page?.totalElements ?? keys.length,
      results: keys.map(
        (k): KeySearchResult => ({
          id: k.keyId,
          name: k.keyName,
          namespace: k.keyNamespace ?? null,
          description: k.keyDescription,
          translation: k.translations?.[languageTag]?.text,
          baseTranslation: baseLanguage ? k.translations?.[baseLanguage]?.text : undefined,
          plural: k.keyIsPlural,
        }),
      ),
    };
  };

  const first = await fetchPage(0);
  const pagesWanted = Math.min(
    Math.ceil(first.total / PHRASE_PAGE_SIZE),
    Math.ceil(maxResults / PHRASE_PAGE_SIZE),
  );
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pagesWanted - 1) }, (_, i) => fetchPage(i + 1)),
  );
  return {
    results: [first, ...rest].flatMap((p) => p.results),
    total: first.total,
  };
}

/**
 * Builds the node data to persist when connecting a node to search result `r`.
 *
 * Mirrors the legacy plugin's connect behaviour: the node adopts the key's
 * TRANSLATION, so the canvas layer immediately reflects the Tolgee value. For a
 * plural, it stores the sample COUNT (a number, as the original persisted) so
 * the key renders and its manual edits are detected; the count is inferred from
 * the layer's current text so the layer keeps the plural form it already shows
 * (the original stored the arg NAME here, which was a latent bug). Falls back to
 * the node's own text / "1" when nothing better is available.
 */
export function connectInfoFromKey(
  r: KeySearchResult,
  node: Pick<NodeInfo, "characters" | "isPlural" | "pluralParamValue">,
  language: string,
): Partial<NodeInfo> {
  const isPlural = r.plural ?? node.isPlural ?? false;
  const icu = r.translation ?? r.baseTranslation ?? "";
  return {
    key: r.name,
    // "" (not undefined) for a no-namespace key — undefined is dropped by the
    // bus's JSON round-trip, leaving the node's old namespace behind.
    ns: r.namespace ?? "",
    translation: r.translation ?? node.characters ?? "",
    isPlural,
    pluralParamValue: isPlural
      ? (inferPluralCount(icu, node.characters ?? "", language) ??
        (node.pluralParamValue && /^\d+$/.test(node.pluralParamValue)
          ? node.pluralParamValue
          : "1"))
      : undefined,
    connected: true,
  };
}

/**
 * Total number of keys in the project (`ProjectStatsModel.keyCount`). Used to
 * give the Connect search empty state context — "0 of N keys in Tolgee".
 * Returns `null` on any failure so callers can simply omit the count.
 */
export async function fetchProjectKeyCount(client: TolgeeClient): Promise<number | null> {
  const { data, error } = await client.GET("/v2/projects/stats");
  if (error || !data) return null;
  return data.keyCount ?? null;
}
