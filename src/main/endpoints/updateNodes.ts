import { NodeInfo, SelectionChangeHandler } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { emit, loadFontsAsync } from "@create-figma-plugin/utilities";
import { formatText } from "./formatText";

export type UpdateNodeProps = {
  nodes: (NodeInfo & { formatted: string })[];
};

export const updateNodesEndpoint = createEndpoint<UpdateNodeProps, void>(
  "UPDATE_NODES",
  async ({ nodes }) => {
    const textNodes = nodes.map((n) => figma.getNodeById(n.id) as TextNode);

    try {
      await loadFontsAsync(textNodes);
    } catch (e) {
      console.error(e);
    }
    const promises = nodes.map((nodeInfo) => {
      const node = textNodes.find((nod) => nod.id === nodeInfo.id)!;
      if (node.hasMissingFont) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return;
      }

      return formatText({
        formatted: nodeInfo.formatted,
        nodeInfo,
      });
    });
    await Promise.allSettled(promises);
    figma.notify("Document translations updated");

    // update selection
    emit<SelectionChangeHandler>("SELECTION_CHANGE");
  }
);
