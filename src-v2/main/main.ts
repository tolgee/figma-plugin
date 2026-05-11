import { UI_SIZES } from "$shared/constants";
import { attachBus, on, send } from "$main/bus";
import { applyTranslations } from "$main/handlers/nodes";
import { getSelectionInfo, setNodesData } from "$main/nodes/selection";
import { readMergedConfig, writeConfig, resetConfig } from "$main/settings";
import { captureScreenshots } from "$main/screenshots/capture";

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
});

figma.on("currentpagechange", () => {
  void emitPageChange();
});

figma.on("documentchange", () => {
  // Reserved for dirty-tracking + annotation reconciler (Phase 8).
});

figma.on("close", () => {
  // Reserved for end-of-session persistence.
});

// --- UI -> main message handlers --------------------------------------------

on("ui-ready", async () => {
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
  const knownCommands = ["open", "toggle-annotations", "refresh-annotations", "open-on-node"] as const;
  type KnownCommand = (typeof knownCommands)[number];
  const cmd = figma.command as KnownCommand | "";
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
});

on("reset", async () => {
  await resetConfig();
  send({ type: "config-changed", config: {} });
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
});

on("sync-annotations", (msg) => {
  // Phase 8 — annotation sync is a no-op until the annotations module lands.
  send({ type: "annotation-sync-result", correlationId: msg.correlationId, updated: 0 });
});
