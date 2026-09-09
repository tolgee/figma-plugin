import { afterEach, describe, expect, it, vi } from "vitest";
import { TOLGEE_NODE_INFO, TOLGEE_PLUGIN_CONFIG_NAME } from "$shared/constants";
import { checkCopyStaleness, createCopy, removeExistingCopyPages } from "../createCopy";

type FakeTextNode = {
  type: "TEXT";
  id: string;
  name: string;
  characters: string;
  visible: boolean;
  getPluginData: (key: string) => string;
};

let nextNodeId = 0;

function textNode(info: { key?: string; ns?: string; connected?: boolean } = {}): FakeTextNode {
  nextNodeId++;
  const data = JSON.stringify({
    key: info.key ?? "",
    ns: info.ns,
    connected: info.connected ?? true,
  });
  return {
    type: "TEXT",
    id: `node-${nextNodeId}`,
    name: "Layer",
    characters: "",
    visible: true,
    getPluginData: (k: string) => (k === TOLGEE_NODE_INFO ? data : ""),
  };
}

type FakePage = {
  type: "PAGE";
  id: string;
  name: string;
  loadAsync: () => Promise<void>;
  getPluginData: (key: string) => string;
  setPluginData: (key: string, value: string) => void;
  remove: () => void;
  findAllWithCriteria: () => FakeTextNode[];
};

function page(
  name: string,
  pageData?: Record<string, unknown>,
  opts: { id?: string; textNodes?: FakeTextNode[] } = {},
): FakePage {
  let raw = pageData ? JSON.stringify(pageData) : "";
  const textNodes = opts.textNodes ?? [];
  return {
    type: "PAGE",
    id: opts.id ?? name,
    name,
    loadAsync: vi.fn(async () => {}),
    getPluginData: (key: string) => (key === TOLGEE_PLUGIN_CONFIG_NAME ? raw : ""),
    setPluginData: (key: string, value: string) => {
      if (key === TOLGEE_PLUGIN_CONFIG_NAME) raw = value;
    },
    remove: vi.fn(),
    findAllWithCriteria: () => textNodes,
  };
}

function setPages(pages: FakePage[], currentPage?: FakePage) {
  const figma = {
    root: { children: pages },
    currentPage: currentPage ?? pages[0],
    getNodeByIdAsync: async (id: string) => pages.find((p) => p.id === id) ?? null,
    // The sync `figma.currentPage` SETTER throws under dynamic-page access —
    // production code must only ever switch via this async API.
    setCurrentPageAsync: async (page: FakePage) => {
      figma.currentPage = page;
    },
    mixed: Symbol("mixed"),
  };
  (globalThis as unknown as { figma: unknown }).figma = figma;
}

afterEach(() => {
  (globalThis as unknown as { figma?: unknown }).figma = undefined;
});

describe("removeExistingCopyPages", () => {
  it("removes a previous copy with the same name", async () => {
    const oldCopy = page("Home — en", { pageCopy: true });
    setPages([page("Home"), oldCopy]);

    await removeExistingCopyPages({ name: "Home — en", sourcePageId: "src" });

    expect(oldCopy.remove).toHaveBeenCalledTimes(1);
  });

  it("does NOT remove a user's own same-named page (not marked pageCopy)", async () => {
    const userPage = page("Home — en"); // no pageCopy marker
    setPages([userPage]);

    await removeExistingCopyPages({ name: "Home — en", sourcePageId: "src" });

    expect(userPage.remove).not.toHaveBeenCalled();
  });

  it("does NOT remove a copy with a different name", async () => {
    const otherCopy = page("Home — de", { pageCopy: true });
    setPages([otherCopy]);

    await removeExistingCopyPages({ name: "Home — en", sourcePageId: "src" });

    expect(otherCopy.remove).not.toHaveBeenCalled();
  });

  describe("when the page being removed is the currently active one", () => {
    it("steps onto the preferred fallback first, then removes it (and reports it)", async () => {
      const source = page("Home", undefined, { id: "src" });
      const activeCopy = page("Home — en", { pageCopy: true }, { id: "copy" });
      setPages([source, activeCopy], activeCopy);

      const result = await removeExistingCopyPages(
        { name: "Home — en", sourcePageId: "src" },
        source as never,
      );

      expect(result.switchedAwayFromCurrent).toBe(true);
      expect(
        (globalThis as unknown as { figma: { currentPage: FakePage } }).figma.currentPage,
      ).toBe(source);
      expect(activeCopy.remove).toHaveBeenCalledTimes(1);
    });

    it("doesn't touch the current page when the copy being removed isn't it", async () => {
      const source = page("Home", undefined, { id: "src" });
      const oldCopy = page("Home — en", { pageCopy: true }, { id: "copy" });
      setPages([source, oldCopy], source);

      const result = await removeExistingCopyPages(
        { name: "Home — en", sourcePageId: "src" },
        source as never,
      );

      expect(result.switchedAwayFromCurrent).toBe(false);
      expect(
        (globalThis as unknown as { figma: { currentPage: FakePage } }).figma.currentPage,
      ).toBe(source);
      expect(oldCopy.remove).toHaveBeenCalledTimes(1);
    });
  });
});

describe("checkCopyStaleness", () => {
  it("reports 0 missing when the copy already has every key the source has", async () => {
    const source = page("Home", undefined, {
      id: "src",
      textNodes: [textNode({ key: "a" }), textNode({ key: "b" })],
    });
    const copyPage = page(
      "Home — en",
      { pageCopy: true, sourcePageId: "src", language: "en" },
      { id: "copy", textNodes: [textNode({ key: "a" }), textNode({ key: "b" })] },
    );
    setPages([source, copyPage], copyPage);

    await expect(checkCopyStaleness(copyPage as never)).resolves.toEqual({
      ok: true,
      missingCount: 0,
      removedCount: 0,
    });
  });

  it("counts source keys the copy doesn't have yet", async () => {
    const source = page("Home", undefined, {
      id: "src",
      textNodes: [textNode({ key: "a" }), textNode({ key: "b" }), textNode({ key: "c" })],
    });
    const copyPage = page(
      "Home — en",
      { pageCopy: true, sourcePageId: "src", language: "en" },
      { id: "copy", textNodes: [textNode({ key: "a" })] },
    );
    setPages([source, copyPage], copyPage);

    await expect(checkCopyStaleness(copyPage as never)).resolves.toEqual({
      ok: true,
      missingCount: 2,
      removedCount: 0,
    });
  });

  it("ignores nodes that aren't actually connected on either side", async () => {
    const source = page("Home", undefined, {
      id: "src",
      textNodes: [textNode({ key: "a" }), textNode({ key: "unconnected", connected: false })],
    });
    const copyPage = page(
      "Home — en",
      { pageCopy: true, sourcePageId: "src", language: "en" },
      { id: "copy", textNodes: [textNode({ key: "a" })] },
    );
    setPages([source, copyPage], copyPage);

    await expect(checkCopyStaleness(copyPage as never)).resolves.toEqual({
      ok: true,
      missingCount: 0,
      removedCount: 0,
    });
  });

  it("counts an ADDITIONAL node connected to an already-connected key (set-diff regression)", async () => {
    // Real-world repro: the source already had key "a" connected on one node
    // when the copy was made; the user then connected a SECOND node to that
    // same key. A set-based diff sees no new key and stays silent — but the
    // copy's clone of that second node predates the connection, so Download
    // will never touch it. Counts must flag it.
    const source = page("Home", undefined, {
      id: "src",
      textNodes: [textNode({ key: "a" }), textNode({ key: "a" })],
    });
    const copyPage = page(
      "Home — en",
      { pageCopy: true, sourcePageId: "src", language: "en" },
      { id: "copy", textNodes: [textNode({ key: "a" })] },
    );
    setPages([source, copyPage], copyPage);

    await expect(checkCopyStaleness(copyPage as never)).resolves.toEqual({
      ok: true,
      missingCount: 1,
      removedCount: 0,
    });
  });

  it("reports strings the source LOST as removedCount, never as negative missing", async () => {
    // The copy has a surplus on key "a" (the source lost a node since the
    // copy was made). That surplus must surface as `removedCount` — and per-
    // key maxes keep it from cancelling genuine missing counts elsewhere.
    const source = page("Home", undefined, {
      id: "src",
      textNodes: [textNode({ key: "a" }), textNode({ key: "b" })],
    });
    const copyPage = page(
      "Home — en",
      { pageCopy: true, sourcePageId: "src", language: "en" },
      {
        id: "copy",
        textNodes: [textNode({ key: "a" }), textNode({ key: "a" }), textNode({ key: "b" })],
      },
    );
    setPages([source, copyPage], copyPage);

    await expect(checkCopyStaleness(copyPage as never)).resolves.toEqual({
      ok: true,
      missingCount: 0,
      removedCount: 1,
    });
  });

  it("counts both directions independently in one check", async () => {
    // Source gained key "c" AND lost one "a" node; neither direction may
    // cancel the other.
    const source = page("Home", undefined, {
      id: "src",
      textNodes: [textNode({ key: "a" }), textNode({ key: "c" })],
    });
    const copyPage = page(
      "Home — en",
      { pageCopy: true, sourcePageId: "src", language: "en" },
      { id: "copy", textNodes: [textNode({ key: "a" }), textNode({ key: "a" })] },
    );
    setPages([source, copyPage], copyPage);

    await expect(checkCopyStaleness(copyPage as never)).resolves.toEqual({
      ok: true,
      missingCount: 1,
      removedCount: 1,
    });
  });

  it("fails gracefully when the copy has no sourcePageId recorded (older copy / production)", async () => {
    const copyPage = page("Home — en", { pageCopy: true }, { id: "copy" });
    setPages([copyPage], copyPage);

    const result = await checkCopyStaleness(copyPage as never);
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("fails gracefully when the recorded source page no longer exists", async () => {
    const copyPage = page(
      "Home — en",
      { pageCopy: true, sourcePageId: "gone" },
      { id: "copy" },
    );
    setPages([copyPage], copyPage);

    const result = await checkCopyStaleness(copyPage as never);
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe("createCopy — ignore settings", () => {
  /** Minimal TEXT-node stand-in that also supports the plain-text write path
   *  (`writeTextSafely` → `applyRichText` with `plainOnly: true`), unlike the
   *  read-only `textNode()` helper above. */
  function writableTextNode(props: {
    id: string;
    characters: string;
    key?: string;
    ns?: string;
    connected?: boolean;
    visible?: boolean;
    name?: string;
  }) {
    const pluginData = new Map<string, string>();
    pluginData.set(
      TOLGEE_NODE_INFO,
      JSON.stringify({ key: props.key ?? "", ns: props.ns, connected: props.connected ?? true }),
    );
    return {
      type: "TEXT" as const,
      id: props.id,
      name: props.name ?? "Layer",
      characters: props.characters,
      visible: props.visible ?? true,
      autoRename: true,
      fontName: { family: "Inter", style: "Regular" },
      getRangeAllFontNames: () => [{ family: "Inter", style: "Regular" }],
      getPluginData: (k: string) => pluginData.get(k) ?? "",
      setPluginData: (k: string, v: string) => pluginData.set(k, v),
    };
  }
  type WritableTextNode = ReturnType<typeof writableTextNode>;

  /** A source page whose `.clone()` returns a second page backed by the SAME
   *  node list — good enough to exercise the per-node filter without
   *  modelling Figma's actual clone semantics. */
  function cloneableSourcePage(name: string, textNodes: WritableTextNode[]) {
    const clone = {
      type: "PAGE" as const,
      id: `${name}-clone`,
      name,
      loadAsync: vi.fn(async () => {}),
      getPluginData: () => "",
      setPluginData: vi.fn(),
      findAllWithCriteria: () => textNodes,
    };
    return {
      type: "PAGE" as const,
      id: name,
      name,
      loadAsync: vi.fn(async () => {}),
      getPluginData: () => "",
      setPluginData: vi.fn(),
      findAllWithCriteria: () => textNodes,
      clone: () => clone,
    };
  }

  function installFigmaForCreateCopy(sourcePage: ReturnType<typeof cloneableSourcePage>) {
    (globalThis as unknown as { figma: unknown }).figma = {
      currentPage: sourcePage,
      root: { children: [sourcePage], appendChild: vi.fn() },
      getNodeByIdAsync: async (id: string) => (id === sourcePage.id ? sourcePage : null),
      setCurrentPageAsync: async () => {},
      loadFontAsync: async () => {},
      mixed: Symbol("mixed"),
    };
  }

  it("does not overwrite hidden / numeric nodes in keys mode (default settings)", async () => {
    const visible = writableTextNode({ id: "n1", characters: "Hello", key: "greeting" });
    const hidden = writableTextNode({
      id: "n2",
      characters: "Hidden",
      key: "hiddenKey",
      visible: false,
    });
    const numeric = writableTextNode({ id: "n3", characters: "42", key: "numKey" });
    const src = cloneableSourcePage("Home", [visible, hidden, numeric]);
    installFigmaForCreateCopy(src);

    const result = await createCopy({ mode: "keys", correlationId: "c1" }, {});

    expect(result.ok).toBe(true);
    expect(visible.characters).toBe("greeting");
    expect(hidden.characters).toBe("Hidden");
    expect(numeric.characters).toBe("42");
  });

  it("writes hidden nodes too once ignoreHiddenLayers is turned off", async () => {
    const hidden = writableTextNode({
      id: "n1",
      characters: "Hidden",
      key: "hiddenKey",
      visible: false,
    });
    const src = cloneableSourcePage("Home", [hidden]);
    installFigmaForCreateCopy(src);

    await createCopy({ mode: "keys", correlationId: "c2" }, { ignoreHiddenLayers: false });

    expect(hidden.characters).toBe("hiddenKey");
  });

  it("excludes ignored nodes from the collected node list in languages mode", async () => {
    const visible = writableTextNode({ id: "n1", characters: "Hello", key: "greeting" });
    const numeric = writableTextNode({ id: "n2", characters: "42", key: "numKey" });
    const src = cloneableSourcePage("Home", [visible, numeric]);
    installFigmaForCreateCopy(src);

    const result = await createCopy(
      { mode: "languages", correlationId: "c3", languages: ["cs"] },
      {},
    );

    expect(result.ok).toBe(true);
    expect(result.pages?.[0]?.nodes.map((n) => n.id)).toEqual(["n1"]);
  });

  it("keys mode: writes the key onto a MIXED-font node (advanced string with bold/italic ranges)", async () => {
    // Regression: an advanced string rendered with <b>/<i> ranges has
    // `fontName === figma.mixed`, and writeTextSafely used to bail on that —
    // leaving the keys copy showing the original text instead of the key for
    // exactly those nodes. applyRichText pre-loads every range font, so the
    // write is safe; the original plugin wrote keys onto mixed nodes too.
    const rich = writableTextNode({ id: "n1", characters: "bold italic text", key: "rich.key" });
    const src = cloneableSourcePage("Home", [rich]);
    installFigmaForCreateCopy(src);
    // Same sentinel the fake figma env exposes — assigned after install.
    rich.fontName = (globalThis as unknown as { figma: { mixed: unknown } }).figma
      .mixed as never;
    rich.getRangeAllFontNames = () => [
      { family: "Inter", style: "Regular" },
      { family: "Inter", style: "Bold Italic" },
    ];

    const result = await createCopy({ mode: "keys", correlationId: "c6" }, {});

    expect(result.ok).toBe(true);
    expect(rich.characters).toBe("rich.key");
  });

  it("keys mode: prefixes the label with the namespace when namespacesEnabled is true", async () => {
    const namespaced = writableTextNode({
      id: "n1",
      characters: "Hello",
      key: "greeting",
      ns: "marketing",
    });
    const src = cloneableSourcePage("Home", [namespaced]);
    installFigmaForCreateCopy(src);

    await createCopy({ mode: "keys", correlationId: "c4", namespacesEnabled: true }, {});

    expect(namespaced.characters).toBe("marketing.greeting");
  });

  it("keys mode: writes the plain key when namespacesEnabled is false, even if the node has an ns", async () => {
    // A node can carry a real `ns` (e.g. legacy data, or namespaces toggled
    // off after some keys were connected) even while the project-wide
    // feature is disabled — the label must match what Pull/CopyView/
    // StringDetails show for that same node (namespacedKeyLabel's gate).
    const namespaced = writableTextNode({
      id: "n1",
      characters: "Hello",
      key: "greeting",
      ns: "marketing",
    });
    const src = cloneableSourcePage("Home", [namespaced]);
    installFigmaForCreateCopy(src);

    await createCopy({ mode: "keys", correlationId: "c5", namespacesEnabled: false }, {});

    expect(namespaced.characters).toBe("greeting");
  });
});

// NOTE: the per-node render logic (formerly `resolveCopyNodeText` here) moved
// to the UI — `$ui/lib/logic/copyApply`'s `buildCopyUpdates` — because ICU
// rendering needs `Intl`, which Figma's main-thread sandbox doesn't provide.
// Its regression tests live in `src/ui/lib/logic/__tests__/copyApply.test.ts`.

describe("removeExistingCopyPages — identity fallback", () => {
  it("replaces a copy of the same (source, language) whose NAME no longer matches", () => {
    // The reported case: this PR aligned copy naming with production, so a
    // copy made by an earlier v2 build carries the old name. Matching on the
    // name alone left it unfound, and Recreate appended a duplicate beside it.
    const renamed = page(
      "Home – en", // en dash: an earlier build's separator
      { pageCopy: true, sourcePageId: "src", copyLanguage: "en" },
      { id: "old" },
    );
    setPages([page("Home", undefined, { id: "src" }), renamed]);

    return removeExistingCopyPages({
      name: "Home - en",
      sourcePageId: "src",
      language: "en",
    }).then(() => {
      expect(renamed.remove).toHaveBeenCalledTimes(1);
    });
  });

  it("does NOT confuse a keys copy with a language copy of the same source", async () => {
    // Identity is (source page, language) — a keys copy carries no language,
    // so recreating it must leave the language copies alone.
    const keysCopy = page(
      "Home - keys",
      { pageCopy: true, sourcePageId: "src" },
      { id: "keys" },
    );
    const enCopy = page(
      "Home - en",
      { pageCopy: true, sourcePageId: "src", copyLanguage: "en" },
      { id: "en" },
    );
    setPages([page("Home", undefined, { id: "src" }), keysCopy, enCopy]);

    await removeExistingCopyPages({ name: "Home - keys", sourcePageId: "src" });

    expect(keysCopy.remove).toHaveBeenCalledTimes(1);
    expect(enCopy.remove).not.toHaveBeenCalled();
  });

  it("does NOT remove a copy belonging to a DIFFERENT source page", async () => {
    const otherSourceCopy = page(
      "Other - en",
      { pageCopy: true, sourcePageId: "other", copyLanguage: "en" },
      { id: "other-copy" },
    );
    setPages([page("Home", undefined, { id: "src" }), otherSourceCopy]);

    await removeExistingCopyPages({
      name: "Home - en",
      sourcePageId: "src",
      language: "en",
    });

    expect(otherSourceCopy.remove).not.toHaveBeenCalled();
  });

  it("leaves a pre-tracking copy (no sourcePageId) alone unless its name matches", async () => {
    // Copies made by the published plugin have no `sourcePageId`; the name is
    // their only handle, and guessing beyond it could delete a page the user
    // still wants.
    const legacy = page("Something else", { pageCopy: true }, { id: "legacy" });
    setPages([page("Home", undefined, { id: "src" }), legacy]);

    await removeExistingCopyPages({
      name: "Home - en",
      sourcePageId: "src",
      language: "en",
    });

    expect(legacy.remove).not.toHaveBeenCalled();
  });

  it("stops after the name match, so the usual path never loads other pages", async () => {
    // Performance guard: reading a copy marker requires loading the page, and
    // a document can have many. The identity pass exists for the migration
    // case only and must not make every ordinary recreate load the document.
    const namedCopy = page("Home - en", { pageCopy: true, sourcePageId: "src" }, { id: "c" });
    const unrelated = page("Sketches", undefined, { id: "u" });
    setPages([page("Home", undefined, { id: "src" }), namedCopy, unrelated]);

    await removeExistingCopyPages({ name: "Home - en", sourcePageId: "src" });

    expect(namedCopy.remove).toHaveBeenCalledTimes(1);
    expect(unrelated.loadAsync).not.toHaveBeenCalled();
  });
});

describe("createCopy — rollback of a failed run", () => {
  /** A clone that records whether the failed run cleaned it up. */
  function failingSetup(opts: { cloneIsCurrent?: boolean } = {}) {
    const exploding = {
      type: "TEXT" as const,
      id: "boom",
      name: "Layer",
      visible: true,
      get characters(): string {
        throw new Error("node write blew up");
      },
      getPluginData: () => JSON.stringify({ key: "k", connected: true }),
      setPluginData: () => {},
    };
    const clone = {
      type: "PAGE" as const,
      id: "clone-id",
      name: "Home - keys",
      loadAsync: vi.fn(async () => {}),
      getPluginData: () => "",
      setPluginData: vi.fn(),
      findAllWithCriteria: () => [exploding],
      remove: vi.fn(),
    };
    const source = {
      type: "PAGE" as const,
      id: "src",
      name: "Home",
      loadAsync: vi.fn(async () => {}),
      getPluginData: () => "",
      setPluginData: vi.fn(),
      findAllWithCriteria: () => [],
      clone: () => clone,
    };
    const figma = {
      currentPage: opts.cloneIsCurrent ? clone : source,
      root: { children: [source], appendChild: vi.fn() },
      getNodeByIdAsync: async (id: string) =>
        id === clone.id ? clone : id === source.id ? source : null,
      setCurrentPageAsync: vi.fn(async (p: unknown) => {
        figma.currentPage = p as typeof source;
      }),
      loadFontAsync: async () => {},
      mixed: Symbol("mixed"),
    };
    (globalThis as unknown as { figma: unknown }).figma = figma;
    return { clone, source, figma };
  }

  it("removes the half-written clone instead of leaving an orphan", async () => {
    // The clone is stamped by `markPageAsCopy` only AFTER the write loop, so a
    // page created before a throw carries no marker — invisible to
    // `removeExistingCopyPages` forever, and every retry would add another.
    const { clone } = failingSetup();

    const result = await createCopy({ mode: "keys", correlationId: "c-fail" }, {});

    expect(result.ok).toBe(false);
    expect(clone.remove).toHaveBeenCalledTimes(1);
  });

  it("reports no created pages once they have been rolled back", async () => {
    // The caller shouldn't be handed ids that no longer exist.
    failingSetup();

    const result = await createCopy({ mode: "keys", correlationId: "c-fail2" }, {});

    expect(result.createdPageIds).toEqual([]);
    expect(result.error).toContain("node write blew up");
  });

  it("steps off an earlier clone before removing it when the run landed on it", async () => {
    // Reachable in languages mode: recreating from inside a copy makes the run
    // step onto each finished clone (`switchedAwayFromCurrent`), so when a
    // LATER language throws, the rollback is deleting the page the user is
    // standing on. Figma forbids removing the active page, so without the
    // step-off the rollback itself would throw and leave both orphans behind.
    const exploding = {
      type: "TEXT" as const,
      id: "boom",
      name: "Layer",
      visible: true,
      get characters(): string {
        throw new Error("scan blew up");
      },
      getPluginData: () => JSON.stringify({ key: "k", connected: true }),
      setPluginData: () => {},
    };
    const makeClone = (id: string, nodes: unknown[]) => ({
      type: "PAGE" as const,
      id,
      name: id,
      loadAsync: vi.fn(async () => {}),
      getPluginData: () => "",
      setPluginData: vi.fn(),
      findAllWithCriteria: () => nodes,
      remove: vi.fn(),
    });
    const enClone = makeClone("clone-en", []); // succeeds
    const deClone = makeClone("clone-de", [exploding]); // throws
    const clones = [enClone, deClone];
    let cloneIndex = 0;

    const source = {
      type: "PAGE" as const,
      id: "src",
      name: "Home",
      loadAsync: vi.fn(async () => {}),
      getPluginData: () => "",
      setPluginData: vi.fn(),
      findAllWithCriteria: () => [],
      clone: () => clones[cloneIndex++],
    };
    // The copy the user is standing on when they hit Recreate.
    const activeOldCopy = page(
      "Home - en",
      { pageCopy: true, sourcePageId: "src", copyLanguage: "en" },
      { id: "old-en" },
    );
    const figma = {
      currentPage: activeOldCopy as unknown,
      root: { children: [source, activeOldCopy], appendChild: vi.fn() },
      getNodeByIdAsync: async (id: string) =>
        [source, enClone, deClone, activeOldCopy].find((p) => p.id === id) ?? null,
      setCurrentPageAsync: vi.fn(async (p: unknown) => {
        figma.currentPage = p;
      }),
      loadFontAsync: async () => {},
      mixed: Symbol("mixed"),
    };
    (globalThis as unknown as { figma: unknown }).figma = figma;

    const result = await createCopy(
      { mode: "languages", languages: ["en", "de"], correlationId: "c-fail3", sourcePageId: "src" },
      {},
    );

    expect(result.ok).toBe(false);
    // The run had stepped onto the finished `en` clone; rollback must move off
    // it before removing, and remove BOTH clones it created.
    expect(figma.setCurrentPageAsync).toHaveBeenCalledWith(source);
    expect(enClone.remove).toHaveBeenCalledTimes(1);
    expect(deClone.remove).toHaveBeenCalledTimes(1);
    expect(result.createdPageIds).toEqual([]);
  });
})

describe("createCopy — layers a missing font blocked", () => {
  it("reports skipped layers instead of leaving the copy silently incomplete", async () => {
    // A node with a missing font can't be written, so a keys copy keeps its
    // ORIGINAL translated text on that layer instead of the key label. Nothing
    // surfaced that, so the copy looked complete and the layer looked like a
    // bug in the plugin.
    const writable = {
      type: "TEXT" as const,
      id: "ok",
      name: "Good layer",
      characters: "Hello",
      visible: true,
      autoRename: true,
      hasMissingFont: false,
      fontName: { family: "Inter", style: "Regular" },
      getRangeAllFontNames: () => [{ family: "Inter", style: "Regular" }],
      getPluginData: (k: string) =>
        k === TOLGEE_NODE_INFO ? JSON.stringify({ key: "greeting", connected: true }) : "",
      setPluginData: () => {},
    };
    const blocked = { ...writable, id: "bad", name: "Broken layer", hasMissingFont: true };

    const clone = {
      type: "PAGE" as const,
      id: "clone",
      name: "Home - keys",
      loadAsync: vi.fn(async () => {}),
      getPluginData: () => "",
      setPluginData: vi.fn(),
      findAllWithCriteria: () => [writable, blocked],
    };
    const source = {
      type: "PAGE" as const,
      id: "src",
      name: "Home",
      loadAsync: vi.fn(async () => {}),
      getPluginData: () => "",
      setPluginData: vi.fn(),
      findAllWithCriteria: () => [],
      clone: () => clone,
    };
    (globalThis as unknown as { figma: unknown }).figma = {
      currentPage: source,
      root: { children: [source], appendChild: vi.fn() },
      getNodeByIdAsync: async (id: string) => (id === "src" ? source : null),
      setCurrentPageAsync: async () => {},
      loadFontAsync: async () => {},
      mixed: Symbol("mixed"),
    };

    const result = await createCopy({ mode: "keys", correlationId: "c-font" }, {});

    expect(result.ok).toBe(true);
    expect(result.skippedMissingFont).toEqual(["Broken layer"]);
    // The writable one still got its key label — one bad layer must not stop
    // the rest.
    expect(writable.characters).toBe("greeting");
  });
})

describe("copy staleness counts key a `|` cannot collide in", () => {
  it("sees two distinct keys where a `|` join would merge them", async () => {
    // The main thread had its own `${ns}|${key}` join, missed by the first
    // sweep because the shared helper lived UI-side, where main can't import
    // from. Staleness compares per-key COUNTS, so a collision doesn't just
    // mislabel a key — it cancels a real difference out.
    //
    // Source holds (ns "a|b", key "c"); the copy holds (ns "a", key "b|c").
    // Different keys, but `a|b` + `|` + `c` and `a` + `|` + `b|c` are the same
    // string — so both sides counted 1 for one merged key and the copy read as
    // up to date, hiding both a gained and a lost string.
    const source = page("Home", undefined, {
      id: "src",
      textNodes: [textNode({ key: "c", ns: "a|b" })],
    });
    const copy = page(
      "Home - keys",
      { pageCopy: true, sourcePageId: "src" },
      { id: "copy", textNodes: [textNode({ key: "b|c", ns: "a" })] },
    );
    setPages([source, copy], copy);

    const result = await checkCopyStaleness(copy as never);

    expect(result.ok).toBe(true);
    expect(result.missingCount).toBe(1); // the source's key the copy lacks
    expect(result.removedCount).toBe(1); // the copy's key the source lacks
  });

  it("still reports a genuinely up-to-date copy as up to date", async () => {
    const source = page("Home", undefined, {
      id: "src2",
      textNodes: [textNode({ key: "greeting", ns: "web" })],
    });
    const copy = page(
      "Home - keys",
      { pageCopy: true, sourcePageId: "src2" },
      { id: "copy2", textNodes: [textNode({ key: "greeting", ns: "web" })] },
    );
    setPages([source, copy], copy);

    const result = await checkCopyStaleness(copy as never);

    expect(result.missingCount).toBe(0);
    expect(result.removedCount).toBe(0);
  });
});
