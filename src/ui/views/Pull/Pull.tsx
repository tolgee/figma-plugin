import { Fragment, FunctionalComponent, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import clsx from "clsx";
import {
  Button,
  Container,
  Divider,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { useApiQuery } from "@/ui/client/useQueryApi";
import { ActionsBottom } from "@/ui/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { useGlobalActions } from "@/ui/state/GlobalState";
import { NodeList } from "@/ui/components/NodeList/NodeList";
import { getPullChanges } from "@/tools/getPullChanges";

import { TopBar } from "../../components/TopBar/TopBar";
import { RouteParam } from "../routes";
import styles from "./Pull.css";
import { useConnectedNodes } from "@/ui/hooks/useConnectedNodes";
import { useUpdateNodesMutation } from "@/ui/hooks/useUpdateNodesMutation";

type Props = RouteParam<"pull">;

export const Pull: FunctionalComponent<Props> = ({ lang }) => {
  const selectedNodes = useConnectedNodes({ ignoreSelection: false });
  const { setRoute, setLanguage } = useGlobalActions();
  const [success, setSuccess] = useState(false);

  const selectedKeys = useMemo(
    () => [...new Set(selectedNodes.data?.items.map((n) => n.key))],
    [selectedNodes.data]
  );

  const translationsLoadable = useApiQuery({
    url: "/v2/projects/translations",
    method: "get",
    query: {
      languages: [lang],
      size: 1000000,
      filterKeyName: selectedKeys,
    },
    options: {
      enabled: selectedNodes.isSuccess,
      cacheTime: 0,
      staleTime: 0,
    },
  });

  const updateNodeLoadable = useUpdateNodesMutation();

  const { changedNodes, missingKeys } = useMemo(() => {
    return getPullChanges(
      selectedNodes.data?.items || [],
      lang,
      translationsLoadable.data?._embedded?.keys || []
    );
  }, [selectedNodes.data, lang, translationsLoadable.data]);

  const handleProcess = async () => {
    if (changedNodes.length !== 0) {
      await updateNodeLoadable.mutateAsync({ nodes: changedNodes });
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

  const isLoading = translationsLoadable.isLoading || selectedNodes.isLoading;

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
          <FullPageLoading text="Searching document for translations" />
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
