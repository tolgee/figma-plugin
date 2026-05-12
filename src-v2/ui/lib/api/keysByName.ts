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

/**
 * Fetch a fixed set of keys by name (and optional namespace) for the diff
 * preview on the push screen. Single-page request — the legacy plugin
 * paginated, but constraining by `filterKeyName` keeps the response well
 * below the 1000-item page size in every realistic scenario.
 *
 * Returns the rows untouched (shape varies slightly across schema revisions);
 * callers consume `keyName / keyNamespace / keyIsPlural / translations`.
 */
export async function fetchRemoteKeys(
  client: TolgeeClient,
  options: FetchRemoteKeysOptions,
): Promise<RemoteKeyRow[]> {
  if (options.filterKeyName.length === 0) return [];

  const { data, error } = await client.GET("/v2/projects/translations", {
    params: {
      query: {
        languages: options.language ? [options.language] : undefined,
        filterKeyName: options.filterKeyName,
        filterNamespace: options.filterNamespace,
        size: 1000,
        branch: options.branch || undefined,
      },
    },
    signal: options.signal,
  });
  if (error || !data) return [];

  // Response shape: `_embedded.keys` (newer) or `pagedModel._embedded.keys`.
  const raw = data as {
    _embedded?: { keys?: unknown[] };
    pagedModel?: { _embedded?: { keys?: unknown[] } };
  };
  const keysRaw =
    raw._embedded?.keys ?? raw.pagedModel?._embedded?.keys ?? [];
  return keysRaw as RemoteKeyRow[];
}
