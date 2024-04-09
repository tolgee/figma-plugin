import { createEndpoint } from "../utils/createEndpoint";

export type HighlightNodeProps = {
  id: string;
};

export const highlightNodeEndpoint = createEndpoint(
  "HIGHLIGHT_NODE",
  async ({ id }: HighlightNodeProps) => {
    const node = figma.getNodeById(id);

    if (node) {
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }
);
