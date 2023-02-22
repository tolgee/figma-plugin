import { NodeInfo } from "@/types";
import { compareNs } from "./compareNs";

export type Conflicts = Record<string, string[]>;

export const getConflictingNodes = (nodes: NodeInfo[]) => {
  const conflictingNodes: NodeInfo[] = [];
  nodes.forEach((node) => {
    // Remove key and value duplicates.
    const conflictingNode = nodes.find((n) => {
      return (
        n.key &&
        n.key === node.key &&
        compareNs(n.ns, node.ns) &&
        n.characters !== node.characters
      );
    });
    if (conflictingNode) {
      conflictingNodes.push(node);
    }
  });
  return conflictingNodes;
};
