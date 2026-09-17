import { attachBus, on, send } from "$main/bus";
import {
  checkCopyStaleness,
  type CopyStalenessResult,
  createCopy,
} from "$main/handlers/createCopy";
import { applyTranslations } from "$main/nodes/selection";
import { cleanUpHighlights, highlightNode } from "$main/nodes/highlight";
import { clearPrefilledKeys } from "$main/nodes/clearPrefilled";
import { buildConnectedNodesInfo, scanConnectedNodes } from "$main/nodes/scan";
import { type MainComponentNameCache, resolveParentNames } from "$main/nodes/nodeParents";
import { type KeyParentNames, keyFormatUsesParents } from "$shared/keyFormat";
import { getSelectionInfo, setNodesData } from "$main/nodes/selection";
import { captureScreenshots } from "$main/screenshots/capture";
import {
  invalidateConfigCache,
  readMergedConfig,
  resetConfig,
  writeConfig,
} from "$main/settings";
import { UI_SIZES } from "$shared/constants";

// When the manifest's `ui` is a string, Figma injects `__html__`. When it's
// an object (per-editor UIs), Figma injects `__uiFiles__` instead with one
// entry per editor key. We picked the object form (figma + dev) so we have
// to read from `__uiFiles__` here. `__html__` is only used as a fallback if
// neither global is available (shouldn't happen but keeps TypeScript calm).
declare const __uiFiles__: { figma?: string; dev?: string } | undefined;
declare const __html__: string | undefined;

const uiHtml =
  figma.editorType === "dev"
    ? (__uiFiles__?.dev ?? __uiFiles__?.figma ?? __html__ ?? "")
    : (__uiFiles__?.figma ?? __html__ ?? "");

figma.skipInvisibleInstanceChildren = true;

figma.showUI(uiHtml, {
  width: UI_SIZES.DEFAULT.width,
  height: UI_SIZES.DEFAULT.height,
  themeColors: true,
});
attachBus();

// Monotonic token: each new scan invalidates every scan still in flight, so a
// slow older scan can never overwrite a newer selection in the UI.
let scanGeneration = 0;

// Whether the first `ui-ready` has already kicked off the startup selection
// scan. The UI retries `ui-ready` every 400ms until it receives `init` (to
// survive the race where this main-side listener isn't attached yet), so this
// handler can fire more than once — but the (potentially multi-second) scan
// must run AT MOST ONCE. A repeat `ui-ready` just re-sends the cheap
// config-first `init`; it never launches another scan.
let initHandled = false;

async function emitSelection(sendPending = true): Promise<void> {
  const generation = ++scanGeneration;
  const isStale = () => generation !== scanGeneration;
  // Tell the UI a scan is starting so it can show a loader during the
  // (potentially slow) getSelectionInfo() below, not just after it resolves.
  if (sendPending) send({ type: "selection-pending" });
  // One REAL breather before the heavy work: everything up to the first
  // engine search resolves in microtasks (cached config, loaded page), so
  // without this the scan blocks the canvas straight from inside the
  // selectionchange callback — the pending message never flushes to the UI
  // (no loader) and pending input (a deselect click) never gets processed.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  if (isStale()) return;
  // STREAMED delivery: each completed batch goes straight to the UI, so the
  // list starts rendering after the first ~100 nodes instead of after the
  // whole (potentially many-second) scan. Stale batches are suppressed at
  // send time; the terminal `selection-done` closes the stream.
  let total = 0;
  try {
    await getSelectionInfo(isStale, (nodes, first) => {
      if (isStale()) return;
      total += nodes.length;
      send({ type: "selection-batch", nodes, first });
    });
  } catch (err) {
    // A failed scan MUST still close the stream — otherwise the UI's
    // delayed spinner (armed by `selection-pending`) stays up forever. Fall
    // through to `selection-done`; the next selection change recovers.
    console.warn("[tolgee:main] selection scan failed", err);
  }
  if (generation !== scanGeneration) return; // superseded by a newer scan
  send({
    type: "selection-done",
    hasUserSelection: figma.currentPage.selection.length > 0,
    total,
  });
}

// Selection events come in two shapes: a single deliberate click, and rapid
// bursts (arrow-keying / drag-selecting through layers fires one event per
// step). A deliberate click scans IMMEDIATELY — a fixed delay on every click
// reads as sluggishness against the previous plugin. Only events that follow
// each other closely (a burst) are coalesced with a short trailing debounce.
const SELECTION_BURST_MS = 150;
const SELECTION_DEBOUNCE_MS = 60;
let selectionDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastSelectionChangeAt = 0;

function scheduleEmitSelection(): void {
  // Invalidate any in-flight scan NOW, not whenever the debounced call gets
  // around to running. `emitSelection` bumps the token itself, but during the
  // debounce window it hasn't run yet — so an older scan finishing in that gap
  // still passed its own staleness check and sent `selection-batch` +
  // `selection-done` for the PREVIOUS selection. The UI took that as the final
  // answer and cleared its loading state, then the debounced scan started with
  // `sendPending = false` and nothing put the loader back: the old selection's
  // result sat there looking authoritative, and a bulk action fired in that
  // window would have targeted those nodes instead of the current ones.
  scanGeneration++;
  send({ type: "selection-pending" });
  const now = Date.now();
  const inBurst = now - lastSelectionChangeAt < SELECTION_BURST_MS;
  lastSelectionChangeAt = now;
  if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
  if (!inBurst) {
    void emitSelection(false);
    return;
  }
  selectionDebounceTimer = setTimeout(() => {
    selectionDebounceTimer = null;
    void emitSelection(false);
  }, SELECTION_DEBOUNCE_MS);
}

async function emitPageChange(): Promise<void> {
  const config = await readMergedConfig();
  send({ type: "page-changed", config, pageName: figma.currentPage.name });
  await emitSelection();
}

// --- Figma event subscriptions ----------------------------------------------

figma.on("selectionchange", () => {
  scheduleEmitSelection();
});

figma.on("currentpagechange", () => {
  void (async () => {
    // Page scope contributes to the merged config (language lives per page).
    invalidateConfigCache();
    await emitPageChange();
  })();
});

// In `documentAccess: "dynamic-page"` mode, Figma rejects `documentchange`
// registration unless we first call `figma.loadAllPagesAsync()`, which is
// expensive on large files. We deliberately skip it — no code here needs
// document-wide change notifications; selection-driven scans and explicit
// writes cover everything the plugin does.

figma.on("close", () => {
  // Restore fills on any node still mid-highlight — an unexpected close
  // would otherwise leave layers stuck in the pink pulse colour.
  cleanUpHighlights();
});

// --- UI -> main message handlers --------------------------------------------

on("ui-ready", async () => {
  const config = await readMergedConfig();

  // Config-FIRST init: reply immediately with everything cheap to read and
  // `selectedNodes: []`. The real selection streams in right after via the
  // generation-tokened `selection-pending`/`selection-batch`/`selection-done`
  // path (same as `selectionchange`). Because this reply is instant, the UI's
  // `ui-ready` retry stops within a frame — so a slow scan can no longer pile
  // up one full scan per 400ms retry, and a late `init` from an earlier retry
  // can no longer overwrite a newer streamed selection.
  send({
    type: "init",
    config,
    selectedNodes: [],
    hasUserSelection: figma.currentPage.selection.length > 0,
    editorType: figma.editorType as "figma" | "dev",
    pageName: figma.currentPage.name,
  });

  // A retry landed after the first init already ran the scan — re-sending the
  // (cheap) init above is enough; never launch a second scan.
  if (initHandled) return;
  initHandled = true;

  // Stream the initial selection with a generation token, exactly like a
  // `selectionchange` — the UI already renders `selection-pending`/`-batch`/
  // `-done` incrementally, so a large startup selection paints progressively
  // instead of blocking `init` on a full scan.
  await emitSelection();
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

// Settings submits its WHOLE form every time, so deciding what a save
// actually changed must compare VALUES, not submitted keys (a save that only
// touched the API key used to trigger a full re-scan of the selection —
// seconds of canvas work on large selections, for nothing).
const IGNORE_RULE_KEYS = [
  "ignoreNumbers",
  "ignoreFormattedNumbers",
  "ignorePrefix",
  "ignoreTextLayers",
  "ignoreHiddenLayers",
  "ignoreHiddenLayersIncludingChildren",
] as const;
const PREFILL_KEYS = ["prefillKeyFormat", "keyFormat", "variableCasing"] as const;

on("save-config", async (msg) => {
  const before = await readMergedConfig();
  // Production always stamps these two scope markers on every settings save
  // (see settingsTools.ts in the reference plugin). Writing them here restores
  // parity: `documentInfo` lets App.svelte's PageSetup gate for newly added
  // pages fire correctly, and `pageInfo` records that this page's language was
  // configured. It also keeps rollback-safe: if a document this plugin
  // configured is later reopened with the ORIGINAL production plugin,
  // production's own "documentInfo missing" gate won't spuriously trigger.
  await writeConfig({ ...msg.config, documentInfo: true, pageInfo: true });
  const merged = await readMergedConfig();
  send({ type: "config-changed", config: merged });
  const ignoreRulesChanged = IGNORE_RULE_KEYS.some((key) => before[key] !== merged[key]);
  const prefillChanged = PREFILL_KEYS.some((key) => before[key] !== merged[key]);
  // Prefill turned OFF: drop the auto-generated keys the prefill persisted to
  // node pluginData while it was on, so they don't linger in the list or get
  // re-offered on push. Matches the published plugin's `clearPrefilledKeys`
  // (which triggers on its per-toggle save); we do it on our form Save.
  const prefillTurnedOff = Boolean(before.prefillKeyFormat) && !merged.prefillKeyFormat;
  if (prefillTurnedOff) {
    await clearPrefilledKeys();
  }
  // Re-scan only when it changes what the scan RETURNS: different ignore
  // filtering, a prefill format that needs freshly resolved parent names
  // ({frame}/{component}/…), or a prefill-off clear (so the current selection
  // reflects the wiped keys). Key regeneration itself happens in the UI from
  // data it already has — re-scanning for a plain format change made a save
  // repaint the list three times (scan overlay + scan result + regeneration
  // patch) instead of once.
  const needsRescan =
    ignoreRulesChanged ||
    prefillTurnedOff ||
    (prefillChanged &&
      Boolean(merged.prefillKeyFormat) &&
      keyFormatUsesParents(merged.keyFormat));
  if (needsRescan) {
    await emitSelection();
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
});

on("set-language", async (msg) => {
  await writeConfig({ language: msg.language });
  send({ type: "config-changed", config: await readMergedConfig() });
});

on("set-branch", async (msg) => {
  await writeConfig({ branch: msg.branch });
  send({ type: "config-changed", config: await readMergedConfig() });
});

on("request-page-connected-nodes", async (msg) => {
  const nodes = await scanConnectedNodes();
  // Same ignore settings (hidden layers, digit-only strings, prefixed layer
  // names, …) the with-selection scan already applies — a page-wide
  // "Download all" should skip the same nodes a selection scan would, not
  // touch everything regardless of those settings.
  const config = await readMergedConfig();
  const needsAncestorHidden = Boolean(
    (config.ignoreHiddenLayers ?? true) && config.ignoreHiddenLayersIncludingChildren,
  );
  // Chunked — `getNodeInfo` is ~5 bridge reads (incl. a full `characters`
  // copy) per node, and a page-wide Pull can hit thousands of connected nodes.
  // `buildConnectedNodesInfo` reports progress (guarded to `total > 100`) so
  // the UI's watchdog can tell a slow-but-alive scan from a hung one.
  const infos = await buildConnectedNodesInfo(nodes, config, needsAncestorHidden, (done, total) => {
    send({
      type: "page-connected-nodes-progress",
      correlationId: msg.correlationId,
      done,
      total,
    });
  });
  send({
    type: "page-connected-nodes-result",
    correlationId: msg.correlationId,
    nodes: infos,
  });
});

on("set-nodes-data", async (msg) => {
  const result = await setNodesData(msg.nodes, (done, total) => {
    send({
      type: "nodes-set-progress",
      correlationId: msg.correlationId,
      done,
      total,
    });
  });
  // The result carries fresh snapshots of the written nodes so the UI can
  // patch its selection in place. We deliberately do NOT re-scan the whole
  // selection here — with large selections that full re-scan per write is
  // what saturated the canvas thread and froze Figma.
  send({
    type: "nodes-set-result",
    correlationId: msg.correlationId,
    ok: result.ok,
    nodes: result.nodes,
  });
});

on("resolve-parent-names", async (msg) => {
  // Walk each node's ancestors on demand (only the requested nodes, not the
  // whole page) so the bulk "Generate key names" action can resolve parent
  // placeholders for a template that differs from the saved key format.
  // Sequential with periodic yields — the walks are bridge-call heavy, and a
  // parallel batch over a large selection blocks the canvas until it's done.
  const mainComponentNames: MainComponentNameCache = new Map();
  const entries: [string, KeyParentNames][] = [];
  let processed = 0;
  for (const id of msg.nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    entries.push([id, node ? await resolveParentNames(node, mainComponentNames) : {}]);
    processed++;
    if (processed % 25 === 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  send({
    type: "parent-names-result",
    correlationId: msg.correlationId,
    parents: Object.fromEntries(entries),
  });
});

on("request-screenshots", async (msg) => {
  // Streamed: one message per exported frame, then a terminal marker. Keeps
  // peak memory at one PNG and avoids serializing tens of MB in one go on
  // the canvas thread.
  let index = 0;
  const { delivered, failed } = await captureScreenshots(msg.nodeIds, (screenshot) => {
    send({
      type: "screenshot-frame",
      correlationId: msg.correlationId,
      screenshot,
      index: index++,
    });
  });
  send({
    type: "screenshots-done",
    correlationId: msg.correlationId,
    total: delivered,
    failed,
  });
});

on("scroll-to-node", async (msg) => {
  // `highlightNode` already calls `scrollAndZoomIntoView` and adds the
  // 500ms pink pulse on top, but it bails on dev-mode editors and on text
  // nodes with mixed fills. Falling back to a plain scroll keeps the click
  // useful in those branches.
  await highlightNode(msg.id);
  if (figma.editorType === "dev") {
    const node = await figma.getNodeByIdAsync(msg.id);
    if (node && "x" in node) {
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }
});

on("apply-translations", async (msg) => {
  const { ok, errors, nodes } = await applyTranslations(msg.updates, (done, total) => {
    send({
      type: "apply-translations-progress",
      correlationId: msg.correlationId,
      done,
      total,
    });
  });
  // Fresh post-write snapshots ride along for in-place patching — see the
  // matching comment in the `set-nodes-data` handler.
  send({
    type: "apply-translations-result",
    correlationId: msg.correlationId,
    ok,
    errors,
    nodes,
  });
});

on("create-copy", async (msg) => {
  // Same ignore settings (hidden layers, digit-only strings, prefixed layer
  // names, …) every other scan/write path already applies — a node the user
  // asked to ignore shouldn't have its text overwritten just because it's
  // being copied instead of downloaded to.
  const settings = await readMergedConfig();
  const result =
    msg.mode === "keys"
      ? await createCopy(
          {
            mode: "keys",
            correlationId: msg.correlationId,
            sourcePageId: msg.sourcePageId,
            namespacesEnabled: msg.namespacesEnabled,
          },
          settings,
        )
      : await createCopy(
          {
            mode: "languages",
            correlationId: msg.correlationId,
            languages: msg.languages ?? [],
            sourcePageId: msg.sourcePageId,
          },
          settings,
        );
  send({
    type: "create-copy-result",
    correlationId: msg.correlationId,
    ok: result.ok,
    createdPageIds: result.createdPageIds,
    pages: result.pages,
    error: result.error,
    skippedMissingFont: result.skippedMissingFont,
  });
});

on("request-copy-staleness", async (msg) => {
  // A throw here would otherwise vanish (the main bus doesn't wrap handlers)
  // and the UI would wait forever with no banner and no trace — the check
  // must ALWAYS answer, even if only with the failure reason.
  let result: CopyStalenessResult;
  try {
    result = await checkCopyStaleness(figma.currentPage);
  } catch (err) {
    result = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  send({
    type: "copy-staleness-result",
    correlationId: msg.correlationId,
    ok: result.ok,
    missingCount: result.missingCount,
    removedCount: result.removedCount,
    error: result.error,
  });
});
