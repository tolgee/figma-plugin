import { TOLGEE_NODE_INFO } from "@/constants";
import { createEndpoint } from "../utils/createEndpoint";

const walkTextNodes = (
  nodes: readonly SceneNode[],
  visit: (node: TextNode) => void,
) => {
  for (const node of nodes) {
    if (node.type === "TEXT") {
      visit(node);
    }
    // @ts-ignore - not all SceneNodes have children, but the check guards us
    if (node.children) {
      // @ts-ignore
      walkTextNodes(node.children as SceneNode[], visit);
    }
  }
};

export const clearPrefilledKeysEndpoint = createEndpoint<void, void>(
  "CLEAR_PREFILLED_KEYS",
  () => {
    for (const page of figma.root.children) {
      if (page.type !== "PAGE") continue;
      walkTextNodes(page.children, (node) => {
        const raw = node.getPluginData(TOLGEE_NODE_INFO);
        if (!raw) return;
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(raw);
        } catch {
          return;
        }
        if (data.connected) return;
        if (!data.key) return;
        node.setPluginData(
          TOLGEE_NODE_INFO,
          JSON.stringify({ ...data, key: "" }),
        );
      });
    }
  },
);
