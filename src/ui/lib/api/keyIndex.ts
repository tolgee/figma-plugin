import type { QueryClient } from "@tanstack/svelte-query";
import type { TolgeeClient } from "$ui/lib/api/client";
import type { KeySearchResult } from "$ui/lib/api/keys";

/**
 * The project's keys with their design-language (and base-language) text,
 * loaded ONCE and searched locally by Connect and the bulk auto-connect.
 *
 * Why not search on the server per query: the only Tolgee search that finds a
 * text "as one piece" is `GET /v2/projects/translations?search=`, and that
 * endpoint has its own per-user rate limit (default 100 requests / 5 minutes,
 * then 3 strikes and the server stops answering). One request per Connect
 * search — or one per string in an auto-connect run — hits it within minutes.
 * Loading the project once costs `ceil(keys / 1000)` requests per
 * `KEY_INDEX_STALE_MS` and then every search is free and instant.
 *
 * Projects above `KEY_INDEX_MAX_KEYS` are not loaded (one probe request): the
 * callers fall back to the fuzzy `/keys/search`, which is not in that bucket.
 *
 * Freshness (other people create keys in Tolgee while the designer works):
 * - auto-connect uses the cached index plus an UNTHROTTLED newest-keys
 *   request (`fetchKeyIndexWithNewest`), so even a key created seconds ago is
 *   seen — for one small request instead of a full reload per run;
 * - Connect tops the cached index up with keys created since it was loaded —
 *   one small newest-first request, at most every `KEY_INDEX_TOPUP_MS`
 *   (`topUpKeyIndex`) — and its live fuzzy search sees new keys anyway;
 * - the whole index reloads after `KEY_INDEX_STALE_MS`, which is also when
 *   edited texts of OLDER keys show up, and after every push.
 */
export const KEY_INDEX_MAX_KEYS = 20_000;
export const KEY_INDEX_STALE_MS = 5 * 60 * 1000;
export const KEY_INDEX_TOPUP_MS = 30 * 1000;
const PAGE_SIZE = 1000;
/** Newest keys checked by one top-up request. */
export const NEWEST_PAGE_SIZE = 100;

type TranslationsRow = {
  keyId: number;
  keyName: string;
  keyNamespace?: string | null;
  keyDescription?: string;
  keyIsPlural?: boolean;
  translations?: Record<string, { text?: string } | undefined>;
};

function toSearchResult(k: TranslationsRow, language: string, base?: string): KeySearchResult {
  return {
    id: k.keyId,
    name: k.keyName,
    namespace: k.keyNamespace ?? null,
    description: k.keyDescription,
    translation: k.translations?.[language]?.text,
    baseTranslation: base ? k.translations?.[base]?.text : undefined,
    plural: k.keyIsPlural,
  };
}

function languagesOf(p: KeyIndexParams): { language: string; base?: string; languages: string[] } | null {
  const language = p.language;
  if (!language) return null;
  const base = p.baseLanguage && p.baseLanguage !== language ? p.baseLanguage : undefined;
  return { language, base, languages: base ? [language, base] : [language] };
}

export type KeyIndexParams = {
  /** The Tolgee server's API URL — project ids are only unique PER SERVER, so
   *  without it a cached index could be served across a server switch. */
  apiUrl: string;
  projectId: number | null;
  language: string | undefined;
  baseLanguage?: string;
  branch?: string;
};

/** Query key prefix — invalidate it after anything that creates keys (push). */
export const KEY_INDEX_QUERY_ROOT = "key-index";

export function keyIndexQueryKey(p: KeyIndexParams): unknown[] {
  return [
    KEY_INDEX_QUERY_ROOT,
    p.apiUrl,
    p.projectId ?? 0,
    p.language ?? "",
    p.baseLanguage ?? "",
    p.branch ?? "",
  ];
}

/**
 * Load every key of the project (all namespaces). Resolves to `null` when the
 * project is larger than `maxKeys` — the caller then uses server search.
 */
export async function fetchKeyIndex(
  client: TolgeeClient,
  p: KeyIndexParams,
  signal?: AbortSignal,
  maxKeys = KEY_INDEX_MAX_KEYS,
): Promise<KeySearchResult[] | null> {
  const langs = languagesOf(p);
  if (!langs) return null;
  const { language, base, languages } = langs;

  const out: KeySearchResult[] = [];
  let cursor: string | undefined;
  let first = true;
  let total: number | undefined;
  while (true) {
    const { data, error } = await client.GET("/v2/projects/translations", {
      params: {
        query: { languages, size: PAGE_SIZE, cursor, branch: p.branch || undefined },
      },
      signal,
    });
    if (error || !data) throw new Error("Failed to load the project's keys");
    if (first) {
      first = false;
      total = data.page?.totalElements;
      if (total !== undefined && total > maxKeys) return null;
    }
    const batch = data._embedded?.keys ?? [];
    for (const k of batch) out.push(toSearchResult(k, language, base));
    if (out.length > maxKeys) return null;
    cursor = data.nextCursor;
    // Tolgee still hands out a cursor on the last page — stop at the total
    // instead of spending a request on an empty page.
    if (!cursor || batch.length === 0 || (total !== undefined && out.length >= total)) {
      return out;
    }
  }
}

/** svelte-query options shared by every user of the index, so they share one
 *  cached copy (and one in-flight load). */
export function keyIndexQueryOptions(client: TolgeeClient | null, p: KeyIndexParams) {
  return {
    queryKey: keyIndexQueryKey(p),
    queryFn: ({ signal }: { signal?: AbortSignal }) => {
      // Never runs without a client: `enabled` below requires one.
      if (!client) return Promise.resolve(null);
      return fetchKeyIndex(client, p, signal);
    },
    enabled: Boolean(client && p.language),
    staleTime: KEY_INDEX_STALE_MS,
    gcTime: 3 * KEY_INDEX_STALE_MS,
    // A failed load must not be retried right away — if it failed on the rate
    // limit, an immediate retry is exactly what earns the next "strike".
    retry: false,
    refetchOnWindowFocus: false,
  };
}

/** The project's most recently created keys, newest first (one request). */
export async function fetchNewestKeys(
  client: TolgeeClient,
  p: KeyIndexParams,
  signal?: AbortSignal,
): Promise<KeySearchResult[]> {
  const langs = languagesOf(p);
  if (!langs) return [];
  const { data, error } = await client.GET("/v2/projects/translations", {
    params: {
      query: {
        languages: langs.languages,
        size: NEWEST_PAGE_SIZE,
        sort: ["keyId,desc"],
        branch: p.branch || undefined,
      },
    },
    signal,
  });
  if (error || !data) throw new Error("Failed to load the newest keys");
  return (data._embedded?.keys ?? []).map((k) => toSearchResult(k, langs.language, langs.base));
}

/**
 * Add keys created since `index` was loaded. Returns `index` itself when
 * nothing is new, and `null` when the newest page is ALL new — more keys were
 * created than one page shows, so only a full reload is complete.
 */
export function mergeNewestKeys(
  index: KeySearchResult[],
  newest: KeySearchResult[],
): KeySearchResult[] | null {
  const known = new Set(index.map((k) => k.id));
  const fresh = newest.filter((k) => !known.has(k.id));
  if (fresh.length === 0) return index;
  if (newest.length >= NEWEST_PAGE_SIZE && fresh.length === newest.length) return null;
  return [...index, ...fresh];
}

/**
 * The index for an AUTO-CONNECT run: the shared cached copy (loaded only when
 * missing or older than `KEY_INDEX_STALE_MS`), brought up to date with an
 * UNTHROTTLED newest-keys request — a key a colleague created seconds ago must
 * not be reported as "No exact match", but reloading the whole index for that
 * guarantee cost `ceil(keys / 1000)` requests out of the shared rate-limit
 * budget on every run. Now a run costs ONE small request when the cache is
 * warm. Only when the newest page is entirely new keys (more were created than
 * one page shows) does it fall back to a full reload — the only complete
 * answer then. The newest-keys request is best-effort: if it fails, the cached
 * index (at worst `KEY_INDEX_STALE_MS` old) still serves the run rather than
 * failing it. Returns `null` for projects above `KEY_INDEX_MAX_KEYS`.
 */
export async function fetchKeyIndexWithNewest(
  qc: QueryClient,
  client: TolgeeClient,
  p: KeyIndexParams,
): Promise<KeySearchResult[] | null> {
  const opts = keyIndexQueryOptions(client, p);
  const index = await qc.fetchQuery(opts);
  if (!index) return null;
  let newest: KeySearchResult[];
  try {
    newest = await fetchNewestKeys(client, p);
  } catch {
    return index;
  }
  const merged = mergeNewestKeys(index, newest);
  if (merged === null) {
    return qc.fetchQuery({ ...opts, staleTime: 0 });
  }
  if (merged !== index) {
    const state = qc.getQueryState<KeySearchResult[] | null>(opts.queryKey);
    qc.setQueryData(opts.queryKey, merged, { updatedAt: state?.dataUpdatedAt });
  }
  return merged;
}

const lastTopUpAt = new Map<string, number>();
// Set by `noteKeysPushed`: the next top-up runs regardless of the throttle.
let forceNextTopUp = false;

/**
 * A push just happened: patch the texts it changed into every cached index
 * for that language (no request — the plugin knows what it sent) and make
 * the next Connect top the NEW keys up with one newest-keys request. This
 * replaces invalidating the whole index after each push, which reloaded it
 * in full (`ceil(keys / 1000)` requests from the shared 100-per-5-min
 * budget) the next time Connect opened — several push/connect cycles in a
 * row could spend the budget the index exists to protect.
 */
export function noteKeysPushed(
  qc: QueryClient,
  pushed: Array<{ name: string; namespace: string | null | undefined; text: string }>,
  language: string | undefined,
): void {
  forceNextTopUp = true;
  if (!language || pushed.length === 0) return;
  const textByKey = new Map(pushed.map((p) => [`${p.namespace ?? ""}\0${p.name}`, p.text]));
  for (const q of qc.getQueryCache().findAll({ queryKey: [KEY_INDEX_QUERY_ROOT] })) {
    if (q.queryKey[3] !== language) continue;
    const data = q.state.data as KeySearchResult[] | null | undefined;
    if (!data) continue;
    let changed = false;
    const next = data.map((k) => {
      const text = textByKey.get(`${k.namespace ?? ""}\0${k.name}`);
      if (text === undefined || text === k.translation) return k;
      changed = true;
      return { ...k, translation: text };
    });
    if (changed) qc.setQueryData(q.queryKey, next, { updatedAt: q.state.dataUpdatedAt });
  }
}

/** Test hook — the throttle and the forced-top-up flag are module state. */
export function resetKeyIndexTopUpState(): void {
  lastTopUpAt.clear();
  forceNextTopUp = false;
}

/**
 * Bring the cached index up to date with newly created keys — at most once per
 * `KEY_INDEX_TOPUP_MS` per index, and not while the index itself is younger
 * than that. Keeps the index's own load time, so the full 5-minute reload
 * still happens on schedule. Best-effort: errors are swallowed (the live fuzzy
 * search still covers new keys).
 */
export async function topUpKeyIndex(
  qc: QueryClient,
  client: TolgeeClient,
  p: KeyIndexParams,
  now: () => number = Date.now,
): Promise<void> {
  const queryKey = keyIndexQueryKey(p);
  const id = JSON.stringify(queryKey);
  const state = qc.getQueryState<KeySearchResult[] | null>(queryKey);
  const t = now();
  if (!state?.data) return;
  if (!forceNextTopUp) {
    if (t - state.dataUpdatedAt < KEY_INDEX_TOPUP_MS) return;
    if (t - (lastTopUpAt.get(id) ?? 0) < KEY_INDEX_TOPUP_MS) return;
  }
  forceNextTopUp = false;
  lastTopUpAt.set(id, t);
  try {
    const newest = await fetchNewestKeys(client, p);
    const current = qc.getQueryData<KeySearchResult[] | null>(queryKey);
    if (!current) return;
    const merged = mergeNewestKeys(current, newest);
    if (merged === null) void qc.invalidateQueries({ queryKey });
    else if (merged !== current) qc.setQueryData(queryKey, merged, { updatedAt: state.dataUpdatedAt });
  } catch {
    // best-effort
  }
}
