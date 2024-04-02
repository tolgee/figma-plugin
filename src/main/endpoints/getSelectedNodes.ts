import { NodeInfo } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { findTextNodesInfo } from "../utils/nodeTools";

export const getSelectedNodesEndpoint = createEndpoint<
  void,
  { items: NodeInfo[] }
>("GET_SELECTED_NODES", () => {
  return {
    items: findTextNodesInfo(figma.currentPage.selection),
  };
});
