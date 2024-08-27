import { useState } from "preact/hooks";
import { useApiMutation } from "../client/useQueryApi";

type Props = {
  language: string;
  namespaces?: string[];
};

export const useAllTranslations = () => {
  const namespacesLoadable = useApiMutation({
    url: "/v2/projects/used-namespaces",
    method: "get",
  });
  const translationsLoadable = useApiMutation({
    url: "/v2/projects/translations/{languages}",
    method: "get",
  });

  async function loadData({ language, namespaces }: Props) {
    const nsNames =
      namespaces ??
      (await namespacesLoadable.mutateAsync({}))._embedded?.namespaces?.map(
        (n) => n.name ?? ""
      ) ??
      [];

    const data: Record<string, Record<string, string>> = {};

    for (const ns of nsNames) {
      data[ns] = (
        (await translationsLoadable.mutateAsync({
          path: { languages: [language] },
          query: { ns, structureDelimiter: "" },
        })) as any
      )?.[language];
    }
    return data;
  }

  const [isLoading, setIsLoading] = useState(false);

  return {
    async getData(props: Props) {
      setIsLoading(true);
      try {
        return await loadData(props);
      } finally {
        setIsLoading(false);
      }
    },
    isLoading,
    error: namespacesLoadable.error || translationsLoadable.error,
  };
};
