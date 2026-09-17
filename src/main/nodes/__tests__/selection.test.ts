import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TOLGEE_NODE_INFO } from "$shared/constants";
import { applyTranslations, setNodesData } from "$main/nodes/selection";

/**
 * Minimal TEXT-node stand-in for the write paths: pluginData round-trip plus
 * the properties `getNodeInfo` / `applyRichText` touch.
 */
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

function installFigma(nodes: FakeNode[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  (globalThis as unknown as { figma: unknown }).figma = {
    getNodeByIdAsync: async (id: string) => byId.get(id) ?? null,
    loadFontAsync: async () => {},
  };
}

beforeEach(() => {
  installFigma([]);
});

afterEach(() => {
  (globalThis as unknown as { figma?: unknown }).figma = undefined;
});

describe("setNodesData", () => {
  it("returns fresh post-write snapshots of the updated nodes", async () => {
    const a = makeTextNode("1:1", "Hello");
    const b = makeTextNode("1:2", "World");
    installFigma([a, b]);

    const result = await setNodesData([
      { id: "1:1", info: { key: "greeting", connected: false } },
      { id: "1:2", info: { key: "world", ns: "app", connected: true } },
    ]);

    expect(result.ok).toBe(true);
    expect(result.nodes).toEqual([
      expect.objectContaining({ id: "1:1", key: "greeting", characters: "Hello" }),
      expect.objectContaining({ id: "1:2", key: "world", ns: "app", connected: true }),
    ]);
    // And the snapshot reflects what was actually persisted.
    expect(JSON.parse(a.getPluginData(TOLGEE_NODE_INFO))).toMatchObject({ key: "greeting" });
  });

  it("skips missing / non-text nodes without failing the batch", async () => {
    const a = makeTextNode("1:1", "Hello");
    installFigma([a]);

    const result = await setNodesData([
      { id: "1:1", info: { key: "kept" } },
      { id: "9:9", info: { key: "ghost" } },
    ]);

    expect(result.ok).toBe(true);
    expect(result.nodes.map((n) => n.id)).toEqual(["1:1"]);
  });

  it("reports progress every 50 updates when total > 100, ending at done === total", async () => {
    const nodes = Array.from({ length: 250 }, (_, i) => makeTextNode(`1:${i}`, `text ${i}`));
    installFigma(nodes);
    const onProgress = vi.fn();

    const updates = nodes.map((n) => ({ id: n.id, info: { key: `k${n.id}` } }));
    const result = await setNodesData(updates, onProgress);

    expect(result.ok).toBe(true);
    expect(onProgress).toHaveBeenCalledTimes(5);
    expect(onProgress.mock.calls[0]).toEqual([50, 250]);
    const last = onProgress.mock.calls.at(-1);
    expect(last).toEqual([250, 250]);
  });

  it("sends no progress messages when total <= 100", async () => {
    const nodes = Array.from({ length: 100 }, (_, i) => makeTextNode(`1:${i}`, `text ${i}`));
    installFigma(nodes);
    const onProgress = vi.fn();

    const updates = nodes.map((n) => ({ id: n.id, info: { key: `k${n.id}` } }));
    const result = await setNodesData(updates, onProgress);

    expect(result.ok).toBe(true);
    expect(onProgress).not.toHaveBeenCalled();
  });
});

describe("applyTranslations", () => {
  it("returns snapshots carrying the new text and translation", async () => {
    const a = makeTextNode("1:1", "old text");
    installFigma([a]);

    const result = await applyTranslations([
      { id: "1:1", text: "new text", translation: "new text", key: "k", connected: true },
    ]);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.nodes).toEqual([
      expect.objectContaining({
        id: "1:1",
        characters: "new text",
        translation: "new text",
        connected: true,
      }),
    ]);
  });

  it("collects per-node errors without aborting the batch", async () => {
    const a = makeTextNode("1:1", "ok");
    installFigma([a]);

    const result = await applyTranslations([
      { id: "9:9", text: "x", translation: "x" },
      { id: "1:1", text: "fine", translation: "fine" },
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.nodes.map((n) => n.id)).toEqual(["1:1"]);
  });

  it("reports progress every 10 updates when total > 100, ending at done === total", async () => {
    const nodes = Array.from({ length: 250 }, (_, i) => makeTextNode(`1:${i}`, `old ${i}`));
    installFigma(nodes);
    const onProgress = vi.fn();

    const updates = nodes.map((n) => ({ id: n.id, text: "new", translation: "new" }));
    const result = await applyTranslations(updates, onProgress);

    expect(result.ok).toBe(true);
    expect(onProgress).toHaveBeenCalledTimes(25);
    expect(onProgress.mock.calls[0]).toEqual([10, 250]);
    const last = onProgress.mock.calls.at(-1);
    expect(last).toEqual([250, 250]);
  });

  it("sends no progress messages when total <= 100", async () => {
    const nodes = Array.from({ length: 100 }, (_, i) => makeTextNode(`1:${i}`, `old ${i}`));
    installFigma(nodes);
    const onProgress = vi.fn();

    const updates = nodes.map((n) => ({ id: n.id, text: "new", translation: "new" }));
    const result = await applyTranslations(updates, onProgress);

    expect(result.ok).toBe(true);
    expect(onProgress).not.toHaveBeenCalled();
  });
});
