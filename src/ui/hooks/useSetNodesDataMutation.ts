import {
  SetNodesDataProps,
  setNodesDataEndpoint,
} from "@/main/endpoints/setNodesData";
import { getConnectedNodesEndpoint } from "@/main/endpoints/getConnectedNodes";
import { delayed } from "@/main/utils/delayed";
import { NodeInfo } from "@/types";
import { useMutation, useQueryClient } from "react-query";

type CachedNodes = { items: NodeInfo[]; basedOnSelection: boolean };

export const useSetNodesDataMutation = () => {
  const queryClient = useQueryClient();
  const result = useMutation<void, unknown, SetNodesDataProps>(
    [setNodesDataEndpoint.name],
    delayed((props: SetNodesDataProps) => setNodesDataEndpoint.call(props)),
    {
      onSuccess: (_, { nodes }) => {
        // Patch the page-wide cache directly so returning to Index does not
        // trigger a full-page rescan. useConnectedNodes uses staleTime:30s,
        // so fresh data here prevents the redundant allNodes.refetch() call.
        const key = [getConnectedNodesEndpoint.name, true] as const;
        const old = queryClient.getQueryData<CachedNodes>(key);
        if (old) {
          const patch = new Map(nodes.map((n) => [n.id, n]));
          const updated = old.items
            .map((item) =>
              patch.has(item.id)
                ? { ...item, ...patch.get(item.id)! }
                : item,
            )
            .filter((item) => item.key && item.connected !== false);
          // Add newly connected nodes that were not tracked before
          for (const n of nodes) {
            if (
              n.key &&
              n.connected !== false &&
              !old.items.some((i) => i.id === n.id)
            ) {
              updated.push(n);
            }
          }
          queryClient.setQueryData<CachedNodes>(key, {
            ...old,
            items: updated,
          });
        }
      },
    },
  );
  return { ...result };
};
