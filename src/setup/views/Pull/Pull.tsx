import { useApiQuery } from "@/setup/client/useQueryApi";
import { ActionsBottom } from "@/setup/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/setup/components/FullPageLoading/FullPageLoading";
import { useGlobalActions, useGlobalState } from "@/setup/state/GlobalState";
import { NodeInfo, TranslationsUpdateHandler } from "@/types";
import {
  Button,
  Container,
  Divider,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { Fragment, FunctionalComponent, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { TopBar } from "../Index/TopBar/TopBar";
import { RouteParam } from "../routes";
import { MissingKeys } from "./MissingKeys";

type Props = RouteParam<"pull">;

export const Pull: FunctionalComponent<Props> = ({ lang, nodes }) => {
  const allNodes = useGlobalState((c) => c.allNodes);
  const selectedNodes = nodes || allNodes;
  const { setRoute, setLanguage } = useGlobalActions();
  const [success, setSuccess] = useState(false);

  console.log({ lang, nodes });

  const connectedNodes = useMemo(
    () => selectedNodes.filter((n) => n.key),
    [selectedNodes]
  );

  const allKeys = useMemo(
    () => [...new Set(connectedNodes.map((n) => n.key))],
    [connectedNodes]
  );

  const translationsLoadable = useApiQuery({
    url: "/v2/projects/translations",
    method: "get",
    query: {
      structureDelimiter: null,
      languages: [lang],
      size: 10000,
      filterKeyName: allKeys,
    },
    options: {
      cacheTime: 0,
      staleTime: 0,
    },
  });

  const { changedNodes, missingKeys } = useMemo(() => {
    const changedNodes: NodeInfo[] = [];
    const missingKeys: string[] = [];

    connectedNodes.forEach((node) => {
      const key = translationsLoadable.data?._embedded?.keys?.find(
        (t) => t.keyName === node.key
      );

      const value = key?.translations[lang]?.text;
      if (value) {
        if (value !== node.characters) {
          changedNodes.push({ ...node, characters: value });
        }
      } else {
        missingKeys.push(node.key);
      }
    });

    return { changedNodes, missingKeys };
  }, [translationsLoadable.data, connectedNodes, lang]);

  const handleProcess = async () => {
    emit<TranslationsUpdateHandler>("UPDATE_NODES", changedNodes);
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
        leftPart={<div>Pull translations ({lang})</div>}
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
            <div>
              {missingKeys.length > 0 && (
                <MissingKeys missingKeys={missingKeys} />
              )}
            </div>
            <ActionsBottom>
              {changedNodes.length === 0 ? (
                <Button onClick={handleProcess}>Ok</Button>
              ) : (
                <Fragment>
                  <Button onClick={handleGoBack} secondary>
                    Cancel
                  </Button>
                  <Button onClick={handleProcess}>Submit</Button>
                </Fragment>
              )}
            </ActionsBottom>
          </Fragment>
        )}
      </Container>
    </Fragment>
  );
};
