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
        : figma.currentPage.children
    ).filter((node) => getNodeInfo(node).key);

    const frames = new Set<FrameNode>();

    // find frames in parents
    connectedNodes.forEach((connectedNode) => {
      const frame = findLastParentFrame(connectedNode);
      if (frame) {
        frames.add(frame);
      }
    });

    const data: FrameScreenshot[] = await Promise.all(
      Array.from(frames).map(async (frame) => {
        const framePosition = frame.absoluteBoundingBox!;
        return {
          image: await frame.exportAsync({ format: "PNG" }),
          info: {
            id: frame.id,
            name: frame.name,
            width: framePosition.width,
            height: framePosition.height,
          },
          keys: [...findTextNodes([frame])].map((node) => {
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
      })
    );
    return data;
  }
);
