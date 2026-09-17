import { TOLGEE_NODE_INFO } from "$shared/constants";
import type { NodeInfo } from "$shared/types";
import { type IgnoreSettings, shouldIgnoreNode } from "./filter";
import { getNodeInfo } from "./getNodeInfo";

/**
 * Return only the text nodes on the current page that carry our plugin data
 * key. The `pluginData.keys` filter is a 2024 addition to the Plugin API and
 * works with `api: 1.0.0` + `documentAccess: "dynamic-page"`, which is what
 * this plugin targets.
 */
export const scanConnectedNodes = async (): Promise<TextNode[]> => {
  await figma.currentPage.loadAsync();
  // TODO: yield periodically for huge documents once measurement exists.
  return figma.currentPage.findAllWithCriteria({
    types: ["TEXT"],
    pluginData: { keys: [TOLGEE_NODE_INFO] },
  });
};

/** Yield to the event loop after this many nodes' `NodeInfo` has been built —
 *  matches the interval `request-page-connected-nodes` used before progress
 *  reporting existed. */
const INFO_YIELD_EVERY = 50;

/** Progress is only reported (and the interim `page-connected-nodes-progress`
 *  message only sent) once a scan is large enough that the UI actually needs
 *  live feedback — small pages resolve near-instantly and the extra chatter
 *  would just be noise. Matches the guard used for other bulk operations
 *  (`nodes-set-progress`, `apply-translations-progress`). */
const PROGRESS_MIN_TOTAL = 100;

/** Walk up from a connected text node to the page root to find out whether
 *  any CONTAINER between it and the page is hidden — the same "ancestor
 *  hidden" concept `scanSelectedTextNodes` threads down during its recursive
 *  walk, needed for the opt-in "ignore hidden layers including children"
 *  filter. Unlike a full-document walk, this stays cheap here: it only ever
 *  runs once per node `findAllWithCriteria` already matched (i.e. bounded to
 *  the page's CONNECTED nodes), not once per node on the page. */
export function computeAncestorHidden(node: SceneNode): boolean {
  let parent = node.parent;
  while (parent && parent.type !== "PAGE") {
    if ("visible" in parent && parent.visible === false) return true;
    parent = parent.parent;
  }
  return false;
}

/**
 * Build a `NodeInfo` for every given text node, yielding to the event loop
 * every `INFO_YIELD_EVERY` nodes so a page-wide scan of thousands of connected
 * nodes doesn't freeze the canvas thread. `getNodeInfo` costs ~5 bridge reads
 * (incl. a full `characters` copy) per node.
 *
 * Nodes the user's ignore settings would exclude (hidden layers, digit-only
 * strings, prefixed layer names, …) are filtered out here too — a page-wide
 * "Download all" should skip exactly what a with-selection scan would skip,
 * rather than touching everything regardless of those settings.
 *
 * `onProgress` is called at each yield point with the running (scanned, not
 * kept) count, but only when `nodes.length > PROGRESS_MIN_TOTAL` — see that
 * constant's doc.
 */
export async function buildConnectedNodesInfo(
  nodes: TextNode[],
  settings: Partial<IgnoreSettings>,
  needsAncestorHidden: boolean,
  onProgress?: (done: number, total: number) => void,
): Promise<NodeInfo[]> {
  const total = nodes.length;
  const infos: NodeInfo[] = [];
  let scanned = 0;
  for (const node of nodes) {
    const characters = node.characters;
    const ancestorHidden = needsAncestorHidden ? computeAncestorHidden(node) : false;
    if (!shouldIgnoreNode(node, ancestorHidden, settings, characters)) {
      infos.push(getNodeInfo(node, characters));
    }
    scanned++;
    if (scanned % INFO_YIELD_EVERY === 0) {
      if (total > PROGRESS_MIN_TOTAL) {
        onProgress?.(scanned, total);
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  return infos;
}

/** A scanned text node plus whether any ANCESTOR within the scanned selection
 *  is hidden — computed once during traversal (threaded down), so the ignore
 *  filter never has to walk each node's parent chain (matches the original
 *  plugin's `ancestorHidden` approach; the per-node walk was "expensive"). */
export type ScannedTextNode = { node: TextNode; ancestorHidden: boolean };

// The plugin sandbox and the Figma canvas share scheduling — a long
// uninterrupted walk over a huge subtree freezes the whole editor. Yielding
// to the event loop every couple hundred visited nodes keeps Figma responsive
// while costing nothing on small selections (no yield ever fires).
const YIELD_EVERY = 200;

const collectTextNodes = async (
  node: SceneNode,
  out: ScannedTextNode[],
  ancestorHidden: boolean,
  progress: { visited: number },
  isStale: () => boolean,
): Promise<void> => {
  progress.visited++;
  if (progress.visited % YIELD_EVERY === 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    if (isStale()) return;
  }
  if (node.type === "TEXT") {
    out.push({ node, ancestorHidden });
    return;
  }
  if ("children" in node) {
    // A container's own hidden state makes its whole subtree "ancestor-hidden".
    const childAncestorHidden = ancestorHidden || node.visible === false;
    for (const child of node.children) {
      if (isStale()) return;
      await collectTextNodes(child, out, childAncestorHidden, progress, isStale);
    }
  }
};

/**
 * Walk the current selection and return every reachable `TextNode`, each tagged
 * with whether an ancestor inside the selection is hidden. Containers (frames,
 * groups, components, instances, …) are descended into so the user can select
 * an arbitrary subtree and still get all its text nodes back.
 *
 * Two strategies:
 * - FAST (default): `findAllWithCriteria` per selection root. The traversal
 *   runs inside the Figma engine — the JS side never touches the (often tens
 *   of thousands of) vector/shape nodes a design section contains, so a
 *   100-key section costs ~100 bridge crossings instead of ~100k. Usable
 *   whenever `ancestorHidden` isn't needed.
 * - RECURSIVE: JS walk that threads `ancestorHidden` down — required only for
 *   the opt-in "ignore hidden layers including children" filter, which needs
 *   to know whether any ancestor within the selection is hidden.
 */
export const scanSelectedTextNodes = async (
  needsAncestorHidden: boolean,
  // Superseded-scan check, polled at every yield. A newer selection makes the
  // running scan WORTHLESS — without bailing out it would keep burning canvas
  // time in the background, and rapid selection switches after a large
  // selection queued up "zombie" scans the new one had to wait behind.
  isStale: () => boolean = () => false,
): Promise<ScannedTextNode[]> => {
  // `figma.currentPage` is implicitly loaded — selection access requires it —
  // but calling `loadAsync` again is cheap and keeps the contract explicit.
  await figma.currentPage.loadAsync();
  const out: ScannedTextNode[] = [];

  if (!needsAncestorHidden) {
    let roots = 0;
    for (const node of figma.currentPage.selection) {
      if (isStale()) return out;
      if (node.type === "TEXT") {
        out.push({ node, ancestorHidden: false });
      } else if ("children" in node) {
        // Search per CHILD, not per root. One atomic `findAllWithCriteria`
        // on a whole design-system wall (tens of thousands of layers) blocks
        // the canvas for its entire duration — Figma can't even process a
        // deselect click, and the pending signal never flushes to the UI.
        // A wall's children are individual screens: each per-child search is
        // small and fast, and the breathers between them keep Figma
        // interactive AND give a superseding selection a place to abort.
        let children = 0;
        for (const child of node.children) {
          if (isStale()) return out;
          if (child.type === "TEXT") {
            out.push({ node: child, ancestorHidden: false });
          } else if ("findAllWithCriteria" in child) {
            const found = child.findAllWithCriteria({ types: ["TEXT"] });
            for (const text of found) {
              out.push({ node: text, ancestorHidden: false });
            }
          }
          children++;
          if (children % 10 === 0) {
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
          }
        }
      }
      roots++;
      if (roots % 25 === 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }
    return out;
  }

  const progress = { visited: 0 };
  for (const node of figma.currentPage.selection) {
    if (isStale()) return out;
    // Seed with the SELECTED ROOT's own ancestor state, not `false`. The walk
    // only ever looks downward, so selecting a visible text node or nested
    // frame from the Layers panel while one of its parents is hidden used to
    // start the traversal as if nothing above it were hidden — the text then
    // showed up and could be synchronised, while a page-wide scan correctly
    // excluded it via the same `computeAncestorHidden`.
    await collectTextNodes(node, out, computeAncestorHidden(node), progress, isStale);
  }
  return out;
};
