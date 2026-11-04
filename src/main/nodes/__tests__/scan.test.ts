import { describe, expect, it, vi } from "vitest";

import { TOLGEE_NODE_INFO } from "$shared/constants";
import { buildConnectedNodesInfo, findTaggedTextNodes, scanSelectedTextNodes } from "$main/nodes/scan";

/** Minimal TEXT-node stand-in — just enough for `getNodeInfo`/`shouldIgnoreNode`
 *  to read. `parent` defaults to a bare PAGE stand-in (no hidden ancestors). */
function makeTextNode(
  id: string,
  overrides: Partial<Omit<TextNode, "parent">> & { parent?: unknown } = {},
): TextNode {
  return {
    id,
    name: `Layer ${id}`,
    characters: `text ${id}`,
    visible: true,
    parent: { type: "PAGE" },
    getPluginData: () => "",
    ...overrides,
  } as unknown as TextNode;
}

describe("buildConnectedNodesInfo", () => {
  it("reports progress every 50 nodes when total > 100, ending at done === total", async () => {
    const nodes = Array.from({ length: 250 }, (_, i) => makeTextNode(`1:${i}`));
    const onProgress = vi.fn();

    const infos = await buildConnectedNodesInfo(nodes, {}, false, onProgress);

    expect(infos).toHaveLength(250);
    expect(onProgress).toHaveBeenCalledTimes(5);
    expect(onProgress.mock.calls).toEqual([
      [50, 250],
      [100, 250],
      [150, 250],
      [200, 250],
      [250, 250],
    ]);
    const last = onProgress.mock.calls.at(-1);
    expect(last?.[0]).toBe(last?.[1]);
  });

  it("sends no progress messages when total <= 100", async () => {
    const nodes = Array.from({ length: 100 }, (_, i) => makeTextNode(`1:${i}`));
    const onProgress = vi.fn();

    const infos = await buildConnectedNodesInfo(nodes, {}, false, onProgress);

    expect(infos).toHaveLength(100);
    expect(onProgress).not.toHaveBeenCalled();
  });

  it("builds correct NodeInfo entries regardless of progress reporting", async () => {
    const nodes = [makeTextNode("1:1"), makeTextNode("1:2")];

    const infos = await buildConnectedNodesInfo(nodes, {}, false);

    expect(infos.map((i) => i.id)).toEqual(["1:1", "1:2"]);
    expect(infos.map((i) => i.characters)).toEqual(["text 1:1", "text 1:2"]);
  });

  it("skips nodes the ignore settings would exclude, same as a with-selection scan", async () => {
    const nodes = [
      makeTextNode("1:1"),
      makeTextNode("1:2", { characters: "42" }), // pure digits, ignoreNumbers default on
      makeTextNode("1:3", { visible: false }), // self-hidden, ignoreHiddenLayers default on
    ];

    const infos = await buildConnectedNodesInfo(nodes, {}, false);

    expect(infos.map((i) => i.id)).toEqual(["1:1"]);
  });

  it("does not check ancestor visibility when needsAncestorHidden is false", async () => {
    const hiddenParent = { type: "FRAME", visible: false, parent: { type: "PAGE" } };
    const nodes = [makeTextNode("1:1", { parent: hiddenParent })];

    const infos = await buildConnectedNodesInfo(nodes, { ignoreHiddenLayersIncludingChildren: true }, false);

    expect(infos.map((i) => i.id)).toEqual(["1:1"]);
  });

  it("skips nodes under a hidden ancestor when needsAncestorHidden is true", async () => {
    const hiddenParent = { type: "FRAME", visible: false, parent: { type: "PAGE" } };
    const nodes = [
      makeTextNode("1:1", { parent: hiddenParent }),
      makeTextNode("1:2"), // parent is the plain PAGE stand-in, not hidden
    ];

    const infos = await buildConnectedNodesInfo(
      nodes,
      { ignoreHiddenLayersIncludingChildren: true },
      true,
    );

    expect(infos.map((i) => i.id)).toEqual(["1:2"]);
  });
});

describe("scanSelectedTextNodes — hidden ancestors above the selected root", () => {
  /** Installs a page whose selection is `selection`. */
  function installFigma(selection: unknown[]) {
    (globalThis as unknown as { figma: unknown }).figma = {
      currentPage: { loadAsync: async () => {}, selection },
    };
  }

  it("honours a hidden parent ABOVE the node picked in the Layers panel", async () => {
    // Selecting a visible text node (or nested frame) through the Layers panel
    // while one of its parents is hidden used to start the walk with
    // `ancestorHidden = false` — the walk only ever looks downward, so nothing
    // above the selected root was ever examined. The text then showed up and
    // could be synchronised, while a page-wide scan correctly excluded it.
    const page = { type: "PAGE" };
    const hiddenFrame = { type: "FRAME", visible: false, parent: page };
    const node = makeTextNode("t1", { type: "TEXT", parent: hiddenFrame });
    installFigma([node]);

    const scanned = await scanSelectedTextNodes(true);

    expect(scanned).toHaveLength(1);
    expect(scanned[0]?.ancestorHidden).toBe(true);
  });

  it("leaves a node with only visible ancestors alone", async () => {
    const page = { type: "PAGE" };
    const frame = { type: "FRAME", visible: true, parent: page };
    const node = makeTextNode("t2", { type: "TEXT", parent: frame });
    installFigma([node]);

    const scanned = await scanSelectedTextNodes(true);

    expect(scanned[0]?.ancestorHidden).toBe(false);
  });

  it("reports no ancestor-hidden state when the filter is off", async () => {
    // The fast path deliberately skips the walk entirely — the filter isn't
    // enabled, so nothing should be marked hidden.
    const page = { type: "PAGE" };
    const hiddenFrame = { type: "FRAME", visible: false, parent: page };
    const node = makeTextNode("t3", { type: "TEXT", parent: hiddenFrame });
    installFigma([node]);

    const scanned = await scanSelectedTextNodes(false);

    expect(scanned[0]?.ancestorHidden).toBe(false);
  });
})

describe("findTaggedTextNodes", () => {
  it("keeps every text whose getPluginData answers — including data INHERITED from a main component — and never asks the engine to filter by pluginData", async () => {
    // A text inside an instance whose key was connected in the MAIN component:
    // `getPluginData` returns the inherited record, but the engine's
    // `pluginData` search criteria does not match it (nothing is stored on the
    // node itself). The customer's language copy left exactly these strings
    // untranslated while a Download with them selected worked.
    const inherited = makeTextNode("I1:2;3:4", {
      getPluginData: (k: string) =>
        k === TOLGEE_NODE_INFO ? JSON.stringify({ key: "title", connected: true }) : "",
    });
    const own = makeTextNode("5:6", {
      getPluginData: (k: string) =>
        k === TOLGEE_NODE_INFO ? JSON.stringify({ key: "body", connected: true }) : "",
    });
    const untagged = makeTextNode("7:8");
    const findAllWithCriteria = vi.fn(() => [inherited, own, untagged]);
    const page = { findAllWithCriteria } as unknown as PageNode;

    const tagged = await findTaggedTextNodes(page);

    expect(tagged.map((n) => n.id)).toEqual(["I1:2;3:4", "5:6"]);
    expect(findAllWithCriteria).toHaveBeenCalledWith({ types: ["TEXT"] });
  });

  it("yields to the event loop on a large page without dropping nodes", async () => {
    const nodes = Array.from({ length: 450 }, (_, i) =>
      makeTextNode(`1:${i}`, {
        getPluginData: (k: string) => (k === TOLGEE_NODE_INFO && i % 2 === 0 ? "{}" : ""),
      }),
    );
    const page = { findAllWithCriteria: () => nodes } as unknown as PageNode;

    const tagged = await findTaggedTextNodes(page);

    expect(tagged).toHaveLength(225);
  });
});
