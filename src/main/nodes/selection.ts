import { keyFormatUsesParents } from "$shared/keyFormat";
import type { NodeInfo } from "$shared/types";

import { readMergedConfig } from "$main/settings";
import { applyRichText } from "$main/text/applyRichText";
import { shouldIgnoreNode } from "./filter";
import { getNodeInfo, setNodeInfo } from "./getNodeInfo";
import { type MainComponentNameCache, resolveParentNames } from "./nodeParents";
import { scanSelectedTextNodes } from "./scan";

/**
 * Replace the rendered text of a `TextNode`, applying Tolgee's inline
 * formatting tags (`<b>` / `<i>` / `<u>` / `<br>`) to the corresponding
 * character ranges. See `$main/text/applyRichText` for the parsing details.
 *
 * Disables `autoRename` (via `applyRichText`) so the layer name doesn't
 * follow the new text — the Tolgee key is the source of truth.
 */
export async function writeTextNode(node: TextNode, newText: string): Promise<void> {
  await applyRichText(node, newText);
}

/**
 * Returns the text nodes the UI should currently focus on — always strictly
 * the user's selection:
 *
 * - If the user has a selection, we return the text nodes inside it (possibly
 *   an empty list, e.g. a frame with no text). Each is run through
 *   `shouldIgnoreNode` so the "ignore numbers / hidden layers / prefixed layer
 *   names" settings prune what shows up. The filter applies UNIFORMLY — a
 *   connected string in a hidden layer is hidden too, matching the original
 *   plugin (`findTextNodesInfo` runs the same `shouldIncludeNode` on every node,
 *   with no exception for connected ones).
 * - If nothing is selected, we return an empty list — we deliberately do NOT
 *   scan the whole page. On large files that page-wide `findAllWithCriteria`
 *   scan is a real performance hit, and silently listing the entire document
 *   is rarely what the user wants. The UI shows a "select something" empty
 *   state instead. Page-wide work still happens on demand in the Download/Pull
 *   flow via the dedicated `request-page-connected-nodes` path.
 */
/** Nodes per streamed `onBatch` delivery. Large enough that per-batch
 *  overhead (parent resolve + message) amortises, small enough that the
 *  first rows reach the UI within a fraction of a second. */
const SELECTION_BATCH_SIZE = 100;

export const getSelectionInfo = async (
  // Superseded-scan probe (see `scanSelectedTextNodes`): checked at every
  // yield so an outdated scan stops burning canvas time as soon as a newer
  // selection arrives. The caller discards the partial result.
  isStale: () => boolean = () => false,
  // Streamed delivery: called with each completed batch of NodeInfos (parent
  // placeholders already resolved for the batch). Building info for
  // thousands of nodes costs many seconds of bridge work — without
  // streaming the UI showed NOTHING until the whole selection finished.
  onBatch?: (nodes: NodeInfo[], first: boolean) => void,
): Promise<{
  nodes: NodeInfo[];
  basedOnSelection: boolean;
}> => {
  const hasUserSelection = figma.currentPage.selection.length > 0;
  if (!hasUserSelection) {
    return { nodes: [], basedOnSelection: false };
  }

  // Config first (cached) — it decides the scan strategy: `ancestorHidden`
  // is only consumed by the opt-in "including children" hidden filter, and
  // skipping it unlocks the engine-side `findAllWithCriteria` fast path.
  const config = await readMergedConfig();
  const needsAncestorHidden = Boolean(
    (config.ignoreHiddenLayers ?? true) && config.ignoreHiddenLayersIncludingChildren,
  );
  // Parent key-format placeholders ({component}/{frame}/…) are resolved only
  // when prefill is on AND the format actually uses one — a plain key format
  // adds zero traversal cost.
  const needsParents = Boolean(config.prefillKeyFormat && keyFormatUsesParents(config.keyFormat));
  // Shared per-scan cache: text nodes under the same INSTANCE ancestor
  // resolve its main component once instead of once each.
  const mainComponentNames: MainComponentNameCache = new Map();

  const selected = await scanSelectedTextNodes(needsAncestorHidden, isStale);
  if (isStale()) return { nodes: [], basedOnSelection: true };

  const all: NodeInfo[] = [];
  let batch: { node: TextNode; info: NodeInfo }[] = [];
  let firstBatch = true;

  // Complete a batch: resolve its parent placeholders (sequential with
  // yields — a parallel burst of ancestor walks blocks the canvas), then
  // hand it to the caller. Returns false when superseded mid-way.
  const flushBatch = async (): Promise<boolean> => {
    if (batch.length === 0) return true;
    if (needsParents) {
      let resolved = 0;
      for (const { node, info } of batch) {
        const parents = await resolveParentNames(node, mainComponentNames);
        info.component = parents.component;
        info.instance = parents.instance;
        info.frame = parents.frame;
        info.artboard = parents.artboard;
        info.section = parents.section;
        info.group = parents.group;
        resolved++;
        if (resolved % 25 === 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
          if (isStale()) return false;
        }
      }
    }
    const infos = batch.map(({ info }) => info);
    all.push(...infos);
    batch = [];
    onBatch?.(infos, firstBatch);
    firstBatch = false;
    return true;
  };

  // Filter BEFORE building NodeInfo — `getNodeInfo` costs ~5 bridge calls per
  // node (pluginData + name + …), which ignored nodes must not pay. One loop
  // so `characters` crosses the bridge once per node (filter + info share it),
  // with periodic yields — thousands of kept nodes are tens of thousands of
  // bridge calls, and doing them unbroken visibly froze the canvas.
  let scanned = 0;
  for (const { node, ancestorHidden } of selected) {
    const characters = node.characters;
    if (!shouldIgnoreNode(node, ancestorHidden, config, characters)) {
      batch.push({ node, info: getNodeInfo(node, characters) });
    }
    scanned++;
    if (scanned % 50 === 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      if (isStale()) return { nodes: all, basedOnSelection: true };
    }
    if (batch.length >= SELECTION_BATCH_SIZE) {
      if (!(await flushBatch())) return { nodes: all, basedOnSelection: true };
    }
  }
  if (!(await flushBatch())) return { nodes: all, basedOnSelection: true };

  return { nodes: all, basedOnSelection: true };
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
 *
 * Returns the fresh post-write `NodeInfo` snapshots (we already hold the node
 * reference, so this costs no extra lookups). The UI patches its selection
 * from these instead of the main thread re-scanning the whole selection.
 *
 * `onProgress` is invoked at each yield point with the running count, but
 * only when `updates.length > 100` — same guard as `applyTranslations` /
 * `buildConnectedNodesInfo` (small batches finish fast enough that progress
 * messages would just be noise, and the UI's bulk action bar shouldn't flash
 * busy for an instant write).
 */
export const setNodesData = async (
  updates: NodeUpdate[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: boolean; nodes: NodeInfo[] }> => {
  let ok = true;
  const nodes: NodeInfo[] = [];
  const total = updates.length;
  let processed = 0;
  for (const update of updates) {
    try {
      const node = await figma.getNodeByIdAsync(update.id);
      if (node && node.type === "TEXT") {
        // `setNodeInfo` already returns the exact post-write snapshot — no
        // second pluginData read needed.
        nodes.push(setNodeInfo(node, update.info));
      }
    } catch {
      ok = false;
    }
    processed++;
    // Yield every ~50 updates so a bulk write over a large selection doesn't
    // starve the canvas thread (pluginData-only writes are cheap).
    if (processed % 50 === 0) {
      if (total > 100) {
        onProgress?.(processed, total);
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  return { ok, nodes };
};

export type ApplyTranslationUpdate = {
  id: string;
  /** Final, ICU-formatted string to write into `TextNode.characters`. */
  text: string;
  /** Raw translation source to persist into plugin data. */
  translation: string;
  /** Optional plural flag; falls back to existing plugin data when omitted. */
  isPlural?: boolean;
  pluralParamValue?: string;
  paramsValues?: Record<string, string>;
  key?: string;
  ns?: string;
  connected?: boolean;
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
 *
 * `onProgress` is invoked at each yield point with the running count, but
 * only when `updates.length > 100` — same guard as `buildConnectedNodesInfo`
 * (small batches finish fast enough that progress messages would just be
 * noise). It doubles as the UI watchdog's "still alive" signal.
 */
export const applyTranslations = async (
  updates: ApplyTranslationUpdate[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: boolean; errors: string[]; nodes: NodeInfo[] }> => {
  const errors: string[] = [];
  const nodes: NodeInfo[] = [];
  const total = updates.length;
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
      if (update.isPlural !== undefined) partial.isPlural = update.isPlural;
      if (update.pluralParamValue !== undefined) {
        partial.pluralParamValue = update.pluralParamValue;
      }
      if (update.paramsValues !== undefined) {
        partial.paramsValues = update.paramsValues;
      }
      if (update.key !== undefined) partial.key = update.key;
      if (update.ns !== undefined) partial.ns = update.ns;
      if (update.connected !== undefined) partial.connected = update.connected;
      nodes.push(setNodeInfo(node, partial));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Node ${update.id}: ${msg}`);
    }

    processed++;
    // Each update is a real canvas mutation (font loads + `characters`
    // relayout), so breathe every few nodes — 50 unbroken text rewrites was
    // hundreds of ms of canvas-thread blocking on real frames.
    if (processed % 10 === 0) {
      if (total > 100) {
        onProgress?.(processed, total);
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  return { ok: errors.length === 0, errors, nodes };
};
