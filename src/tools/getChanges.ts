import { FrameScreenshot, NodeInfo } from "@/types";
import { components } from "../client/apiSchema.generated";

type KeyWithTranslationsModel =
  components["schemas"]["KeyWithTranslationsModel"];

export type KeyChangeValue = {
  key: string;
  ns: string | undefined;
  oldValue?: string;
  newValue: string;
  screenshots: FrameScreenshot[];
};

export type KeyChanges = {
  newKeys: KeyChangeValue[];
  changedKeys: KeyChangeValue[];
  unchangedKeys: KeyChangeValue[];
  requiredScreenshots: FrameScreenshot[];
};

export const getChanges = (
  nodes: NodeInfo[],
  translations: KeyWithTranslationsModel[],
  language: string,
  screenshots: FrameScreenshot[]
): KeyChanges => {
  const newKeys: KeyChangeValue[] = [];
  const changedKeys: KeyChangeValue[] = [];
  const unchangedKeys: KeyChangeValue[] = [];
  const requiredScreenshots: FrameScreenshot[] = [];

  const getKeyScreenshots = (value: NodeInfo): FrameScreenshot[] => {
    const result: FrameScreenshot[] = [];
    screenshots.forEach((screenshot) => {
      if (
        screenshot.keys.find(
          (node) =>
            node.key === value.key &&
            (node.ns || "") === (value.ns || "") &&
            node.connected
        )
      ) {
        if (!requiredScreenshots.includes(screenshot)) {
          requiredScreenshots.push(screenshot);
        }
        result.push(screenshot);
      }
    });

    return result;
  };

  nodes.forEach((node) => {
    const key = translations.find(
      (t) =>
        t.keyName === node.key &&
        (t.keyNamespace || "") === (node.ns || "") &&
        t.translations[language]?.text
    );
    const change = {
      key: node.key,
      ns: node.ns,
      oldValue: key?.translations[language]?.text,
      newValue: node.characters,
      screenshots: getKeyScreenshots(node),
    };

    if (!key) {
      newKeys.push(change);
    } else if (change.oldValue !== change.newValue) {
      changedKeys.push(change);
    } else {
      unchangedKeys.push(change);
    }
  });

  return { newKeys, changedKeys, unchangedKeys, requiredScreenshots };
};
