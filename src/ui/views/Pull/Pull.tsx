import { Fragment, FunctionalComponent, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import clsx from "clsx";
import {
  Button,
  Container,
  Divider,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { emit } from "@/utilities";
import { useApiQuery } from "@/ui/client/useQueryApi";
import { ActionsBottom } from "@/ui/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { getConnectedNodes } from "@/tools/getConnectedNodes";
import { NodeInfo, TranslationsUpdateHandler } from "@/types";
import { NodeList } from "@/ui/components/NodeList/NodeList";
import { getPullChanges } from "@/tools/getPullChanges";

import { TopBar } from "../../components/TopBar/TopBar";
import { RouteParam } from "../routes";
import styles from "./Pull.css";

type Props = RouteParam<"pull">;

export const Pull: FunctionalComponent<Props> = ({ lang, nodes }) => {
  const allNodes = /*useGlobalState((c) => c.allNodes);*/ [] as NodeInfo[];
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
    return getPullChanges(
      selectedNodes,
      lang,
      translationsLoadable.data?._embedded?.keys || []
    );
  }, [selectedNodes, lang, translationsLoadable.data]);

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
    translationsLoadable.refetch();
  };

  const isLoading = translationsLoadable.isLoading;

  return (
    <Fragment>
      <TopBar
        onBack={handleGoBack}
        leftPart={<div>Pull translations from Tolgee ({lang})</div>}
      />
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        {isLoading ? (
          <FullPageLoading />
        ) : translationsLoadable.error ? (
          <Fragment>
            <div>
              {translationsLoadable.error || "Cannot get translation data."}
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
                : `This action will replace translations in ${changedNodes.length} text(s).`}
            </div>
            {missingKeys.length > 0 && (
              <Fragment>
                <div className={clsx(styles.sectionTitle)}>Missing keys:</div>
                <div className={clsx(styles.list, styles.missing)}>
                  <NodeList nodes={missingKeys} compact />
                </div>
              </Fragment>
            )}
            <ActionsBottom>
              {changedNodes.length === 0 ? (
                <Button data-cy="pull_ok_button" onClick={handleProcess}>
                  OK
                </Button>
              ) : (
                <Fragment>
                  <Button
                    data-cy="pull_cancel_button"
                    onClick={handleGoBack}
                    secondary
                  >
                    Cancel
                  </Button>
                  <Button data-cy="pull_submit_button" onClick={handleProcess}>
                    Replace
                  </Button>
                </Fragment>
              )}
            </ActionsBottom>
          </Fragment>
        )}
      </Container>
    </Fragment>
  );
};
