import {
  emit,
  loadFontsAsync,
  on,
  once,
  showUI,
} from "@create-figma-plugin/utilities";
import { TOLGEE_PLUGIN_CONFIG_NAME } from "../tolgee";

import {
  Node,
  SetupHandle,
  SyncCompleteHandler,
  TolgeeConfig,
  TranslationsUpdateHandler,
} from "../types";
import { PAGES } from "./pages/data";

const findTextNodes = (nodes?: readonly SceneNode[]): Node[] => {
  if (!nodes) {
    return findTextNodes(figma.currentPage.selection || []);
  }
  let result: Node[] = [];
  for (const node of nodes) {
    if (node.type === "TEXT") {
      result.push({
        id: node.id,
        name: node.name,
        characters: node.characters,
      });
    }
    // @ts-ignore
    if (node.children) {
      // @ts-ignore
      result = result.concat(findTextNodes(node.children as SceneNode[]));
    }
  }
  return result;
};

export default async function () {
  figma.on("selectionchange", () => {
    const nodes = findTextNodes();
    emit("SELECTION_CHANGE", nodes);
  });

  on<SetupHandle>("SETUP", (config) => {
    figma.currentPage.setPluginData(
      TOLGEE_PLUGIN_CONFIG_NAME,
      JSON.stringify(config)
    );
    figma.notify("Tolgee credentials saved.");
  });

  on("RESIZE", (size) => {
    figma.ui.resize(size.width, size.height);
  });

  on<SyncCompleteHandler>("SYNC_COMPLETE", () => {
    figma.notify("Synchronization completed.");
    figma.closePlugin();
  });
  on<TranslationsUpdateHandler>("UPDATE_NODES", async (nodes) => {
    const textNodes = nodes.map((n) => figma.getNodeById(n.id) as TextNode);
    await loadFontsAsync(textNodes);
    nodes.forEach(async (n) => {
      const node = textNodes.find((nod) => nod.id === n.id)!;
      node.autoRename = false;
      node.characters = n.characters;
    });
  });

  const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  const config =
    pluginData !== ""
      ? (JSON.parse(
          figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME)
        ) as Partial<TolgeeConfig>)
      : null;

  showUI(
    {
      title: "Tolgee",
      width: PAGES.index.width,
      height: PAGES.index.height,
    },
    { config, nodes: findTextNodes() }
  );
}
