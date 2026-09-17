import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Narrow test for the `on("set-nodes-data", ...)` handler wired up in
 * `main.ts`. `setNodesData` itself (in `$main/nodes/selection`) is already
 * well covered (see `nodes/__tests__/selection.test.ts`, task 7) — this test
 * only checks that the main-thread MESSAGE HANDLER correctly forwards
 * `setNodesData`'s `onProgress` callback into `nodes-set-progress` UI
 * messages, and sends `nodes-set-result` at the end.
 *
 * `main.ts` has no exported, individually-invokable handler functions — every
 * `on(...)` registration is an inline arrow function, and the file runs
 * side-effecting top-level code (`figma.showUI`, `figma.on(...)`,
 * `attachBus()`) at import time. Rather than refactor the whole file's
 * handler-registration pattern just to make ONE handler unit-testable in
 * isolation (out of proportion for this cleanup task — see task 14g), this
 * test drives it the way the real bridge does: `attachBus()` (called at
 * module top level) assigns `figma.ui.onmessage` to the actual dispatcher, so
 * invoking that with a `set-nodes-data` message exercises the exact handler
 * registered in `main.ts`, with no behavioural changes to the source file.
 */

/** Minimal TEXT-node stand-in — same shape `selection.test.ts` uses for
 *  `setNodesData`'s `figma.getNodeByIdAsync` lookups. */
function makeTextNode(id: string, characters: string) {
  const pluginData = new Map<string, string>();
  return {
    id,
    type: "TEXT" as const,
    name: `Layer ${id}`,
    characters,
    visible: true,
    autoRename: true,
    getPluginData: (key: string) => pluginData.get(key) ?? "",
    setPluginData: (key: string, value: string) => {
      pluginData.set(key, value);
    },
    getRangeAllFontNames: () => [{ family: "Inter", style: "Regular" }],
  };
}

type FakeNode = ReturnType<typeof makeTextNode>;
type FakeFigma = {
  editorType: "figma" | "dev";
  command: string;
  currentPage: {
    selection: unknown[];
    name: string;
    loadAsync: () => Promise<void>;
    getPluginData: (key: string) => string;
  };
  root: { getPluginData: (key: string) => string };
  clientStorage: { getAsync: (key: string) => Promise<unknown> };
  skipInvisibleInstanceChildren: boolean;
  showUI: ReturnType<typeof vi.fn>;
  notify: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  ui: { postMessage: ReturnType<typeof vi.fn>; onmessage?: (msg: unknown) => unknown };
  getNodeByIdAsync: (id: string) => Promise<FakeNode | null>;
};

/** Installs a fresh `figma` global (+ the two build-time UI-html injected
 *  globals `main.ts` reads at module scope) and imports `main.ts` fresh, so
 *  its top-level `attachBus()` wires `figma.ui.onmessage` for this test.
 *
 *  `selection` (optional) populates `figma.currentPage.selection` for tests
 *  that exercise `ui-ready`'s startup scan; the config/pluginData reads all
 *  return empty (merged config = defaults), which is all those tests need. */
async function loadMain(
  nodes: FakeNode[],
  editorType: "figma" | "dev" = "figma",
  selection: FakeNode[] = [],
): Promise<FakeFigma> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const figma: FakeFigma = {
    editorType,
    command: "",
    currentPage: {
      selection,
      name: "Page 1",
      loadAsync: async () => {},
      getPluginData: () => "",
    },
    root: { getPluginData: () => "" },
    clientStorage: { getAsync: async () => undefined },
    skipInvisibleInstanceChildren: false,
    showUI: vi.fn(),
    notify: vi.fn(),
    on: vi.fn(),
    ui: { postMessage: vi.fn() },
    getNodeByIdAsync: async (id: string) => byId.get(id) ?? null,
  };
  (globalThis as unknown as { figma: unknown }).figma = figma;
  (globalThis as unknown as { __uiFiles__: unknown }).__uiFiles__ = { figma: "<html></html>" };
  (globalThis as unknown as { __html__: unknown }).__html__ = "";

  vi.resetModules();
  await import("../main");

  return figma;
}

afterEach(() => {
  (globalThis as unknown as { figma?: unknown }).figma = undefined;
  (globalThis as unknown as { __uiFiles__?: unknown }).__uiFiles__ = undefined;
  (globalThis as unknown as { __html__?: unknown }).__html__ = undefined;
  vi.restoreAllMocks();
});

describe('main.ts on("set-nodes-data", ...) handler', () => {
  it("forwards setNodesData's onProgress into nodes-set-progress, then sends nodes-set-result", async () => {
    const nodes = Array.from({ length: 250 }, (_, i) => makeTextNode(`1:${i}`, `text ${i}`));
    const figma = await loadMain(nodes);
    expect(figma.ui.onmessage).toBeTypeOf("function");

    const updates = nodes.map((n) => ({ id: n.id, info: { key: `k${n.id}` } }));
    await figma.ui.onmessage?.({
      type: "set-nodes-data",
      correlationId: "corr-1",
      nodes: updates,
    });

    const calls = figma.ui.postMessage.mock.calls.map((c) => c[0] as { type: string });

    const progressMsgs = calls.filter((m) => m.type === "nodes-set-progress") as Array<{
      type: "nodes-set-progress";
      correlationId: string;
      done: number;
      total: number;
    }>;
    // setNodesData yields (and reports progress) every 50 updates, only when
    // total > 100 — 250 updates -> 5 progress messages, done reaching total.
    expect(progressMsgs).toHaveLength(5);
    for (const msg of progressMsgs) {
      expect(msg.correlationId).toBe("corr-1");
      expect(msg.total).toBe(250);
    }
    expect(progressMsgs[0]?.done).toBe(50);
    expect(progressMsgs.at(-1)?.done).toBe(250);

    const resultMsgs = calls.filter((m) => m.type === "nodes-set-result") as Array<{
      type: "nodes-set-result";
      correlationId: string;
      ok: boolean;
      nodes: unknown[];
    }>;
    expect(resultMsgs).toHaveLength(1);
    expect(resultMsgs[0]?.correlationId).toBe("corr-1");
    expect(resultMsgs[0]?.ok).toBe(true);
    expect(resultMsgs[0]?.nodes).toHaveLength(250);
  });

  it("sends no progress messages for a small batch (<=100), still sends the result", async () => {
    const nodes = Array.from({ length: 10 }, (_, i) => makeTextNode(`1:${i}`, `text ${i}`));
    const figma = await loadMain(nodes);

    const updates = nodes.map((n) => ({ id: n.id, info: { key: `k${n.id}` } }));
    await figma.ui.onmessage?.({
      type: "set-nodes-data",
      correlationId: "corr-2",
      nodes: updates,
    });

    const calls = figma.ui.postMessage.mock.calls.map((c) => c[0] as { type: string });
    expect(calls.filter((m) => m.type === "nodes-set-progress")).toHaveLength(0);
    expect(calls.filter((m) => m.type === "nodes-set-result")).toHaveLength(1);
  });
});

describe("Dev-Mode canvas guard (attachBus + MESSAGE_IMPACT)", () => {
  it("blocks a canvas message in dev: handler never runs, user gets a toast", async () => {
    const figma = await loadMain([], "dev");
    // Silence the guard's console.warn — it's the expected path here.
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await figma.ui.onmessage?.({
      type: "apply-translations",
      correlationId: "corr-dev-1",
      updates: [],
    });

    // Blocked BEFORE the handler: no apply-translations-result ever posted.
    const calls = figma.ui.postMessage.mock.calls.map((c) => c[0] as { type: string });
    expect(calls.filter((m) => m.type === "apply-translations-result")).toHaveLength(0);
    expect(figma.notify).toHaveBeenCalledWith("Not available in Dev Mode");
  });

  it("lets a metadata message through in dev (production parity: Push works there)", async () => {
    const node = makeTextNode("1:1", "Hello");
    const figma = await loadMain([node], "dev");

    await figma.ui.onmessage?.({
      type: "set-nodes-data",
      correlationId: "corr-dev-2",
      nodes: [{ id: "1:1", info: { key: "k" } }],
    });

    const calls = figma.ui.postMessage.mock.calls.map((c) => c[0] as { type: string });
    expect(calls.filter((m) => m.type === "nodes-set-result")).toHaveLength(1);
    expect(figma.notify).not.toHaveBeenCalled();
  });

  it("does not interfere in the design editor: canvas messages run, no toast", async () => {
    const figma = await loadMain([], "figma");

    await figma.ui.onmessage?.({
      type: "apply-translations",
      correlationId: "corr-fig-1",
      updates: [],
    });

    const calls = figma.ui.postMessage.mock.calls.map((c) => c[0] as { type: string });
    expect(calls.filter((m) => m.type === "apply-translations-result")).toHaveLength(1);
    expect(figma.notify).not.toHaveBeenCalled();
  });
});

describe('main.ts on("ui-ready", ...) — config-first init + idempotent scan (task 58/63)', () => {
  type Posted = { type: string; [k: string]: unknown };

  it("replies with a config-first init immediately, then STREAMS the selection", async () => {
    const selection = [makeTextNode("1:1", "Hello"), makeTextNode("1:2", "World")];
    const figma = await loadMain(selection, "figma", selection);

    await figma.ui.onmessage?.({ type: "ui-ready" });

    const calls = figma.ui.postMessage.mock.calls.map((c) => c[0] as Posted);
    const initIdx = calls.findIndex((m) => m.type === "init");
    const batchIdx = calls.findIndex((m) => m.type === "selection-batch");

    // (c) init carries config + editorType + pageName …
    const init = calls[initIdx] as Posted;
    expect(init).toBeDefined();
    expect(init.editorType).toBe("figma");
    expect(init.pageName).toBe("Page 1");
    expect(init.config).toBeTypeOf("object");
    // … and NO selection — the nodes arrive via the stream, not the init.
    expect(init.selectedNodes).toEqual([]);
    expect(init.hasUserSelection).toBe(true);

    // (b) init goes out BEFORE the first streamed batch.
    expect(initIdx).toBeGreaterThanOrEqual(0);
    expect(batchIdx).toBeGreaterThan(initIdx);

    // The streamed batch actually carries the selected nodes.
    const batch = calls[batchIdx] as Posted & { nodes: unknown[] };
    expect(batch.nodes).toHaveLength(2);
  });

  it("runs the scan AT MOST ONCE across repeated ui-ready retries", async () => {
    const selection = [makeTextNode("1:1", "Hello"), makeTextNode("1:2", "World")];
    const figma = await loadMain(selection, "figma", selection);

    // Two retries land (the UI resends ui-ready until it sees init).
    await figma.ui.onmessage?.({ type: "ui-ready" });
    await figma.ui.onmessage?.({ type: "ui-ready" });

    const calls = figma.ui.postMessage.mock.calls.map((c) => c[0] as Posted);

    // Both ui-readys reply with an init (cheap) …
    expect(calls.filter((m) => m.type === "init")).toHaveLength(2);
    // … but the expensive scan ran exactly once: one pending, one batch set,
    // one done. A second scan would double these.
    expect(calls.filter((m) => m.type === "selection-pending")).toHaveLength(1);
    expect(calls.filter((m) => m.type === "selection-batch")).toHaveLength(1);
    expect(calls.filter((m) => m.type === "selection-done")).toHaveLength(1);
  });

  it("with no selection: config-first init, an (empty) scan, done total 0", async () => {
    const figma = await loadMain([], "figma", []);

    await figma.ui.onmessage?.({ type: "ui-ready" });

    const calls = figma.ui.postMessage.mock.calls.map((c) => c[0] as Posted);
    const init = calls.find((m) => m.type === "init") as Posted;
    expect(init.hasUserSelection).toBe(false);
    expect(init.selectedNodes).toEqual([]);
    // No nodes to stream → no batch, and done reports an empty selection.
    expect(calls.filter((m) => m.type === "selection-batch")).toHaveLength(0);
    const done = calls.find((m) => m.type === "selection-done") as Posted;
    expect(done.total).toBe(0);
    expect(done.hasUserSelection).toBe(false);
  });
});

/**
 * The supersede mechanism behind `selectionchange` — flagged as untested in
 * review, and the exact place the race below lived.
 *
 * `getSelectionInfo` is mocked so a scan's completion can be held open across
 * a second selection event; the real one resolves too fast to interleave.
 */
describe("main.ts selection supersede", () => {
  /** A scan whose completion the test controls. */
  function deferredScan() {
    const pending: Array<{
      resolve: () => void;
      isStale: () => boolean;
      emit: (nodes: unknown[], first: boolean) => void;
    }> = [];
    const getSelectionInfo = vi.fn(
      (isStale: () => boolean, onBatch: (nodes: unknown[], first: boolean) => void) =>
        new Promise<void>((resolve) => {
          pending.push({ resolve, isStale, emit: onBatch });
        }),
    );
    return { pending, getSelectionInfo };
  }

  it("drops a scan superseded by a newer selection before it finishes", async () => {
    const scan = deferredScan();
    vi.doMock("$main/nodes/selection", async () => {
      const actual = await vi.importActual<typeof import("$main/nodes/selection")>(
        "$main/nodes/selection",
      );
      return { ...actual, getSelectionInfo: scan.getSelectionInfo };
    });

    const figma = await loadMain([]);
    const selectionChange = figma.on.mock.calls.find((c) => c[0] === "selectionchange")?.[1] as
      | (() => void)
      | undefined;
    expect(selectionChange).toBeTypeOf("function");

    // Selection A — starts a scan and leaves it hanging.
    selectionChange?.();
    await vi.waitFor(() => expect(scan.pending).toHaveLength(1));
    figma.ui.postMessage.mockClear();

    // Selection B arrives while A is still in flight.
    selectionChange?.();

    // A now finishes. It must be recognised as stale: no batch, no done.
    const first = scan.pending[0];
    first?.emit([{ id: "stale-node" }], true);
    first?.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const types = figma.ui.postMessage.mock.calls.map((c) => (c[0] as { type: string }).type);
    expect(first?.isStale()).toBe(true);
    expect(types).not.toContain("selection-batch");
    expect(types).not.toContain("selection-done");
    // The UI must still be told a scan is under way, or it would sit on the
    // previous result with no loader.
    expect(types).toContain("selection-pending");

    vi.doUnmock("$main/nodes/selection");
  });
})
