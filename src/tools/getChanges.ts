import { NodeInfo } from "@/types";
import { components } from "../client/apiSchema.generated";

type KeyWithTranslationsModel =
  components["schemas"]["KeyWithTranslationsModel"];

export type KeyChangeValue = {
  key: string;
  ns: string | undefined;
  oldValue?: string;
  newValue: string;
};

export type KeyChanges = {
  newKeys: KeyChangeValue[];
  changedKeys: KeyChangeValue[];
};

export const getChanges = (
  nodes: NodeInfo[],
  translations: KeyWithTranslationsModel[],
  language: string
): KeyChanges => {
  const newKeys: KeyChangeValue[] = [];
  const changedKeys: KeyChangeValue[] = [];

  nodes.forEach((node) => {
    const key = translations.find(
      (t) =>
        t.keyName === node.key && (t.keyNamespace || "") === (node.ns || "")
    );
    const change = {
      key: node.key,
      ns: node.ns,
      oldValue: key?.translations[language]?.text,
      newValue: node.characters,
    };

    if (!key) {
      newKeys.push(change);
    } else if (change.oldValue !== change.newValue) {
      changedKeys.push(change);
    }
  });

  return { newKeys, changedKeys };
};
