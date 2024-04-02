import { getSelectedNodesEndpoint } from "@/main/endpoints/getSelectedNodes";
import { delayed } from "@/main/utils/delayed";
import { useQuery } from "react-query";

export const useConnectedNodes = () => {
  const result = useQuery(
    [getSelectedNodesEndpoint.name],
    delayed(() => getSelectedNodesEndpoint.call()),
    { select: (data) => ({ ...data, items: data.items.filter((n) => n.key) }) }
  );

  return { ...result };
};
