import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cleanUpHighlights, highlightNode } from "$main/nodes/highlight";

/** Minimal TEXT-node stand-in for the fills read/write the pulse touches. */
function makeTextNode(id: string, fills: Paint[] = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]) {
  return {
    id,
    type: "TEXT" as const,
    fills,
    removed: false,
  };
}

type FakeNode = ReturnType<typeof makeTextNode>;

function installFigma(nodes: FakeNode[], editorType: "figma" | "dev" = "figma") {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  (globalThis as unknown as { figma: unknown }).figma = {
    editorType,
    getNodeByIdAsync: async (id: string) => byId.get(id) ?? null,
    // Deliberately NOT provided: a sync `getNodeById` — this is the whole
    // point of the fix. If cleanup ever calls it again, the test blows up
    // with "figma.getNodeById is not a function" instead of silently
    // swallowing a thrown error like the try/catch used to.
    viewport: { scrollAndZoomIntoView: () => {} },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  (globalThis as unknown as { figma?: unknown }).figma = undefined;
});

describe("cleanUpHighlights", () => {
  it("restores original fills using the captured node reference, without figma.getNodeById", async () => {
    const original: Paint[] = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    const node = makeTextNode("1:1", original);
    installFigma([node]);

    await highlightNode("1:1");
    // Highlight applied, pulse still pending (500ms timer not yet fired).
    expect(node.fills).not.toEqual(original);

    cleanUpHighlights();

    expect(node.fills).toEqual(original);
  });

  it("is a no-op when nothing is pulsing", () => {
    installFigma([]);
    expect(() => cleanUpHighlights()).not.toThrow();
  });

  it("skips a node that was removed while pulsing, without throwing", async () => {
    const node = makeTextNode("1:1");
    installFigma([node]);

    await highlightNode("1:1");
    node.removed = true;

    expect(() => cleanUpHighlights()).not.toThrow();
  });

  it("clears the pending timer so it can't fire after cleanup", async () => {
    const original: Paint[] = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    const node = makeTextNode("1:1", original);
    installFigma([node]);

    await highlightNode("1:1");
    cleanUpHighlights();
    node.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

    vi.advanceTimersByTime(1000);

    // The (cleared) pulse timer must not overwrite this later change.
    expect(node.fills).toEqual([{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]);
  });
});
