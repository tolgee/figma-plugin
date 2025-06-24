import { useState } from "preact/hooks";
import { useApiMutation } from "../client/useQueryApi";
import { useFigmaNotify } from "./useFigmaNotify";

interface Tag {
  id: number;
  name: string;
}

export const useAllTags = () => {
  const tagsLoadable = useApiMutation({
    url: "/v2/projects/tags",
    method: "get",
  });
  const notifier = useFigmaNotify();
  const [tagsData, setTagsData] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  async function loadTags({
    search = "",
    sort = [],
  }: {
    search?: string;
    sort?: string[];
  } = {}) {
    let page = 0;
    const size = 1000;
    let hasMore = true;
    let allTags: Tag[] = [];

    while (hasMore) {
      if (page > 100) {
        console.warn("Too many pages, stopping pagination");
        break;
      }
      try {
        const response = await tagsLoadable.mutateAsync({
          query: {
            search,
            page,
            size,
            sort,
          },
        });
        allTags = allTags.concat(response._embedded?.tags ?? []);
        const totalElements = response.page?.totalElements ?? 0;
        hasMore = allTags.length < totalElements;
        page++;
      } catch (e) {
        setError(e);
        notifier.mutate("Error loading tags");
        throw e;
      }
    }
    setTagsData(allTags);
    return allTags;
  }

  return {
    async getData(params?: { search?: string; sort?: string[] }) {
      setIsLoading(true);
      setError(null);
      try {
        return await loadTags(params);
      } finally {
        setIsLoading(false);
      }
    },
    tagsData,
    isLoading,
    error,
  };
};
