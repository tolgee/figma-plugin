import { NodeInfo } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { TOLGEE_NODE_INFO } from "@/constants";

export type SetNodesDataProps = {
  nodes: NodeInfo[];
};

export const setNodesDataEndpoint = createEndpoint<SetNodesDataProps, void>(
  "SET_NODES_DATA",
  async ({ nodes }) => {
    for (const nodeInfo of nodes) {
      const node = figma.getNodeById(nodeInfo.id);
      node?.setPluginData(
        TOLGEE_NODE_INFO,
        JSON.stringify({
          key: nodeInfo.key,
          isPlural: nodeInfo.isPlural,
          pluralParamValue: nodeInfo.pluralParamValue,
          translation: nodeInfo.translation,
          paramsValues: nodeInfo.paramsValues,
          ns: nodeInfo.ns,
          connected: nodeInfo.connected,
        })
      );
    }
  }
);
