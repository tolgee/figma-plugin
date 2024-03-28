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

export function* findTextNodes(
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

export const findTextNodesInfo = (
  nodes: readonly SceneNode[],
  items = 20
): NodeInfo[] => {
  // const time = Date.now();

  const nodesGenerator = findTextNodes(nodes);
  const result: NodeInfo[] = [];

  let i = 0;
  for (const item of nodesGenerator) {
    if (i >= items) {
      break;
    }
    result.push(getNodeInfo(item));

    i++;
  }
  // console.log(
  //   "nodes traversed in:",
  //   (Date.now() - time) / 1000,
  //   "s",
  //   `(${items})`
  // );
  return result;
};
