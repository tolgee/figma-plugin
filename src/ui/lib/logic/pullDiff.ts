import type { NodeInfo } from "$shared/types";
import type { PulledKey } from "$ui/lib/api/pull";
import { renderIcuForNode } from "$shared/interpolate";
import { plainCanvasText } from "$shared/richText";
import { nsKeyIndex } from "$ui/lib/logic/namespaces";

export type PullDiffResult = {
  /** Nodes whose remote translation differs from the local `translation`. */
  changedNodes: Array<{ node: NodeInfo; newText: string; isPlural: boolean }>;
  /** Connected nodes whose key is not present in the remote payload. */
  missingKeys: NodeInfo[];
  /** Connected nodes whose remote translation matches the local one. */
  unchangedNodes: NodeInfo[];
};

/**
 * Builds a lookup table of `ns|key` -> remote key. We index by namespace +
 * keyName because Tolgee allows the same key name across namespaces.
 *
 * Empty namespace and `undefined` namespace both map to `""` so lookup is
 * consistent regardless of whether the server omits the field.
 */
function indexRemote(remoteKeys: PulledKey[]): Map<string, PulledKey> {
  const map = new Map<string, PulledKey>();
  for (const k of remoteKeys) {
    const ns = k.keyNamespace ?? "";
    map.set(nsKeyIndex(ns, k.keyName), k);
  }
  return map;
}

/**
 * Compute the pull diff between local connected nodes and the remote
 * translations payload, for a single `language`.
 *
 * This deliberately compares raw text only — no ICU formatting is applied
 * here. Callers that need the final TextNode characters should run
 * `formatNodeText` per changed node afterwards (and surface the formatting
 * error to the user if any).
 *
 * Nodes that aren't connected to a key are ignored — they have nothing to
 * pull. Connected nodes without a remote key land in `missingKeys`.
 */
/**
 * Whether the canvas characters differ from what applying `remoteText` would
 * ACTUALLY write. The comparison must run the remote text through the same
 * pipeline the apply path uses — ICU render (quote unescaping, param
 * seeding), then the shared `plainCanvasText` markup strip (`<b>` becomes a
 * font range, not characters; `<br>` becomes "\n") — because comparing the
 * canvas against the RAW remote text made every formatted string look
 * permanently drifted and re-download as "changed" on every single pull.
 *
 * A render failure counts as "no drift": we can't know what the canvas
 * should look like, and re-applying on unknowns would loop forever too.
 */
function canvasDrifted(node: NodeInfo, remoteText: string, language: string): boolean {
  const out = renderIcuForNode(remoteText, node, language);
  if (out.error) return false;
  return node.characters !== plainCanvasText(out.text);
}

export function pullDiff(
  localNodes: NodeInfo[],
  remoteKeys: PulledKey[],
  language: string,
  namespacesEnabled = true,
): PullDiffResult {
  const remote = indexRemote(remoteKeys);

  const changedNodes: PullDiffResult["changedNodes"] = [];
  const missingKeys: NodeInfo[] = [];
  const unchangedNodes: NodeInfo[] = [];

  for (const node of localNodes) {
    if (!node.connected || !node.key) continue;

    // With namespaces disabled on the project the write pipeline ignores the
    // node's stored `ns` (keys live in the default namespace), so the lookup
    // must too — a stale invisible ns would otherwise land the node in
    // `missingKeys` and silently skip its update. Mirrors push + the
    // stale-link check (`effectiveNs`).
    const ns = namespacesEnabled ? (node.ns ?? "") : "";
    const remoteKey = remote.get(nsKeyIndex(ns, node.key));

    if (!remoteKey) {
      missingKeys.push(node);
      continue;
    }

    const remoteText = remoteKey.translations[language]?.text ?? "";
    const remoteIsPlural = remoteKey.isPlural;

    // Treat an empty remote translation the same way the legacy plugin did:
    // surface it as "missing" so the user sees they need to translate the
    // key in Tolgee. Overwriting a local string with `""` would be
    // destructive, so we don't fall into the changedNodes bucket either.
    if (!remoteText) {
      missingKeys.push(node);
      continue;
    }

    if (remoteText !== node.translation || remoteIsPlural !== Boolean(node.isPlural)) {
      changedNodes.push({
        node,
        newText: remoteText,
        isPlural: remoteIsPlural,
      });
    } else if (
      // The cached translation matches the remote, but the rendered canvas
      // characters have drifted (e.g. someone typed over the layer manually).
      // For non-plural / non-parametric keys we can safely re-apply the
      // remote text so the canvas matches the source of truth again.
      //
      // The plural/params exclusion is LOAD-BEARING, not caution — do not
      // relax it to "rescue" stale nodes. Drift is measured by rendering the
      // remote text with the node's own sample, and a node migrated from the
      // published plugin has no usable sample: that plugin stored the argument
      // NAME in `pluralParamValue` (its own bug, see interpolate.ts), which
      // `numericCount` rejects, so the sample falls back to 1. A migrated
      // layer reading "10 days" therefore renders as "1 day", looks drifted,
      // and re-applying would overwrite the design with the wrong plural form
      // on every pull. Same for a parametric string with no stored params.
      //
      // Skip if `characters` is empty — that's not real drift, it just means
      // the node hasn't been rendered yet (typical in tests / fresh syncs).
      node.characters &&
      !remoteIsPlural &&
      !node.isPlural &&
      (!node.paramsValues || Object.keys(node.paramsValues).length === 0) &&
      canvasDrifted(node, remoteText, language)
    ) {
      changedNodes.push({
        node,
        newText: remoteText,
        isPlural: remoteIsPlural,
      });
    } else {
      unchangedNodes.push(node);
    }
  }

  return { changedNodes, missingKeys, unchangedNodes };
}

/**
 * Renders the final string that will land in `TextNode.characters` for a
 * single pulled translation, via the shared render core (`renderIcuForNode`).
 * For a plural, the variable's sample COUNT comes from the node (so each layer
 * keeps its own form — "1 woman" / "10 women"), the variable NAME from the ICU,
 * and any other named param is seeded with its own name so nothing renders as a
 * literal `{brace}`.
 *
 * On a formatting error, keeps the node's CURRENT canvas text (never dumps raw
 * ICU onto the design) and returns the captured `Error` so the caller can warn
 * — matching the original pull behaviour.
 */
export function formatNodeText(
  node: NodeInfo,
  remoteText: string,
  language: string,
): { text: string; error?: Error } {
  const out = renderIcuForNode(remoteText, node, language);
  return out.error ? { text: node.characters, error: out.error } : out;
}

/** One node's payload for the `apply-translations` message. */
export type ApplyUpdate = {
  id: string;
  text: string;
  translation: string;
  isPlural: boolean;
};

/**
 * Split a pull diff into the updates that can actually be written and the
 * nodes whose ICU wouldn't render.
 *
 * A failed render must NOT travel on: `formatNodeText` falls back to the
 * node's CURRENT canvas text (deliberately — raw ICU never gets dumped onto
 * the design), so sending it would rewrite the text that is already there
 * while persisting `translation` as the new remote value. The node then looks
 * up to date FOREVER — the next diff finds the cached translation matching the
 * remote, and `canvasDrifted` reports no drift because it trips over the very
 * same render error — so the copy can never retry it, and the download claims
 * a success it did not deliver.
 *
 * Callers are expected to surface `skipped`; silently dropping those nodes
 * would just be the old bug with fewer writes.
 */
export function buildApplyUpdates(
  changedNodes: PullDiffResult["changedNodes"],
  language: string,
): { updates: ApplyUpdate[]; skipped: Array<{ node: NodeInfo; error: Error }> } {
  const updates: ApplyUpdate[] = [];
  const skipped: Array<{ node: NodeInfo; error: Error }> = [];

  for (const { node, newText, isPlural } of changedNodes) {
    const { text, error } = formatNodeText(node, newText, language);
    if (error) {
      skipped.push({ node, error });
      continue;
    }
    updates.push({ id: node.id, text, translation: newText, isPlural });
  }

  return { updates, skipped };
}

/** User-facing summary of the nodes a render failure kept out of the write. */
export function skippedRenderMessage(
  skipped: Array<{ node: NodeInfo; error: Error }>,
): string {
  const noun = skipped.length === 1 ? "string" : "strings";
  const names = skipped
    .slice(0, 3)
    .map((s) => s.node.key || s.node.name)
    .join(", ");
  const more = skipped.length > 3 ? `, +${skipped.length - 3} more` : "";
  return `${skipped.length} ${noun} could not be rendered and ${
    skipped.length === 1 ? "was" : "were"
  } left unchanged (${names}${more}).`;
}
