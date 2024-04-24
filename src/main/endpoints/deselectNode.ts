import { createEndpoint } from "../utils/createEndpoint";

export type DeselectNodeProps = {
  id: string;
};

export const deselectNodeEndpoint = createEndpoint(
  "DESELECT_NODE",
  async ({ id }: DeselectNodeProps) => {
    const currentSelection = figma.currentPage.selection;

    if (currentSelection.length === 0) {
      return;
    }

    // Check if all selected nodes are text nodes removed from the selection
    if (currentSelection.every((node) => node.type === "TEXT")) {
      figma.currentPage.selection = currentSelection.filter(
        (node) => node.id !== id
      );

      return;
    }

    // Expand selection to include all text nodes
    const expandedSelection = currentSelection.reduce((acc, node) => {
      if (node.type === "TEXT") {
        acc.push(node);
      } else if (node.type === "FRAME" || node.type === "COMPONENT") {
        acc.push(
          ...node.findAllWithCriteria({
            types: ["TEXT"],
          })
        );
      }

      return acc;
    }, [] as TextNode[]);

    figma.currentPage.selection = expandedSelection.filter(
      (node) => node.id !== id
    );
  }
);
