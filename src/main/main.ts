import { showUI } from "@create-figma-plugin/utilities";
import { on, emit } from "@/utilities";

import {
  ConfigChangeHandler,
  DocumentChangeHandler,
  ResetHandler,
  ResizeHandler,
  SelectionChangeHandler,
  SetLanguageHandler,
  SetupHandle,
  SyncCompleteHandler,
} from "../types";
import { getScreenshotsEndpoint } from "./endpoints/getScreenshots";
import { getSelectedNodesEndpoint } from "./endpoints/getSelectedNodes";
import { getConnectedNodesEndpoint } from "./endpoints/getConnectedNodes";
import { copyPageEndpoint } from "./endpoints/copyPage";
import { updateNodesEndpoint } from "./endpoints/updateNodes";
import { setNodesDataEndpoint } from "./endpoints/setNodesData";
import {
  deleteDocumentData,
  deleteGlobalSettings,
  deletePageData,
  getPluginData,
  setPluginData,
} from "./utils/settingsTools";
import { DEFAULT_SIZE } from "@/ui/hooks/useWindowSize";
import { highlightNodeEndpoint } from "./endpoints/highlightNode";
import { deselectNodeEndpoint } from "./endpoints/deselectNode";

const getAllPages = () => {
  const document = figma.root;

  return document.children.filter((node) => node.type === "PAGE");
};

export default async function () {
  figma.on("selectionchange", () => {
    emit<SelectionChangeHandler>("SELECTION_CHANGE");
  });

  figma.currentPage.on("nodechange", (e) => {
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
  highlightNodeEndpoint.register();
  deselectNodeEndpoint.register();

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
