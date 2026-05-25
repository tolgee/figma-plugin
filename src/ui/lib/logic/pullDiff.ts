import { formatIcuMessage } from "$shared/icu";
import type { NodeInfo } from "$shared/types";
import type { PulledKey } from "$ui/lib/api/pull";
import { getTolgeeFormat } from "$ui/lib/logic/tolgeeFormat";

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
    map.set(`${ns}|${k.keyName}`, k);
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
export function pullDiff(
  localNodes: NodeInfo[],
  remoteKeys: PulledKey[],
  language: string,
): PullDiffResult {
  const remote = indexRemote(remoteKeys);

  const changedNodes: PullDiffResult["changedNodes"] = [];
  const missingKeys: NodeInfo[] = [];
  const unchangedNodes: NodeInfo[] = [];

  for (const node of localNodes) {
    if (!node.connected || !node.key) continue;

    const ns = node.ns ?? "";
    const remoteKey = remote.get(`${ns}|${node.key}`);

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
      // For simple, non-plural / non-parametric keys we can safely re-apply
      // the remote text so the canvas matches the source of truth again.
      // Skip if `characters` is empty — that's not real drift, it just means
      // the node hasn't been rendered yet (typical in tests / fresh syncs).
      node.characters &&
      node.characters !== remoteText &&
      !remoteIsPlural &&
      !node.isPlural &&
      (!node.paramsValues || Object.keys(node.paramsValues).length === 0)
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
 * single pulled translation. Uses the node's known param values plus the
 * plural parameter (filled with `pluralParamValue ?? "1"`).
 *
 * On any ICU error the raw `remoteText` is returned with the captured
 * `Error` so the UI can warn but still write a sensible string.
 */
export function formatNodeText(
  node: NodeInfo,
  remoteText: string,
  language: string,
): { text: string; error?: Error } {
  const params: Record<string, string> = { ...(node.paramsValues ?? {}) };

  // The plural parameter name varies by key. Parse the remote ICU once to
  // discover the actual parameter name and inject `pluralParamValue` under
  // that name. If parsing fails (e.g. non-plural / malformed), fall back to
  // the conventional `count` so we still feed *something* sensible into
  // `formatIcuMessage` — it'll throw on a missing variable and the caller
  // surfaces the error.
  if (node.pluralParamValue != null) {
    const parsed = getTolgeeFormat(remoteText, Boolean(node.isPlural), false);
    const paramName = parsed.parameter ?? "count";
    if (!(paramName in params)) {
      params[paramName] = node.pluralParamValue;
    }
  }

  const formatted = formatIcuMessage(remoteText, params, language || "en");

  if (formatted.error) {
    return { text: remoteText, error: formatted.error };
  }
  return { text: formatted.result };
}
