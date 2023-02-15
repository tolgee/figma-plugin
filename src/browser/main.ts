import {
  DocumentChangeHandler,
  NodeInfo,
  SelectionChangeHandler,
  SetNodesDataHandler,
} from "@/types";
import { emit, on } from "../utilities";
import { generateIframeContent } from "./iframeContent";
import { createLinks, getUrlConfig } from "./urlConfig";

const iframe = document.getElementById("plugin_iframe") as HTMLIFrameElement;
const shortcuts = document.getElementById("shortcuts") as HTMLDivElement;

function main() {
  shortcuts.innerHTML = createLinks();
  // populate the iframe after the listeners are ready
  iframe.contentDocument?.write(generateIframeContent());
  iframe.contentDocument?.close();

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
      emit<DocumentChangeHandler>("DOCUMENT_CHANGE", state.allNodes);
    }
    if (changed.selectionChanged) {
      emit<SelectionChangeHandler>("SELECTION_CHANGE", state.selectedNodes);
    }
  }

  on("RESIZE", (data) => {
    iframe.style.width = `${data.width}px`;
    iframe.style.height = `${data.height}px`;
  });

  on<SetNodesDataHandler>("SET_NODES_DATA", (changes) => {
    updateNodes(changes);
  });
}

main();

export default function () {
  // pass
}
