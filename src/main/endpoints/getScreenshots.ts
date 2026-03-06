import { FrameScreenshot } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import {
  findLastParentFrame,
  findTextNodes,
  getNodeInfo,
} from "../utils/nodeTools";

export const getScreenshotsEndpoint = createEndpoint(
  "GET_SCREENSHOTS",
  async () => {
    const connectedNodes = findTextNodes(
      figma.currentPage.selection.length
        ? figma.currentPage.selection
        : figma.currentPage.children,
    ).filter((node) => getNodeInfo(node).key);

    const frameToNodes = new Map<FrameNode, TextNode[]>();

    // find frames in parents and group text nodes by frame
    connectedNodes.forEach((connectedNode) => {
      const frame = findLastParentFrame(connectedNode);
      if (frame) {
        let nodes = frameToNodes.get(frame);
        if (!nodes) {
          nodes = [];
          frameToNodes.set(frame, nodes);
        }
        nodes.push(connectedNode);
      }
    });

    const data: FrameScreenshot[] = await Promise.all(
      Array.from(frameToNodes.entries()).map(async ([frame, textNodes]) => {
        const framePosition = frame.absoluteBoundingBox!;
        return {
          image: await frame.exportAsync({ format: "PNG" }),
          info: {
            id: frame.id,
            name: frame.name,
            width: framePosition.width,
            height: framePosition.height,
          },
          keys: textNodes.map((node) => {
            const nodePosition = node.absoluteBoundingBox!;
            return {
              ...getNodeInfo(node),
              x: nodePosition.x - framePosition.x,
              y: nodePosition.y - framePosition.y,
              width: nodePosition.width,
              height: nodePosition.height,
            };
          }),
        };
      }),
    );
    return data;
  },
);
