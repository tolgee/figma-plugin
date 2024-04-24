import { TOLGEE_NODE_INFO } from "@/constants";
import { CurrentDocumentSettings, NodeInfo } from "@/types";
import { getDocumentData } from "./settingsTools";

export const getNodeInfo = (node: TextNode): NodeInfo => {
  const pluginData = JSON.parse(
    node.getPluginData(TOLGEE_NODE_INFO) || "{}"
  ) as Partial<NodeInfo>;
  return {
    id: node.id,
    name: node.name,
    characters: node.characters,
    key: pluginData.key || "",
    ns: pluginData.ns,
    connected: Boolean(pluginData.connected),
    visible: Boolean(pluginData.visible),
  };
};

function shouldIncludeNode(
  node: TextNode,
  settings: Partial<CurrentDocumentSettings>
) {
  if (settings.ignoreNumbers && /^\d+$/.test(node.characters)) {
    return false;
  }
  if (settings.ignorePrefix && node.name.startsWith(settings.ignorePrefix)) {
    return false;
  }
  if (node.characters.trim().length === 0) {
    return false;
  }
  if (!node.visible) {
    return false;
  }
  return true;
}

export const findTextNodes = (nodes: readonly SceneNode[]): TextNode[] => {
  const documentSettings = getDocumentData();
  const result: TextNode[] = [];
  for (const node of nodes) {
    if (node.type === "TEXT") {
      if (shouldIncludeNode(node, documentSettings)) {
        result.push(node);
      }
    }
    // @ts-ignore
    if (node.children) {
      // @ts-ignore
      findTextNodes(node.children as SceneNode[]).forEach((n) =>
        result.push(n)
      );
    }
  }
  return result;
};

export const findTextNodesInfo = (nodes: readonly SceneNode[]): NodeInfo[] => {
  return findTextNodes(nodes).map(getNodeInfo);
};

export const findLastParentFrame = (subject: BaseNode) => {
  let node = subject as (BaseNode & ChildrenMixin) | null;
  let lastFrame: FrameNode | undefined;
  while (node) {
    if (node.type === "FRAME") {
      lastFrame = node;
    }
    node = node.parent;
  }
  return lastFrame;
};
