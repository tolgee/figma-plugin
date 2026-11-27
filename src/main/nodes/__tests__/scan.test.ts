import { describe, expect, it, vi } from "vitest";

import { TOLGEE_NODE_INFO } from "$shared/constants";
import {
  buildConnectedNodesInfo,
  collectConnectedKeyRefs,
  findTaggedTextNodes,
  inheritanceChain,
  scanSelectedTextNodes,
} from "$main/nodes/scan";
import { createYielder } from "$main/nodes/yield";

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
    // Connected by default — `buildConnectedNodesInfo` drops unconnected
    // nodes after a single pluginData read (see `readConnectedNodeInfo`).
    getPluginData: () => JSON.stringify({ key: `k-${id}`, connected: true }),
    ...overrides,
  } as unknown as TextNode;
}

describe("buildConnectedNodesInfo", () => {
  it("drops unconnected / keyless tagged nodes after ONE pluginData read, never touching characters", async () => {
    const charactersRead = vi.fn(() => "text");
    const unconnected = makeTextNode("1:1", {
      getPluginData: () => JSON.stringify({ key: "stale", connected: false, prefilledKey: "stale" }),
    });
    const keyless = makeTextNode("1:2", {
      getPluginData: () => JSON.stringify({ key: "", connected: true }),
    });
    for (const n of [unconnected, keyless]) {
      Object.defineProperty(n, "characters", { get: charactersRead });
    }
    const connected = makeTextNode("1:3");

    const infos = await buildConnectedNodesInfo([unconnected, keyless, connected], {}, false);

    expect(infos.map((i) => i.id)).toEqual(["1:3"]);
    expect(charactersRead).not.toHaveBeenCalled();
  });

  it("still applies the ignore settings to connected nodes", async () => {
    const hidden = makeTextNode("1:1", { visible: false });
    const blank = makeTextNode("1:2", { characters: "   " });
    const kept = makeTextNode("1:3");

    const infos = await buildConnectedNodesInfo([hidden, blank, kept], {}, false);

    expect(infos.map((i) => i.id)).toEqual(["1:3"]);
  });


  /** A yielder on a fake clock that advances 1 ms per `now()` call — with the
   *  default 50 ms budget it yields exactly every 50 nodes, which keeps the
   *  progress cadence below deterministic. */
  const tickingYielder = () => {
    let t = 0;
    return createYielder(undefined, () => ++t);
  };

  it("reports progress at each (time-sliced) yield when total > 100, ending at done === total", async () => {
    const nodes = Array.from({ length: 250 }, (_, i) => makeTextNode(`1:${i}`));
    const onProgress = vi.fn();

    const infos = await buildConnectedNodesInfo(nodes, {}, false, onProgress, tickingYielder());

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

    const infos = await buildConnectedNodesInfo(nodes, {}, false, onProgress, tickingYielder());

    expect(infos).toHaveLength(100);
    expect(onProgress).not.toHaveBeenCalled();
  });

  it("always ends with done === total even when the last slice didn't yield", async () => {
    const nodes = Array.from({ length: 120 }, (_, i) => makeTextNode(`1:${i}`));
    const onProgress = vi.fn();

    await buildConnectedNodesInfo(nodes, {}, false, onProgress, tickingYielder());

    expect(onProgress.mock.calls).toEqual([
      [50, 120],
      [100, 120],
      [120, 120],
    ]);
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
  /** A page whose engine search behaves like Figma's: the pluginData criteria
   *  only matches DIRECTLY stored data, the types-only search returns every
   *  text. */
  function makePage(allTexts: TextNode[], directlyTagged: TextNode[]): {
    page: PageNode;
    findAllWithCriteria: ReturnType<typeof vi.fn>;
  } {
    const findAllWithCriteria = vi.fn((criteria: { pluginData?: unknown }) =>
      criteria.pluginData ? directlyTagged : allTexts,
    );
    return { page: { findAllWithCriteria } as unknown as PageNode, findAllWithCriteria };
  }

  it("keeps directly tagged texts AND instance sublayers with INHERITED data, probing only the latter", async () => {
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
    // A plain (non-instance) untagged text must never even be probed — probing
    // EVERY text froze the huge pages this scan runs on (28k texts ⇒ 28k
    // bridge reads per page scan / copy / staleness check).
    const untaggedProbe = vi.fn(() => "");
    const untagged = makeTextNode("7:8", { getPluginData: untaggedProbe });
    const { page, findAllWithCriteria } = makePage([inherited, own, untagged], [own]);

    const tagged = await findTaggedTextNodes(page);

    expect(tagged.map((n) => n.id)).toEqual(["I1:2;3:4", "5:6"]);
    expect(findAllWithCriteria).toHaveBeenCalledWith({
      types: ["TEXT"],
      pluginData: { keys: [TOLGEE_NODE_INFO] },
    });
    expect(findAllWithCriteria).toHaveBeenCalledWith({ types: ["TEXT"] });
    expect(untaggedProbe).not.toHaveBeenCalled();
  });

  it("resolves inheritance from an ON-PAGE main component by id, with no probe at all", async () => {
    // Instances of LOCAL components are the common case on a design page:
    // the sublayer id names the main component's node, which the direct
    // (engine) set already classifies — tagged main → tagged sublayer,
    // plain main → plain sublayer. Probing each of them was still one
    // bridge read per instance text, i.e. most of a real page.
    const taggedMain = makeTextNode("3:4", {
      getPluginData: () => JSON.stringify({ key: "title", connected: true }),
    });
    const plainMain = makeTextNode("5:6");
    const probeOfTagged = vi.fn(() => "should not be asked");
    const probeOfPlain = vi.fn(() => "");
    const subOfTagged = makeTextNode("I1:2;3:4", { getPluginData: probeOfTagged });
    const subOfPlain = makeTextNode("I1:2;5:6", { getPluginData: probeOfPlain });
    const { page } = makePage([taggedMain, plainMain, subOfTagged, subOfPlain], [taggedMain]);

    const tagged = await findTaggedTextNodes(page);

    expect(tagged.map((n) => n.id)).toEqual(["3:4", "I1:2;3:4"]);
    expect(probeOfTagged).not.toHaveBeenCalled();
    expect(probeOfPlain).not.toHaveBeenCalled();
  });

  it("nested instances: an on-page override wins; a chain that leaves the page falls back to the probe", async () => {
    // "I1:2;3:4;5:6" inherits from "I3:4;5:6" (on this page, carries its own
    // data) before "5:6" — tagged without a probe. "I7:8;9:0" points at a
    // main component on another page / in a library → only the probe knows.
    const override = makeTextNode("I3:4;5:6", {
      getPluginData: () => JSON.stringify({ key: "o", connected: true }),
    });
    const deepProbe = vi.fn(() => "");
    const deep = makeTextNode("I1:2;3:4;5:6", { getPluginData: deepProbe });
    const remoteProbe = vi.fn(() => JSON.stringify({ key: "r", connected: true }));
    const remote = makeTextNode("I7:8;9:0", { getPluginData: remoteProbe });
    const { page } = makePage([override, deep, remote], [override]);

    const tagged = await findTaggedTextNodes(page);

    expect(tagged.map((n) => n.id)).toEqual(["I3:4;5:6", "I1:2;3:4;5:6", "I7:8;9:0"]);
    expect(deepProbe).not.toHaveBeenCalled();
    expect(remoteProbe).toHaveBeenCalledTimes(1);
  });

  it("inheritanceChain walks the id nearest link first", () => {
    expect(inheritanceChain("I1:2;3:4;5:6")).toEqual(["I3:4;5:6", "5:6"]);
    expect(inheritanceChain("I1:2;3:4")).toEqual(["3:4"]);
    expect(inheritanceChain("7:8")).toEqual([]);
  });

  it("yields to the event loop while probing many instance sublayers, without dropping nodes", async () => {
    const nodes = Array.from({ length: 450 }, (_, i) =>
      makeTextNode(`I1:${i};2:${i}`, {
        getPluginData: (k: string) => (k === TOLGEE_NODE_INFO && i % 2 === 0 ? "{}" : ""),
      }),
    );
    const { page } = makePage(nodes, []);

    const tagged = await findTaggedTextNodes(page);

    expect(tagged).toHaveLength(225);
  });
});

describe("collectConnectedKeyRefs", () => {
  /** A page whose directly-tagged texts are exactly `tagged` — no instance
   *  sublayers involved, `findTaggedTextNodes` is exercised separately above. */
  function makePage(tagged: TextNode[]): PageNode {
    const findAllWithCriteria = vi.fn((criteria: { pluginData?: unknown }) =>
      criteria.pluginData ? tagged : tagged,
    );
    return { findAllWithCriteria } as unknown as PageNode;
  }

  it("returns only key/ns, reading EACH tagged node's pluginData exactly once — no characters, visible or ignore-filter cost", async () => {
    const charactersSpy = vi.fn();
    const visibleSpy = vi.fn();
    const pluginDataSpy = vi.fn(() => JSON.stringify({ key: "greet", ns: "web", connected: true }));
    const node = {
      id: "1:1",
      get characters() {
        charactersSpy();
        return "should never be read";
      },
      get visible() {
        visibleSpy();
        return true;
      },
      getPluginData: pluginDataSpy,
    } as unknown as TextNode;

    const refs = await collectConnectedKeyRefs(makePage([node]));

    expect(refs).toEqual([{ key: "greet", ns: "web" }]);
    expect(pluginDataSpy).toHaveBeenCalledTimes(1);
    expect(charactersSpy).not.toHaveBeenCalled();
    expect(visibleSpy).not.toHaveBeenCalled();
  });

  it("carries the node's sample values (for keeping them across a Recreate)", async () => {
    const node = makeTextNode("1:1", {
      getPluginData: () =>
        JSON.stringify({ key: "hello", connected: true, paramsValues: { name: "John" }, pluralParamValue: "2" }),
    });
    const page = {
      findAllWithCriteria: () => [node],
    } as unknown as PageNode;
    const refs = await collectConnectedKeyRefs(page);
    expect(refs).toEqual([
      { key: "hello", ns: undefined, paramsValues: { name: "John" }, pluralParamValue: "2" },
    ]);
  });

  it("skips a tagged node that isn't actually connected, or has no key", async () => {
    const unconnected = makeTextNode("1:1", {
      getPluginData: () => JSON.stringify({ key: "a", connected: false }),
    });
    const noKey = makeTextNode("1:2", {
      getPluginData: () => JSON.stringify({ key: "", connected: true }),
    });
    const good = makeTextNode("1:3", {
      getPluginData: () => JSON.stringify({ key: "b", connected: true }),
    });

    const refs = await collectConnectedKeyRefs(makePage([unconnected, noKey, good]));

    expect(refs).toEqual([{ key: "b", ns: undefined }]);
  });

  it("ignores a node whose pluginData is unparseable, without throwing", async () => {
    const bad = makeTextNode("1:1", { getPluginData: () => "{not json" });
    const good = makeTextNode("1:2", {
      getPluginData: () => JSON.stringify({ key: "b", connected: true }),
    });

    const refs = await collectConnectedKeyRefs(makePage([bad, good]));

    expect(refs).toEqual([{ key: "b", ns: undefined }]);
  });

  it("yields to the event loop on a large page without dropping or duplicating refs", async () => {
    const nodes = Array.from({ length: 1200 }, (_, i) =>
      makeTextNode(`1:${i}`, {
        getPluginData: () => JSON.stringify({ key: `k${i}`, connected: true }),
      }),
    );

    const refs = await collectConnectedKeyRefs(makePage(nodes));

    expect(refs).toHaveLength(1200);
    expect(new Set(refs.map((r) => r.key)).size).toBe(1200);
  });
});
