import type { NodeInfo } from "$shared/types";
import { formatIcuMessage } from "$shared/icu";
import type { PulledKey } from "$ui/lib/api/pull";

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

    // Treat empty remote translation as "no translation available". It would
    // be destructive to overwrite a local string with `""` just because the
    // server hasn't translated it for this language yet.
    if (remoteText === "") {
      unchangedNodes.push(node);
      continue;
    }

    if (
      remoteText !== node.translation ||
      remoteIsPlural !== Boolean(node.isPlural)
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

  // The plural parameter name varies by key. Without `@tginternal/editor`'s
  // `getTolgeeFormat` we can't reliably extract it from the ICU source here
  // (TODO: schema/library wiring), so we fall back to injecting a generic
  // "count" value AND any params the node already carries. `formatIcuMessage`
  // will throw if the message references a missing variable; the caller
  // handles that gracefully.
  if (node.pluralParamValue != null && !("count" in params)) {
    params.count = node.pluralParamValue;
  }

  const formatted = formatIcuMessage(remoteText, params, language || "en");

  if (formatted.error) {
    return { text: remoteText, error: formatted.error };
  }
  return { text: formatted.result };
}
