import {
  SetNodesDataProps,
  setNodesDataEndpoint,
} from "@/main/endpoints/setNodesData";
import { getConnectedNodesEndpoint } from "@/main/endpoints/getConnectedNodes";
import { delayed } from "@/main/utils/delayed";
import { useMutation, useQueryClient } from "react-query";

export const useSetNodesDataMutation = () => {
  const queryClient = useQueryClient();
  const result = useMutation<void, unknown, SetNodesDataProps>(
    [setNodesDataEndpoint.name],
    delayed((props: SetNodesDataProps) => setNodesDataEndpoint.call(props)),
    {
      onSuccess: () => {
        // Mark connected-nodes data stale without triggering an immediate
        // refetch. Refetching on every keystroke walks the entire page tree
        // (see getConnectedNodes with ignoreSelection: true) and froze the UI
        // while typing. Stale data is refetched on the next mount, e.g. when
        // navigating back to Index/Pull/Push after Connect.
        queryClient.invalidateQueries([getConnectedNodesEndpoint.name], {
          refetchActive: false,
          refetchInactive: false,
        });
      },
    },
  );
  return { ...result };
};
