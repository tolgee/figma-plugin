import {
  ConfigChangeHandler,
  DocumentChangeHandler,
  FrameScreenshot,
  NodeInfo,
  ResizeHandler,
  SelectionChangeHandler,
  SetNodesDataHandler,
  SetupHandle,
  TranslationsUpdateHandler,
} from "@/types";
import { emit, on } from "@/utilities";
import { generateIframeContent } from "./iframeContent";
import { createLinks, getUrlConfig } from "./urlConfig";
import exampleScreenshot from "./exampleScreenshot";
import { getScreenshotsEndpoint } from "@/main/endpoints/getScreenshots";

const iframe = document.getElementById("plugin_iframe") as HTMLIFrameElement;
const shortcuts = document.getElementById("shortcuts") as HTMLDivElement;

function main() {
  // populate the iframe the listeners are ready
  iframe.contentDocument?.write(generateIframeContent());
  iframe.contentDocument?.close();

  shortcuts.innerHTML = createLinks();

  const state = getUrlConfig();

  window.addEventListener("message", (e) => {
    // print incoming messages
    console.log(...e.data.pluginMessage);
  });

  function updateNodes(changes: NodeInfo[]) {
    const changed = { allNodesChanged: false, selectionChanged: false };

    const updateNode = (prop: keyof typeof changed) => (node: NodeInfo) => {
      const change = changes.find((n) => n.id === node.id);
      if (change) {
        changed[prop] = true;
      }
      return {
        ...node,
        ...change,
      };
    };

    state.allNodes = state.allNodes.map(updateNode("allNodesChanged"));
    state.selectedNodes = state.selectedNodes.map(
      updateNode("selectionChanged")
    );

    if (changed.allNodesChanged) {
      emit<DocumentChangeHandler>("DOCUMENT_CHANGE");
    }
    if (changed.selectionChanged) {
      emit<SelectionChangeHandler>("SELECTION_CHANGE");
    }
  }

  getScreenshotsEndpoint
    .mock(() => {
      // if (nodes.find((n) => n.key === "on-the-road-title")) {
      return [exampleScreenshot] as FrameScreenshot[];
      // }
      // return [] as FrameScreenshot[];
    })
    .register();

  on<SetupHandle>("SETUP", (data) => {
    state.config = { ...data, pageInfo: true, documentInfo: true };
    emit<ConfigChangeHandler>("CONFIG_CHANGE", state.config);
  });

  on<ResizeHandler>("RESIZE", (data) => {
    iframe.style.width = `${data.width}px`;
    iframe.style.height = `${data.height}px`;
  });

  on<SetNodesDataHandler>("SET_NODES_DATA", (changes) => {
    updateNodes(changes);
  });

  on<TranslationsUpdateHandler>("UPDATE_NODES", (changes) => {
    updateNodes(changes);
  });
}

main();

export default function () {
  // pass
}
