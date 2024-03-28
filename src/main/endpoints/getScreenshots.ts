import { FrameScreenshot, NodeInfo } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { findTextNodes, getNodeInfo } from "../utils/nodeTools";

export const getScreenshotsEndpoint = createEndpoint(
  "GET_SCREENSHOTS",
  async (nodes: NodeInfo[]) => {
    // find nodes in document
    const documentNodes = figma.currentPage.findAll((docNode) =>
      Boolean(nodes.find((n) => n.id === docNode.id))
    );

    const frames = new Set<FrameNode>();

    // find frames in parents
    documentNodes.forEach((docNode) => {
      let node = docNode as (BaseNode & ChildrenMixin) | null;
      while (node) {
        if (node.type === "FRAME") {
          frames.add(node as FrameNode);
          break;
        }
        node = node.parent;
      }
    });

    const data: FrameScreenshot[] = await Promise.all(
      Array.from(frames).map(async (frame) => {
        return {
          image: await frame.exportAsync({ format: "PNG" }),
          info: {
            id: frame.id,
            name: frame.name,
            width: frame.width,
            height: frame.height,
          },
          keys: [],
          // keys: [...findTextNodes(frame)].map((node) => {
          //   return {
          //     ...getNodeInfo(node),
          //     x: node.x,
          //     y: node.y,
          //     width: node.width,
          //     height: node.height,
          //   };
          // }),
        };
      })
    );
    return data;
  }
);
