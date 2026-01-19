import { useState, useCallback, useRef, useEffect } from "preact/hooks";
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

  const [isLoading, setIsLoading] = useState(false);

  // Use refs to store the latest mutation functions to avoid dependency issues
  const namespacesLoadableRef = useRef(namespacesLoadable);
  const translationsBaseLoadableRef = useRef(translationsBaseLoadable);
  const notifierRef = useRef(notifier);

  useEffect(() => {
    namespacesLoadableRef.current = namespacesLoadable;
    translationsBaseLoadableRef.current = translationsBaseLoadable;
    notifierRef.current = notifier;
  }, [namespacesLoadable, translationsBaseLoadable, notifier]);

  async function loadData({ language, namespaces }: Props) {
    const nsNames =
      namespaces ??
      (
        await namespacesLoadableRef.current.mutateAsync({})
      )._embedded?.namespaces?.map((n) => n.name ?? "") ??
      [];

    // Ensure empty string is included if namespaces is provided and contains empty string
    // This handles the default namespace case
    if (namespaces && namespaces.includes("") && !nsNames.includes("")) {
      nsNames.push("");
    }

    const data: TranslationData = {};

    for (const ns of nsNames) {
      let cursor: string | undefined;
      let hasMore = true;

      const translationsData: components["schemas"]["KeyWithTranslationsModel"][] =
        [];

      do {
        const batchOfTranslations =
          await translationsBaseLoadableRef.current.mutateAsync({
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

  const getData = useCallback(async (props: Props) => {
    setIsLoading(true);
    try {
      return await loadData(props);
    } catch (e) {
      if (e === "invalid_project_api_key") {
        notifierRef.current.mutate("Invalid project API key");
      }

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty deps - we use refs for the mutation objects

  const clearCache = useCallback(() => {
    setTranslationsData(null);
  }, []);

  const error = namespacesLoadable.error || translationsLoadable.error;

  return {
    getData,
    clearCache,
    translationsData,
    isLoading,
    error,
  };
};
