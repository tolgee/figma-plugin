import { NodeInfo, PartialNodeInfo } from "@/types";
import { TranslationData } from "../ui/client/types";
import { createFormatIcu } from "../createFormatIcu";
import { getTolgeeFormat } from "@tginternal/editor";

export const getPullChanges = (
  nodes: NodeInfo[],
  lang: string,
  keys: TranslationData
) => {
  const changedNodes: NodeInfo[] = [];
  const missingKeys: PartialNodeInfo[] = [];
  const formatter = createFormatIcu();

  nodes.forEach((node) => {
    const value = keys?.[node.ns ?? ""]?.[node.key];

    if (value) {
      if (
        value.translation !== node.translation ||
        value.keyIsPlural !== node.isPlural
      ) {
        const tolgeeValue = getTolgeeFormat(
          value.translation,
          value.keyIsPlural,
          false
        );
        try {
          const formatted = formatter.format({
            language: lang,
            translation: value.translation,
            params: {
              ...node.paramsValues,
              [tolgeeValue.parameter ?? ""]: node.pluralParamValue ?? "1",
            },
          });
          changedNodes.push({
            ...node,
            isPlural: value.keyIsPlural,
            characters: formatted,
            translation: value.translation,
          });
        } catch (e) {
          changedNodes.push({
            ...node,
            isPlural: value.keyIsPlural,
            characters: value.translation,
            translation: value.translation,
          });
        }
      } else if (
        node.characters !== value.translation &&
        !node.isPlural &&
        (!node.paramsValues || Object.keys(node.paramsValues).length === 0)
      ) {
        changedNodes.push({
          ...node,
          isPlural: value.keyIsPlural,
          characters: value.translation,
          translation: value.translation,
        });
      }
    } else {
      missingKeys.push({ id: node.id, key: node.key, ns: node.ns });
    }
  });

  return { changedNodes, missingKeys };
};
