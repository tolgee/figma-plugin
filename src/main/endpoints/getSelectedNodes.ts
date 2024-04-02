import { NodeInfo } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { findTextNodesInfo } from "../utils/nodeTools";

export const getSelectedNodesEndpoint = createEndpoint<
  void,
  { items: NodeInfo[]; somethingSelected: boolean }
>("GET_SELECTED_NODES", () => {
  const somethingSelected = figma.currentPage.selection.length > 0;
  return {
    items: findTextNodesInfo(figma.currentPage.selection),
    somethingSelected,
  };
});
