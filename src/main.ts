import { loadFontsAsync, showUI } from "@create-figma-plugin/utilities";
import { on, emit } from "@/utilities";
import { TOLGEE_NODE_INFO, TOLGEE_PLUGIN_CONFIG_NAME } from "./constants";

import {
  ConfigChangeHandler,
  CurrentDocumentSettings,
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
import { endpointGetScreenshots } from "./endpoints";

const toNodeInfo = (node: TextNode): NodeInfo => {
  const pluginData = JSON.parse(
    node.getPluginData(TOLGEE_NODE_INFO) || "{}"
  ) as Partial<NodeInfo>;
  return {
    id: node.id,
    name: node.name,
    characters: node.characters,
    key: pluginData.key || "",
    ns: pluginData.ns,
    connected: Boolean(pluginData.connected),
  };
};

const findTextNodes = (nodes: readonly SceneNode[]): TextNode[] => {
  let result: TextNode[] = [];
  for (const node of nodes) {
    if (node.type === "TEXT") {
      result.push(node);
    }
    // @ts-ignore
    if (node.children) {
      // @ts-ignore
      result = result.concat(findTextNodes(node.children as SceneNode[]));
    }
  }
  return result;
};

const findTextNodesInfo = (nodes: readonly SceneNode[]): NodeInfo[] => {
  return findTextNodes(nodes).map(toNodeInfo);
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

const getDocumentData = () => {
  const pluginData = figma.root.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return pluginData
    ? (JSON.parse(pluginData) as Partial<CurrentDocumentSettings>)
    : {};
};

const setDocumentData = (data: Partial<CurrentDocumentSettings>) => {
  figma.root.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(data));
};

const getPageData = () => {
  const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return pluginData
    ? (JSON.parse(pluginData) as Partial<CurrentPageSettings>)
    : {};
};

const setPageData = (data: Partial<CurrentPageSettings>) => {
  figma.currentPage.setPluginData(
    TOLGEE_PLUGIN_CONFIG_NAME,
    JSON.stringify(data)
  );
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

export default async function () {
  figma.on("selectionchange", () => {
    const nodes = findTextNodesInfo(figma.currentPage.selection);
    emit<SelectionChangeHandler>("SELECTION_CHANGE", nodes);
  });

  figma.on("documentchange", () => {
    console.log("documentchange");
    const nodes = findTextNodesInfo(figma.currentPage.children);
    emit<DocumentChangeHandler>("DOCUMENT_CHANGE", nodes);
  });

  figma.on("currentpagechange", async () => {
    emit<SelectionChangeHandler>(
      "SELECTION_CHANGE",
      findTextNodesInfo(figma.currentPage.selection)
    );
    emit<DocumentChangeHandler>(
      "DOCUMENT_CHANGE",
      findTextNodesInfo(figma.currentPage.children)
    );
    emit<ConfigChangeHandler>("CONFIG_CHANGE", await getPluginData());
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

  endpointGetScreenshots.implement(async (nodes) => {
    // find nodes in document
    const documentNodes = figma.currentPage.findAll((docNode) =>
      Boolean(nodes.find((n) => n.id === docNode.id))
    );

    const frames = new Set<FrameNode>();

    // find frames in parents
    documentNodes.forEach((docNode) => {
      let node = docNode as (BaseNode & ChildrenMixin) | null;
      while (node) {
        if (node.type === "FRAME") {
          frames.add(node as FrameNode);
          break;
        }
        node = node.parent;
      }
    });

    const data = await Promise.all(
      Array.from(frames).map(async (frame) => {
        return {
          image: await frame.exportAsync({ format: "PNG" }),
          info: {
            id: frame.id,
            name: frame.name,
            width: frame.width,
            height: frame.height,
          },
          keys: findTextNodes([frame]).map((node) => {
            return {
              ...toNodeInfo(node),
              x: node.x,
              y: node.y,
              width: node.width,
              height: node.height,
            };
          }),
        };
      })
    );
    return data;
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
    emit<SelectionChangeHandler>(
      "SELECTION_CHANGE",
      findTextNodesInfo(figma.currentPage.selection)
    );
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
    emit<SelectionChangeHandler>(
      "SELECTION_CHANGE",
      findTextNodesInfo(figma.currentPage.selection)
    );
  });

  const config = await getPluginData();

  showUI(
    {
      title: "Tolgee",
      ...DEFAULT_SIZE,
    },
    {
      config,
      selectedNodes: findTextNodesInfo(figma.currentPage.selection),
      allNodes: findTextNodesInfo(figma.currentPage.children),
    }
  );
}
