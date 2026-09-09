/**
 * Pure windowing math for a fixed-row-height virtualized list — pulled out
 * of `NodeList.svelte` so it's unit-testable without any Svelte
 * component-render infrastructure (this repo deliberately has none — see
 * tasks 3/7/11/13 in ukoly.md) and reusable by other windowed lists
 * (`CopyView.svelte`'s read-only selection list) without duplicating the
 * scroll-position → visible-range arithmetic.
 *
 * Callers own the actual `$state` (scrollTop, viewportHeight, rowHeight) —
 * this just turns those numbers into a start/end slice range plus the two
 * spacer heights that stand in for the rows outside it.
 */
export type VirtualWindow = {
  start: number;
  end: number;
  padTop: number;
  padBottom: number;
};

export function computeVirtualWindow(
  itemCount: number,
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  overscan: number,
): VirtualWindow {
  if (itemCount <= 0 || rowHeight <= 0) {
    return { start: 0, end: itemCount, padTop: 0, padBottom: 0 };
  }
  const start = Math.min(
    Math.max(0, Math.floor(scrollTop / rowHeight) - overscan),
    Math.max(0, itemCount - 1),
  );
  const end = Math.min(itemCount, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);
  return {
    start,
    end,
    padTop: start * rowHeight,
    padBottom: Math.max(0, itemCount - end) * rowHeight,
  };
}
