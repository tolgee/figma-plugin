import {
  ConnectedNodesProps,
  getConnectedNodesEndpoint,
} from "@/main/endpoints/getConnectedNodes";
import { delayed } from "@/main/utils/delayed";
import { useQuery } from "react-query";

export const useConnectedNodes = (props: ConnectedNodesProps) => {
  const queryKey = [
    getConnectedNodesEndpoint.name,
    props.ignoreSelection,
  ] as const;
  return useQuery(
    queryKey,
    delayed(() => getConnectedNodesEndpoint.call(props)),
    { select: (data) => ({ ...data, items: data.items.filter((n) => n.key) }) },
  );
};
