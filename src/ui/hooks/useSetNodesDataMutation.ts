import {
  SetNodesDataProps,
  setNodesDataEndpoint,
} from "@/main/endpoints/setNodesData";
import { delayed } from "@/main/utils/delayed";
import { useMutation } from "react-query";

export const useSetNodesDataMutation = () => {
  const result = useMutation<void, unknown, SetNodesDataProps>(
    [setNodesDataEndpoint.name],
    delayed((props: SetNodesDataProps) => setNodesDataEndpoint.call(props))
  );
  return { ...result };
};
