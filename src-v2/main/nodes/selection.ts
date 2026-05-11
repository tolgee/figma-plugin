import type { NodeInfo } from "$shared/types";

import { getNodeInfo, setNodeInfo } from "./getNodeInfo";
import { scanConnectedNodes, scanSelectedTextNodes } from "./scan";

/**
 * Replace the rendered text of a `TextNode`. Figma requires every font used
 * in the node's existing text to be loaded before `characters` can be
 * assigned, otherwise the assignment throws. We load every distinct font
 * range in parallel and then write the new string in one go.
 *
 * Disables `autoRename` so the layer name doesn't follow the new text — the
 * Tolgee key is the source of truth for what the layer represents.
 */
export async function writeTextNode(
  node: TextNode,
  newText: string,
): Promise<void> {
  node.autoRename = false;
  const fonts = node.getRangeAllFontNames(0, node.characters.length);
  await Promise.all(fonts.map((f) => figma.loadFontAsync(f)));
  node.characters = newText;
}

/**
 * Returns the text nodes the UI should currently focus on:
 *
 * - If the active selection contains at least one text node (directly or
 *   nested), we return those text nodes with `basedOnSelection: true`.
 * - Otherwise we fall back to the full set of connected nodes on the page,
 *   with `basedOnSelection: false`.
 */
export const getSelectionInfo = async (): Promise<{
  nodes: NodeInfo[];
  basedOnSelection: boolean;
}> => {
  const selected = await scanSelectedTextNodes();
  if (selected.length > 0) {
    return {
      nodes: selected.map(getNodeInfo),
      basedOnSelection: true,
    };
  }

  const connected = await scanConnectedNodes();
  return {
    nodes: connected.map(getNodeInfo),
    basedOnSelection: false,
  };
};

export type NodeUpdate = {
  id: string;
  info: Partial<NodeInfo>;
};

/**
 * Apply a batch of partial `NodeInfo` updates. Each lookup goes through
 * `getNodeByIdAsync` because `documentAccess: "dynamic-page"` rules out the
 * synchronous variant. Non-text or missing nodes are skipped silently and do
 * not flip the result to `ok: false` — callers receive `ok: false` only when
 * an unexpected error escapes a single update.
 */
export const setNodesData = async (
  updates: NodeUpdate[],
): Promise<{ ok: boolean }> => {
  let ok = true;
  for (const update of updates) {
    try {
      const node = await figma.getNodeByIdAsync(update.id);
      if (node && node.type === "TEXT") {
        setNodeInfo(node, update.info);
      }
    } catch {
      ok = false;
    }
  }
  return { ok };
};

export type ApplyTranslationUpdate = {
  id: string;
  /** Final, ICU-formatted string to write into `TextNode.characters`. */
  text: string;
  /** Raw translation source to persist into plugin data. */
  translation: string;
  /** Optional plural flag; falls back to existing plugin data when omitted. */
  isPlural?: boolean;
};

/**
 * Pull-side counterpart to `setNodesData`. For each update we:
 *   1. resolve the node via the async API (dynamic-page safe),
 *   2. load every font present in the existing text and write `text`,
 *   3. persist the raw `translation` (and optional `isPlural`) into plugin
 *      data so future diffs work off the canonical source.
 *
 * The function never throws — per-node failures are collected into `errors`
 * so the UI can report them without aborting the whole batch.
 */
export const applyTranslations = async (
  updates: ApplyTranslationUpdate[],
): Promise<{ ok: boolean; errors: string[] }> => {
  const errors: string[] = [];
  let processed = 0;

  for (const update of updates) {
    try {
      const node = await figma.getNodeByIdAsync(update.id);
      if (!node || node.type !== "TEXT") {
        errors.push(`Node ${update.id} is not a text node`);
        continue;
      }
      await writeTextNode(node, update.text);
      const partial: Partial<NodeInfo> = { translation: update.translation };
      if (update.isPlural !== undefined) {
        partial.isPlural = update.isPlural;
      }
      setNodeInfo(node, partial);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Node ${update.id}: ${msg}`);
    }

    processed++;
    // Yield to the main thread every ~50 updates so very large batches don't
    // freeze the plugin sandbox.
    if (processed % 50 === 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  return { ok: errors.length === 0, errors };
};
