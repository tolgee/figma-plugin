/**
 * A query outcome that carries its own failure INSTEAD of rejecting.
 *
 * The two data-loading queries whose failure the user must see — Push's diff
 * and Pull's translations — cannot rely on TanStack's `.error`/terminal
 * `.isPending` reactive fields: the `@tanstack/svelte-query` runes adapter we
 * ship does not reliably propagate a query's terminal ERROR transition into
 * Svelte's reactive graph, so a failed fetch left the loading spinner up
 * forever (verified live: HTTP 500 and network throw both hung indefinitely).
 * Its `.data` transition, by contrast, works — the happy path renders fine.
 *
 * So we funnel failures through `.data`: the `queryFn` never rejects, it
 * resolves with `{ ok: false, error }`, and the view derives its error state
 * from that value. This is independent of the adapter version, so a future
 * dependency bump (or regression) can't silently resurrect the stuck spinner.
 *
 * Shape mirrors the existing `ValidateApiKeyResult` discriminated union in
 * `api/auth.ts` for consistency.
 */
export type QueryOutcome<T> = { ok: true; value: T } | { ok: false; error: string };

export type SettleOptions = {
  /**
   * The query's abort signal, when it has one. A CANCELLED query (query-key
   * change, navigation away) must NOT surface as an `{ ok: false }` result —
   * that would cache a bogus error under the old key. When the signal is
   * aborted we re-throw so TanStack handles the cancellation normally.
   */
  signal?: AbortSignal;
  /** Turn a caught failure into the message shown to the user. */
  toMessage: (error: unknown) => string;
  /**
   * Extra attempts after the first on a GENUINE failure (not a cancellation),
   * preserving the single automatic retry the query client used to provide via
   * `retry: 1` — which no longer fires now that `queryFn` doesn't throw for API
   * errors. Retries are immediate; a transient blip usually clears at once, and
   * a persistent failure just costs one extra request before surfacing.
   */
  retries?: number;
};

/**
 * Run `run`, converting any genuine failure into an `{ ok: false }` outcome
 * rather than rejecting — while re-throwing on cancellation so TanStack's
 * abort handling is untouched. See `QueryOutcome` for why.
 */
export async function settleQuery<T>(
  run: () => Promise<T>,
  options: SettleOptions,
): Promise<QueryOutcome<T>> {
  const attempts = (options.retries ?? 1) + 1;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return { ok: true, value: await run() };
    } catch (error) {
      // A cancelled query is not a failure to report — let TanStack see the
      // throw and treat it as cancellation (no error cached, no retry).
      if (options.signal?.aborted) throw error;
      lastError = error;
    }
  }
  return { ok: false, error: options.toMessage(lastError) };
}
