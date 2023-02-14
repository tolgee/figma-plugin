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
import { getChanges, KeyChanges, KeyChangeValue } from "@/tools/getChanges";
import { TopBar } from "../../components/TopBar/TopBar";
import { RouteParam } from "../routes";
import { Changes } from "./Changes";
import { FrameScreenshot, NodeInfo, SetNodesDataHandler } from "@/types";
import { emit } from "@/utilities";
import { endpointGetScreenshots } from "@/endpoints";

type ImportKeysResolvableItemDto =
  components["schemas"]["ImportKeysResolvableItemDto"];
type KeyScreenshotDto = components["schemas"]["KeyScreenshotDto"];

type Props = RouteParam<"push">;

export const Push: FunctionalComponent<Props> = ({ nodes }) => {
  const language = useGlobalState((c) => c.config!.language!);
  const { setRoute } = useGlobalActions();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | undefined>();
  const [changes, setChanges] = useState<KeyChanges>();

  const keys = useMemo(() => [...new Set(nodes.map((n) => n.key))], [nodes]);

  const deduplicatedNodes = useMemo(() => {
    const deduplicatedNodes: NodeInfo[] = [];
    nodes.forEach((node) => {
      if (
        !deduplicatedNodes.find(
          (n) => node.key === n.key && (node.ns || "") === (n.ns || "")
        )
      ) {
        deduplicatedNodes.push(node);
      }
    });
    return deduplicatedNodes;
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
      onSuccess(data) {
        endpointGetScreenshots.call().then((screenshots) => {
          setChanges(
            getChanges(
              deduplicatedNodes,
              data?._embedded?.keys || [],
              language,
              screenshots
            )
          );
        });
      },
    },
  });

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
    emit<SetNodesDataHandler>(
      "SET_NODES_DATA",
      nodes.map((n) => ({ ...n, connected: true }))
    );
  };

  const handleSubmit = async () => {
    const keys: ImportKeysResolvableItemDto[] = [];

    if (!changes) {
      return;
    }

    try {
      const screenshotsMap = new Map<FrameScreenshot, number>();
      const requiredScreenshots = changes.requiredScreenshots;

      for (const [i, screenshot] of requiredScreenshots.entries()) {
        setLoadingStatus(
          `Uploading images (${i + 1}/${requiredScreenshots.length})`
        );
        const blob = new Blob([screenshot.image.buffer], { type: "image/png" });
        const data = await uploadImage.mutateAsync({
          content: { "multipart/form-data": { image: blob as any } },
        });
        screenshotsMap.set(screenshot, data.id);
      }

      const mapScreenshots = (item: KeyChangeValue): KeyScreenshotDto[] => {
        const result: KeyScreenshotDto[] = [];
        item.screenshots.forEach((screenshot) => {
          const relevantNodes = screenshot.keys.filter(
            ({ key, ns, connected }) =>
              key === item.key && ns === item.ns && connected
          );

          result.push({
            text: item.newValue,
            uploadedImageId: screenshotsMap.get(screenshot)!,
            positions: relevantNodes.map(({ x, y, width, height }) => ({
              x,
              y,
              width,
              height,
            })),
          });
        });
        return result;
      };

      setLoadingStatus("Updating keys");

      changes.unchangedKeys.forEach((item) => {
        keys.push({
          name: item.key,
          namespace: item.ns || undefined,
          screenshots: mapScreenshots(item),
          translations: {},
        });
      });

      changes.changedKeys.forEach((item) => {
        keys.push({
          name: item.key,
          namespace: item.ns || undefined,
          screenshots: mapScreenshots(item),
          translations: {
            [language]: {
              text: item.newValue,
              resolution: "OVERRIDE",
            },
          },
        });
      });

      changes.newKeys.forEach((item) => {
        keys.push({
          name: item.key,
          namespace: item.ns || undefined,
          screenshots: mapScreenshots(item),
          translations: {
            [language]: { text: item.newValue, resolution: "NEW" },
          },
        });
      });

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
      console.error(e);
    } finally {
      setLoadingStatus(undefined);
    }
  };

  const handleRepeat = () => {
    setError(false);
    setSuccess(false);
    translationsLoadable.refetch();
  };

  const isLoading =
    translationsLoadable.isFetching ||
    updateTranslations.isLoading ||
    uploadImage.isLoading;

  const changesSize = changes
    ? changes.changedKeys.length + changes.newKeys.length
    : 0;

  const screenshotCount = changes?.requiredScreenshots.length || 0;

  return (
    <Fragment>
      <TopBar
        onBack={handleGoBack}
        leftPart={<div>Push translations to Tolgee platform ({language})</div>}
      />
      <Divider />
      <VerticalSpace space="large" />
      <Container space="medium">
        {isLoading || !changes ? (
          <FullPageLoading text={loadingStatus} />
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
            <div>
              Successfully updated {changesSize} keys and uploaded{" "}
              {screenshotCount} screenshots.
            </div>
            <ActionsBottom>
              <Button onClick={handleGoBack}>Ok</Button>
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
