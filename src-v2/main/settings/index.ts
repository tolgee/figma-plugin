import type { TolgeeConfig } from "$shared/types";

import { mergeConfig, splitConfig } from "./merge";
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
 * Whether the active manifest opts in to dynamic-page loading. When `true`,
 * any page other than `figma.currentPage` must be `loadAsync()`-ed before its
 * pluginData/children can be read. We probe via duck-typing because the field
 * is only present on newer plugin-typings versions and we don't want a hard
 * dependency on it.
 */
function isDynamicPageAccess(): boolean {
  const access = (
    figma as unknown as { documentAccess?: string }
  ).documentAccess;
  return access === "dynamic-page";
}

/**
 * Reads and merges settings from all three storage scopes (global ->
 * document -> page, right-wins).
 *
 * Under `documentAccess: "dynamic-page"`, the current page must be explicitly
 * loaded before its pluginData is safe to read.
 */
export async function readMergedConfig(): Promise<Partial<TolgeeConfig>> {
  if (isDynamicPageAccess()) {
    await figma.currentPage.loadAsync();
  }
  const global = await readGlobalSettings();
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
export async function writeConfig(
  partial: Partial<TolgeeConfig>,
): Promise<void> {
  const split = splitConfig(partial);

  if (isDynamicPageAccess()) {
    await figma.currentPage.loadAsync();
  }

  const currentGlobal = await readGlobalSettings();
  const currentDoc = readDocumentSettings();
  const currentPage = readPageSettings(figma.currentPage);

  const nextGlobal = { ...currentGlobal, ...split.global };
  const nextDoc = { ...currentDoc, ...split.doc };
  const nextPage = { ...currentPage, ...split.page };

  await writeGlobalSettings(nextGlobal);
  writeDocumentSettings(nextDoc);
  writePageSettings(figma.currentPage, nextPage);
}

/**
 * Clears persisted state across all three scopes, including every page in the
 * current document. Does not emit any events — callers handle notifications.
 */
export async function resetConfig(): Promise<void> {
  await deleteGlobalSettings();
  // Empty-object writes delete the underlying pluginData entry (see
  // `./storage.ts`).
  writeDocumentSettings({});

  if (isDynamicPageAccess()) {
    // Iterate every page so settings written under "documentAccess: full"
    // (or by older versions of the plugin) don't get left behind. Each page
    // must be loaded before its pluginData is mutated under dynamic-page.
    for (const page of figma.root.children) {
      if (page.type !== "PAGE") continue;
      await page.loadAsync();
      writePageSettings(page, {});
    }
  } else {
    for (const page of figma.root.children) {
      if (page.type !== "PAGE") continue;
      writePageSettings(page, {});
    }
  }
}
