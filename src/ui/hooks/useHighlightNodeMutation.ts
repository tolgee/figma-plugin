import {
  HighlightNodeProps,
  highlightNodeEndpoint,
} from "@/main/endpoints/highlightNode";
import { useMutation } from "react-query";

export const useHighlightNodeMutation = () => {
  return useMutation<void, void, HighlightNodeProps>(
    [highlightNodeEndpoint.name],
    (data: HighlightNodeProps) => highlightNodeEndpoint.call(data)
  );
};
