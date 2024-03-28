import { loadFontsAsync, showUI } from "@create-figma-plugin/utilities";
import { on, emit } from "@/utilities";
import { TOLGEE_NODE_INFO, TOLGEE_PLUGIN_CONFIG_NAME } from "../constants";

import {
  ConfigChangeHandler,
  CopyPageHandler,
  CurrentDocumentSettings,
  CurrentPageSettings,
  DocumentChangeHandler,
  GlobalSettings,
  ResetHandler,
  ResizeHandler,
  SelectionChangeHandler,
  SetLanguageHandler,
  SetNodesDataHandler,
  SetupHandle,
  SyncCompleteHandler,
  TolgeeConfig,
  TranslationsUpdateHandler,
} from "../types";
import { DEFAULT_SIZE } from "../tools/useWindowSize";
import { compareNs } from "../tools/compareNs";
import {
  findTextNodes,
  findTextNodesInfo,
  getNodeInfo,
} from "./utils/nodeTools";
import { getScreenshotsEndpoint } from "./endpoints/getScreenshots";
import { getSelectedNodesEndpoint } from "./endpoints/getSelectedNodes";

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

const deleteGlobalSettings = async () => {
  await figma.clientStorage.deleteAsync(TOLGEE_PLUGIN_CONFIG_NAME);
};

const getDocumentData = () => {
  const pluginData = figma.root.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return pluginData
    ? (JSON.parse(pluginData) as Partial<CurrentDocumentSettings>)
    : {};
};

const setDocumentData = (data: Partial<CurrentDocumentSettings>) => {
  figma.root.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(data));
};

const deleteDocumentData = () => {
  figma.root.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
};

const getPageData = (page = figma.currentPage) => {
  const pluginData = page.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return pluginData
    ? (JSON.parse(pluginData) as Partial<CurrentPageSettings>)
    : {};
};

const setPageData = (
  data: Partial<CurrentPageSettings>,
  page = figma.currentPage
) => {
  page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(data));
};

const deletePageData = (page = figma.currentPage) => {
  page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
};

const getPluginData = async () => {
  return {
    ...(await getGlobalSettings()),
    ...getDocumentData(),
    ...getPageData(),
  };
};

const setPluginData = async (data: Partial<TolgeeConfig>) => {
  const { apiKey, apiUrl, language, namespace, namespacesDisabled } = data;
  await setGlobalSettings({ apiKey, apiUrl });
  setDocumentData({
    apiKey,
    apiUrl,
    namespace,
    namespacesDisabled,
    documentInfo: true,
  });
  setPageData({ language, pageInfo: true });
  emit<ConfigChangeHandler>("CONFIG_CHANGE", await getPluginData());
};

const getAllPages = () => {
  const document = figma.root;

  return document.children.filter((node) => node.type === "PAGE");
};

export default async function () {
  figma.on("selectionchange", () => {
    emit<SelectionChangeHandler>("SELECTION_CHANGE");
  });

  figma.on("documentchange", (e) => {
    if (
      !e.documentChanges.every((ch) => {
        return (
          ch.type === "PROPERTY_CHANGE" &&
          ch.properties.every((p) => p === "pluginData")
        );
      })
    ) {
      emit<DocumentChangeHandler>("DOCUMENT_CHANGE");
    }
  });

  figma.on("currentpagechange", async () => {
    emit<SelectionChangeHandler>("SELECTION_CHANGE");
    emit<DocumentChangeHandler>("DOCUMENT_CHANGE");
    emit<ConfigChangeHandler>("CONFIG_CHANGE", await getPluginData());
  });

  on<SetupHandle>("SETUP", async (config) => {
    await setPluginData(config);
    figma.notify("Tolgee settings saved.");
  });

  on<ResetHandler>("RESET", async () => {
    await deleteGlobalSettings();
    deleteDocumentData();
    getAllPages().forEach((page) => {
      deletePageData(page);
    });
    emit<ConfigChangeHandler>("CONFIG_CHANGE", await getPluginData());
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
    emit<SelectionChangeHandler>("SELECTION_CHANGE");
  });

  on<CopyPageHandler>("COPY_PAGE", async (data) => {
    const newPage = figma.currentPage.clone();
    const name = `${figma.currentPage.name} - ${
      data?.language ? data.language : "keys"
    }`;
    getAllPages().forEach((page) => {
      if (page.name === name && getPageData(page).pageCopy === true) {
        page.remove();
      }
    });
    newPage.name = name;
    const textNodes = [...findTextNodes(newPage.children)];
    await loadFontsAsync(textNodes);
    [...textNodes].forEach((node) => {
      const { connected, key, ns } = getNodeInfo(node);
      if (connected) {
        if (data) {
          const newText = data?.nodes.find(
            (n) => n.key === key && compareNs(n.ns, ns)
          )?.characters;

          if (newText) {
            node.characters = newText;
          }
        } else {
          node.characters = key;
        }
      }
    });
    setPageData(
      { pageCopy: true, pageInfo: true, language: data?.language },
      newPage
    );
    figma.notify(`Created page "${name}"`);
  });

  getScreenshotsEndpoint.register();
  getSelectedNodesEndpoint.register();

  const config = await getPluginData();

  showUI(
    {
      title: "Tolgee",
      ...DEFAULT_SIZE,
    },
    {
      config,
      selectedNodes: findTextNodesInfo(figma.currentPage.selection),
    }
  );
}
