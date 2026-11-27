import { afterEach, describe, expect, it, vi } from "vitest";

import { TOLGEE_COPY_SOURCE, TOLGEE_NODE_INFO } from "$shared/constants";
import { diffCopyFrames, mapCopyChildren, updateCopyFrames } from "../copyFrames";

/** A connected text node stand-in (direct pluginData, no inheritance). */
function text(id: string, key: string) {
  return {
    type: "TEXT" as const,
    id,
    name: `Text ${id}`,
    characters: key,
    visible: true,
    autoRename: true,
    fontName: { family: "Inter", style: "Regular" },
    getRangeAllFontNames: () => [{ family: "Inter", style: "Regular" }],
    getPluginData: (k: string) =>
      k === TOLGEE_NODE_INFO ? JSON.stringify({ key, connected: true }) : "",
    setPluginData: vi.fn(),
  };
}

/** A top-level frame stand-in: searchable, cloneable, carries pluginData. */
function frame(id: string, texts: ReturnType<typeof text>[], sourceId?: string) {
  const data = new Map<string, string>();
  if (sourceId) data.set(TOLGEE_COPY_SOURCE, sourceId);
  const f = {
    type: "FRAME" as const,
    id,
    name: `Frame ${id}`,
    findAllWithCriteria: (c: { pluginData?: unknown }) =>
      c.pluginData ? texts.filter((t) => t.getPluginData(TOLGEE_NODE_INFO)) : texts,
    getPluginData: (k: string) => data.get(k) ?? "",
    setPluginData: (k: string, v: string) => data.set(k, v),
    parent: null as { children: unknown[] } | null,
    // Like Figma: removing a layer takes it out of its parent's children.
    remove: vi.fn(() => {
      const kids = f.parent?.children;
      if (kids) kids.splice(kids.indexOf(f), 1);
    }),
    clone: (): unknown => frame(`${id}-clone`, texts.map((t) => text(`${t.id}-clone`, t.characters))),
  };
  return f;
}
type Frame = ReturnType<typeof frame>;

function page(id: string, children: Frame[]) {
  const p = {
    type: "PAGE" as const,
    id,
    name: id,
    children,
    loadAsync: vi.fn(async () => {}),
    getPluginData: () => "",
    setPluginData: vi.fn(),
    appendChild: (c: Frame) => {
      c.parent = p;
      p.children.push(c);
    },
    insertChild: (at: number, c: Frame) => {
      c.parent = p;
      p.children.splice(at, 0, c);
    },
    findAllWithCriteria: (c: { pluginData?: unknown }) =>
      children.flatMap((f) => f.findAllWithCriteria(c)),
  };
  for (const c of children) c.parent = p;
  return p;
}

afterEach(() => {
  (globalThis as unknown as { figma?: unknown }).figma = undefined;
});

describe("mapCopyChildren", () => {
  it("writes each source layer's id onto the clone's layer at the same index", () => {
    const src = page("src", [frame("a", []), frame("b", [])]);
    const copy = page("copy", [frame("a2", []), frame("b2", [])]);
    mapCopyChildren(src as never, copy as never);
    expect(copy.children[0]?.getPluginData(TOLGEE_COPY_SOURCE)).toBe("a");
    expect(copy.children[1]?.getPluginData(TOLGEE_COPY_SOURCE)).toBe("b");
  });
});

describe("diffCopyFrames", () => {
  it("pairs frames by the recorded source id and classifies added / removed / changed / kept", async () => {
    const src = page("src", [
      frame("a", [text("t1", "k1")]), // unchanged
      frame("b", [text("t2", "k2"), text("t3", "k3")]), // gained a key
      frame("d", [text("t5", "k5")]), // new on the source
    ]);
    const copy = page("copy", [
      frame("a2", [text("t1c", "k1")], "a"),
      frame("b2", [text("t2c", "k2")], "b"),
      frame("c2", [text("t4c", "k4")], "c"), // source frame c was deleted
      frame("manual", [], undefined), // user's own frame in the copy — left alone
    ]);

    const diff = await diffCopyFrames(src as never, copy as never);

    expect(diff.mappable).toBe(true);
    expect(diff.kept).toBe(1);
    expect(diff.added.map((n) => n.id)).toEqual(["d"]);
    expect(diff.changed.map((p) => p.source.id)).toEqual(["b"]);
    expect(diff.removed.map((n) => n.id)).toEqual(["c2"]);
  });

  it("is not mappable for a copy made without the mapping (original plugin)", async () => {
    const src = page("src", [frame("a", [])]);
    const copy = page("copy", [frame("a2", [])]);
    const diff = await diffCopyFrames(src as never, copy as never);
    expect(diff.mappable).toBe(false);
    expect(diff.added).toEqual([]);
  });
});

describe("updateCopyFrames", () => {
  it("clones only new and changed frames, removes deleted ones, keeps the rest, and returns the fresh connected nodes", async () => {
    const src = page("src", [
      frame("a", [text("t1", "k1")]),
      frame("b", [text("t2", "k2"), text("t3", "k3")]),
      frame("d", [text("t5", "k5")]),
    ]);
    const kept = frame("a2", [text("t1c", "k1")], "a");
    const stale = frame("b2", [text("t2c", "k2")], "b");
    const gone = frame("c2", [text("t4c", "k4")], "c");
    const copy = page("copy", [kept, stale, gone]);
    (globalThis as unknown as { figma: unknown }).figma = {
      currentPage: copy,
      getNodeByIdAsync: async (id: string) => (id === "src" ? src : null),
      ui: { postMessage: vi.fn() },
    };

    const result = await updateCopyFrames({ correlationId: "u1", sourcePageId: "src", language: "de" });

    expect(result.ok).toBe(true);
    expect(gone.remove).toHaveBeenCalled();
    expect(stale.remove).toHaveBeenCalled();
    expect(kept.remove).not.toHaveBeenCalled();
    const ids = copy.children.map((c) => c.id);
    expect(ids).toEqual(["a2", "b-clone", "d-clone"]);
    expect(copy.children[1]?.getPluginData(TOLGEE_COPY_SOURCE)).toBe("b");
    expect(copy.children[2]?.getPluginData(TOLGEE_COPY_SOURCE)).toBe("d");
    // Only the fresh clones' connected texts come back for translation.
    expect(result.pages?.[0]?.language).toBe("de");
    expect(result.pages?.[0]?.nodes.map((n) => n.key).sort()).toEqual(["k2", "k3", "k5"]);
  });

  it("a replaced frame keeps the sample values the copy had for its keys", async () => {
    const srcText = text("t1", "hello");
    const src = page("src", [frame("a", [srcText, text("t2", "extra")])]);
    // The copy's text for "hello" carries the user's per-language value.
    const copyText = {
      ...text("t1c", "hello"),
      getPluginData: (k: string) =>
        k === TOLGEE_NODE_INFO
          ? JSON.stringify({ key: "hello", connected: true, paramsValues: { name: "John" } })
          : "",
    };
    const copy = page("copy", [frame("a2", [copyText], "a")]);
    (globalThis as unknown as { figma: unknown }).figma = {
      currentPage: copy,
      getNodeByIdAsync: async () => src,
      ui: { postMessage: vi.fn() },
    };

    const result = await updateCopyFrames({ correlationId: "u3", sourcePageId: "src", language: "en" });

    expect(result.ok).toBe(true);
    const hello = result.pages?.[0]?.nodes.find((n) => n.key === "hello");
    expect(hello?.paramsValues).toEqual({ name: "John" });
  });

  it("refuses a copy without the mapping instead of guessing", async () => {
    const src = page("src", [frame("a", [])]);
    const copy = page("copy", [frame("a2", [])]);
    (globalThis as unknown as { figma: unknown }).figma = {
      currentPage: copy,
      getNodeByIdAsync: async () => src,
      ui: { postMessage: vi.fn() },
    };
    const result = await updateCopyFrames({ correlationId: "u2", sourcePageId: "src", language: "de" });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Recreate copy/);
  });
});
