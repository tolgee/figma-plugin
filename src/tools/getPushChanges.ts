import { FrameScreenshot, NodeInfo } from "@/types";
import { compareNs } from "./compareNs";

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
  translations: Record<string, Record<string, string>>,
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

    const change: KeyChangeValue = {
      key: node.key,
      ns: node.ns,
      oldValue,
      newValue: node.characters,
      screenshots: getKeyScreenshots(node),
    };

    if (!oldValue) {
      newKeys.push(change);
    } else if (change.oldValue !== change.newValue) {
      changedKeys.push(change);
    } else {
      unchangedKeys.push(change);
    }
  });

  return { newKeys, changedKeys, unchangedKeys, screenshots };
};
