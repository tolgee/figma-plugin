import { components } from "@/ui/client/apiSchema.generated";
import { NodeInfo, PartialNodeInfo } from "@/types";
import { compareNs } from "./compareNs";

type KeyWithTranslationsModel =
  components["schemas"]["KeyWithTranslationsModel"];

export const getPullChanges = (
  nodes: NodeInfo[],
  lang: string,
  keys: KeyWithTranslationsModel[]
) => {
  const changedNodes: NodeInfo[] = [];
  const missingKeys: PartialNodeInfo[] = [];

  nodes.forEach((node) => {
    const key = keys?.find(
      (t) => t.keyName === node.key && compareNs(t.keyNamespace, node.ns)
    );

    const value = key?.translations[lang]?.text;
    if (value) {
      if (value !== node.characters) {
        changedNodes.push({ ...node, characters: value });
      }
    } else {
      missingKeys.push({ id: node.id, key: node.key, ns: node.ns });
    }
  });

  return { changedNodes, missingKeys };
};
