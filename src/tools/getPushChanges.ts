import { FrameScreenshot, NodeInfo } from "@/types";
import { compareNs } from "./compareNs";
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
  language: string,
  screenshots: FrameScreenshot[]
): KeyChanges => {
  const newKeys: KeyChangeValue[] = [];
  const changedKeys: KeyChangeValue[] = [];
  const unchangedKeys: KeyChangeValue[] = [];

  const getKeyScreenshots = (value: NodeInfo): FrameScreenshot[] => {
    const result: FrameScreenshot[] = [];
    screenshots.forEach((screenshot) => {
      if (
        screenshot.keys.find(
          (node) => node.key === value.key && compareNs(node.ns, value.ns)
        )
      ) {
        result.push(screenshot);
      }
    });

    return result;
  };

  nodes.forEach((node) => {
    const oldValue = translations?.[node.ns ?? ""]?.[node.key];

    const hasChangesOutsideFromTolgee =
      stringFormatter(node.translation ?? "") !=
        stringFormatter(node.characters ?? "") &&
      Object.keys(node.paramsValues ?? {}).length == 0 &&
      !node.isPlural;

    const oldTolgeeValue = oldValue
      ? getTolgeeFormat(oldValue.translation, oldValue.keyIsPlural, false)
      : null;

    const newTranslation = hasChangesOutsideFromTolgee
      ? node.characters ?? node.translation
      : node.translation || node.characters;

    const newTolgeeValue = getTolgeeFormat(
      newTranslation,
      node.isPlural,
      false
    );

    const hasChanges =
      oldTolgeeValue == null ||
      (oldTolgeeValue &&
        (JSON.stringify(oldTolgeeValue) !== JSON.stringify(newTolgeeValue) ||
          oldValue.keyIsPlural !== node.isPlural));

    const change: KeyChangeValue = {
      key: node.key,
      ns: node.ns,
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
