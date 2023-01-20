import { Fragment, FunctionalComponent, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import {
  Button,
  Container,
  Divider,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";

import { useApiQuery } from "@/client/useQueryApi";
import { ActionsBottom } from "@/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/components/FullPageLoading/FullPageLoading";
import { useGlobalActions, useGlobalState } from "@/state/GlobalState";
import { getConnectedNodes } from "@/tools/getConnectedNodes";
import { NodeInfo, PartialNodeInfo, TranslationsUpdateHandler } from "@/types";
import { TopBar } from "../../components/TopBar/TopBar";
import { RouteParam } from "../routes";
import clsx from "clsx";
import styles from "./Pull.css";
import { NodeList } from "@/components/NodeList/NodeList";

type Props = RouteParam<"pull">;

export const Pull: FunctionalComponent<Props> = ({ lang, nodes }) => {
  const allNodes = useGlobalState((c) => c.allNodes);
  const selectedNodes = nodes || getConnectedNodes(allNodes);
  const { setRoute, setLanguage } = useGlobalActions();
  const [success, setSuccess] = useState(false);

  const selectedKeys = useMemo(
    () => [...new Set(selectedNodes.map((n) => n.key))],
    [selectedNodes]
  );

  const translationsLoadable = useApiQuery({
    url: "/v2/projects/translations",
    method: "get",
    query: {
      languages: [lang],
      size: 10000,
      filterKeyName: selectedKeys,
    },
    options: {
      cacheTime: 0,
      staleTime: 0,
    },
  });

  const { changedNodes, missingKeys } = useMemo(() => {
    const changedNodes: NodeInfo[] = [];
    const missingKeys: PartialNodeInfo[] = [];

    selectedNodes.forEach((node) => {
      const key = translationsLoadable.data?._embedded?.keys?.find(
        (t) =>
          t.keyName === node.key && (t.keyNamespace || "") === (node.ns || "")
      );

      const value = key?.translations[lang]?.text;
      if (value) {
        if (value !== node.characters) {
          changedNodes.push({ ...node, characters: value });
        }
      } else {
        missingKeys.push({ id: node.id, key: node.key, ns: node.ns });
      }
    });

    return { changedNodes, missingKeys };
  }, [translationsLoadable.data, selectedNodes, lang]);

  const handleProcess = async () => {
    if (changedNodes.length !== 0) {
      emit<TranslationsUpdateHandler>("UPDATE_NODES", changedNodes);
    }
    setLanguage(lang);
    setRoute("index");
  };

  const handleGoBack = () => {
    setRoute("index");
  };

  const handleRepeat = () => {
    setSuccess(false);
    handleProcess();
  };

  const isLoading = translationsLoadable.isLoading;

  return (
    <Fragment>
      <TopBar
        onBack={handleGoBack}
        leftPart={<div>Pull translations from Tolgee platform ({lang})</div>}
      />
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        {isLoading ? (
          <FullPageLoading />
        ) : translationsLoadable.error ? (
          <Fragment>
            <div>
              {translationsLoadable.error || "Cannot get translation data"}
            </div>
            <ActionsBottom>
              <Button onClick={handleRepeat}>Try again</Button>
            </ActionsBottom>
          </Fragment>
        ) : success ? (
          <Fragment>
            <div>Success!</div>
            <ActionsBottom>
              <Button onClick={handleGoBack}>Continue to home page</Button>
            </ActionsBottom>
          </Fragment>
        ) : (
          <Fragment>
            <div>
              {changedNodes.length === 0
                ? "Everything up to date"
                : `This action will replace translations in ${changedNodes.length} nodes.`}
            </div>
            <div className={clsx(styles.list, styles.missing)}>
              {missingKeys.length > 0 && <NodeList nodes={missingKeys} />}
            </div>
            <ActionsBottom>
              {changedNodes.length === 0 ? (
                <Button onClick={handleProcess}>Ok</Button>
              ) : (
                <Fragment>
                  <Button onClick={handleGoBack} secondary>
                    Cancel
                  </Button>
                  <Button onClick={handleProcess}>Process</Button>
                </Fragment>
              )}
            </ActionsBottom>
          </Fragment>
        )}
      </Container>
    </Fragment>
  );
};
