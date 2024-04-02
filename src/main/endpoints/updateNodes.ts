import { NodeInfo, SelectionChangeHandler } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { emit, loadFontsAsync } from "@create-figma-plugin/utilities";

export type UpdateNodeProps = {
  nodes: NodeInfo[];
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
    nodes.forEach((n) => {
      const node = textNodes.find((nod) => nod.id === n.id)!;
      if (node.hasMissingFont) {
        return;
      }
      node.autoRename = false;
      node.characters = n.characters;
    });
    figma.notify("Document translations updated");

    // update selection
    emit<SelectionChangeHandler>("SELECTION_CHANGE");
  }
);
