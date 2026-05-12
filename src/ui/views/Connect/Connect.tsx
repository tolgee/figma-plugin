import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { useDebounce } from "use-debounce";
import {
  Button,
  Container,
  Divider,
  Muted,
  Text,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { TopBar } from "@/ui/components/TopBar/TopBar";
import { ActionsBottom } from "@/ui/components/ActionsBottom/ActionsBottom";
import { useApiMutation, useApiQuery } from "@/ui/client/useQueryApi";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { useSetNodesDataMutation } from "@/ui/hooks/useSetNodesDataMutation";
import { RouteParam } from "../routes";
import styles from "./Connect.css";
import { SearchRow } from "./SearchRow";

type Props = RouteParam<"connect">;

export const Connect = ({ node }: Props) => {
  const { setRoute } = useGlobalActions();
  const branch = useGlobalState((c) => c.config?.branch);

  const language = useGlobalState((c) => c.config?.language);

  const [search, setSearch] = useState(node.key || node.characters);

  const [debouncedSearch] = useDebounce(search, 300);

  const translationsLoadable = useApiQuery({
    url: "/v2/projects/keys/search",
    method: "get",
    query: {
      search: debouncedSearch,
      size: 20,
      languageTag: language,
    },
    options: {
      enabled: Boolean(debouncedSearch),
    },
  });

  // Fetches just the picked key (with plural metadata) instead of paginating
  // through every translation in a namespace.
  const keyTranslationLoadable = useApiMutation({
    url: "/v2/projects/translations",
    method: "get",
  });

  const setNodesDataMutation = useSetNodesDataMutation();

  const handleGoBack = () => {
    setRoute("index");
  };

  const handleConnect = async (
    keyId: number,
    key: string,
    ns: string | undefined,
    translation: string | undefined,
  ) => {
    let resolvedTranslation = translation;
    let isPlural: boolean | undefined;
    let pluralParamValue: string | undefined;

    try {
      const result = await keyTranslationLoadable.mutateAsync({
        query: {
          filterKeyId: [keyId],
          languages: language ? [language] : undefined,
          size: 1,
          branch: branch || undefined,
        },
      });
      const tolgeeKey = result._embedded?.keys?.[0];
      if (tolgeeKey) {
        isPlural = tolgeeKey.keyIsPlural;
        pluralParamValue = tolgeeKey.keyPluralArgName;
        resolvedTranslation =
          (language && tolgeeKey.translations?.[language]?.text) ||
          resolvedTranslation;
      }
    } catch (e) {
      console.error("Failed to load key metadata, connecting without it.", e);
    }

    await setNodesDataMutation.mutateAsync({
      nodes: [
        {
          ...node,
          translation: resolvedTranslation || node.characters,
          isPlural: isPlural ?? node.isPlural,
          pluralParamValue: pluralParamValue ?? node.pluralParamValue,
          key,
          ns: ns || "",
          connected: true,
        },
      ],
    });
    setRoute("index");
  };

  const handleRemoveConnection = async () => {
    await setNodesDataMutation.mutateAsync({
      nodes: [
        {
          ...node,
          key: "",
          ns: undefined,
          connected: false,
        },
      ],
    });
    setRoute("index");
  };

  const isConnecting =
    keyTranslationLoadable.isLoading || setNodesDataMutation.isLoading;

  return (
    <Fragment>
      {(translationsLoadable.isFetching || isConnecting) && <FullPageLoading />}
      <TopBar
        onBack={handleGoBack}
        leftPart={<div className={styles.title}>Connect to existing key</div>}
      />
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        <div className={styles.container}>
          <div>
            <Text>
              <Muted>Search</Muted>
            </Text>
            <VerticalSpace space="small" />
            <Textbox
              data-cy="connect_search_input"
              placeholder="Search by key or translation"
              autoFocus={true}
              onValueInput={(value) => setSearch(value)}
              value={search}
              variant="border"
            />
          </div>
          <div />
        </div>
        <VerticalSpace space="large" />
      </Container>
      <div className={styles.results}>
        {debouncedSearch &&
          translationsLoadable.data?._embedded?.keys?.map((key) => (
            <SearchRow
              key={key.id}
              data={key}
              onClick={() =>
                handleConnect(key.id, key.name, key.namespace, key.translation)
              }
            />
          ))}
      </div>
      <ActionsBottom>
        {node.connected && (
          <Button secondary onClick={handleRemoveConnection}>
            Remove connection
          </Button>
        )}
        <Button secondary onClick={handleGoBack}>
          Cancel
        </Button>
      </ActionsBottom>
    </Fragment>
  );
};
