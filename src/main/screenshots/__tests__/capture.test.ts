import { afterEach, describe, expect, it, vi } from "vitest";

import { captureScreenshots } from "$main/screenshots/capture";
import type { FrameScreenshot } from "$shared/types";

/**
 * Minimal fakes for the parent-chain walks (`findParentPage`,
 * `findOutermostFrame`) and the handful of node properties `capture.ts`
 * touches (`absoluteBoundingBox`, `exportAsync`, plugin data get/set).
 */
function makePage(id: string) {
  return { id, type: "PAGE" as const, parent: null, loadAsync: async () => {} };
}

function makeFrame(id: string, parent: unknown) {
  return {
    id,
    name: `Frame ${id}`,
    type: "FRAME" as const,
    parent,
    absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
    exportAsync: vi.fn(async () => new Uint8Array([1, 2, 3])),
  };
}

function makeTextNode(id: string, parent: unknown) {
  const pluginData = new Map<string, string>();
  return {
    id,
    name: `Text ${id}`,
    type: "TEXT" as const,
    parent,
    characters: "Hello",
    visible: true,
    absoluteBoundingBox: { x: 10, y: 10, width: 50, height: 20 },
    getPluginData: (key: string) => pluginData.get(key) ?? "",
    setPluginData: (key: string, value: string) => {
      pluginData.set(key, value);
    },
  };
}

function installFigma(getNodeByIdAsync: (id: string) => Promise<unknown>) {
  (globalThis as unknown as { figma: unknown }).figma = { getNodeByIdAsync };
}

afterEach(() => {
  (globalThis as unknown as { figma?: unknown }).figma = undefined;
  vi.restoreAllMocks();
});

describe("captureScreenshots", () => {
  it("resolves node ids, skips missing ones, and delivers one screenshot per frame", async () => {
    const page = makePage("page-1");
    const frame = makeFrame("f-1", page);
    const t1 = makeTextNode("t-1", frame);
    const t2 = makeTextNode("t-2", frame);
    const nodesById = new Map<string, unknown>([
      ["f-1", frame],
      ["t-1", t1],
      ["t-2", t2],
    ]);
    installFigma(async (id) => nodesById.get(id) ?? null);

    const delivered: FrameScreenshot[] = [];
    // "missing-id" resolves to null and must be skipped, not crash the batch.
    const { delivered: count } = await captureScreenshots(["t-1", "t-2", "missing-id"], (s) =>
      delivered.push(s),
    );

    expect(count).toBe(1);
    expect(delivered).toHaveLength(1);
    expect(delivered[0]?.info.id).toBe("f-1");
    expect(delivered[0]?.keys.map((k) => k.id)).toEqual(["t-1", "t-2"]);
  });

  it("resolves ids sequentially with periodic yields instead of one concurrent Promise.all burst", async () => {
    const total = 120;
    const nodesById = new Map<string, unknown>();
    // None of these are TEXT nodes, so `frameToNodes` stays empty and the
    // frame-export loop never runs -- any yields observed come solely from
    // the id-resolve step under test.
    for (let i = 0; i < total; i++) {
      nodesById.set(`n-${i}`, { id: `n-${i}`, type: "RECTANGLE", parent: null });
    }

    let inFlight = 0;
    let maxInFlight = 0;
    installFigma(async (id) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      // Simulate a real bridge round-trip (a microtask gap) so a concurrent
      // burst would actually show overlapping in-flight calls.
      await Promise.resolve();
      const result = nodesById.get(id) ?? null;
      inFlight--;
      return result;
    });

    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    const ids = Array.from({ length: total }, (_, i) => `n-${i}`);
    const { delivered: count } = await captureScreenshots(ids, () => {});

    expect(count).toBe(0);
    // Sequential resolution: at most one lookup in flight at any time, never
    // a 120-way concurrent burst.
    expect(maxInFlight).toBe(1);
    // Yields at 50 and 100 resolved ids (120 isn't itself a multiple of 50).
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
  });
});

describe("captureScreenshots — failed frames", () => {
  it("reports frames whose export threw instead of dropping them silently", async () => {
    // A failed export was console.warn'd (dev-only, invisible to users) and
    // vanished, so the push summary presented the reduced count as the whole
    // set: "N screenshot(s) uploaded" with no hint that M never made it.
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const page = makePage("page-1");
    const okFrame = makeFrame("f-ok", page);
    const badFrame = makeFrame("f-bad", page);
    badFrame.exportAsync = vi.fn(async () => {
      throw new Error("export blew up");
    }) as never;
    const tOk = makeTextNode("t-ok", okFrame);
    const tBad = makeTextNode("t-bad", badFrame);
    const nodesById = new Map<string, unknown>([
      ["t-ok", tOk],
      ["t-bad", tBad],
    ]);
    installFigma(async (id) => nodesById.get(id) ?? null);

    const delivered: FrameScreenshot[] = [];
    const result = await captureScreenshots(["t-ok", "t-bad"], (s) => delivered.push(s));

    expect(result.delivered).toBe(1);
    expect(result.failed).toBe(1);
    expect(delivered).toHaveLength(1);
  });

  it("reports zero failures when every frame exports", async () => {
    const page = makePage("page-1");
    const frame = makeFrame("f-1", page);
    const t1 = makeTextNode("t-1", frame);
    installFigma(async (id) => (id === "t-1" ? t1 : null));

    const result = await captureScreenshots(["t-1"], () => {});

    expect(result).toEqual({ delivered: 1, failed: 0 });
  });
});
