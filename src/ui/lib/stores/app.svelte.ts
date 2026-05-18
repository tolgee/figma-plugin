import type { NodeInfo, Route, TolgeeConfig } from "$shared/types";

type AppState = {
  config: Partial<TolgeeConfig> | null;
  selectedNodes: NodeInfo[];
  /**
   * `true` when the user has at least one node selected on the current
   * Figma page. `selectedNodes` falls back to all connected page nodes when
   * this is `false`, so consumers can't infer "user selected something" from
   * `selectedNodes.length > 0` alone.
   */
  hasUserSelection: boolean;
  route: Route;
  editorType: "figma" | "dev";
  errorBanner: { message: string; severity: "error" | "warning" } | null;
};

function createAppState() {
  const state = $state<AppState>({
    config: null,
    selectedNodes: [],
    hasUserSelection: false,
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
    setSelection(nodes: NodeInfo[], hasUserSelection: boolean) {
      state.selectedNodes = nodes;
      state.hasUserSelection = hasUserSelection;
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
