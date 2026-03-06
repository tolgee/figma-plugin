import { getSelectedNodesEndpoint } from "@/main/endpoints/getSelectedNodes";
import { delayed } from "@/main/utils/delayed";
import { DocumentChangeHandler, SelectionChangeHandler } from "@/types";
import { on } from "@create-figma-plugin/utilities";
import { useCallback, useEffect, useRef } from "preact/hooks";
import { useQuery } from "react-query";

export const useSelectedNodes = () => {
  const result = useQuery(
    [getSelectedNodesEndpoint.name],
    delayed(() => getSelectedNodesEndpoint.call()),
    { keepPreviousData: true, staleTime: 0, cacheTime: 0 },
  );

  const refetchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const debouncedRefetch = useCallback(() => {
    if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    refetchTimerRef.current = setTimeout(() => result.refetch(), 50);
  }, []);

  useEffect(() => {
    const unsubDoc = on<DocumentChangeHandler>(
      "DOCUMENT_CHANGE",
      debouncedRefetch,
    );
    const unsubSel = on<SelectionChangeHandler>(
      "SELECTION_CHANGE",
      debouncedRefetch,
    );
    return () => {
      unsubDoc();
      unsubSel();
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    };
  }, []);

  return { ...result };
};
