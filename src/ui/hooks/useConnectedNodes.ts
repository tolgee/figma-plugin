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
    {
      select: (data) => ({ ...data, items: data.items.filter((n) => n.key) }),
      // Keeps data "fresh" long enough that an optimistic cache patch written
      // by useSetNodesDataMutation.onSuccess prevents an unnecessary full-page
      // rescan when returning to Index right after a connect/disconnect.
      staleTime: 30_000,
    },
  );
};
