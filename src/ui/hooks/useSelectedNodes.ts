import { getSelectedNodesEndpoint } from "@/main/endpoints/getSelectedNodes";
import { delayed } from "@/main/utils/delayed";
import { DocumentChangeHandler, SelectionChangeHandler } from "@/types";
import { on } from "@create-figma-plugin/utilities";
import { useEffect } from "preact/hooks";
import { useQuery } from "react-query";

export const useSelectedNodes = () => {
  const result = useQuery(
    [getSelectedNodesEndpoint.name],
    delayed(() => getSelectedNodesEndpoint.call())
  );

  useEffect(() => {
    return on<DocumentChangeHandler>("DOCUMENT_CHANGE", () => {
      result.refetch();
    });
  }, []);

  useEffect(() => {
    return on<SelectionChangeHandler>("SELECTION_CHANGE", () => {
      result.refetch();
    });
  });

  return { ...result };
};
