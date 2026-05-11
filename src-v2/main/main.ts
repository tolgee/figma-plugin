import { UI_SIZES } from "$shared/constants";
import { attachBus, on, send } from "$main/bus";

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

// --- Figma event subscriptions -------------------------------------------------

figma.on("selectionchange", () => {
  // TODO: collect selected node info via handlers/nodes.ts and forward it.
  send({ type: "selection-changed", nodes: [] });
});

figma.on("currentpagechange", () => {
  // TODO: re-read merged config for the new page and emit a `page-changed`
  // message with the fresh config + selection snapshot.
});

figma.on("documentchange", () => {
  // TODO: mark store dirty / debounce a rescan of connected nodes.
});

figma.on("close", () => {
  // TODO: persist any pending state (e.g. last UI route, draft config) before
  // the sandbox tears down.
});

// --- UI -> main message handlers ----------------------------------------------

on("ui-ready", () => {
  send({
    type: "init",
    config: null,
    selectedNodes: [],
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

// All remaining UiToMain types fall through to the bus's catch-all logger.
// Implementations land in src-v2/main/handlers/* and will be wired here.
