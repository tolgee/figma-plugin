import { NodeInfo } from "@/types";

export const getConnectedNodes = (nodes: NodeInfo[]) => {
  return nodes.filter((n) => n.key);
};
