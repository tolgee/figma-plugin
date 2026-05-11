import type { NodeInfo, Route, TolgeeConfig } from "$shared/types";

type AppState = {
  config: Partial<TolgeeConfig> | null;
  selectedNodes: NodeInfo[];
  route: Route;
  editorType: "figma" | "dev";
  errorBanner: { message: string; severity: "error" | "warning" } | null;
};

function createAppState() {
  const state = $state<AppState>({
    config: null,
    selectedNodes: [],
    route: { name: "index" },
    editorType: "figma",
    errorBanner: null,
  });
  return {
    get value() {
      return state;
    },
    setConfig(c: Partial<TolgeeConfig> | null) {
      state.config = c;
    },
    setSelection(nodes: NodeInfo[]) {
      state.selectedNodes = nodes;
    },
    navigate(route: Route) {
      state.route = route;
    },
    setEditorType(t: "figma" | "dev") {
      state.editorType = t;
    },
    setError(banner: AppState["errorBanner"]) {
      state.errorBanner = banner;
    },
  };
}

export const appState = createAppState();
