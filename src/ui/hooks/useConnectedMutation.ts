import {
  ConnectedNodesProps,
  getConnectedNodesEndpoint,
} from "@/main/endpoints/getConnectedNodes";
import { delayed } from "@/main/utils/delayed";
import { useMutation } from "react-query";

export const useConnectedMutation = (props: ConnectedNodesProps) => {
  const result = useMutation(
    [getConnectedNodesEndpoint.name],
    delayed(() => getConnectedNodesEndpoint.call(props))
  );
  return { ...result };
};
