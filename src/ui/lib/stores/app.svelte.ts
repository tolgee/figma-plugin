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

/**
 * Reads the initial route from the E2E host page's URL state param.
 *
 * In E2E tests the host page and the plugin iframe share the same origin
 * (localhost:4173), so `window.parent.location.search` is accessible and
 * contains the ?state=… query the test fixtures encode. Reading it here —
 * synchronously, before the first render — lets the app start in the correct
 * view without a reactive navigate() call.
 *
 * In Figma the plugin iframe is sandboxed at a different origin; accessing
 * window.parent.location throws a SecurityError that we swallow silently.
 */
function getInitialRoute(): Route {
  try {
    const params = new URLSearchParams(window.parent.location.search);
    const raw = params.get("state");
    if (raw) {
      const parsed = JSON.parse(raw) as { route?: string };
      if (parsed.route) return { name: parsed.route } as Route;
    }
  } catch {
    // Cross-origin (Figma sandbox) or missing state — fall through.
  }
  return { name: "index" };
}

function createAppState() {
  const state = $state<AppState>({
    config: null,
    selectedNodes: [],
    hasUserSelection: false,
    route: getInitialRoute(),
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
