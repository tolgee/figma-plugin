import { NodeInfo, SelectionChangeHandler } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { emit, loadFontsAsync } from "@create-figma-plugin/utilities";
import { formatText } from "./formatText";
import { createFormatIcu } from "../../createFormatIcu";
import { type TolgeeFormat } from "@tginternal/editor";

export type UpdateNodeProps = {
  nodes: NodeInfo[];
  lang: string;
  getTolgeeFormat: (
    input: string,
    plural: boolean,
    raw: boolean
  ) => TolgeeFormat;
};

export const updateNodesEndpoint = createEndpoint<UpdateNodeProps, void>(
  "UPDATE_NODES",
  async ({ nodes, lang, getTolgeeFormat }) => {
    const textNodes = nodes.map((n) => figma.getNodeById(n.id) as TextNode);

    try {
      await loadFontsAsync(textNodes);
    } catch (e) {
      console.error(e);
    }
    const promises = nodes.map((nodeInfo) => {
      const node = textNodes.find((nod) => nod.id === nodeInfo.id)!;
      if (node.hasMissingFont) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return new Promise<void>(() => {});
      }

      const tolgeeValue = getTolgeeFormat(
        nodeInfo.translation,
        nodeInfo.isPlural,
        false
      );

      const formatter = createFormatIcu();
      const formatted = formatter.format({
        language: lang ?? "en",
        translation: nodeInfo.translation,
        params: {
          ...(nodeInfo.paramsValues ?? {}),
          [tolgeeValue.parameter ?? ""]: nodeInfo.pluralParamValue ?? "1",
        },
      });

      return formatText({
        formatted,
        nodeInfo,
      });
    });
    await Promise.all(promises);
    figma.notify("Document translations updated");

    // update selection
    emit<SelectionChangeHandler>("SELECTION_CHANGE");
  }
);
