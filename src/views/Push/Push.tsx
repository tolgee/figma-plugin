import { Fragment, FunctionalComponent, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import {
  Button,
  Container,
  Divider,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { components } from "@/client/apiSchema.generated";
import { useApiMutation, useApiQuery } from "@/client/useQueryApi";
import { ActionsBottom } from "@/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/components/FullPageLoading/FullPageLoading";
import { useGlobalActions, useGlobalState } from "@/state/GlobalState";
import { getChanges } from "@/tools/getChanges";
import { TopBar } from "../../components/TopBar/TopBar";
import { RouteParam } from "../routes";
import { Changes } from "./Changes";
import { NodeInfo, SetNodesDataHandler } from "@/types";
import { emit } from "@create-figma-plugin/utilities";

type ImportKeysResolvableItemDto =
  components["schemas"]["ImportKeysResolvableItemDto"];

type Props = RouteParam<"push">;

export const Push: FunctionalComponent<Props> = ({ nodes }) => {
  const language = useGlobalState((c) => c.config!.language!);
  const { setRoute } = useGlobalActions();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const keys = useMemo(() => [...new Set(nodes.map((n) => n.key))], [nodes]);

  const { deduplicatedNodes } = useMemo(() => {
    const deduplicatedNodes: NodeInfo[] = [];
    nodes.forEach((node) => {
      if (
        !nodes.find(
          (n) =>
            node.id !== node.id &&
            node.key === n.key &&
            (node.ns || "") === (n.ns || "")
        )
      ) {
        deduplicatedNodes.push(node);
      }
    });
    return {
      deduplicatedNodes,
      keys: Array.from(keys),
    };
  }, [nodes]);

  const translationsLoadable = useApiQuery({
    url: "/v2/projects/translations",
    method: "get",
    query: {
      languages: [language],
      size: 10000,
      filterKeyName: keys,
    },
    options: {
      cacheTime: 0,
      staleTime: 0,
    },
  });

  const updateTranslations = useApiMutation({
    url: "/v2/projects/keys/import-resolvable",
    method: "post",
  });

  const handleGoBack = () => {
    setRoute("index");
  };

  const handleConnectAndGoBack = () => {
    connectNodes();
    handleGoBack();
  };

  const connectNodes = () => {
    emit<SetNodesDataHandler>(
      "SET_NODES_DATA",
      nodes.map((n) => ({ ...n, connected: true }))
    );
  };

  const changes = useMemo(() => {
    return getChanges(
      deduplicatedNodes,
      translationsLoadable.data?._embedded?.keys || [],
      language
    );
  }, [translationsLoadable.data, nodes]);

  const handleSubmit = async () => {
    const keys: ImportKeysResolvableItemDto[] = [];

    changes.changedKeys.forEach((key) => {
      keys.push({
        name: key.key,
        namespace: key.ns || undefined,
        translations: {
          [language]: {
            text: key.newValue,
            resolution: key.oldValue ? "OVERRIDE" : "NEW",
          },
        },
      });
    });

    changes.newKeys.forEach((key) => {
      keys.push({
        name: key.key,
        namespace: key.ns || undefined,
        translations: {
          [language]: { text: key.newValue, resolution: "NEW" },
        },
      });
    });

    try {
      await updateTranslations.mutateAsync({
        content: {
          "application/json": {
            keys,
          },
        },
      });
      connectNodes();
      setSuccess(true);
    } catch (e) {
      setError(true);
    }
  };

  const handleRepeat = () => {
    setError(false);
    setSuccess(false);
    translationsLoadable.refetch();
  };

  const isLoading =
    translationsLoadable.isFetching || updateTranslations.isLoading;

  const changesSize = changes.changedKeys.length + changes.newKeys.length;

  return (
    <Fragment>
      <TopBar
        onBack={handleGoBack}
        leftPart={<div>Push translations to Tolgee platform</div>}
      />
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        {isLoading ? (
          <FullPageLoading />
        ) : error ? (
          <Fragment>
            <div>
              {updateTranslations.error || "An error has occured during push."}
            </div>
            <ActionsBottom>
              <Button onClick={handleRepeat}>Try again</Button>
            </ActionsBottom>
          </Fragment>
        ) : success ? (
          <Fragment>
            <div>{changesSize} key(s) updated!</div>
            <ActionsBottom>
              <Button onClick={handleGoBack}>Ok</Button>
            </ActionsBottom>
          </Fragment>
        ) : changesSize === 0 ? (
          <Fragment>
            <div>Everything up to date</div>
            <ActionsBottom>
              <Button onClick={handleConnectAndGoBack}>Ok</Button>
            </ActionsBottom>
          </Fragment>
        ) : (
          <Fragment>
            <Changes changes={changes} />
            <ActionsBottom>
              <Button onClick={handleGoBack} secondary>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Push to Tolgee</Button>
            </ActionsBottom>
          </Fragment>
        )}
      </Container>
    </Fragment>
  );
};
