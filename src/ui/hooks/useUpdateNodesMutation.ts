import {
  UpdateNodeProps,
  updateNodesEndpoint,
} from "@/main/endpoints/updateNodes";
import { delayed } from "@/main/utils/delayed";
import { useMutation } from "react-query";

export const useUpdateNodesMutation = () => {
  const result = useMutation<void, unknown, UpdateNodeProps>(
    [updateNodesEndpoint.name],
    delayed((props: UpdateNodeProps) => updateNodesEndpoint.call(props))
  );
  return { ...result };
};
