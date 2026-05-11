import type { NodeInfo } from "$shared/types";

import { getNodeInfo } from "$main/nodes/getNodeInfo";
import { scanConnectedNodes as scanConnectedTextNodes } from "$main/nodes/scan";

export { setNodesData, applyTranslations } from "$main/nodes/selection";

/**
 * Collect every connected text node (i.e. carrying Tolgee plugin data) on the
 * current page and project it into a `NodeInfo` record the UI can consume.
 */
export async function scanConnectedNodes(): Promise<NodeInfo[]> {
  const nodes = await scanConnectedTextNodes();
  return nodes.map(getNodeInfo);
}
