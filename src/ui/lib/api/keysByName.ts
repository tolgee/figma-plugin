import type { TolgeeClient } from "$ui/lib/api/client";

export type RemoteKeyRow = {
  keyName: string;
  keyNamespace?: string;
  keyIsPlural?: boolean;
  keyTags?: Array<{ name: string }>;
  translations?: Record<string, { text?: string } | undefined>;
};

export type FetchRemoteKeysOptions = {
  filterKeyName: string[];
  filterNamespace?: string[];
  language?: string;
  branch?: string;
  signal?: AbortSignal;
};

const PAGE_SIZE = 1000;

// `filterKeyName` is a repeated query param — sending too many/too-long names
// in one request risks exceeding proxy/server URL length limits (~8KB), which
// fails outright with a network error (`TypeError: Failed to fetch`).
//
// A fixed name COUNT is not a safe proxy for URL length: key names generated
// from a template like `{elementText}` are the entire camelCased sentence of
// a Figma text layer (often 60-100+ characters each), so even well under a
// count-based cap of 200 the cumulative length can blow the URL budget
// (live-tested: 154 such names succeeded, a bit more started failing).
// Batching by cumulative character length instead keeps every request's URL
// short regardless of how long individual names are.
//
// 3000 is conservative under the typical ~8KB URL/header limit, leaving room
// on the same request for `filterNamespace`, `languages`, `branch`, and for
// URL-encoding overhead (non-ASCII characters can expand to several bytes
// once percent-encoded).
export const MAX_BATCH_CHARS = 3000;

/**
 * Split `names` into batches so that the summed character length of each
 * batch stays at or under `maxChars` where possible. A single name that is
 * itself longer than `maxChars` still gets sent — alone, in its own batch —
 * rather than being dropped or crashing the whole call.
 *
 * Exported so `pull.ts`'s key-filtered fetch can reuse the exact same
 * URL-length-safe batching instead of duplicating the reasoning.
 */
export function chunkByLength(names: string[], maxChars: number): string[][] {
  const out: string[][] = [];
  let current: string[] = [];
  let currentLen = 0;

  for (const name of names) {
    if (current.length > 0 && currentLen + name.length > maxChars) {
      out.push(current);
      current = [];
      currentLen = 0;
    }
    current.push(name);
    currentLen += name.length;
  }

  if (current.length > 0) out.push(current);
  return out;
}

/**
 * Fetch one batch of key names, following `cursor`/`nextCursor` pagination
 * until exhausted. A single batch (sized by `chunkByLength`) fits within one
 * page in the overwhelming majority of cases, so this loop typically runs
 * once — it only keeps going if many namespaces multiply the batch's result
 * count past the page size. Mirrors the pagination pattern in `pull.ts`'s
 * `fetchAllTranslations`.
 */
async function fetchBatch(
  client: TolgeeClient,
  filterKeyName: string[],
  options: Pick<FetchRemoteKeysOptions, "filterNamespace" | "language" | "branch" | "signal">,
): Promise<RemoteKeyRow[]> {
  const out: RemoteKeyRow[] = [];
  let cursor: string | undefined;

  while (true) {
    const { data, error } = await client.GET("/v2/projects/translations", {
      params: {
        query: {
          languages: options.language ? [options.language] : undefined,
          filterKeyName,
          filterNamespace: options.filterNamespace,
          size: PAGE_SIZE,
          cursor,
          branch: options.branch || undefined,
        },
      },
      signal: options.signal,
    });

    if (error || !data) {
      const code =
        (error as { code?: string } | undefined)?.code ??
        (typeof error === "string" ? error : null);
      throw code ? new Error(code) : new Error("Failed to fetch remote keys");
    }

    // Response shape: `_embedded.keys` (newer) or `pagedModel._embedded.keys`.
    const raw = data as {
      _embedded?: { keys?: unknown[] };
      pagedModel?: { _embedded?: { keys?: unknown[] } };
      nextCursor?: string;
    };
    const batch = (raw._embedded?.keys ?? raw.pagedModel?._embedded?.keys ?? []) as RemoteKeyRow[];
    out.push(...batch);

    cursor = raw.nextCursor;
    if (!cursor || batch.length === 0) {
      return out;
    }
  }
}

/**
 * Fetch a fixed set of keys by name (and optional namespace) for the diff
 * preview on the push screen.
 *
 * `filterKeyName` is split into batches by cumulative character length (see
 * `chunkByLength`/`MAX_BATCH_CHARS`), each issued as its own request (in
 * parallel — these are independent reads), and each batch follows cursor
 * pagination defensively. Results are merged into a single flat array with
 * the exact same shape this function returned before batching was
 * introduced, so callers (`pushDiff.ts` via `Push.svelte` and
 * `pushFlow.ts`) need no changes.
 *
 * Any batch failing fails the whole call — we throw rather than silently
 * returning `[]`, since a swallowed error here previously looked identical
 * to "no remote keys found" and made `pushDiff` misreport existing keys as
 * deleted on the platform.
 *
 * `onProgress`, when given, is called once per batch as that SPECIFIC
 * batch's `fetchBatch` resolves — not after the whole `Promise.all` settles,
 * since batches run in parallel and a large push can have several in flight
 * at once. `total` is the full name count, known up front; `done` is the
 * cumulative count of names whose batch has already resolved (so it grows
 * out of request order when a later batch happens to finish first).
 */
export async function fetchRemoteKeys(
  client: TolgeeClient,
  options: FetchRemoteKeysOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<RemoteKeyRow[]> {
  if (options.filterKeyName.length === 0) return [];

  const total = options.filterKeyName.length;
  const batches = chunkByLength(options.filterKeyName, MAX_BATCH_CHARS);
  let done = 0;
  const results = await Promise.all(
    batches.map(async (filterKeyName) => {
      const rows = await fetchBatch(client, filterKeyName, {
        filterNamespace: options.filterNamespace,
        language: options.language,
        branch: options.branch,
        signal: options.signal,
      });
      // Runs right after THIS batch resolves — safe to mutate the shared
      // counter without a lock since JS has no true concurrency here, only
      // interleaved microtasks.
      done += filterKeyName.length;
      onProgress?.(done, total);
      return rows;
    }),
  );
  return results.flat();
}
