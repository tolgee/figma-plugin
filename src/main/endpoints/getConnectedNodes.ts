import { NodeInfo } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { findTextNodesInfo } from "../utils/nodeTools";

type Props = {
  ignoreSelection: boolean;
};

export const getConnectedNodesEndpoint = createEndpoint<
  Props,
  { items: NodeInfo[] }
>("GET_CONNECTED_NODES", async ({ ignoreSelection }) => {
  const items =
    ignoreSelection || figma.currentPage.selection.length === 0
      ? figma.currentPage.children
      : figma.currentPage.selection;
  return {
    items: findTextNodesInfo(items).filter(({ key }) => key),
  };
});
