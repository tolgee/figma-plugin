import { TOLGEE_NODE_INFO } from "$shared/constants";
import type { NodeInfo } from "$shared/types";
import { type IgnoreSettings, shouldIgnoreNode } from "./filter";
import { getNodeInfo, readPersistedNodeInfo } from "./getNodeInfo";
import { createYielder, type Yielder } from "./yield";

/**
 * Every TEXT node under `root` that carries our plugin data — including data
 * INHERITED from a main component, which the engine's `pluginData` search
 * criteria alone misses (it only matches data STORED on the node itself; a
 * text inside a component INSTANCE answers `getPluginData` with the main
 * component's record without storing anything of its own). Every page-wide
 * operation built on the bare criteria (language/keys copy, "Download all",
 * copy staleness) silently missed keys connected in the main component: a
 * fresh language copy kept those strings in the source language while a
 * Download with the same strings SELECTED translated them.
 *
 * Two engine-side searches, then inheritance resolved from IDS wherever the
 * page allows it: an instance sublayer's id spells out the chain of nodes it
 * inherits from (`"I<instance>;<mainNode>"`, nested instances add segments —
 * see `inheritanceChain`). When those nodes are on this page, the directly
 * tagged set already answers (tagged main → tagged sublayer, plain main →
 * plain sublayer) with zero bridge reads. Only a sublayer whose main
 * component lives elsewhere (another page, a library) is actually probed
 * with `getPluginData`. Real design pages are mostly instances of LOCAL
 * components, so this stays at two engine calls where probing every instance
 * text — let alone every text — froze exactly the huge documents the
 * inheritance fix was added for.
 *
 * `root` must be loaded (`loadAsync`) by the caller under dynamic-page access.
 */
/** Anything `findAllWithCriteria` runs on — a page, or one of its frames
 *  (the per-frame diff behind "Update changed frames"). */
export type SearchRoot = Pick<PageNode, "findAllWithCriteria">;

export async function findTaggedTextNodes(
  root: SearchRoot,
  yieldBudgetMs?: number,
): Promise<TextNode[]> {
  // Directly stored data: fully engine-side, one call.
  const direct = new Set(
    root
      .findAllWithCriteria({ types: ["TEXT"], pluginData: { keys: [TOLGEE_NODE_INFO] } })
      .map((n) => n.id),
  );
  const texts = root.findAllWithCriteria({ types: ["TEXT"] });
  const onPage = new Set(texts.map((n) => n.id));
  const tagged: TextNode[] = [];
  // Time-sliced (see `yield.ts`): a page-wide pass over a huge page can't
  // freeze the canvas, but doesn't pay a fixed per-N-nodes yield tax either.
  const yielder = createYielder(yieldBudgetMs);
  for (const node of texts) {
    if (direct.has(node.id)) {
      tagged.push(node);
      continue;
    }
    // Only an instance sublayer can INHERIT plugin data from its main
    // component — everything else without direct data is untagged for sure.
    if (!node.id.startsWith("I")) continue;
    const verdict = inheritedTagVerdict(node.id, direct, onPage);
    if (verdict === "tagged") {
      tagged.push(node);
      continue;
    }
    if (verdict === "untagged") continue;
    // The chain leaves this page — only the node itself can tell.
    if (node.getPluginData(TOLGEE_NODE_INFO)) tagged.push(node);
    await yielder.maybeYield();
  }
  return tagged;
}

/**
 * The nodes an instance sublayer inherits plugin data from, nearest first.
 * `"I<a>;<b>;<c>"` is the sublayer of instance `a` that mirrors node `b`'s
 * sublayer `"I<b>;<c>"` in a's main component, which in turn mirrors node
 * `"<c>"` in b's main component — each link may carry its own (override)
 * data, and the nearest one that does wins. Empty for a non-instance id.
 */
export function inheritanceChain(id: string): string[] {
  if (!id.startsWith("I")) return [];
  const segments = id.slice(1).split(";");
  const chain: string[] = [];
  for (let i = 1; i < segments.length; i++) {
    const rest = segments.slice(i);
    chain.push(rest.length > 1 ? `I${rest.join(";")}` : (rest[0] as string));
  }
  return chain;
}

/** Decide a sublayer's tag from its chain: the first link with direct data
 *  makes it tagged; a link that isn't on this page makes it unknowable from
 *  ids alone; a chain fully on the page with no data makes it untagged. */
function inheritedTagVerdict(
  id: string,
  direct: ReadonlySet<string>,
  onPage: ReadonlySet<string>,
): "tagged" | "untagged" | "unknown" {
  for (const link of inheritanceChain(id)) {
    if (direct.has(link)) return "tagged";
    if (!onPage.has(link)) return "unknown";
  }
  return "untagged";
}

/**
 * The text nodes on the current page that carry our plugin data key — read per
 * node (see `findTaggedTextNodes` for why the engine's pluginData criteria is
 * not enough).
 */
export const scanConnectedNodes = async (): Promise<TextNode[]> => {
  await figma.currentPage.loadAsync();
  return findTaggedTextNodes(figma.currentPage);
};

/** A connected node's key identity only — no `characters`, `visible`, name or
 *  ignore-filter, the fields `getNodeInfo`/`buildConnectedNodesInfo` cost real
 *  bridge reads building just to have them unused. */
export type ConnectedKeyRef = {
  key: string;
  ns?: string;
  /** The node's sample ICU values (what `{name}` / the plural count render
   *  as on canvas). Carried so a Recreate / Update keeps the values the user
   *  set ON THE COPY instead of resetting them to the source page's. */
  paramsValues?: Record<string, string>;
  pluralParamValue?: string;
};

/**
 * The CONNECTED key (namespace + name) of every tagged node on `page` — the
 * minimum a caller needs to know "which Tolgee keys does this page use"
 * (e.g. to pre-fetch their translations) without paying for a full
 * `NodeInfo` per node. `findTaggedTextNodes` already narrows to tagged nodes
 * cheaply (engine criteria ∪ instance-sublayer probe); this reads each one's
 * pluginData ONCE (the probe above doesn't keep the parsed value) and keeps
 * only `key`/`ns`, skipping `characters`/`visible`/name entirely and the
 * ignore-settings filter (not needed for "what to pre-fetch" — a miss here
 * is covered by `topUpCopyTranslations` reading the real clone afterwards).
 *
 * `page` must be loaded (`loadAsync`) by the caller under dynamic-page access.
 */
export async function collectConnectedKeyRefs(page: SearchRoot): Promise<ConnectedKeyRef[]> {
  const tagged = await findTaggedTextNodes(page);
  const refs: ConnectedKeyRef[] = [];
  const yielder = createYielder();
  for (const node of tagged) {
    const raw = node.getPluginData(TOLGEE_NODE_INFO);
    await yielder.maybeYield();
    if (!raw) continue;
    try {
      const data = JSON.parse(raw) as {
        connected?: boolean;
        key?: string;
        ns?: string;
        paramsValues?: Record<string, string>;
        pluralParamValue?: string;
      };
      if (data.connected && data.key) {
        const ref: ConnectedKeyRef = { key: data.key, ns: data.ns };
        if (data.paramsValues && Object.keys(data.paramsValues).length > 0) {
          ref.paramsValues = data.paramsValues;
        }
        if (data.pluralParamValue) ref.pluralParamValue = data.pluralParamValue;
        refs.push(ref);
      }
    } catch {
      // unparseable pluginData — skip this node
    }
  }
  return refs;
}

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
 * The full `NodeInfo` of `node` if it is CONNECTED to a key and not excluded
 * by the ignore settings — `null` otherwise. Reads pluginData FIRST (one
 * bridge call) and only pays for `characters`/`name`/`visible` on nodes that
 * passed the connected gate, so the unconnected majority of a large page's
 * tagged nodes (stale prefill leftovers) costs one read each instead of ~5.
 *
 * Order of the two gates doesn't change the outcome — a node has to pass both
 * either way — only what gets read before it's thrown away.
 */
export function readConnectedNodeInfo(
  node: TextNode,
  settings: Partial<IgnoreSettings>,
  needsAncestorHidden: boolean,
): NodeInfo | null {
  const persisted = readPersistedNodeInfo(node);
  if (!persisted.connected || !persisted.key) return null;
  const characters = node.characters;
  const ancestorHidden = needsAncestorHidden ? computeAncestorHidden(node) : false;
  if (shouldIgnoreNode(node, ancestorHidden, settings, characters)) return null;
  return getNodeInfo(node, characters, persisted);
}

/**
 * Build a `NodeInfo` for every given text node that is CONNECTED to a key
 * (see `readConnectedNodeInfo` — unconnected tagged nodes are dropped after a
 * single pluginData read), yielding to the event loop by TIME (see
 * `yield.ts`) so a page-wide scan of thousands of nodes doesn't freeze the
 * canvas thread without paying a fixed per-N-nodes yield tax.
 *
 * Nodes the user's ignore settings would exclude (hidden layers, digit-only
 * strings, prefixed layer names, …) are filtered out here too — a page-wide
 * "Download all" should skip exactly what a with-selection scan would skip,
 * rather than touching everything regardless of those settings.
 *
 * `onProgress` is called at each yield point with the running (scanned, not
 * kept) count, and once more with `done === total` at the end, but only when
 * `nodes.length > PROGRESS_MIN_TOTAL` — see that constant's doc.
 *
 * `yielder` is injectable for tests (a fake clock makes the cadence
 * deterministic); production uses the default time budget.
 */
export async function buildConnectedNodesInfo(
  nodes: TextNode[],
  settings: Partial<IgnoreSettings>,
  needsAncestorHidden: boolean,
  onProgress?: (done: number, total: number) => void,
  yielder: Yielder = createYielder(),
): Promise<NodeInfo[]> {
  const total = nodes.length;
  const infos: NodeInfo[] = [];
  const reportProgress = total > PROGRESS_MIN_TOTAL;
  let scanned = 0;
  let reported = 0;
  for (const node of nodes) {
    const info = readConnectedNodeInfo(node, settings, needsAncestorHidden);
    if (info) infos.push(info);
    scanned++;
    if (reportProgress && (await yielder.maybeYield())) {
      onProgress?.(scanned, total);
      reported = scanned;
    }
  }
  // The UI's watchdog/progress bar wants a terminal `done === total`, which
  // a time-sliced loop doesn't naturally land on.
  if (reportProgress && reported !== total) onProgress?.(total, total);
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
