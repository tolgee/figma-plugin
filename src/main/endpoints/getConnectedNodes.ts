import { TOLGEE_NODE_INFO } from "@/constants";
import { NodeInfo } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { findTextNodesInfo, getNodeInfo } from "../utils/nodeTools";

export type ConnectedNodesProps = {
  ignoreSelection: boolean;
};

export const getConnectedNodesEndpoint = createEndpoint<
  ConnectedNodesProps,
  { items: NodeInfo[]; basedOnSelection: boolean }
>("GET_CONNECTED_NODES", async ({ ignoreSelection }) => {
  const basedOnSelection =
    !ignoreSelection && figma.currentPage.selection.length > 0;

  if (basedOnSelection) {
    // Selection path: still walk manually since selection may be a subtree of
    // any depth and `findAllWithCriteria` only operates on the whole page.
    return {
      items: findTextNodesInfo(figma.currentPage.selection).filter(
        ({ key }) => key,
      ),
      basedOnSelection: true,
    };
  }

  // Page-wide path: let the Figma runtime filter by plugin-data key natively.
  // This avoids recursing through every node in JS and calling getPluginData
  // on every TextNode — O(all nodes) → O(connected nodes).
  await figma.currentPage.loadAsync();
  const connected = figma.currentPage.findAllWithCriteria({
    types: ["TEXT"],
    pluginData: { keys: [TOLGEE_NODE_INFO] },
  }) as TextNode[];

  return {
    items: connected.map(getNodeInfo),
    basedOnSelection: false,
  };
});
