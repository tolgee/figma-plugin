import { FrameScreenshot, NodeInfo, TolgeeConfig } from "@/types";
import { TranslationData } from "../ui/client/types";
import { getTolgeeFormat } from "@tginternal/editor";
import { stringFormatter } from "../main/utils/textFormattingTools";

export type KeyChangeValue = {
  key: string;
  ns: string | undefined;
  oldValue?: string;
  newValue: string;
  isPlural: boolean;
  oldIsPlural?: boolean;
  screenshots: FrameScreenshot[];
};

export type KeyChanges = {
  newKeys: KeyChangeValue[];
  changedKeys: KeyChangeValue[];
  unchangedKeys: KeyChangeValue[];
  screenshots: FrameScreenshot[];
};

export const getPushChanges = (
  nodes: NodeInfo[],
  translations: TranslationData,
  hasNamespacesEnabled: boolean,
  screenshots: FrameScreenshot[],
  tolgeeConfig: Partial<TolgeeConfig> | null,
): KeyChanges => {
  const newKeys: KeyChangeValue[] = [];
  const changedKeys: KeyChangeValue[] = [];
  const unchangedKeys: KeyChangeValue[] = [];

  const screenshotsByKey = new Map<string, FrameScreenshot[]>();
  screenshots.forEach((screenshot) => {
    screenshot.keys.forEach((node) => {
      const mapKey = `${node.key}\0${hasNamespacesEnabled ? node.ns || "" : ""}`;
      let list = screenshotsByKey.get(mapKey);
      if (!list) {
        list = [];
        screenshotsByKey.set(mapKey, list);
      }
      list.push(screenshot);
    });
  });

  const getKeyScreenshots = (value: NodeInfo): FrameScreenshot[] => {
    const mapKey = `${value.key}\0${hasNamespacesEnabled ? value.ns || "" : ""}`;
    return screenshotsByKey.get(mapKey) ?? [];
  };
  const newTags = tolgeeConfig?.tags;

  nodes.forEach((node) => {
    const nsLookup = hasNamespacesEnabled ? (node.ns ?? "") : "";
    const oldValue = translations?.[nsLookup]?.[node.key];

    const oldTags = oldValue?.keyTags.map((tag) => tag.name) ?? [];

    const hasChangesOutsideFromTolgee =
      stringFormatter(node.translation ?? "") !=
        stringFormatter(node.characters ?? "") &&
      Object.keys(node.paramsValues ?? {}).length == 0 &&
      !node.isPlural;

    const oldTolgeeValue = oldValue
      ? getTolgeeFormat(oldValue.translation, oldValue.keyIsPlural, false)
      : null;

    const newTranslation = hasChangesOutsideFromTolgee
      ? (node.characters ?? node.translation)
      : node.translation || node.characters;

    const newTolgeeValue = getTolgeeFormat(
      newTranslation,
      node.isPlural,
      false,
    );

    const hasChanges =
      oldTolgeeValue == null ||
      (oldTolgeeValue &&
        (JSON.stringify(oldTolgeeValue) !== JSON.stringify(newTolgeeValue) ||
          oldValue.keyIsPlural !== node.isPlural)) ||
      newTags?.some((tag) => !oldTags.includes(tag));

    const change: KeyChangeValue = {
      key: node.key,
      ns: hasNamespacesEnabled ? node.ns : undefined,
      oldValue: oldValue ? oldValue.translation : undefined,
      oldIsPlural: oldValue ? oldValue.keyIsPlural : undefined,
      isPlural: node.isPlural,
      newValue: newTranslation,
      screenshots: getKeyScreenshots(node),
    };

    if (!oldValue) {
      newKeys.push(change);
    } else if (hasChanges) {
      changedKeys.push(change);
    } else {
      unchangedKeys.push(change);
    }
  });

  return { newKeys, changedKeys, unchangedKeys, screenshots };
};
