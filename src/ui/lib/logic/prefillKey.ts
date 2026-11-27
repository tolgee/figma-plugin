import { formatKey, type KeyFormatContext, keyFormatUsesParents } from "$shared/keyFormat";
import type { NodeInfo, TolgeeConfig } from "$shared/types";

/**
 * Key prefill = a SUGGESTION shown in the UI, never a write on selection.
 *
 * It used to be persisted the moment a selection was scanned: every key-less
 * unconnected text got its format-generated key written into the document —
 * thousands of `setPluginData` calls interleaved with the scan on a large
 * selection, each one an undo step, a multiplayer sync and (on instance
 * sublayers) a component override. With several designers in one file, each
 * of them seeded the same suggestions into everybody's document. That was
 * the plugin's own share of the canvas stutter.
 *
 * Now the suggestion is computed here, overlaid onto the selection the UI
 * shows (`withSuggestedKeys`), and persisted only by a user action: an inline
 * edit, Connect, "Generate key names", or Push — which writes the suggested
 * keys of the strings it sends first (`persistSuggestedKeys`), because
 * screenshots and the connect-back need them in the document. The published
 * plugin worked the same way (its `usePrefilledKey` computed per row and
 * wrote nothing until push), so files round-trip between versions unchanged.
 *
 * Auto vs manual stays decided by the persisted `prefilledKey` marker:
 *   key === ""                       → suggestion shown
 *   key === prefilledKey (non-empty) → an UNTOUCHED auto key from an earlier
 *                                      write: the suggestion is recomputed from
 *                                      the CURRENT layer/format, so renames and
 *                                      format changes are followed
 *   anything else                    → the user's key, never touched
 */

/**
 * Builds the `formatKey` context from a node's fields.
 *
 * Single source of truth for the placeholder inputs, so BOTH the in-row prefill
 * and the "Generate key names" bulk action feed `formatKey` identical values —
 * including the parent placeholders ({component}/{frame}/{artboard}/{section}/
 * {group}), which are resolved main-side and left undefined when the node has
 * no such ancestor (or the format doesn't use one).
 */
export function keyContextForNode(node: NodeInfo): KeyFormatContext {
  return {
    elementName: node.name,
    elementText: node.characters,
    component: node.component,
    instance: node.instance,
    frame: node.frame,
    artboard: node.artboard,
    section: node.section,
    group: node.group,
  };
}

/** Any parent placeholder name resolved on this snapshot? The scan fills
 *  these only when the SAVED format uses them, so right after a format save
 *  the current snapshot may predate that scan — suggesting from it would show
 *  a partial key (`formatKey` drops empty placeholders). */
function hasParentContext(n: NodeInfo): boolean {
  return (
    n.component !== undefined ||
    n.instance !== undefined ||
    n.frame !== undefined ||
    n.artboard !== undefined ||
    n.section !== undefined ||
    n.group !== undefined
  );
}

/**
 * The format-generated key suggestion for a node under `config`, or "" when
 * there is none: prefill off, no format, or a parent-based format whose
 * parent names this snapshot doesn't carry yet (the follow-up scan delivers
 * them; a text with genuinely no eligible ancestor never prefills under such
 * a format — acceptable for the page-root edge case).
 */
export function suggestedKeyFor(
  node: NodeInfo,
  config: Partial<TolgeeConfig> | null | undefined,
): string {
  if (!config?.prefillKeyFormat || !config.keyFormat) return "";
  if (keyFormatUsesParents(config.keyFormat) && !hasParentContext(node)) return "";
  return formatKey(config.keyFormat, keyContextForNode(node), config.variableCasing);
}

/**
 * Does this node's key follow the suggestion? True for an unconnected node
 * with no key, or with an UNTOUCHED auto key (key === the `prefilledKey`
 * marker we wrote). A manually typed/edited key — or one with no marker, e.g.
 * written by the published plugin, which we can't prove we generated — is the
 * user's and is never overridden. Same rule `clearPrefilledKeys` applies.
 */
export function followsSuggestion(node: NodeInfo): boolean {
  if (node.connected) return false;
  const key = node.key ?? "";
  if (key === "") return true;
  const marker = node.prefilledKey ?? "";
  return marker !== "" && key === marker;
}

export type SuggestedKey = { key: string; ns: string };

type Overlay = { config: Partial<TolgeeConfig>; node: NodeInfo; pending: SuggestedKey | null };
// Per raw-node memo of its overlay under a given config object. The raw
// snapshots keep their identity across the streamed selection batches (only
// the ARRAY is rebuilt per batch) and across in-place patches of OTHER nodes,
// so a selection of thousands of texts formats each key once, not once per
// batch — and the overlaid node objects stay stable too (no row re-renders).
// Keyed weakly: snapshots that leave the selection are collected with it.
const overlayMemo = new WeakMap<NodeInfo, Overlay>();

/**
 * The selection as the UI shows it: every node that follows the suggestion
 * carries the CURRENT suggestion as its `key` (and the default namespace when
 * it has none), with the `prefilledKey` marker set so downstream rules still
 * see it as auto. `pending` lists the nodes whose shown key differs from the
 * stored one — exactly what has to be persisted before an action that reads
 * keys from the document (Push), see `persistSuggestedKeys`.
 *
 * Untouched nodes keep their object identity (the keyed list doesn't re-mount
 * them), and the input array itself is returned when nothing changes.
 */
export function withSuggestedKeys(
  nodes: NodeInfo[],
  config: Partial<TolgeeConfig> | null | undefined,
): { nodes: NodeInfo[]; pending: Map<string, SuggestedKey> } {
  const pending = new Map<string, SuggestedKey>();
  if (!config?.prefillKeyFormat || !config.keyFormat) return { nodes, pending };
  let changed = false;
  const out = nodes.map((n) => {
    let memo = overlayMemo.get(n);
    if (!memo || memo.config !== config) {
      memo = overlayFor(n, config);
      overlayMemo.set(n, memo);
    }
    if (memo.pending) {
      changed = true;
      pending.set(n.id, memo.pending);
    }
    return memo.node;
  });
  return { nodes: changed ? out : nodes, pending };
}

function overlayFor(n: NodeInfo, config: Partial<TolgeeConfig>): Overlay {
  if (!followsSuggestion(n)) return { config, node: n, pending: null };
  const key = suggestedKeyFor(n, config);
  // No suggestion (yet), or the stored auto key already IS the suggestion.
  if (!key || key === (n.key ?? "")) return { config, node: n, pending: null };
  const ns = n.ns ?? config.namespace ?? "";
  return { config, node: { ...n, key, ns, prefilledKey: key }, pending: { key, ns } };
}
