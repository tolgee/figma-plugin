import type { NodeInfo, Route, TolgeeConfig } from "$shared/types";
import { flushNodeSaves } from "$ui/lib/logic/saveQueue";

/**
 * Which editor types may open each route — the navigation-side half of the
 * Dev-Mode safety layer (the message-side half is `$shared/messagePolicy`).
 * Exhaustive over `Route["name"]` so a NEW route can't ship unclassified:
 * the compiler forces a decision here, mirroring `MESSAGE_IMPACT`.
 *
 * `design-only` routes exist to change the design (Pull rewrites canvas
 * text, CreateCopy clones pages, StringDetails edits a string) — in Dev
 * Mode `navigate()` refuses them as a SILENT no-op. Silent on purpose:
 * clicking a row is a frequent reflex action in Dev Mode and a toast on
 * every click would nag; the toast belongs to the message guard in
 * `$main/bus.ts`, where being reached at all signals a real anomaly.
 *
 * `copyView` stays "all": it's the read-only viewer for copy pages, and
 * both of its write actions (Download, Recreate) go through canvas-classed
 * messages the bus guard already blocks.
 */
export const ROUTE_AVAILABILITY: Record<Route["name"], "all" | "design-only"> = {
  index: "all",
  pageSetup: "all",
  copyView: "all",
  settings: "all",
  push: "all",
  connect: "all",
  pull: "design-only",
  stringDetails: "design-only",
  createCopy: "design-only",
};

type AppState = {
  config: Partial<TolgeeConfig> | null;
  selectedNodes: NodeInfo[];
  /**
   * `true` when the user has at least one node selected on the current
   * Figma page. With no selection, `selectedNodes` is EMPTY (the main thread
   * deliberately never falls back to a page-wide scan) — this flag exists so
   * consumers can distinguish "nothing selected" from "selection contains no
   * usable text nodes".
   */
  hasUserSelection: boolean;
  /**
   * `true` when a selection scan on the main thread has been running longer
   * than the spinner delay (see `setScanning`) and its nodes haven't arrived
   * yet. Drives the Index loading overlay for genuinely slow scans only —
   * quick scans (the overwhelming majority) never flip it, so ordinary canvas
   * clicks don't flash the overlay.
   */
  scanning: boolean;
  route: Route;
  editorType: "figma" | "dev";
  /** `figma.currentPage.name` — used directly in CopyView's header (the name
      already carries the language, e.g. "Home - cs"), kept in sync on
      `init`/`page-changed`. */
  pageName: string;
  errorBanner: { message: string; severity: "error" | "warning" } | null;
  /**
   * Progress for ANY in-flight large `set-nodes-data` write — bulk actions in
   * Index, auto-connect, and the save-queue's prefill/regen flush alike.
   * Deliberately not paired to a single request's `correlationId` (see
   * `nodes-set-progress` in `shared/messages.ts`): only one big write is ever
   * meaningfully "in flight" from the user's point of view, and `null` means
   * none is. Set on `nodes-set-progress`, cleared on `nodes-set-result`.
   */
  writeProgress: { done: number; total: number } | null;
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
  const state = $state<Omit<AppState, "selectedNodes">>({
    config: null,
    hasUserSelection: false,
    scanning: false,
    route: getInitialRoute(),
    editorType: "figma",
    pageName: "",
    errorBanner: null,
    writeProgress: null,
  });
  // `$state.raw`: the nodes are immutable snapshots from the main thread and
  // are only ever replaced wholesale (setSelection / patchNodes), so deep
  // proxying hundreds of them — every field read of every row going through a
  // proxy trap — is pure overhead. Reactivity comes from reassignment.
  let selectedNodes = $state.raw<NodeInfo[]>([]);

  // Delayed scan spinner: most scans finish in well under this, and flashing
  // the loading overlay for every canvas click reads as jank. Arm a timer on
  // `selection-pending` and only flip `scanning` if the nodes haven't arrived
  // by then — quick scans never show the overlay at all.
  const SCAN_SPINNER_DELAY_MS = 200;
  let scanSpinnerTimer: ReturnType<typeof setTimeout> | null = null;

  function cancelScanSpinner(): void {
    if (scanSpinnerTimer) {
      clearTimeout(scanSpinnerTimer);
      scanSpinnerTimer = null;
    }
  }

  // Stable read view combining the reactive state with the raw node array,
  // so consumers keep the `appState.value.selectedNodes` shape.
  const view = {
    get config() {
      return state.config;
    },
    get selectedNodes() {
      return selectedNodes;
    },
    get hasUserSelection() {
      return state.hasUserSelection;
    },
    get scanning() {
      return state.scanning;
    },
    get route() {
      return state.route;
    },
    get editorType() {
      return state.editorType;
    },
    get pageName() {
      return state.pageName;
    },
    get errorBanner() {
      return state.errorBanner;
    },
    get writeProgress() {
      return state.writeProgress;
    },
  };

  return {
    get value() {
      return view;
    },
    setConfig(c: Partial<TolgeeConfig> | null) {
      state.config = c;
    },
    setSelection(nodes: NodeInfo[], hasUserSelection: boolean) {
      selectedNodes = nodes;
      state.hasUserSelection = hasUserSelection;
      cancelScanSpinner();
      state.scanning = false;
    },
    /**
     * One chunk of a streamed selection scan. The first batch REPLACES the
     * list (and is the moment the user has real feedback, so it also clears
     * the scan loader); later batches append. Streamed batches only exist
     * for genuine selections, hence `hasUserSelection` flips on the first.
     */
    appendSelection(nodes: NodeInfo[], first: boolean) {
      selectedNodes = first ? nodes : [...selectedNodes, ...nodes];
      if (first) state.hasUserSelection = true;
      cancelScanSpinner();
      state.scanning = false;
    },
    /**
     * Terminal marker of a streamed scan. A stream that delivered nothing
     * (empty canvas click, or a selection whose texts are all ignored)
     * must clear the previous list.
     */
    finalizeSelection(hasUserSelection: boolean, total: number) {
      if (total === 0) selectedNodes = [];
      state.hasUserSelection = hasUserSelection;
      cancelScanSpinner();
      state.scanning = false;
    },
    /**
     * Merge fresh post-write snapshots into the current selection by node id.
     * Untouched rows keep their object identity, so the keyed `{#each}` list
     * doesn't re-mount them. Nodes not currently in the selection are ignored
     * (a Pull can write page-wide, beyond the selection). This replaces the
     * old whole-selection re-scan the main thread used to do after writes.
     */
    patchNodes(updated: NodeInfo[]) {
      if (updated.length === 0) return;
      const byId = new Map(updated.map((n) => [n.id, n]));
      selectedNodes = selectedNodes.map((n) => byId.get(n.id) ?? n);
    },
    setScanning() {
      if (state.scanning) return;
      if (scanSpinnerTimer) {
        // A SECOND scan started before the first delivered — the user
        // switched selection while we were still working. That's exactly
        // when feedback matters: show the loader immediately instead of
        // re-waiting out the delay on a visibly stale list.
        clearTimeout(scanSpinnerTimer);
        scanSpinnerTimer = null;
        state.scanning = true;
        return;
      }
      scanSpinnerTimer = setTimeout(() => {
        scanSpinnerTimer = null;
        state.scanning = true;
      }, SCAN_SPINNER_DELAY_MS);
    },
    navigate(route: Route) {
      // Dev-Mode gate — covers EVERY entry point to a design-only route
      // (row click, menus, future callers) in one place instead of chasing
      // each button. Silent no-op by design; see ROUTE_AVAILABILITY's doc.
      if (state.editorType === "dev" && ROUTE_AVAILABILITY[route.name] === "design-only") {
        console.warn("[tolgee:ui] blocked design-only route in Dev Mode:", route.name);
        return;
      }
      // Persist any debounced inline edits BEFORE the destination flow reads
      // node state — Push must diff the key the user just typed, not the one
      // still sitting in the queue.
      flushNodeSaves();
      state.route = route;
    },
    setEditorType(t: "figma" | "dev") {
      state.editorType = t;
    },
    setPageName(name: string) {
      state.pageName = name;
    },
    setError(banner: AppState["errorBanner"]) {
      state.errorBanner = banner;
    },
    /** A `nodes-set-progress` message arrived — some large write is in flight. */
    setWriteProgress(done: number, total: number) {
      state.writeProgress = { done, total };
    },
    /** The in-flight write settled (`nodes-set-result`) — nothing to show. */
    clearWriteProgress() {
      state.writeProgress = null;
    },
  };
}

export const appState = createAppState();
