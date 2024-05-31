import { createEndpoint } from "../utils/createEndpoint";

export type HighlightNodeProps = {
  id: string;
};

const highlitedNodes: Map<string, MinimalFillsMixin["fills"]> = new Map();

export const highlightNodeEndpoint = createEndpoint(
  "HIGHLIGHT_NODE",
  async ({ id }: HighlightNodeProps) => {
    const node = figma.getNodeById(id) as TextNode | null;

    if (node) {
      figma.viewport.scrollAndZoomIntoView([node]);
    }

    if (node && !highlitedNodes.has(id)) {
      const paint: SolidPaint = {
        type: "SOLID",
        color: { r: 1, g: 0, b: 0 },
      };
      highlitedNodes.set(id, node.fills);
      const original = node.fills;
      node.fills = [paint];

      setTimeout(() => {
        node.fills = original;
        highlitedNodes.delete(id);
      }, 500);
    }
  }
);

export const cleanUp = () => {
  highlitedNodes.forEach((value, id) => {
    const node = figma.getNodeById(id) as TextNode | null;
    if (node) {
      node.fills = value;
      highlitedNodes.delete(id);
    }
  });
};
