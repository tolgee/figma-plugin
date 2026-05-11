import { UI_SIZES } from "$shared/constants";
import { attachBus, on, send } from "$main/bus";
import {
  clearCurrentPage,
  isAnnotationsEnabled,
  scheduleReconcile,
  setAnnotationsEnabled,
  syncCurrentPage,
} from "$main/handlers/annotations";
import { createCopy } from "$main/handlers/createCopy";
import { applyTranslations } from "$main/handlers/nodes";
import { getSelectionInfo, setNodesData } from "$main/nodes/selection";
import { captureScreenshots } from "$main/screenshots/capture";
import { readMergedConfig, resetConfig, writeConfig } from "$main/settings";

// `__html__` is injected by the Figma plugin sandbox loader (manifest-driven)
// and is therefore not redeclared here. The same loader picks the correct UI
// bundle for the active editor — when `figma.editorType === "dev"` Figma loads
// the inspect UI defined in the manifest, so no branching is required here.

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, {
  width: UI_SIZES.DEFAULT.width,
  height: UI_SIZES.DEFAULT.height,
  themeColors: true,
});

attachBus();

// Cached annotation-toggle state. The truth lives in clientStorage; this is
// the in-memory mirror that lets synchronous Figma event handlers
// (selectionchange / documentchange) avoid an async hop on every tick.
let annotationsEnabled = false;

async function refreshAnnotationsEnabled(): Promise<void> {
  annotationsEnabled = await isAnnotationsEnabled();
}

async function emitSelection(): Promise<void> {
  const { nodes } = await getSelectionInfo();
  send({ type: "selection-changed", nodes });
}

async function emitPageChange(): Promise<void> {
  const config = await readMergedConfig();
  send({ type: "page-changed", config });
  await emitSelection();
}

// --- Figma event subscriptions ----------------------------------------------

figma.on("selectionchange", () => {
  void emitSelection();
  // Annotation mutations do NOT fire `documentchange`, so a per-node reconcile
  // on selection is our cheapest path back to consistency after the user has
  // edited keys in another session or in our own UI.
  if (annotationsEnabled && figma.editorType !== "dev") {
    const ids = figma.currentPage.selection.map((n) => n.id);
    if (ids.length > 0) {
      scheduleReconcile(ids, annotationsEnabled);
    }
  }
});

figma.on("currentpagechange", () => {
  void (async () => {
    await emitPageChange();
    if (annotationsEnabled && figma.editorType !== "dev") {
      await syncCurrentPage();
    }
  })();
});

figma.on("documentchange", (event) => {
  if (!annotationsEnabled) return;
  if (figma.editorType === "dev") return;
  const ids: string[] = [];
  for (const change of event.documentChanges) {
    if (change.type !== "PROPERTY_CHANGE") continue;
    const node = change.node;
    if ("removed" in node && node.removed) continue;
    if (node.type !== "TEXT") continue;
    // We only care about node-data edits that may change the Tolgee key.
    // `pluginData` covers our `tolgee_info` writes; `characters` / `name` may
    // affect key-format-derived labels in the future.
    const props = change.properties;
    if (
      !props.includes("pluginData") &&
      !props.includes("characters") &&
      !props.includes("name")
    ) {
      continue;
    }
    ids.push(node.id);
  }
  if (ids.length > 0) {
    scheduleReconcile(ids, annotationsEnabled);
  }
});

figma.on("close", () => {
  // Reserved for end-of-session persistence.
});

// --- UI -> main message handlers --------------------------------------------

on("ui-ready", async () => {
  await refreshAnnotationsEnabled();

  const config = await readMergedConfig();
  const { nodes } = await getSelectionInfo();

  send({
    type: "init",
    config,
    selectedNodes: nodes,
    editorType: figma.editorType as "figma" | "dev",
  });

  // Forward the invoked plugin command (if any) so the UI can route to the
  // matching screen after it has finished bootstrapping.
  const knownCommands = [
    "open",
    "toggle-annotations",
    "refresh-annotations",
    "open-on-node",
  ] as const;
  type KnownCommand = (typeof knownCommands)[number];
  const cmd = figma.command as KnownCommand | "";

  if (cmd === "toggle-annotations" && figma.editorType !== "dev") {
    annotationsEnabled = !annotationsEnabled;
    await setAnnotationsEnabled(annotationsEnabled);
    if (annotationsEnabled) {
      await syncCurrentPage();
    } else {
      await clearCurrentPage();
    }
  } else if (cmd === "refresh-annotations" && figma.editorType !== "dev") {
    if (annotationsEnabled) {
      await syncCurrentPage();
    }
  } else if (annotationsEnabled && figma.editorType !== "dev") {
    // First-open / regular-open: bring annotations back in sync after any
    // remote edits made while this plugin instance wasn't running.
    await syncCurrentPage();
  }

  if (cmd && knownCommands.includes(cmd)) {
    send({ type: "command", command: cmd });
  }
});

on("resize", (msg) => {
  figma.ui.resize(msg.size.width, msg.size.height);
});

on("close", () => {
  figma.closePlugin();
});

on("notify", (msg) => {
  figma.notify(msg.text, { error: msg.error });
});

on("open-external", (msg) => {
  figma.openExternal(msg.url);
});

on("save-config", async (msg) => {
  await writeConfig(msg.config);
  const merged = await readMergedConfig();
  send({ type: "config-changed", config: merged });
  if (annotationsEnabled && figma.editorType !== "dev") {
    await syncCurrentPage();
  }
});

on("reset", async () => {
  await resetConfig();
  send({ type: "config-changed", config: {} });
  if (annotationsEnabled && figma.editorType !== "dev") {
    await syncCurrentPage();
  }
});

on("set-language", async (msg) => {
  await writeConfig({ language: msg.language });
  send({ type: "config-changed", config: await readMergedConfig() });
});

on("set-branch", async (msg) => {
  await writeConfig({ branch: msg.branch });
  send({ type: "config-changed", config: await readMergedConfig() });
});

on("set-nodes-data", async (msg) => {
  const result = await setNodesData(msg.nodes);
  send({ type: "nodes-set-result", correlationId: msg.correlationId, ok: result.ok });
  // After data changes, refresh the selection snapshot so the UI sees the
  // updated NodeInfo without a manual re-fetch.
  await emitSelection();
  // Direct plugin-data writes don't always round-trip through documentchange
  // for the same plugin instance — kick the reconciler explicitly.
  if (annotationsEnabled && figma.editorType !== "dev") {
    scheduleReconcile(
      msg.nodes.map((n) => n.id),
      annotationsEnabled,
    );
  }
});

on("request-screenshots", async (msg) => {
  const screenshots = await captureScreenshots(msg.nodeIds);
  send({ type: "screenshots-result", correlationId: msg.correlationId, screenshots });
});

on("scroll-to-node", async (msg) => {
  const node = await figma.getNodeByIdAsync(msg.id);
  if (node && "x" in node) {
    figma.viewport.scrollAndZoomIntoView([node]);
  }
});

on("apply-translations", async (msg) => {
  const { ok, errors } = await applyTranslations(msg.updates);
  send({
    type: "apply-translations-result",
    correlationId: msg.correlationId,
    ok,
    errors,
  });
  if (annotationsEnabled && figma.editorType !== "dev") {
    scheduleReconcile(
      msg.updates.map((u) => u.id),
      annotationsEnabled,
    );
  }
});

on("sync-annotations", async (msg) => {
  if (figma.editorType === "dev") {
    send({
      type: "annotation-sync-result",
      correlationId: msg.correlationId,
      updated: 0,
    });
    return;
  }
  if (msg.all) {
    const { updated } = await syncCurrentPage();
    send({
      type: "annotation-sync-result",
      correlationId: msg.correlationId,
      updated,
    });
    return;
  }
  const ids = figma.currentPage.selection.map((n) => n.id);
  scheduleReconcile(ids, true);
  send({
    type: "annotation-sync-result",
    correlationId: msg.correlationId,
    updated: ids.length,
  });
});

on("toggle-annotations", async (msg) => {
  annotationsEnabled = msg.enabled;
  await setAnnotationsEnabled(msg.enabled);
  if (figma.editorType === "dev") return;
  if (msg.enabled) {
    await syncCurrentPage();
  } else {
    await clearCurrentPage();
  }
});

on("get-annotations-state", async (msg) => {
  const enabled = await isAnnotationsEnabled();
  annotationsEnabled = enabled;
  send({
    type: "annotations-state",
    correlationId: msg.correlationId,
    enabled,
    available: figma.editorType !== "dev",
  });
});

on("create-copy", async (msg) => {
  const result =
    msg.mode === "keys"
      ? await createCopy({ mode: "keys", correlationId: msg.correlationId })
      : await createCopy({
          mode: "languages",
          correlationId: msg.correlationId,
          languages: msg.languages ?? [],
          translations: msg.translations ?? {},
        });
  send({
    type: "create-copy-result",
    correlationId: msg.correlationId,
    ok: result.ok,
    createdPageIds: result.createdPageIds,
    error: result.error,
  });
});
