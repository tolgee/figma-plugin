import {
  DeselectNodeProps,
  deselectNodeEndpoint,
} from "@/main/endpoints/deselectNode";
import { useMutation } from "react-query";

export const useDeselectNodeMutation = () => {
  return useMutation<void, void, DeselectNodeProps>(
    [deselectNodeEndpoint.name],
    (data: DeselectNodeProps) => deselectNodeEndpoint.call(data)
  );
};
