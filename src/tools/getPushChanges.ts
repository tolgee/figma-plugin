import { FrameScreenshot, NodeInfo } from "@/types";
import { components } from "../client/apiSchema.generated";
import { compareNs } from "./compareNs";

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
  screenshots: FrameScreenshot[];
};

export const getPushChanges = (
  nodes: NodeInfo[],
  translations: KeyWithTranslationsModel[],
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
    const key = translations.find(
      (t) =>
        t.keyName === node.key &&
        compareNs(t.keyNamespace, node.ns) &&
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

  return { newKeys, changedKeys, unchangedKeys, screenshots };
};
