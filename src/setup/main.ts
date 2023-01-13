import {
  emit,
  loadFontsAsync,
  on,
  showUI,
} from "@create-figma-plugin/utilities";
import { TOLGEE_NODE_KEY, TOLGEE_PLUGIN_CONFIG_NAME } from "../tolgee";

import {
  ConfigChangeHandler,
  NodeInfo,
  ResizeHandler,
  SelectionChangeHandler,
  SetLanguageHandler,
  SetNodeConnectionHandler,
  SetupHandle,
  SyncCompleteHandler,
  TolgeeConfig,
  TranslationsUpdateHandler,
} from "../types";
import { getWindowSize } from "./views/routes";

const findTextNodes = (nodes?: readonly SceneNode[]): NodeInfo[] => {
  if (!nodes) {
    return findTextNodes(figma.currentPage.selection || []);
  }
  let result: NodeInfo[] = [];
  for (const node of nodes) {
    if (node.type === "TEXT") {
      result.push({
        id: node.id,
        name: node.name,
        characters: node.characters,
        key: node.getPluginData(TOLGEE_NODE_KEY),
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

const getPluginData = () => {
  const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return pluginData !== ""
    ? (JSON.parse(
        figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME)
      ) as Partial<TolgeeConfig>)
    : {};
};

const setPluginData = (data: Partial<TolgeeConfig>) => {
  figma.currentPage.setPluginData(
    TOLGEE_PLUGIN_CONFIG_NAME,
    JSON.stringify(data)
  );
  emit<ConfigChangeHandler>("CONFIG_CHANGE", data);
};

export default async function () {
  figma.on("selectionchange", () => {
    const nodes = findTextNodes();
    emit<SelectionChangeHandler>("SELECTION_CHANGE", nodes);
  });

  on<SetupHandle>("SETUP", (config) => {
    setPluginData(config);
    figma.notify("Tolgee credentials saved.");
  });

  on<SetLanguageHandler>("SET_LANGUAGE", (lang: string) => {
    const pluginData = getPluginData();
    const data = { ...pluginData, lang };
    setPluginData(data);
  });

  on<ResizeHandler>("RESIZE", (size) => {
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

  on<SetNodeConnectionHandler>("SET_NODE_CONNECTION", (nodeId, key) => {
    const node = figma.getNodeById(nodeId);
    node?.setPluginData(TOLGEE_NODE_KEY, key);

    // update selection
    const nodes = findTextNodes();
    emit<SelectionChangeHandler>("SELECTION_CHANGE", nodes);
  });

  const config = getPluginData();

  showUI(
    {
      title: "Tolgee",
      ...getWindowSize("index"),
    },
    { config, nodes: findTextNodes() }
  );
}
