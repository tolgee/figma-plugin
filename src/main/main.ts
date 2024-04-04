import { showUI } from "@create-figma-plugin/utilities";
import { on, emit } from "@/utilities";
import { TOLGEE_PLUGIN_CONFIG_NAME } from "../constants";

import {
  ConfigChangeHandler,
  CurrentDocumentSettings,
  CurrentPageSettings,
  DocumentChangeHandler,
  GlobalSettings,
  ResetHandler,
  ResizeHandler,
  SelectionChangeHandler,
  SetLanguageHandler,
  SetupHandle,
  SyncCompleteHandler,
  TolgeeConfig,
} from "../types";
import { DEFAULT_SIZE } from "../tools/useWindowSize";
import { getScreenshotsEndpoint } from "./endpoints/getScreenshots";
import { getSelectedNodesEndpoint } from "./endpoints/getSelectedNodes";
import { getConnectedNodesEndpoint } from "./endpoints/getConnectedNodes";
import { setPageData } from "./utils/pages";
import { copyPageEndpoint } from "./endpoints/copyPage";
import { updateNodesEndpoint } from "./endpoints/updateNodes";
import { setNodesDataEndpoint } from "./endpoints/setNodesData";

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

  figma.currentPage.on("nodechange", (e) => {
    console.log(e);
    if (
      !e.nodeChanges.every((ch) => {
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

  getScreenshotsEndpoint.register();
  getSelectedNodesEndpoint.register();
  getConnectedNodesEndpoint.register();
  copyPageEndpoint.register();
  updateNodesEndpoint.register();
  setNodesDataEndpoint.register();

  const config = await getPluginData();

  showUI(
    {
      title: "Tolgee",
      ...DEFAULT_SIZE,
    },
    {
      config,
    }
  );
}
