import { useState } from "preact/hooks";
import { useApiMutation } from "../client/useQueryApi";
import { components } from "../client/apiSchema.generated";
import { TranslationData } from "../client/types";
import { useFigmaNotify } from "./useFigmaNotify";

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
  const translationsBaseLoadable = useApiMutation({
    url: "/v2/projects/translations",
    method: "get",
  });

  const notifier = useFigmaNotify();

  const [translationsData, setTranslationsData] =
    useState<TranslationData | null>(null);

  async function loadData({ language, namespaces }: Props) {
    const nsNames =
      namespaces ??
      (await namespacesLoadable.mutateAsync({}))._embedded?.namespaces?.map(
        (n) => n.name ?? ""
      ) ??
      [];

    const data: TranslationData = {};

    for (const ns of nsNames) {
      let cursor: string | undefined;
      let hasMore = true;

      const translationsData: components["schemas"]["KeyWithTranslationsModel"][] =
        [];

      do {
        const batchOfTranslations = await translationsBaseLoadable.mutateAsync({
          query: {
            filterNamespace: [ns],
            languages: [language],
            size: 1000,
            cursor,
          },
        });

        translationsData.push(...(batchOfTranslations._embedded?.keys ?? []));
        cursor = batchOfTranslations.nextCursor;

        hasMore =
          translationsData.length <
          (batchOfTranslations.page?.totalElements ?? 0);
      } while (hasMore);

      data[ns] = translationsData.reduce((acc, key) => {
        acc[key.keyName] = {
          ...key,
          translation: key.translations[language]?.text ?? "",
        };
        return acc;
      }, {} as Record<string, any>);
    }
    setTranslationsData(data);
    return data;
  }

  const [isLoading, setIsLoading] = useState(false);

  return {
    async getData(props: Props) {
      setIsLoading(true);
      try {
        return await loadData(props);
      } catch (e) {
        if (e === "invalid_project_api_key") {
          notifier.mutate("Invalid project API key");
        }

        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    translationsData,
    isLoading,
    error: namespacesLoadable.error || translationsLoadable.error,
  };
};
