/**
 * Runs `worker` over `items` with at most `concurrency` calls in flight at
 * once — a fixed-size worker pool, not `Promise.all` (unbounded) or a
 * sequential loop (one at a time). Items are pulled off `items` in order,
 * but workers finish independently, so callers needing per-item state
 * (progress counters, cancellation checks) must do that inside `worker`
 * itself rather than relying on completion order.
 */
export async function runWithConcurrency<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  async function runNext(): Promise<void> {
    while (cursor < items.length) {
      const item = items[cursor++] as T;
      await worker(item);
    }
  }
  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workerCount }, runNext));
}
