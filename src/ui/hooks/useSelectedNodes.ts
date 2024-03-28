import { getSelectedNodesEndpoint } from "@/main/endpoints/getSelectedNodes";
import { DocumentChangeHandler, SelectionChangeHandler } from "@/types";
import { on } from "@create-figma-plugin/utilities";
import { useEffect, useState } from "preact/hooks";
import { useQuery } from "react-query";

const delayed =
  <T>(promise: () => Promise<T>) =>
  () =>
    new Promise<T>((resolve, reject) =>
      setTimeout(() => promise().then(resolve).catch(reject))
    );

const PAGE_SIZE = 100;

export const useSelectedNodes = () => {
  const [size, setSize] = useState(PAGE_SIZE);
  const result = useQuery(
    [getSelectedNodesEndpoint.name, size],
    delayed(() => getSelectedNodesEndpoint.call(size)),
    { keepPreviousData: true }
  );

  useEffect(() => {
    return on<DocumentChangeHandler>("DOCUMENT_CHANGE", () => {
      setSize(PAGE_SIZE);
      result.refetch();
    });
  }, []);

  useEffect(() => {
    return on<SelectionChangeHandler>("SELECTION_CHANGE", () => {
      setSize(PAGE_SIZE);
      result.refetch();
    });
  });

  function fetchMore() {
    console.log(result.isFetching, result.data);
    if (!result.isFetching && result.data?.items.length === result.data?.size) {
      setSize((size) => size + PAGE_SIZE);
    }
  }

  return { ...result, fetchMore };
};
