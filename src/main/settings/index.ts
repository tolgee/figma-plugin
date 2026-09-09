import type { TolgeeConfig } from "$shared/types";

import { mergeConfig, pickGlobalSettings, splitConfig } from "./merge";
import {
  deleteGlobalSettings,
  readDocumentSettings,
  readGlobalSettings,
  readPageSettings,
  writeDocumentSettings,
  writeGlobalSettings,
  writePageSettings,
} from "./storage";

/**
 * This plugin's manifest ships with `documentAccess: "dynamic-page"` (see
 * scripts/build-manifest.mjs), so pages must be `loadAsync()`-ed before their
 * pluginData is touched. A constant — the previous runtime probe read
 * `figma.documentAccess`, which does not exist in the Plugin API, so it was
 * always `false` and silently disabled every dynamic-page branch below.
 */
const DYNAMIC_PAGE_ACCESS = true;

/**
 * Merged-config cache. The config is read on EVERY selection scan (each
 * debounced selectionchange), and a miss costs a clientStorage async hop plus
 * three pluginData reads + JSON parses. All main-thread writes funnel through
 * `writeConfig`/`resetConfig`, and page scope changes with the current page —
 * those three events invalidate. (A second Figma window editing the shared
 * clientStorage mid-session is the one accepted miss.)
 */
let cachedConfig: Promise<Partial<TolgeeConfig>> | null = null;

export function invalidateConfigCache(): void {
  cachedConfig = null;
}

/**
 * Reads and merges settings from all three storage scopes (global ->
 * document -> page, right-wins).
 *
 * Under `documentAccess: "dynamic-page"`, the current page must be explicitly
 * loaded before its pluginData is safe to read.
 */
export async function readMergedConfig(): Promise<Partial<TolgeeConfig>> {
  if (!cachedConfig) {
    cachedConfig = readMergedConfigUncached();
    // Don't cache a failed read — the next caller retries.
    cachedConfig.catch(() => {
      cachedConfig = null;
    });
  }
  return cachedConfig;
}

async function readMergedConfigUncached(): Promise<Partial<TolgeeConfig>> {
  if (DYNAMIC_PAGE_ACCESS) {
    await figma.currentPage.loadAsync();
  }
  // Filter global to its legit keys so any document-level settings leaked into
  // global by an earlier build don't pre-fill this document.
  const global = pickGlobalSettings(await readGlobalSettings());
  const doc = readDocumentSettings();
  const page = readPageSettings(figma.currentPage);
  return mergeConfig(global, doc, page);
}

/**
 * Persists a partial config across the three storage scopes.
 *
 * The input is split by scope, merged onto the current persisted state of
 * each scope (right-wins so callers can supply partial updates), and the
 * combined result is written back. No notification is emitted from here —
 * the calling handler decides whether/how to notify subscribers.
 */
export async function writeConfig(partial: Partial<TolgeeConfig>): Promise<void> {
  invalidateConfigCache();
  const split = splitConfig(partial);

  if (DYNAMIC_PAGE_ACCESS) {
    await figma.currentPage.loadAsync();
  }

  const currentGlobal = await readGlobalSettings();
  const currentDoc = readDocumentSettings();
  const currentPage = readPageSettings(figma.currentPage);

  // `pickGlobalSettings` also drops any leaked document-level keys a previous
  // build may have written into global, cleaning them up on this save.
  const nextGlobal = pickGlobalSettings({ ...currentGlobal, ...split.global });
  const nextDoc = { ...currentDoc, ...split.doc };
  const nextPage = { ...currentPage, ...split.page };

  await writeGlobalSettings(nextGlobal);
  writeDocumentSettings(nextDoc);
  writePageSettings(figma.currentPage, nextPage);

  // Invalidate AGAIN, now that the writes have landed. The invalidation at the
  // top of this function only clears what was cached before it; every `await`
  // since is a window in which another event (a `selectionchange` scan, say)
  // can call `readMergedConfig` and cache the pre-write state. That stale
  // promise would then survive the save — reverting the form in the UI and
  // keeping the old ignore/prefill behaviour until something else happened to
  // invalidate.
  invalidateConfigCache();
}

/**
 * Clears persisted state across all three scopes, including every page in the
 * current document. Does not emit any events — callers handle notifications.
 */
export async function resetConfig(): Promise<void> {
  invalidateConfigCache();
  await deleteGlobalSettings();
  // Empty-object writes delete the underlying pluginData entry (see
  // `./storage.ts`).
  writeDocumentSettings({});

  // Iterate every page so settings written under "documentAccess: full"
  // (or by older versions of the plugin) don't get left behind. Each page
  // must be loaded before its pluginData is mutated under dynamic-page.
  for (const page of figma.root.children) {
    if (page.type !== "PAGE") continue;
    await page.loadAsync();
    writePageSettings(page, {});
  }
}
