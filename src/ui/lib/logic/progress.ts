/**
 * Pure percentage/indeterminate logic for `progressBar.svelte`, pulled out so
 * it can be unit-tested without any Svelte component-render infrastructure
 * (this repo deliberately has none — see tasks 3/7/11/13).
 *
 * `total === null` (or `<= 0`) means the size isn't known yet — the caller
 * should render the indeterminate sliding animation instead of a fill.
 * Otherwise the percentage is rounded and clamped to `[0, 100]` so a stale
 * `loaded > total` (or a negative `loaded`) never overflows/underflows the
 * bar.
 */
export function computeProgressPercent(
  loaded: number,
  total: number | null,
): number | null {
  if (total === null || total <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
}

/**
 * The `3 / 10` counter shown beside a progress label, or `null` when there is
 * nothing truthful to count.
 *
 * An indeterminate stage (`total === null`) has no denominator — a single
 * upload request can't be subdivided, so it genuinely doesn't know. Rendering
 * `0 / …` there reads as a glitch (reported live: "the progress jumps from
 * 0/1 to 0/...") and, worse, invites the reader to believe nothing has
 * happened. The sliding bar already says "working"; the label should say what
 * is being worked on instead of pretending to count.
 */
export function formatProgressCount(loaded: number, total: number | null): string | null {
  if (total === null || total <= 0) return null;
  return `${Math.max(0, Math.min(loaded, total))} / ${total}`;
}
