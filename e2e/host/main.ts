/**
 * E2E host shim: a Figma-free stand-in for `src/main/main.ts`.
 *
 * Plays the role of the plugin's "main" thread in tests: listens for
 * `pluginMessage` posts from the UI iframe (the production Svelte bundle)
 * and responds with synthesized `MainToUi` messages from in-memory state.
 *
 * This lets the UI bundle run unmodified — every HTTP call still hits the
 * real Tolgee platform started by `e2e/docker-compose.yml` — while we
 * inject selection / config / annotations behaviour from the test harness.
 *
 * Initial state is read from `?state=<URL-encoded JSON>` so tests can
 * construct deep-link URLs (mirroring the v1 `createShortcutUrl` pattern).
 */
import type { MainToUi, UiToMain } from "../../src/shared/messages";
import type { NodeInfo, TolgeeConfig } from "../../src/shared/types";

type HostState = {
  config: Partial<TolgeeConfig> | null;
  allNodes: NodeInfo[];
  selectedNodes: NodeInfo[];
  hasUserSelection: boolean;
  editorType: "figma" | "dev";
  annotationsEnabled: boolean;
  route?: string;
};

function defaultState(): HostState {
  return {
    config: null,
    allNodes: [],
    selectedNodes: [],
    hasUserSelection: false,
    editorType: "figma",
    annotationsEnabled: false,
    route: undefined,
  };
}

function readInitialState(): HostState {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("state");
  if (!raw) return defaultState();
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Partial<HostState>;
    return { ...defaultState(), ...data };
  } catch {
    return defaultState();
  }
}

const state = readInitialState();

const iframe = document.getElementById("plugin-iframe") as HTMLIFrameElement;

function send(msg: MainToUi): void {
  iframe.contentWindow?.postMessage({ pluginMessage: msg }, "*");
}

function emitSelectionChanged(): void {
  send({
    type: "selection-changed",
    nodes: state.selectedNodes,
    hasUserSelection: state.hasUserSelection,
  });
}

function applyNodeUpdates(
  id: string,
  patch: Partial<NodeInfo>,
): void {
  const a = state.allNodes.find((n) => n.id === id);
  if (a) Object.assign(a, patch);
  const s = state.selectedNodes.find((n) => n.id === id);
  if (s) Object.assign(s, patch);
}

window.addEventListener("message", (event) => {
  const msg = event.data?.pluginMessage as UiToMain | undefined;
  if (!msg) return;

  switch (msg.type) {
    case "ui-ready": {
      send({
        type: "init" as const,
        config: state.config,
        selectedNodes: state.selectedNodes,
        hasUserSelection: state.hasUserSelection,
        editorType: state.editorType,
        ...(state.route ? { initialRoute: state.route } : {}),
      });
      return;
    }
    case "resize": {
      iframe.style.width = `${msg.size.width}px`;
      iframe.style.height = `${msg.size.height}px`;
      return;
    }
    case "save-config": {
      state.config = { ...(state.config ?? {}), ...msg.config };
      send({ type: "config-changed", config: state.config });
      return;
    }
    case "persist-project-id": {
      state.config = { ...(state.config ?? {}), projectId: msg.projectId };
      send({ type: "config-changed", config: state.config });
      return;
    }
    case "reset": {
      state.config = null;
      send({ type: "config-changed", config: {} });
      return;
    }
    case "set-language": {
      state.config = { ...(state.config ?? {}), language: msg.language };
      send({ type: "config-changed", config: state.config });
      return;
    }
    case "set-branch": {
      state.config = { ...(state.config ?? {}), branch: msg.branch };
      send({ type: "config-changed", config: state.config });
      return;
    }
    case "request-page-connected-nodes": {
      send({
        type: "page-connected-nodes-result",
        correlationId: msg.correlationId,
        nodes: state.allNodes.filter((n) => n.key),
      });
      return;
    }
    case "set-nodes-data": {
      for (const { id, info } of msg.nodes) applyNodeUpdates(id, info);
      send({
        type: "nodes-set-result",
        correlationId: msg.correlationId,
        ok: true,
      });
      emitSelectionChanged();
      return;
    }
    case "apply-translations": {
      for (const u of msg.updates) {
        const patch: Partial<NodeInfo> = {
          characters: u.text,
          translation: u.translation,
        };
        if (u.isPlural !== undefined) patch.isPlural = u.isPlural;
        if (u.pluralParamValue !== undefined)
          patch.pluralParamValue = u.pluralParamValue;
        if (u.paramsValues !== undefined) patch.paramsValues = u.paramsValues;
        if (u.key !== undefined) patch.key = u.key;
        if (u.ns !== undefined) patch.ns = u.ns;
        if (u.connected !== undefined) patch.connected = u.connected;
        applyNodeUpdates(u.id, patch);
      }
      send({
        type: "apply-translations-result",
        correlationId: msg.correlationId,
        ok: true,
        errors: [],
      });
      emitSelectionChanged();
      return;
    }
    case "request-screenshots": {
      // Stub: no real screenshots in the host shim. Pull/push flows that
      // upload screenshots will simply skip them.
      send({
        type: "screenshots-result",
        correlationId: msg.correlationId,
        screenshots: [],
      });
      return;
    }
    case "scroll-to-node":
    case "notify":
    case "open-external":
    case "close": {
      // No-ops in the host. Tests can assert these were sent by spying on
      // postMessage from the page level if needed.
      return;
    }
    case "sync-annotations": {
      send({
        type: "annotation-sync-result",
        correlationId: msg.correlationId,
        updated: 0,
      });
      return;
    }
    case "toggle-annotations": {
      state.annotationsEnabled = msg.enabled;
      return;
    }
    case "get-annotations-state": {
      send({
        type: "annotations-state",
        correlationId: msg.correlationId,
        enabled: state.annotationsEnabled,
        available: state.editorType !== "dev",
      });
      return;
    }
    case "create-copy": {
      send({
        type: "create-copy-result",
        correlationId: msg.correlationId,
        ok: true,
        createdPageIds: [],
      });
      return;
    }
  }
});

// Expose for power-tests that need to push state changes mid-test
// (e.g. simulating a selection change without re-navigating). Kept off
// the `window` global type by attaching dynamically.
(window as unknown as { __e2e: unknown }).__e2e = {
  get state() {
    return state;
  },
  send,
  selectNodes(nodes: NodeInfo[], hasUserSelection = true): void {
    state.selectedNodes = nodes;
    state.hasUserSelection = hasUserSelection;
    emitSelectionChanged();
  },
};
