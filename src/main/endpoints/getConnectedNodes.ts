import { NodeInfo } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { findTextNodesInfo } from "../utils/nodeTools";

export type ConnectedNodesProps = {
  ignoreSelection: boolean;
};

export const getConnectedNodesEndpoint = createEndpoint<
  ConnectedNodesProps,
  { items: NodeInfo[]; basedOnSelection: boolean }
>("GET_CONNECTED_NODES", async ({ ignoreSelection }) => {
  const basedOnSelection =
    !ignoreSelection && figma.currentPage.selection.length > 0;
  const items = basedOnSelection
    ? figma.currentPage.selection
    : figma.currentPage.children;
  return {
    items: findTextNodesInfo(items).filter(({ key }) => key),
    basedOnSelection,
  };
});
