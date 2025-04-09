import {
  ConfigChangeHandler,
  DocumentChangeHandler,
  FrameScreenshot,
  NodeInfo,
  ResizeHandler,
  SelectionChangeHandler,
  SetupHandle,
} from "@/types";
import { emit, on } from "@/utilities";
import { generateIframeContent } from "./iframeContent";
import { createLinks, getUrlConfig } from "./urlConfig";
import exampleScreenshot from "./exampleScreenshot";
import { getScreenshotsEndpoint } from "@/main/endpoints/getScreenshots";
import { updateNodesEndpoint } from "@/main/endpoints/updateNodes";
import { setNodesDataEndpoint } from "@/main/endpoints/setNodesData";
import { getSelectedNodesEndpoint } from "@/main/endpoints/getSelectedNodes";
import { getConnectedNodesEndpoint } from "@/main/endpoints/getConnectedNodes";
import { copyPageEndpoint } from "@/main/endpoints/copyPage";
import { formatTextEndpoint } from "../main/endpoints/formatText";

const iframe = document.getElementById("plugin_iframe") as HTMLIFrameElement;
const shortcuts = document.getElementById("shortcuts") as HTMLDivElement;

function main() {
  // populate the iframe the listeners are ready
  iframe.contentDocument?.write(generateIframeContent());
  iframe.contentDocument?.close();

  shortcuts.innerHTML = createLinks();

  const state = getUrlConfig();

  function updateNodes(changes: NodeInfo[], notify: boolean) {
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

    if (notify) {
      if (changed.allNodesChanged) {
        emit<DocumentChangeHandler>("DOCUMENT_CHANGE");
      }
      emit<SelectionChangeHandler>("SELECTION_CHANGE");
    }
  }

  on<SetupHandle>("SETUP", (data) => {
    state.config = { ...data, pageInfo: true, documentInfo: true };
    emit<ConfigChangeHandler>("CONFIG_CHANGE", state.config);
  });

  on<ResizeHandler>("RESIZE", (data) => {
    iframe.style.width = `${data.width}px`;
    iframe.style.height = `${data.height}px`;
  });

  getScreenshotsEndpoint.mock(() => {
    return [exampleScreenshot] as FrameScreenshot[];
  });
  getSelectedNodesEndpoint.mock(() => ({
    items: state.selectedNodes,
    somethingSelected: state.selectedNodes.length > 0,
  }));
  getConnectedNodesEndpoint.mock(({ ignoreSelection }) => {
    const basedOnSelection = !ignoreSelection && state.selectedNodes.length > 0;
    const items = basedOnSelection ? state.selectedNodes : state.allNodes;
    return {
      items: items.filter(({ key }) => key),
      basedOnSelection,
    };
  });
  copyPageEndpoint.mock(() => {
    throw new Error("Not implemented");
  });
  updateNodesEndpoint.mock(({ nodes }) => updateNodes(nodes, true));
  setNodesDataEndpoint.mock(({ nodes }) => updateNodes(nodes, false));
  formatTextEndpoint.mock(({ formatted, nodeInfo }) => {
    nodeInfo.characters = formatted;
    emit<SelectionChangeHandler>("SELECTION_CHANGE");
  });
}

main();

export default function () {
  // pass
}
