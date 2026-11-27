import type { CopyStalenessResult } from "$main/handlers/createCopy";

/**
 * One-shot "this copy is fresh" answers for pages the plugin just created.
 *
 * A copy the plugin just built matches its source by construction, so the
 * CopyView's first staleness check on it (two full-page scans, ~2–6 s on the
 * customer-sized test file) is pure waste — it is answered from here instead,
 * ONCE. Nothing else is cached: a remembered answer went stale the moment the
 * user duplicated a frame on the source page outside the plugin (which the
 * plugin can't observe), and the banner then said "up to date" for minutes.
 * The user asked for a reliable banner over a faster page switch.
 */
export function createCopyStalenessCache() {
  const fresh = new Set<string>();
  return {
    /** The seeded answer for `pageId`, consumed on read — `null` otherwise. */
    take(pageId: string): CopyStalenessResult | null {
      if (!fresh.delete(pageId)) return null;
      return { ok: true, missingCount: 0, removedCount: 0 };
    },
    /** Mark pages the plugin just built as fresh (one answer each). */
    seedFresh(pageIds: readonly string[]): void {
      for (const id of pageIds) fresh.add(id);
    },
    clear(): void {
      fresh.clear();
    },
    size(): number {
      return fresh.size;
    },
  };
}

export type CopyStalenessCache = ReturnType<typeof createCopyStalenessCache>;
