import {
  ConnectedNodesProps,
  getConnectedNodesEndpoint,
} from "@/main/endpoints/getConnectedNodes";
import { delayed } from "@/main/utils/delayed";
import { useQuery } from "react-query";

export const useConnectedNodes = (props: ConnectedNodesProps) => {
  return useQuery(
    [getConnectedNodesEndpoint.name],
    delayed(() => getConnectedNodesEndpoint.call(props)),
    { select: (data) => ({ ...data, items: data.items.filter((n) => n.key) }) },
  );
};
