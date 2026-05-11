import type { NodeInfo } from "$shared/types";

import { getNodeInfo, setNodeInfo } from "./getNodeInfo";
import { scanConnectedNodes, scanSelectedTextNodes } from "./scan";

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
