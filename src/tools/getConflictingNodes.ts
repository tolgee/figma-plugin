import { NodeInfo } from "@/types";

export type Conflicts = Record<string, string[]>;

export const getConflictingNodes = (nodes: NodeInfo[]) => {
  const groupMap = new Map<string, NodeInfo[]>();
  for (const node of nodes) {
    if (!node.key) continue;
    const groupKey = `${node.key}\0${node.ns ?? ""}`;
    const group = groupMap.get(groupKey);
    if (group) {
      group.push(node);
    } else {
      groupMap.set(groupKey, [node]);
    }
  }

  const conflictingNodes: NodeInfo[] = [];
  for (const group of groupMap.values()) {
    if (group.length < 2) continue;
    const hasConflict = group.some(
      (n, i) => i > 0 && n.characters !== group[0].characters,
    );
    if (hasConflict) {
      conflictingNodes.push(...group);
    }
  }
  return conflictingNodes;
};
