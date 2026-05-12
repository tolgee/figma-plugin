/**
 * Briefly recolors a TextNode pink so the user can spot it after a
 * `scrollAndZoomIntoView`. Tiny strings in large frames vanish even at full
 * zoom; the pulse is a 500 ms affordance that survived the rewrite as a
 * regression and is restored here.
 *
 * `node.fills` may be `figma.mixed` when the user has manually styled ranges
 * differently. In that case we leave fills untouched — overwriting them with
 * a single SolidPaint would silently flatten the user's work, which is much
 * worse than skipping the pulse.
 *
 * The original-fill snapshot is kept in `pending` so:
 *   - Repeated highlights of the same node coalesce (no growing chain of
 *     pending restores).
 *   - `cleanUp()` can restore everything if the plugin closes mid-pulse.
 */

const HIGHLIGHT_FILL: SolidPaint = {
  type: "SOLID",
  color: { r: 1, g: 0.41, b: 0.58 },
};

const PULSE_MS = 500;

type Pending = {
  /** The fills array we captured before applying the highlight. */
  originalFills: ReadonlyArray<Paint>;
  /** Timer id so we can clear it on re-pulse / cleanup. */
  timer: ReturnType<typeof setTimeout>;
};

const pending = new Map<string, Pending>();

export async function highlightNode(id: string): Promise<void> {
  if (figma.editorType !== "figma") return;
  const node = await figma.getNodeByIdAsync(id);
  if (!node || node.type !== "TEXT") return;

  figma.viewport.scrollAndZoomIntoView([node]);

  const fills = node.fills;
  if (fills === figma.mixed) {
    // Range-specific fills: don't risk flattening them.
    return;
  }

  // If a previous pulse is still active for this node, reuse its captured
  // original fills (they pre-date OUR overwrite) and reset the timer.
  const previous = pending.get(id);
  const originalFills = previous?.originalFills ?? (fills as ReadonlyArray<Paint>);
  if (previous) clearTimeout(previous.timer);

  node.fills = [HIGHLIGHT_FILL];
  const timer = setTimeout(() => {
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    // The node may have been deleted while the timer was waiting. Guard
    // every property access so the restore can't throw.
    try {
      if (node.removed) return;
      node.fills = entry.originalFills as Paint[];
    } catch {
      /* node went away or fills are no longer writable — give up silently */
    }
  }, PULSE_MS);

  pending.set(id, { originalFills, timer });
}

/**
 * Restore every still-pulsing node's original fills. Called from the plugin's
 * `close` hook so an unexpected exit doesn't leave layers stuck pink.
 */
export function cleanUpHighlights(): void {
  for (const [id, entry] of pending) {
    clearTimeout(entry.timer);
    try {
      const node = figma.getNodeById(id);
      if (node && node.type === "TEXT" && !node.removed) {
        node.fills = entry.originalFills as Paint[];
      }
    } catch {
      /* swallow — best-effort cleanup */
    }
  }
  pending.clear();
}
