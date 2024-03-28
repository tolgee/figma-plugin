import { createEndpoint } from "../utils/createEndpoint";
import { findTextNodesInfo } from "../utils/nodeTools";

export const getSelectedNodesEndpoint = createEndpoint(
  "GET_SELECTED_NODES",
  (requestSize?: number) => {
    const size = requestSize ?? 20;
    return {
      items: findTextNodesInfo(figma.currentPage.selection, size),
      size,
    };
  }
);
