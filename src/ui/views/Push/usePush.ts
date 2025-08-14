import { compareNs } from "@/tools/compareNs";
import { KeyChanges, KeyChangeValue } from "@/tools/getPushChanges";
import { satisfiesMinimalVersion } from "@/tools/satisfiesMinimalVersion";
import { FrameScreenshot } from "@/types";
import { components } from "@/ui/client/apiSchema.generated";
import { API_VERSION } from "@/ui/client/client";
import { useApiMutation } from "@/ui/client/useQueryApi";
import { useGlobalState } from "@/ui/state/GlobalState";
import { useState } from "preact/hooks";

type KeyScreenshotDto = components["schemas"]["KeyScreenshotDto"];
type SimpleImportConflictResult =
  components["schemas"]["SimpleImportConflictResult"];

type KeyWithTranslationsUniversal<R extends string> = {
  /**
   * @description Key name to set translations for
   * @example what_a_key_to_translate
   */
  name: string;
  /** @description The namespace of the key. (When empty or null default namespace will be used) */
  namespace?: string;
  screenshots?: components["schemas"]["KeyScreenshotDto"][];
  /** @description Object mapping language tag to translation */
  translations: {
    [key: string]: {
      text: string;
      resolution: R;
    };
  };
};

export function usePush(setLoadingStatus: (message?: string) => void) {
  const [unresolvedConflicts, setUnresolvedConflicts] =
    useState<SimpleImportConflictResult[]>();

  const updateTranslationsNew = useApiMutation({
    url: "/v2/projects/single-step-import-resolvable",
    method: "post",
  });

  const updateTranslationsOld = useApiMutation({
    url: "/v2/projects/keys/import-resolvable",
    method: "post",
  });

  const uploadImage = useApiMutation({
    url: "/v2/image-upload",
    method: "post",
  });

  const bigMeta = useApiMutation({
    url: "/v2/projects/big-meta",
    method: "post",
  });

  const addTagsToKeys = useApiMutation({
    url: "/v2/projects/tag-complex",
    method: "put",
  });

  const tolgeeConfig = useGlobalState((c) => c.config);

  async function push(
    changes: KeyChanges,
    uploadScreenshots: boolean,
    language: string,
    override: boolean
  ) {
    const screenshotsMap = new Map<FrameScreenshot, number>();
    const requiredScreenshots = uploadScreenshots ? changes.screenshots : [];
    setUnresolvedConflicts(undefined);

    for (const [i, screenshot] of requiredScreenshots.entries()) {
      setLoadingStatus(
        `Uploading images (${i + 1}/${requiredScreenshots.length})`
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
            ({ key, ns }) => key === item.key && compareNs(ns, item.ns)
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

    function mapKeys<R extends string>(
      values: KeyChangeValue[],
      resolution: R
    ) {
      const result: KeyWithTranslationsUniversal<R>[] = [];
      values.forEach((item) => {
        result.push({
          name: item.key,
          namespace: item.ns || undefined,
          screenshots: mapScreenshots(item),
          translations: {
            [language]: {
              text: item.newValue,
              resolution,
            },
          },
        });
      });
      return result;
    }

    setLoadingStatus("Updating keys");

    // Making it backwards compatible with the old API
    if (satisfiesMinimalVersion("3.127.0", API_VERSION) !== false) {
      const keys = [
        ...mapKeys(changes.unchangedKeys, "EXPECT_NO_CONFLICT"),
        ...mapKeys(changes.newKeys, "EXPECT_NO_CONFLICT"),
        ...mapKeys(changes.changedKeys, "OVERRIDE"),
      ];
      const result = await updateTranslationsNew.mutateAsync({
        content: {
          "application/json": {
            errorOnUnresolvedConflict: false,
            keys,
            overrideMode: override ? "ALL" : "RECOMMENDED",
          },
        },
      });
      if (result.unresolvedConflicts?.length) {
        setUnresolvedConflicts(result.unresolvedConflicts);
      }
    } else {
      const keys = [
        ...mapKeys(changes.unchangedKeys, "KEEP"),
        ...mapKeys(changes.newKeys, "NEW"),
        ...mapKeys(changes.changedKeys, "OVERRIDE"),
      ];
      await updateTranslationsOld.mutateAsync({
        content: {
          "application/json": {
            keys,
          },
        },
      });
    }

    // Add tags to keys
    if (
      (tolgeeConfig?.addTags ?? false) &&
      tolgeeConfig?.tags &&
      tolgeeConfig.tags.length > 0
    ) {
      await addTagsToKeys.mutateAsync({
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

    if (tolgeeConfig?.updateScreenshots ?? true) {
      for (const screenshot of changes.screenshots.values()) {
        const relatedKeys = screenshot.keys
          .map((data) => ({
            keyName: data.key,
            namespace: data.ns || undefined,
          }))
          .slice(0, 100);
        await bigMeta.mutateAsync({
          content: {
            "application/json": {
              relatedKeysInOrder: relatedKeys,
            },
          },
        });
      }
    }
  }

  return { push, unresolvedConflicts };
}
