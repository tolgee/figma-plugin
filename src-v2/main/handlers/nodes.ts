import type { NodeInfo } from "$shared/types";

// TODO: Walk the current page (or document) and collect nodes that carry
// Tolgee plugin data (TOLGEE_NODE_INFO). Should return shape-stable NodeInfo
// records the UI can consume without further roundtrips.
export async function scanConnectedNodes(): Promise<NodeInfo[]> {
  // TODO
  return [];
}

// TODO: Persist node data (key, namespace, etc.) into pluginData on each node.
// Should accept a batch and handle missing nodes / type mismatches gracefully.
export async function setNodesData(_nodes: NodeInfo[]): Promise<void> {
  // TODO
}
