import { getConnectedNodesEndpoint } from "@/main/endpoints/getConnectedNodes";
import { delayed } from "@/main/utils/delayed";
import { useQuery } from "react-query";

type Props = {
  ignoreSelection: boolean;
};

export const useConnectedNodes = (props: Props) => {
  const result = useQuery(
    [getConnectedNodesEndpoint.name],
    delayed(() => getConnectedNodesEndpoint.call(props)),
    { select: (data) => ({ ...data, items: data.items.filter((n) => n.key) }) }
  );

  return { ...result };
};
