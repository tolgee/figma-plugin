import { TOLGEE_NODE_INFO } from "@/constants";
import { NodeInfo } from "@/types";

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
  };
};

export function* findTextNodesGenerator(
  nodes: readonly SceneNode[]
): Generator<TextNode> {
  const toExplore = [...nodes].reverse();
  let node: SceneNode | undefined;
  while ((node = toExplore.pop())) {
    if (node.type === "TEXT") {
      yield node;
    }
    // @ts-ignore
    if (node.children) {
      // @ts-ignore
      [...(node.children as SceneNode[])].reverse().forEach((value) => {
        toExplore.push(value);
      });
    }
  }
}

export const findTextNodes = (nodes: readonly SceneNode[]): TextNode[] => {
  return [...findTextNodesGenerator(nodes)];
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
