import { createEndpoint } from "../utils/createEndpoint";

export type HighlightNodeProps = {
  key: string;
};

export const highlightNodeEndpoint = createEndpoint(
  "HIGHLIGHT_NODE",
  async ({ key }: HighlightNodeProps) => {
    const node = figma.getNodeById(key);
    if (node) {
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }
);
