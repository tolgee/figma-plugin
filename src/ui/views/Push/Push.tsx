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

import { components } from "@/ui/client/apiSchema.generated";
import { useApiMutation } from "@/ui/client/useQueryApi";
import { ActionsBottom } from "@/ui/components/ActionsBottom/ActionsBottom";
import { FullPageLoading } from "@/ui/components/FullPageLoading/FullPageLoading";
import { useGlobalActions, useGlobalState } from "@/ui/state/GlobalState";
import {
  getPushChanges,
  KeyChanges,
  KeyChangeValue,
} from "@/tools/getPushChanges";
import { TopBar } from "../../components/TopBar/TopBar";
import { Changes } from "./Changes";
import { FrameScreenshot, NodeInfo } from "@/types";
import { compareNs } from "@/tools/compareNs";
import { getScreenshotsEndpoint } from "@/main/endpoints/getScreenshots";
import { useConnectedNodes } from "@/ui/hooks/useConnectedNodes";
import { useSetNodesDataMutation } from "@/ui/hooks/useSetNodesDataMutation";
import { useAllTranslations } from "@/ui/hooks/useAllTranslations";
import { useHasNamespacesEnabled } from "../../hooks/useHasNamespacesEnabled";

type ImportKeysResolvableItemDto =
  components["schemas"]["ImportKeysResolvableItemDto"];
type KeyScreenshotDto = components["schemas"]["KeyScreenshotDto"];

export const Push: FunctionalComponent = () => {
  const language = useGlobalState((c) => c.config!.language!);
  const branch = useGlobalState((c) => c.config?.branch);
  const { setRoute } = useGlobalActions();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [_loadingStatus, setLoadingStatus] = useState<string | undefined>();
  const [changes, setChanges] = useState<KeyChanges>();
  const [pushedKeysCount, setPushedKeysCount] = useState<number>(0);
  const selectedNodes = useConnectedNodes({ ignoreSelection: false });
  const tolgeeConfig = useGlobalState((c) => c.config);
  const [uploadedScreenshotCount, setUploadedScreenshotCount] = useState(0);

  const nodes = selectedNodes.data?.items ?? [];

  const [uploadScreenshots, setUploadScreenshots] = useState(true);

  // Optimize deduplication from O(n²) to O(n) using Set
  const deduplicatedNodes = useMemo(() => {
    const seen = new Set<string>();
    const deduplicatedNodes: NodeInfo[] = [];
    for (const node of nodes) {
      const key = `${node.key}:${node.ns || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicatedNodes.push(node);
      }
    }
    return deduplicatedNodes;
  }, [nodes]);

  const allTranslationsLoadable = useAllTranslations();
  const hasNamespacesEnabled = useHasNamespacesEnabled();

  // Create a stable key from nodes to detect changes (including namespace changes)
  const nodesKey = useMemo(
    () => nodes.map((n) => `${n.id}:${n.key}:${n.ns || ""}`).join("|"),
    [nodes],
  );

  // Extract unique namespaces from nodes being pushed (performance optimization)
  // Only load translations for namespaces actually used by the nodes
  // This is computed inside the effect to avoid dependency issues
  const requiredNamespacesKey = useMemo(() => {
    if (!hasNamespacesEnabled) return "";
    const uniqueNamespaces = Array.from(
      new Set(
        deduplicatedNodes
          .map((node) => node.ns)
          .filter((ns): ns is string => Boolean(ns)),
      ),
    );
    return uniqueNamespaces.sort().join(",");
  }, [deduplicatedNodes, hasNamespacesEnabled]);

  // Memoize screenshots key to avoid regenerating screenshots unnecessarily
  const screenshotsKey = useMemo(
    () =>
      tolgeeConfig?.updateScreenshots
        ? nodes.map((n) => `${n.id}:${n.key}:${n.ns || ""}`).join("|")
        : "",
    [nodes, tolgeeConfig?.updateScreenshots],
  );

  // Extract stable primitive values from tolgeeConfig to avoid object reference issues
  const tolgeeConfigTags = useMemo(
    () => JSON.stringify([...(tolgeeConfig?.tags ?? [])].sort()),
    [tolgeeConfig?.tags],
  );
  const tolgeeConfigUpdateScreenshots = tolgeeConfig?.updateScreenshots ?? true;
  const tolgeeConfigAddTags = tolgeeConfig?.addTags ?? false;

  useEffect(() => {
    // Don't recompute if we're showing success screen
    if (success) {
      return;
    }

    let cancelled = false;

    async function computeDiff() {
      setLoadingStatus("Loading translations");
      try {
        // Compute requiredNamespaces inside the effect to avoid dependency issues
        // Include all namespaces from nodes, including empty string for default namespace
        const requiredNamespaces =
          hasNamespacesEnabled && deduplicatedNodes.length > 0
            ? Array.from(
                new Set(deduplicatedNodes.map((node) => node.ns ?? "")),
              )
            : undefined;

        const translations = await allTranslationsLoadable.getData({
          language,
          namespaces: requiredNamespaces,
          branch: branch || undefined,
        });

        // Check if cancelled before expensive screenshot operation
        if (cancelled) return;

        const screenshots = tolgeeConfigUpdateScreenshots
          ? await getScreenshotsEndpoint.call(nodes)
          : [];

        // Check if cancelled before setting state
        if (cancelled) return;

        // Reconstruct tolgeeConfig object for getPushChanges
        const configForDiff = {
          ...tolgeeConfig,
          updateScreenshots: tolgeeConfigUpdateScreenshots,
          addTags: tolgeeConfigAddTags,
        };

        setChanges(
          getPushChanges(
            deduplicatedNodes,
            translations,
            hasNamespacesEnabled,
            screenshots,
            configForDiff,
          ),
        );
      } catch (e) {
        if (cancelled) return;
        if (e === "invalid_project_api_key") {
          setErrorMessage("Invalid API key");
        } else {
          setErrorMessage(`Cannot get translation data. ${e}`);
        }
      } finally {
        if (!cancelled) {
          setLoadingStatus(undefined);
        }
      }
    }

    computeDiff();

    // Cleanup: cancel if dependencies change before async operations complete
    return () => {
      cancelled = true;
    };
  }, [
    nodesKey,
    screenshotsKey,
    hasNamespacesEnabled,
    language,
    branch,
    requiredNamespacesKey,
    tolgeeConfigTags,
    tolgeeConfigUpdateScreenshots,
    tolgeeConfigAddTags,
    success, // Include success to prevent recompute when showing success screen
    // Note: allTranslationsLoadable.getData is stable via useCallback with refs
    // We don't include allTranslationsLoadable itself to avoid infinite loops
  ]);

  const totalScreenshotCount = useMemo(() => {
    return changes?.screenshots.length || 0;
  }, [changes]);

  const setNodesDataMutation = useSetNodesDataMutation();

  const loadingStatus =
    allTranslationsLoadable.isLoading || selectedNodes.isLoading
      ? "Loading data and generating screenshots"
      : _loadingStatus;

  const updateTranslations = useApiMutation({
    url: "/v2/projects/keys/import-resolvable",
    method: "post",
  });

  const addTagsToKeys = useApiMutation({
    url: "/v2/projects/tag-complex",
    method: "put",
  });

  const uploadImage = useApiMutation({
    url: "/v2/image-upload",
    method: "post",
  });

  const bigMeta = useApiMutation({
    url: "/v2/projects/big-meta",
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
            (k) => k.key === n.key && compareNs(k.ns, n.ns),
          )?.newValue ?? n.translation,
        connected: true,
      })),
    });
  };

  const handleConnectOnly = () => {
    connectNodes();
    setRoute("index");
  };

  const handleSubmit = async () => {
    const keys: ImportKeysResolvableItemDto[] = [];

    if (!changes) {
      return;
    }

    setUploadedScreenshotCount(0);
    setIsPushing(true);

    try {
      const screenshotsMap = new Map<FrameScreenshot, number>();
      const requiredScreenshots = uploadScreenshots ? changes.screenshots : [];

      for (const [i, screenshot] of requiredScreenshots.entries()) {
        setLoadingStatus(
          `Uploading images (${i + 1}/${requiredScreenshots.length})`,
        );
        const imageBlob = new Blob([screenshot.image.buffer as ArrayBuffer], {
          type: "image/png",
        });
        const location = `figma-${screenshot.info.id}`;
        const infoBlob = new Blob([JSON.stringify({ location })], {
          type: "application/json",
        });
        const data = await uploadImage.mutateAsync({
          content: {
            "multipart/form-data": {
              image: imageBlob as any,
              info: infoBlob as any,
            },
          },
        });
        screenshotsMap.set(screenshot, data.id);
      }

      const mapScreenshots = (item: KeyChangeValue): KeyScreenshotDto[] => {
        const result: KeyScreenshotDto[] = [];
        if (uploadScreenshots) {
          item.screenshots.forEach((screenshot) => {
            const relevantNodes = screenshot.keys.filter(
              ({ key, ns }) => key === item.key && compareNs(ns, item.ns),
            );

            result.push({
              text: item.newValue,
              uploadedImageId: screenshotsMap.get(screenshot)!,
              positions: relevantNodes.map(({ x, y, width, height }) => {
                return {
                  x,
                  y,
                  width,
                  height,
                };
              }),
            });
          });
        }
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
              resolution: item.oldValue ? "OVERRIDE" : "NEW",
            },
          },
        });
      });

      changes.newKeys.forEach((item) => {
        keys.push({
          name: item.key,
          branch: branch || undefined,
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

      try {
        // Add tags to keys
        if (
          (tolgeeConfig?.addTags ?? false) &&
          tolgeeConfig?.tags &&
          tolgeeConfig.tags.length > 0
        ) {
          await addTagsToKeys.mutateAsync({
            query: { branch: branch || undefined },
            content: {
              "application/json": {
                tagFiltered: tolgeeConfig?.tags ?? [],
                filterKeys: [
                  ...changes.newKeys,
                  ...changes.unchangedKeys,
                  ...changes.changedKeys,
                ].map((k) => ({
                  name: k.key,
                  namespace: k.ns || undefined,
                })),
              },
            },
          });
        }
      } catch (e) {
        setErrorMessage(
          `Error adding tags. ${e}. Translations were still updated.`,
        );
      }

      if ((tolgeeConfig?.updateScreenshots ?? true) && uploadScreenshots) {
        for (const screenshot of changes.screenshots.values()) {
          try {
            const relatedKeys = screenshot.keys
              .map((data) => ({
                keyName: data.key,
                namespace: data.ns || undefined,
              }))
              .slice(0, 100);
            await bigMeta.mutateAsync({
              query: { branch: branch || undefined },
              content: {
                "application/json": {
                  relatedKeysInOrder: relatedKeys,
                },
              },
            });
            setUploadedScreenshotCount((c) => c + 1);
          } catch (e) {
            if (e === "too_many_uploaded_images") {
              setErrorMessage(
                "Too many uploaded images. Disable update screenshots in settings. Translations were still updated.",
              );
            } else {
              setErrorMessage(
                `Error updating screenshots. ${e}. Translations were still updated.`,
              );
            }
          }
        }
      }

      // Store the count of keys that were pushed before clearing cache
      const keysPushed = changes.newKeys.length + changes.changedKeys.length;
      setPushedKeysCount(keysPushed);

      connectNodes();

      // Clear translations cache so newly pushed keys are recognized on next check
      allTranslationsLoadable.clearCache();

      setSuccess(true);
    } catch (e) {
      setError(true);
      if (e === "invalid_project_api_key") {
        setErrorMessage("Invalid project API key");
      } else if (e === "too_many_uploaded_images") {
        setErrorMessage(
          "Too many uploaded images. Disable update screenshots in settings.",
        );
      } else if (e === "import_keys_error") {
        setErrorMessage("Error pushing translations. Please try again.");
      } else {
        setErrorMessage(`Cannot push translations. ${e}`);
      }
      console.error(e);
    } finally {
      setIsPushing(false);
      setLoadingStatus(undefined);
    }
  };

  const handleRepeat = () => {
    setError(false);
    setSuccess(false);
    setPushedKeysCount(0);
    setUploadedScreenshotCount(0);
    setErrorMessage(undefined);
  };

  const isLoading =
    allTranslationsLoadable.isLoading ||
    updateTranslations.isLoading ||
    uploadImage.isLoading;

  // Use pushedKeysCount if we're showing success (after push), otherwise use current changes
  const changesSize = success
    ? pushedKeysCount
    : changes
      ? changes.changedKeys.length + changes.newKeys.length
      : 0;

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
        ) : success ? (
          // Show success screen immediately, don't wait for recompute
          <Fragment>
            <div>
              Successfully updated {pushedKeysCount} key(s)
              {uploadScreenshots
                ? ` and uploaded ${uploadedScreenshotCount} screenshot(s).`
                : "."}
            </div>
            <ActionsBottom>
              <Button data-cy="push_ok_button" onClick={handleGoBack}>
                OK
              </Button>
            </ActionsBottom>
          </Fragment>
        ) : isLoading || !changes || isPushing ? (
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
        ) : (
          <Fragment>
            {totalScreenshotCount !== 0 && (
              <Fragment>
                <Checkbox
                  data-cy="push_upload_screenshots_checkbox"
                  value={uploadScreenshots}
                  onChange={(e) =>
                    setUploadScreenshots(Boolean(e.currentTarget.checked))
                  }
                >
                  <Text>Upload {totalScreenshotCount} screenshot(s)</Text>
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
              {noChanges &&
              (totalScreenshotCount === 0 || !uploadScreenshots) ? (
                <Button
                  data-cy="push_finish_button"
                  onClick={handleConnectOnly}
                >
                  Finish
                </Button>
              ) : (
                <Button data-cy="push_submit_button" onClick={handleSubmit}>
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
