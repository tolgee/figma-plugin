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

// When the manifest's `ui` is a string, Figma injects `__html__`. When it's
// an object (per-editor UIs), Figma injects `__uiFiles__` instead with one
// entry per editor key. We picked the object form (figma + dev) so we have
// to read from `__uiFiles__` here. `__html__` is only used as a fallback if
// neither global is available (shouldn't happen but keeps TypeScript calm).
declare const __uiFiles__: { figma?: string; dev?: string } | undefined;
declare const __html__: string | undefined;

const uiHtml =
  figma.editorType === "dev"
    ? __uiFiles__?.dev ?? __uiFiles__?.figma ?? __html__ ?? ""
    : __uiFiles__?.figma ?? __html__ ?? "";

figma.skipInvisibleInstanceChildren = true;

// Quick-action commands run their side effect and close the plugin without
// ever showing the UI. Everything else opens the plugin window.
const isQuickAction =
  figma.command === "toggle-annotations" && figma.editorType !== "dev";

if (isQuickAction) {
  void (async () => {
    try {
      const enabled = !(await isAnnotationsEnabled());
      await setAnnotationsEnabled(enabled);
      if (enabled) {
        const { updated } = await syncCurrentPage();
        figma.closePlugin(`Tolgee annotations on (${updated} updated)`);
      } else {
        const { updated } = await clearCurrentPage();
        figma.closePlugin(`Tolgee annotations off (${updated} cleared)`);
      }
    } catch (err) {
      figma.closePlugin(
        `Tolgee error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  })();
} else {
  figma.showUI(uiHtml, {
    width: UI_SIZES.DEFAULT.width,
    height: UI_SIZES.DEFAULT.height,
    themeColors: true,
  });
  attachBus();
}

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

// In `documentAccess: "dynamic-page"` mode, Figma rejects `documentchange`
// registration unless we first call `figma.loadAllPagesAsync()`, which is
// expensive on large files. We deliberately skip it: annotation reconciles
// already happen on `selectionchange` (covers user-visible drift) and after
// our own `set-nodes-data` / `apply-translations` writes (covers our edits).
// Cross-plugin edits to `tolgee_info` would be missed, but that's an edge
// case and the user can hit "Refresh Annotations" from the menu.

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
  // matching screen after it has finished bootstrapping. `toggle-annotations`
  // is handled as a quick action above and never reaches ui-ready.
  const knownCommands = ["open", "open-on-node"] as const;
  type KnownCommand = (typeof knownCommands)[number];
  const cmd = figma.command as KnownCommand | "";

  // On a regular open, bring annotations back in sync after any external
  // edits made while this plugin instance wasn't running.
  if (annotationsEnabled && figma.editorType !== "dev") {
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

// API-key validation lives in the design-mode UI (depends on `openapi-fetch`).
// The UI relays the resolved `projectId` back here so we can persist it at
// the document scope; the inspect (Dev Mode) UI reads it from config to
// build project-aware deep links into the Tolgee web app.
on("persist-project-id", async (msg) => {
  await writeConfig({ projectId: msg.projectId });
  const merged = await readMergedConfig();
  send({ type: "config-changed", config: merged });
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
  // Re-emit selection so the UI sees the post-write NodeInfo (new characters,
  // translation, key/ns/plural flags) without an extra round-trip.
  await emitSelection();
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
