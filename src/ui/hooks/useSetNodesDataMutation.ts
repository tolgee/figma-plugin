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
        // Invalidate connected nodes query to ensure fresh data is fetched
        queryClient.invalidateQueries([getConnectedNodesEndpoint.name]);
      },
    },
  );
  return { ...result };
};
