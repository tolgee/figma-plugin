import { NodeInfo, PartialNodeInfo } from "@/types";

export const getPullChanges = (
  nodes: NodeInfo[],
  lang: string,
  keys: Record<string, Record<string, string>>
) => {
  const changedNodes: NodeInfo[] = [];
  const missingKeys: PartialNodeInfo[] = [];

  nodes.forEach((node) => {
    const value = keys?.[node.ns ?? ""]?.[node.key];

    if (value) {
      if (value !== node.characters) {
        changedNodes.push({ ...node, characters: value });
      }
    } else {
      missingKeys.push({ id: node.id, key: node.key, ns: node.ns });
    }
  });

  return { changedNodes, missingKeys };
};
