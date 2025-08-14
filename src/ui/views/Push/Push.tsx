import { Fragment, FunctionalComponent, h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import {
  Banner,
  Button,
  Checkbox,
  Container,
  Divider,
  IconWarning32,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";

import { useApiMutation } from "@/ui/client/useQueryApi";
import { ActionsBottom } from "@/ui/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import { getPushChanges, KeyChanges } from "@/tools/getPushChanges";
import { TopBar } from "../../components/TopBar/TopBar";
import { Changes } from "./Changes";
import { NodeInfo } from "@/types";
import { compareNs } from "@/tools/compareNs";
import { getScreenshotsEndpoint } from "@/main/endpoints/getScreenshots";
import { useConnectedNodes } from "@/ui/hooks/useConnectedNodes";
import { useSetNodesDataMutation } from "@/ui/hooks/useSetNodesDataMutation";
import { useAllTranslations } from "@/ui/hooks/useAllTranslations";
import { usePush } from "./usePush";
import { UnresolvedConflicts } from "./UnresolvedConflicts";

export const Push: FunctionalComponent = () => {
  const language = useGlobalState((c) => c.config!.language!);
  const { setRoute } = useGlobalActions();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [_loadingStatus, setLoadingStatus] = useState<string | undefined>();
  const [changes, setChanges] = useState<KeyChanges>();
  const selectedNodes = useConnectedNodes({ ignoreSelection: false });
  const tolgeeConfig = useGlobalState((c) => c.config);

  const nodes = selectedNodes.data?.items ?? [];

  const [uploadScreenshots, setUploadScreenshots] = useState(true);

  const deduplicatedNodes = useMemo(() => {
    const deduplicatedNodes: NodeInfo[] = [];
    nodes.forEach((node) => {
      if (
        !deduplicatedNodes.find(
          (n) => node.key === n.key && compareNs(node.ns, n.ns)
        )
      ) {
        deduplicatedNodes.push(node);
      }
    });
    return deduplicatedNodes;
  }, [nodes]);

  const allTranslationsLoadable = useAllTranslations();

  async function computeDiff() {
    try {
      const translations = await allTranslationsLoadable.getData({
        language,
      });

      const screenshots =
        tolgeeConfig?.updateScreenshots ?? true
          ? await getScreenshotsEndpoint.call(nodes)
          : [];

      setChanges(
        getPushChanges(
          deduplicatedNodes,
          translations,
          language,
          screenshots,
          tolgeeConfig
        )
      );
    } catch (e) {
      if (e === "invalid_project_api_key") {
        setErrorMessage("Invalid API key");
      } else {
        setErrorMessage(`Cannot get translation data. ${e}`);
      }
    } finally {
      setLoadingStatus(undefined);
    }
  }

  useEffect(() => {
    computeDiff();
  }, [nodes.length]);

  const setNodesDataMutation = useSetNodesDataMutation();

  const loadingStatus =
    allTranslationsLoadable.isLoading || selectedNodes.isLoading
      ? "Loading data and generating screenshots"
      : _loadingStatus;

  const updateTranslations = useApiMutation({
    url: "/v2/projects/keys/import-resolvable",
    method: "post",
  });

  const uploadImage = useApiMutation({
    url: "/v2/image-upload",
    method: "post",
  });

  const handleGoBack = () => {
    setRoute("index");
  };

  const connectNodes = () => {
    setNodesDataMutation.mutate({
      nodes: nodes.map((n) => ({
        ...n,
        translation:
          changes?.changedKeys.find(
            (k) => k.key === n.key && compareNs(k.ns, n.ns)
          )?.newValue ?? n.translation,
        connected: true,
      })),
    });
  };

  const handleConnectOnly = () => {
    connectNodes();
    setRoute("index");
  };

  const { push, unresolvedConflicts } = usePush(setLoadingStatus);
  const unresolvedConflictsSize = unresolvedConflicts?.length ?? 0;

  const handleSubmit = async (override = false) => {
    if (!changes) {
      return;
    }

    try {
      await push(changes, uploadScreenshots, language, override);
      connectNodes();
      setSuccess(true);
    } catch (e) {
      setError(true);
      if (e === "invalid_project_api_key") {
        setErrorMessage("Invalid project API key");
      } else {
        setErrorMessage(`Cannot get translation data. ${e}`);
      }
      console.error(e);
    } finally {
      setLoadingStatus(undefined);
    }
  };

  const handleRepeat = () => {
    setError(false);
    setSuccess(false);
    computeDiff();
  };

  const isLoading =
    allTranslationsLoadable.isLoading ||
    updateTranslations.isLoading ||
    uploadImage.isLoading;

  const changesSize = changes
    ? changes.changedKeys.length + changes.newKeys.length
    : 0;

  const screenshotCount = changes?.screenshots.length || 0;

  const noChanges = changesSize === 0;

  return (
    <Fragment>
      <TopBar
        onBack={handleGoBack}
        leftPart={<div>Push translations to Tolgee ({language})</div>}
      />
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        {errorMessage && !error ? (
          <Banner icon={<IconWarning32 />}>{errorMessage}</Banner>
        ) : isLoading || !changes ? (
          <FullPageLoading text={loadingStatus} />
        ) : error ? (
          <Fragment>
            <div>
              <Banner icon={<IconWarning32 />}>
                {errorMessage ||
                  updateTranslations.error ||
                  "An error has occurred during push."}
              </Banner>
            </div>
            <ActionsBottom>
              <Button onClick={handleRepeat}>Try again</Button>
            </ActionsBottom>
          </Fragment>
        ) : success ? (
          <Fragment>
            <div>
              Successfully updated {changesSize - unresolvedConflictsSize}{" "}
              key(s)
              {uploadScreenshots
                ? ` and uploaded ${screenshotCount} screenshot(s).`
                : "."}
            </div>
            {unresolvedConflicts && (
              <UnresolvedConflicts
                conflicts={unresolvedConflicts}
                onOverride={() => handleSubmit(true)}
              />
            )}
            <ActionsBottom>
              <Button data-cy="push_ok_button" onClick={handleGoBack}>
                OK
              </Button>
            </ActionsBottom>
          </Fragment>
        ) : (
          <Fragment>
            {screenshotCount !== 0 && (
              <Fragment>
                <Checkbox
                  data-cy="push_upload_screenshots_checkbox"
                  value={uploadScreenshots}
                  onChange={(e) =>
                    setUploadScreenshots(Boolean(e.currentTarget.checked))
                  }
                >
                  <Text>Upload {screenshotCount} screenshot(s)</Text>
                </Checkbox>
                <VerticalSpace space="medium" />
              </Fragment>
            )}
            <Changes changes={changes} />
            {noChanges && <div>No changes necessary</div>}
            <ActionsBottom>
              <Button
                data-cy="push_cancel_button"
                onClick={handleGoBack}
                secondary
              >
                Cancel
              </Button>
              {noChanges && (screenshotCount === 0 || !uploadScreenshots) ? (
                <Button
                  data-cy="push_finish_button"
                  onClick={handleConnectOnly}
                >
                  Finish
                </Button>
              ) : (
                <Button
                  data-cy="push_submit_button"
                  onClick={() => handleSubmit()}
                >
                  Push to Tolgee
                </Button>
              )}
            </ActionsBottom>
          </Fragment>
        )}
      </Container>
    </Fragment>
  );
};
