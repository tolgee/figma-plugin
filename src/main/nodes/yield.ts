/**
 * Time-sliced yielding for long read loops on the main (sandbox) thread.
 *
 * The plugin sandbox shares scheduling with the Figma canvas, so a long loop
 * has to hand control back now and then or the editor freezes. The old loops
 * did that every N nodes — and N was tuned for *our* cost per node, not for
 * how long Figma keeps the thread once it has it. Right after cloning a huge
 * page Figma is busy (layout, render, sync of the new page) and every yield
 * cost ~120 ms regardless of how little we had done: 17k nodes / 50 = 340
 * yields ≈ 41 s for a loop whose own reads take ~1 s (measured on the
 * customer-sized test file, Recreate copy).
 *
 * Yielding by TIME bounds the yield count by our own work instead: the loop
 * runs for at most `budgetMs` in one go, then yields once. Cheap reads make
 * ~20 yields for 17k nodes; expensive ones (connected nodes with a full
 * `characters` copy) still never block the canvas for longer than the budget.
 */
export const YIELD_BUDGET_MS = 50;

/**
 * Budget for loops that run RIGHT AFTER a page clone. Measured on the
 * customer-sized file: Figma keeps the thread ~500 ms per yield while it
 * digests a fresh 120k-layer clone, so 27 yields at the 50 ms budget cost
 * 13.6 s of waiting for ~1.4 s of our own reads. Six times longer slices →
 * ~5 yields → ~2.5 s waiting. The canvas pauses ≤300 ms at a time, under a
 * progress bar that says what is happening.
 */
export const POST_CLONE_YIELD_BUDGET_MS = 300;

export type Yielder = {
  /** Yield to the event loop if the current slice has used up its budget.
   *  Resolves `true` when it actually yielded, `false` when it just returned. */
  maybeYield(): Promise<boolean>;
  /** How many times it yielded, and how long Figma kept the thread in total
   *  across those yields — for the `[tolgee:perf]` lines, so a slow loop can
   *  be attributed to our reads vs. Figma's own work between slices. */
  stats(): { yields: number; waitedMs: number };
};

export function createYielder(budgetMs = YIELD_BUDGET_MS, now: () => number = Date.now): Yielder {
  let sliceStart = now();
  let yields = 0;
  let waitedMs = 0;
  return {
    async maybeYield() {
      const t = now();
      if (t - sliceStart < budgetMs) return false;
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      // The slice starts AFTER we get the thread back — the time Figma kept
      // it must not count against our next budget.
      sliceStart = now();
      yields++;
      waitedMs += sliceStart - t;
      return true;
    },
    stats: () => ({ yields, waitedMs }),
  };
}

/** `"N yields, M ms waiting for Figma"` — the perf-line suffix for a loop. */
export function yieldStats(y: Yielder): string {
  const { yields, waitedMs } = y.stats();
  return `${yields} yields, ${waitedMs} ms waiting for Figma`;
}
