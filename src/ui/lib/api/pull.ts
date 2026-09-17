import type { TolgeeClient } from "$ui/lib/api/client";
import { MAX_BATCH_CHARS, chunkByLength } from "$ui/lib/api/keysByName";

/**
 * Flat representation of one Tolgee key + its translations, normalised for
 * the diff/apply pipeline. We intentionally keep only what the UI cares about
 * so callers don't have to reach into `KeyWithTranslationsModel` fields that
 * are unrelated to the pull workflow.
 */
export type PulledKey = {
  keyName: string;
  keyNamespace?: string;
  isPlural: boolean;
  translations: Record<string, { text: string }>;
};

export type FetchAllTranslationsOptions = {
  languages: string[];
  /**
   * Namespaces to fetch. Pass `[""]` to filter to the default namespace,
   * or an empty array `[]` (or omit) to fetch every namespace in the project
   * — no `filterNamespace` is sent in that case, so the server returns keys
   * across all namespaces.
   */
  namespaces?: string[];
  branch?: string;
  pageSize?: number;
  /**
   * Progress callback. `total` is `null` until the first batch returns
   * `page.totalElements`, and may stay `null` if the server omits the field.
   */
  onProgress?: (loaded: number, total: number | null) => void;
  /** Forwarded to `fetch`; lets svelte-query cancel in-flight requests. */
  signal?: AbortSignal;
  /**
   * When given (non-empty), fetch ONLY these key names instead of paginating
   * the whole project — batched by `chunkByLength`/`MAX_BATCH_CHARS`, the
   * same URL-length-safe batching `keysByName.ts`'s `fetchRemoteKeys` uses
   * for Push. No `filterNamespace` is sent in this path: callers (Pull,
   * CopyView's Download) match each local node to its remote key by the
   * node's OWN `ns`, so returning a name across every namespace it exists in
   * is correct — `pullDiff` only uses the entries whose `(ns, key)` matches a
   * local node either way.
   *
   * Undefined (or an empty array) falls back to the original unfiltered
   * project-wide pagination — still used by CreateCopy/`recreateCopy`, which
   * don't know the clone's key set in advance and must fetch broadly.
   */
  keyNames?: string[];
};

const DEFAULT_PAGE_SIZE = 1000;

function toPulledKey(key: {
  keyName: string;
  keyNamespace?: string;
  keyIsPlural?: boolean;
  translations?: Record<string, { text?: string } | undefined>;
}): PulledKey {
  const translations: Record<string, { text: string }> = {};
  for (const [lang, view] of Object.entries(key.translations ?? {})) {
    translations[lang] = { text: view?.text ?? "" };
  }
  return {
    keyName: key.keyName,
    keyNamespace: key.keyNamespace,
    isPlural: Boolean(key.keyIsPlural),
    translations,
  };
}

/**
 * Fetch one name-filtered batch, following `cursor`/`nextCursor` pagination
 * until exhausted. Mirrors `keysByName.ts`'s `fetchBatch` — a single batch
 * (sized by `chunkByLength`) fits within one page in the overwhelming
 * majority of cases, so this loop typically runs once.
 */
async function fetchKeyNameBatch(
  client: TolgeeClient,
  filterKeyName: string[],
  languages: string[],
  branch: string | undefined,
  pageSize: number,
  signal: AbortSignal | undefined,
): Promise<PulledKey[]> {
  const out: PulledKey[] = [];
  let cursor: string | undefined;

  while (true) {
    const { data, error } = await client.GET("/v2/projects/translations", {
      params: {
        query: {
          languages,
          filterKeyName,
          size: pageSize,
          cursor,
          branch: branch || undefined,
        },
      },
      signal,
    });

    if (error) {
      const code =
        (error as { code?: string }).code ?? (typeof error === "string" ? error : null);
      throw code ?? new Error("Failed to fetch translations");
    }

    const batch = data?._embedded?.keys ?? [];
    for (const key of batch) out.push(toPulledKey(key));

    cursor = data?.nextCursor;
    if (!cursor || batch.length === 0) return out;
  }
}

/**
 * Key-filtered counterpart of the broad pagination below — see `keyNames` on
 * `FetchAllTranslationsOptions` for when/why this path is used.
 */
async function fetchTranslationsByKeyNames(
  client: TolgeeClient,
  keyNames: string[],
  options: FetchAllTranslationsOptions,
): Promise<PulledKey[]> {
  const { languages, branch, pageSize = DEFAULT_PAGE_SIZE, onProgress, signal } = options;

  const total = keyNames.length;
  const batches = chunkByLength(keyNames, MAX_BATCH_CHARS);
  let done = 0;

  const results = await Promise.all(
    batches.map(async (filterKeyName) => {
      const rows = await fetchKeyNameBatch(client, filterKeyName, languages, branch, pageSize, signal);
      // Safe without a lock: JS has no true concurrency, only interleaved
      // microtasks, and this runs right after THIS batch resolves.
      done += filterKeyName.length;
      onProgress?.(done, total);
      return rows;
    }),
  );
  return results.flat();
}

/**
 * Fetches every translation for the requested `languages` across the given
 * `namespaces`, paginating via the cursor returned by
 * `GET /v2/projects/translations`.
 *
 * Namespaces are fetched in parallel — each has its own cursor and the server
 * returns disjoint key sets. The result is a flat `PulledKey[]`; callers
 * disambiguate via `keyName` + `keyNamespace`.
 */
export async function fetchAllTranslations(
  client: TolgeeClient,
  options: FetchAllTranslationsOptions,
): Promise<PulledKey[]> {
  if (options.keyNames) {
    if (options.keyNames.length === 0) return [];
    return fetchTranslationsByKeyNames(client, options.keyNames, options);
  }

  const {
    languages,
    namespaces,
    branch,
    pageSize = DEFAULT_PAGE_SIZE,
    onProgress,
    signal,
  } = options;

  // Empty / unspecified `namespaces` means "every namespace" — a single pass
  // without `filterNamespace`. The synthetic `null` sentinel drives that
  // branch through the same paginated loop.
  const nsList: Array<string | null> = !namespaces || namespaces.length === 0 ? [null] : namespaces;

  // Shared progress aggregator: each namespace pushes its loaded count and
  // total; we sum and emit a combined number so the UI sees one bar.
  const loadedByNs = new Array<number>(nsList.length).fill(0);
  const totalByNs = new Array<number | null>(nsList.length).fill(null);

  function emitProgress(): void {
    const combinedLoaded = loadedByNs.reduce((a, b) => a + b, 0);
    const combinedTotal = totalByNs.some((t) => t === null)
      ? null
      : (totalByNs as number[]).reduce((a, b) => a + b, 0);
    onProgress?.(combinedLoaded, combinedTotal);
  }

  async function loadNamespace(ns: string | null, index: number): Promise<PulledKey[]> {
    const out: PulledKey[] = [];
    let cursor: string | undefined;
    let nsTotal: number | null = null;
    let firstBatch = true;

    while (true) {
      const { data, error } = await client.GET("/v2/projects/translations", {
        params: {
          query: {
            languages,
            filterNamespace: ns === null ? undefined : [ns],
            size: pageSize,
            cursor,
            branch: branch || undefined,
          },
        },
        signal,
      });

      if (error) {
        // Surface the error code verbatim so the caller can branch on common
        // cases (e.g. "invalid_project_api_key").
        const code =
          (error as { code?: string }).code ?? (typeof error === "string" ? error : null);
        throw code ?? new Error("Failed to fetch translations");
      }

      const batch = data?._embedded?.keys ?? [];
      for (const key of batch) out.push(toPulledKey(key));

      loadedByNs[index] = out.length;

      if (firstBatch) {
        nsTotal = data?.page?.totalElements ?? null;
        totalByNs[index] = nsTotal;
        firstBatch = false;
      }

      emitProgress();

      cursor = data?.nextCursor;
      const reachedTotal = nsTotal !== null && out.length >= nsTotal;
      if (!cursor || batch.length === 0 || reachedTotal) {
        return out;
      }
    }
  }

  const perNs = await Promise.all(nsList.map((ns, i) => loadNamespace(ns, i)));
  return perNs.flat();
}
