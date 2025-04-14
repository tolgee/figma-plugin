import { useAllTranslations } from "./useAllTranslations";

type Props = {
  language: string;
  namespace?: string;
  /** Key to get as translation value */
  key?: string;
};

export const useTranslation = (props: Props) => {
  const translationsLoadable = useAllTranslations();

  if (
    !translationsLoadable.isLoading &&
    translationsLoadable.translationsData == null
  ) {
    translationsLoadable.getData({
      language: props.language,
      namespaces: [props.namespace ?? "default"],
    });
  }

  return {
    getData: translationsLoadable.getData,
    translation:
      props.key != null
        ? translationsLoadable.translationsData?.[
            props.namespace ?? "default"
          ]?.[props.key] ?? null
        : null,
    isLoading: translationsLoadable.isLoading,
    error: translationsLoadable.error,
  };
};
