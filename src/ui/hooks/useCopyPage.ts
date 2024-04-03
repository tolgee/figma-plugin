import { copyPageEndpoint } from "@/main/endpoints/copyPage";
import { delayed } from "@/main/utils/delayed";
import { NodeInfo } from "@/types";
import { useMutation } from "react-query";

type Props = {
  language: string;
  nodes: NodeInfo[];
};

export const useCopyPage = () => {
  return useMutation<void, void, Props | undefined>(
    [copyPageEndpoint.name],
    delayed((data: Props | undefined) => copyPageEndpoint.call(data))
  );
};
