import type { TolgeeClient } from "$ui/lib/api/client";

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
  /** Namespaces to fetch — use `""` for the default namespace. */
  namespaces: string[];
  branch?: string;
  pageSize?: number;
  /**
   * Progress callback. `total` is `null` until the first batch returns
   * `page.totalElements`, and may stay `null` if the server omits the field.
   */
  onProgress?: (loaded: number, total: number | null) => void;
};

const DEFAULT_PAGE_SIZE = 1000;

/**
 * Fetches every translation for the requested `languages` across the given
 * `namespaces`, paginating via the cursor returned by
 * `GET /v2/projects/translations`.
 *
 * For each namespace we loop until the server stops returning a cursor or
 * the accumulated keys reach `page.totalElements`. The result is a flat
 * `PulledKey[]` (one entry per remote key, regardless of namespace). Callers
 * are expected to disambiguate via `keyName` + `keyNamespace`.
 */
export async function fetchAllTranslations(
  client: TolgeeClient,
  options: FetchAllTranslationsOptions,
): Promise<PulledKey[]> {
  const {
    languages,
    namespaces,
    branch,
    pageSize = DEFAULT_PAGE_SIZE,
    onProgress,
  } = options;

  const all: PulledKey[] = [];

  // Running total across all namespaces. `null` means at least one namespace
  // hasn't reported `page.totalElements` yet, so the UI should show an
  // indeterminate progress indicator.
  let combinedTotal: number | null = null;
  let combinedTotalKnown = true;

  for (const ns of namespaces) {
    let cursor: string | undefined;
    let nsLoaded = 0;
    let nsTotal: number | null = null;
    let firstBatch = true;

    while (true) {
      const { data, error } = await client.GET("/v2/projects/translations", {
        params: {
          query: {
            languages,
            filterNamespace: [ns],
            size: pageSize,
            cursor,
            branch: branch || undefined,
          },
        },
      });

      if (error) {
        // Surface the error code verbatim so the caller can branch on common
        // cases (e.g. "invalid_project_api_key").
        const code =
          (error as { code?: string }).code ??
          (typeof error === "string" ? error : null);
        throw code ?? new Error("Failed to fetch translations");
      }

      const batch = data?._embedded?.keys ?? [];

      for (const key of batch) {
        const translations: Record<string, { text: string }> = {};
        for (const [lang, view] of Object.entries(key.translations ?? {})) {
          translations[lang] = { text: view?.text ?? "" };
        }
        all.push({
          keyName: key.keyName,
          keyNamespace: key.keyNamespace,
          isPlural: Boolean(key.keyIsPlural),
          translations,
        });

        // Yield to the event loop every 50 items so we don't starve the UI.
        if (all.length % 50 === 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      }

      nsLoaded += batch.length;

      if (firstBatch) {
        nsTotal = data?.page?.totalElements ?? null;
        firstBatch = false;
        if (nsTotal == null) {
          combinedTotalKnown = false;
          combinedTotal = null;
        } else if (combinedTotalKnown) {
          combinedTotal = (combinedTotal ?? 0) + nsTotal;
        }
      }

      onProgress?.(all.length, combinedTotal);

      cursor = data?.nextCursor;

      const reachedTotal = nsTotal !== null && nsLoaded >= nsTotal;
      if (!cursor || batch.length === 0 || reachedTotal) {
        break;
      }
    }
  }

  return all;
}
