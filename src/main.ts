import {
  emit,
  loadFontsAsync,
  on,
  showUI,
} from "@create-figma-plugin/utilities";
import { TOLGEE_NODE_INFO, TOLGEE_PLUGIN_CONFIG_NAME } from "./constants";

import {
  ConfigChangeHandler,
  CurrentPageSettings,
  DocumentChangeHandler,
  GlobalSettings,
  NodeInfo,
  ResizeHandler,
  SelectionChangeHandler,
  SetLanguageHandler,
  SetNodesDataHandler,
  SetupHandle,
  SyncCompleteHandler,
  TolgeeConfig,
  TranslationsUpdateHandler,
} from "./types";
import { DEFAULT_SIZE } from "./tools/useWindowSize";

const findTextNodes = (nodes?: readonly SceneNode[]): NodeInfo[] => {
  if (!nodes) {
    return findTextNodes(figma.currentPage.selection || []);
  }
  let result: NodeInfo[] = [];
  for (const node of nodes) {
    if (node.type === "TEXT") {
      const pluginData = JSON.parse(
        node.getPluginData(TOLGEE_NODE_INFO) || "{}"
      ) as Partial<NodeInfo>;
      result.push({
        id: node.id,
        name: node.name,
        characters: node.characters,
        key: pluginData.key || "",
        ns: pluginData.ns,
        connected: Boolean(pluginData.connected),
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

const getGlobalSettings = async () => {
  const pluginData = await figma.clientStorage.getAsync(
    TOLGEE_PLUGIN_CONFIG_NAME
  );
  return pluginData ? (JSON.parse(pluginData) as Partial<GlobalSettings>) : {};
};

const setGlobalSettings = async (data: Partial<GlobalSettings>) => {
  await figma.clientStorage.setAsync(
    TOLGEE_PLUGIN_CONFIG_NAME,
    JSON.stringify(data)
  );
};

const getCurrentPageSettings = () => {
  const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return pluginData
    ? (JSON.parse(pluginData) as Partial<CurrentPageSettings>)
    : {};
};

const setCurrentPageSettings = (data: Partial<CurrentPageSettings>) => {
  figma.currentPage.setPluginData(
    TOLGEE_PLUGIN_CONFIG_NAME,
    JSON.stringify(data)
  );
};

const getPluginData = async () => {
  return {
    ...(await getGlobalSettings()),
    ...getCurrentPageSettings(),
  };
};

const setPluginData = async (data: Partial<TolgeeConfig>) => {
  const { apiKey, apiUrl, ...pageConfig } = data;
  await setGlobalSettings({ apiKey, apiUrl });
  setCurrentPageSettings(pageConfig);
  emit<ConfigChangeHandler>("CONFIG_CHANGE", await getPluginData());
};

export default async function () {
  figma.on("selectionchange", () => {
    const nodes = findTextNodes();
    emit<SelectionChangeHandler>("SELECTION_CHANGE", nodes);
  });

  figma.on("documentchange", () => {
    const nodes = findTextNodes(figma.currentPage.children);
    emit<DocumentChangeHandler>("DOCUMENT_CHANGE", nodes);
  });

  on<SetupHandle>("SETUP", async (config) => {
    await setPluginData(config);
    figma.notify("Tolgee settings saved.");
  });

  on<SetLanguageHandler>("SET_LANGUAGE", async (language: string) => {
    const pluginData = await getPluginData();
    const data = { ...pluginData, language };
    await setPluginData(data);
  });

  on<ResizeHandler>("RESIZE", (size) => {
    figma.ui.resize(size.width, size.height);
  });

  on<SyncCompleteHandler>("SYNC_COMPLETE", () => {
    figma.notify("Synchronization completed.");
    figma.closePlugin();
  });

  on<SetNodesDataHandler>("SET_NODES_DATA", (nodes) => {
    nodes.forEach((nodeInfo) => {
      const node = figma.getNodeById(nodeInfo.id);
      node?.setPluginData(
        TOLGEE_NODE_INFO,
        JSON.stringify({
          key: nodeInfo.key,
          ns: nodeInfo.ns,
          connected: nodeInfo.connected,
        })
      );
    });

    // update selection
    emit<SelectionChangeHandler>("SELECTION_CHANGE", findTextNodes());
  });

  on<TranslationsUpdateHandler>("UPDATE_NODES", async (nodes) => {
    const textNodes = nodes.map((n) => figma.getNodeById(n.id) as TextNode);
    await loadFontsAsync(textNodes);
    nodes.forEach((n) => {
      const node = textNodes.find((nod) => nod.id === n.id)!;
      node.autoRename = false;
      node.characters = n.characters;
    });
    figma.notify("Document translations updated");

    // update selection
    emit<SelectionChangeHandler>("SELECTION_CHANGE", findTextNodes());
  });

  const config = await getPluginData();

  showUI(
    {
      title: "Tolgee",
      ...DEFAULT_SIZE,
    },
    {
      config,
      selectedNodes: findTextNodes(),
      allNodes: findTextNodes(figma.currentPage.children),
    }
  );
}
