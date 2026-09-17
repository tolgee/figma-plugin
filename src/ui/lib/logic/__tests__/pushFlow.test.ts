import type { FrameScreenshot, NodeInfo } from "$shared/types";
import type { TolgeeClient } from "$ui/lib/api/client";
import type { SimpleImportConflictResult } from "$ui/lib/api/push";
import {
  buildConnectBackUpdates,
  buildPayload,
  buildRelatedKeys,
  canonicalKey,
  defaultResolutions,
  resolutionKey,
} from "$ui/lib/logic/pushFlow";
import type { PushContext } from "$ui/lib/logic/pushFlow";
import type { PushDiff } from "$ui/lib/logic/pushDiff";
import { describe, expect, it } from "vitest";
import { nsKeyIndex } from "$ui/lib/logic/namespaces";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNode(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: overrides.id ?? "node-1",
    name: overrides.name ?? "Node",
    characters: overrides.characters ?? "",
    translation: overrides.translation ?? "",
    isPlural: overrides.isPlural ?? false,
    key: overrides.key ?? "some-key",
    ns: overrides.ns,
    connected: overrides.connected ?? true,
    visible: overrides.visible,
    paramsValues: overrides.paramsValues,
    pluralParamValue: overrides.pluralParamValue,
  };
}

function makeConflict(
  overrides: Partial<SimpleImportConflictResult> = {},
): SimpleImportConflictResult {
  return {
    keyName: overrides.keyName ?? "some-key",
    keyNamespace: overrides.keyNamespace,
    language: overrides.language ?? "en",
    isOverridable: overrides.isOverridable ?? true,
  };
}

const ctx: PushContext = {
  client: {} as TolgeeClient,
  apiUrl: "https://app.tolgee.io",
  apiKey: "test",
  language: "en",
  hasNamespacesEnabled: false,
};

function makeScreenshot(keys: Array<{ key: string; ns?: string }>): FrameScreenshot {
  return {
    image: new Uint8Array(),
    info: {} as FrameScreenshot["info"],
    keys: keys.map((k, i) => ({
      ...makeNode({ id: `k${i}`, key: k.key, ns: k.ns }),
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    })) as FrameScreenshot["keys"],
  };
}

// ---------------------------------------------------------------------------
// canonicalKey
// ---------------------------------------------------------------------------

describe("canonicalKey", () => {
  it("joins ns and key when ns is provided (namespaces enabled)", () => {
    const node = makeNode({ key: "greeting", ns: "common" });
    expect(canonicalKey(node, true)).toBe(nsKeyIndex("common", "greeting"));
  });

  it("joins an empty ns when none is provided", () => {
    const node = makeNode({ key: "greeting", ns: undefined });
    expect(canonicalKey(node, true)).toBe(nsKeyIndex(undefined, "greeting"));
  });

  it("ignores a stale ns when namespaces are DISABLED (matches the server's default-ns row)", () => {
    // A node can carry a stale, invisible ns even on a ns-disabled project.
    const node = makeNode({ key: "greeting", ns: "web" });
    expect(canonicalKey(node, false)).toBe(nsKeyIndex(undefined, "greeting"));
    // …but with the feature ON the ns is honoured.
    expect(canonicalKey(node, true)).toBe(nsKeyIndex("web", "greeting"));
  });
});

// ---------------------------------------------------------------------------
// resolutionKey
// ---------------------------------------------------------------------------

describe("resolutionKey", () => {
  it("joins namespace and keyName when a namespace is provided (namespaces enabled)", () => {
    expect(resolutionKey("greeting", "common", true)).toBe(nsKeyIndex("common", "greeting"));
  });

  it("joins an empty namespace when none is provided", () => {
    expect(resolutionKey("greeting", undefined, true)).toBe(nsKeyIndex(undefined, "greeting"));
  });

  it("ignores a stale namespace when namespaces are DISABLED", () => {
    // The server reports conflicts for the default ns; a local node's stale ns
    // must normalise to the same key so its resolution is found.
    expect(resolutionKey("greeting", "web", false)).toBe(nsKeyIndex(undefined, "greeting"));
    expect(resolutionKey("greeting", "web", true)).toBe(nsKeyIndex("web", "greeting"));
  });
});

// ---------------------------------------------------------------------------
// defaultResolutions
// ---------------------------------------------------------------------------

describe("defaultResolutions", () => {
  it("returns OVERRIDE for isOverridable:true conflicts", () => {
    const conflicts = [makeConflict({ keyName: "k1", isOverridable: true })];
    const result = defaultResolutions(conflicts, true);
    expect(result[nsKeyIndex(undefined, "k1")]).toBe("OVERRIDE");
  });

  it("returns KEEP for isOverridable:false conflicts", () => {
    const conflicts = [makeConflict({ keyName: "k1", isOverridable: false })];
    const result = defaultResolutions(conflicts, true);
    expect(result[nsKeyIndex(undefined, "k1")]).toBe("KEEP");
  });

  it("returns empty object for empty list", () => {
    expect(defaultResolutions([], true)).toEqual({});
  });

  it("uses resolutionKey for map keys", () => {
    const conflicts = [makeConflict({ keyName: "btn", keyNamespace: "ui", isOverridable: true })];
    const result = defaultResolutions(conflicts, true);
    expect(Object.keys(result)).toContain(nsKeyIndex("ui", "btn"));
  });

  it("handles mixed overridable and non-overridable conflicts", () => {
    const conflicts = [
      makeConflict({ keyName: "k1", isOverridable: true }),
      makeConflict({ keyName: "k2", isOverridable: false }),
    ];
    const result = defaultResolutions(conflicts, true);
    expect(result[nsKeyIndex(undefined, "k1")]).toBe("OVERRIDE");
    expect(result[nsKeyIndex(undefined, "k2")]).toBe("KEEP");
  });

  it("REGRESSION: ns-disabled — a default-ns conflict resolves for a node with a stale ns", () => {
    // The server reports the conflict under the DEFAULT namespace…
    const resolutions = defaultResolutions(
      [makeConflict({ keyName: "greeting", keyNamespace: undefined, isOverridable: true })],
      false,
    );
    // …and a local node that still carries a stale "web" ns must find it.
    expect(resolutions[resolutionKey("greeting", "web", false)]).toBe("OVERRIDE");
  });
});

// ---------------------------------------------------------------------------
// buildPayload
// ---------------------------------------------------------------------------

describe("buildPayload", () => {
  const emptyMap = new Map<FrameScreenshot, number>();
  const noScreenshots: FrameScreenshot[] = [];

  it("sets node.key as name and node.ns as namespace when hasNamespacesEnabled is true", () => {
    const node = makeNode({ key: "title", ns: "home" });
    const [item] = buildPayload({
      ctx: { ...ctx, hasNamespacesEnabled: true },
      nodes: [node],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
    });
    expect(item?.name).toBe("title");
    expect(item?.namespace).toBe("home");
  });

  it("omits namespace when hasNamespacesEnabled is false", () => {
    const node = makeNode({ key: "title", ns: "home" });
    const [item] = buildPayload({
      ctx: { ...ctx, hasNamespacesEnabled: false },
      nodes: [node],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
    });
    expect(item?.namespace).toBeUndefined();
  });

  it("omits namespace when hasNamespacesEnabled is true but ns is falsy", () => {
    const node = makeNode({ key: "title", ns: undefined });
    const [item] = buildPayload({
      ctx: { ...ctx, hasNamespacesEnabled: true },
      nodes: [node],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
    });
    expect(item?.namespace).toBeUndefined();
  });

  it("includes translation text in translations[language]", () => {
    const node = makeNode({ key: "greeting", translation: "Hello" });
    const [item] = buildPayload({
      ctx,
      nodes: [node],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
    });
    expect(item?.translations).toEqual({
      en: { text: "Hello", resolution: "OVERRIDE" },
    });
  });

  it("sets translations to {} (empty) when resolutionFor returns KEEP", () => {
    const node = makeNode({ key: "greeting", translation: "Hello" });
    const [item] = buildPayload({
      ctx,
      nodes: [node],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
      resolutionFor: () => "KEEP",
    });
    expect(item?.translations).toEqual({});
  });

  it("sends translations: {} for an UNCHANGED node (never re-overrides it)", () => {
    const changed = makeNode({ id: "a", key: "changed", translation: "New" });
    const unchanged = makeNode({ id: "b", key: "same", translation: "Same" });
    const items = buildPayload({
      ctx,
      nodes: [changed, unchanged],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
      unchangedNodeIds: new Set(["b"]),
    });
    // changed node still pushes its text with OVERRIDE...
    expect(items[0]?.translations).toEqual({
      en: { text: "New", resolution: "OVERRIDE" },
    });
    // ...the unchanged one carries no translation at all.
    expect(items[1]?.translations).toEqual({});
    expect(items[1]?.name).toBe("same");
  });

  it("falls back to node.characters when translation is empty", () => {
    const node = makeNode({ key: "label", translation: "", characters: "Fallback" });
    const [item] = buildPayload({
      ctx,
      nodes: [node],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
    });
    expect(item?.translations?.en?.text).toBe("Fallback");
  });

  it("uses empty string when both translation and characters are empty", () => {
    const node = makeNode({ key: "label", translation: "", characters: "" });
    const [item] = buildPayload({
      ctx,
      nodes: [node],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
    });
    expect(item?.translations?.en?.text).toBe("");
  });

  it("returns empty array for empty nodes list", () => {
    const result = buildPayload({
      ctx,
      nodes: [],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
    });
    expect(result).toEqual([]);
  });

  it("screenshots array is empty when uploadedImageIdByScreenshot has no matching entry", () => {
    const node = makeNode({ key: "title" });
    const [item] = buildPayload({
      ctx,
      nodes: [node],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
    });
    expect(item?.screenshots).toEqual([]);
  });

  it("maps screenshots that reference the node's key and have an uploaded image id", () => {
    const node = makeNode({ key: "title", ns: undefined });
    const screenshot: FrameScreenshot = {
      image: new Uint8Array([1, 2, 3]),
      info: { id: "frame-1", name: "Frame", width: 800, height: 600 },
      keys: [
        {
          ...node,
          x: 10,
          y: 20,
          width: 100,
          height: 50,
        },
      ],
    };
    const uploadedMap = new Map<FrameScreenshot, number>([[screenshot, 42]]);

    const [item] = buildPayload({
      ctx,
      nodes: [node],
      screenshots: [screenshot],
      uploadedImageIdByScreenshot: uploadedMap,
    });

    expect(item?.screenshots).toHaveLength(1);
    expect(item?.screenshots?.[0]?.uploadedImageId).toBe(42);
    expect(item?.screenshots?.[0]?.positions).toEqual([{ x: 10, y: 20, width: 100, height: 50 }]);
  });

  it("excludes screenshots whose key does not match the node", () => {
    const node = makeNode({ key: "title" });
    const otherNode = makeNode({ key: "other-key" });
    const screenshot: FrameScreenshot = {
      image: new Uint8Array([1]),
      info: { id: "frame-2", name: "Frame", width: 400, height: 300 },
      keys: [{ ...otherNode, x: 0, y: 0, width: 50, height: 20 }],
    };
    const uploadedMap = new Map<FrameScreenshot, number>([[screenshot, 99]]);

    const [item] = buildPayload({
      ctx,
      nodes: [node],
      screenshots: [screenshot],
      uploadedImageIdByScreenshot: uploadedMap,
    });

    expect(item?.screenshots).toEqual([]);
  });

  it("processes multiple nodes independently", () => {
    const nodeA = makeNode({ key: "a", translation: "Alpha" });
    const nodeB = makeNode({ key: "b", translation: "Beta" });
    const result = buildPayload({
      ctx,
      nodes: [nodeA, nodeB],
      screenshots: noScreenshots,
      uploadedImageIdByScreenshot: emptyMap,
    });
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe("a");
    expect(result[1]?.name).toBe("b");
  });
});

describe("buildRelatedKeys", () => {
  it("lists a screenshot's keys in order, dropping empty keys", () => {
    const s = makeScreenshot([{ key: "a" }, { key: "" }, { key: "b" }]);
    const rel = buildRelatedKeys(ctx, s);
    expect(rel.map((k) => k.keyName)).toEqual(["a", "b"]);
  });

  it("includes namespace only when namespaces are enabled", () => {
    const s = makeScreenshot([{ key: "a", ns: "common" }]);
    expect(buildRelatedKeys({ ...ctx, hasNamespacesEnabled: true }, s)[0]?.namespace).toBe(
      "common",
    );
    expect(buildRelatedKeys(ctx, s)[0]?.namespace).toBeUndefined();
  });

  it("carries the branch on each related key when set", () => {
    const s = makeScreenshot([{ key: "a" }]);
    expect(buildRelatedKeys({ ...ctx, branch: "feat" }, s)[0]?.branch).toBe("feat");
    expect(buildRelatedKeys(ctx, s)[0]?.branch).toBeUndefined();
  });

  it("caps at 100 keys", () => {
    const s = makeScreenshot(Array.from({ length: 150 }, (_, i) => ({ key: `k${i}` })));
    expect(buildRelatedKeys(ctx, s)).toHaveLength(100);
  });
});

// ---------------------------------------------------------------------------
// buildConnectBackUpdates
// ---------------------------------------------------------------------------

function makeDiff(overrides: Partial<PushDiff> = {}): PushDiff {
  return {
    newKeys: [],
    changedKeys: [],
    unchangedKeys: [],
    missingKeys: [],
    conflictingNodes: [],
    ...overrides,
  };
}

describe("buildConnectBackUpdates", () => {
  it("connects every snapshot node, preferring the canonical translation", () => {
    const a = makeNode({ id: "a", key: "title", characters: "Hi" });
    const b = makeNode({ id: "b", key: "title", characters: "Hi" });
    const canonical = new Map([
      [nsKeyIndex(undefined, "title"), { translation: "Hi canonical", isPlural: true }],
    ]);

    const updates = buildConnectBackUpdates(
      makeDiff({ newKeys: [a] }),
      [a, b],
      canonical,
      true,
    );

    // Both nodes sharing the pushed key get connected (bulk-assign case).
    expect(updates).toEqual([
      { id: "a", info: { connected: true, translation: "Hi canonical", isPlural: true } },
      { id: "b", info: { connected: true, translation: "Hi canonical", isPlural: true } },
    ]);
  });

  it("falls back to the node's own translation, then characters", () => {
    const withTranslation = makeNode({ id: "a", key: "x", translation: "Saved" });
    const withoutAny = makeNode({ id: "b", key: "y", translation: "", characters: "Typed" });

    const updates = buildConnectBackUpdates(
      makeDiff(),
      [withTranslation, withoutAny],
      null,
      true,
    );

    expect(updates[0]?.info.translation).toBe("Saved");
    // `??` semantics: an empty-string translation is kept as-is (matches the
    // pre-extraction inline code — characters is only for nullish).
    expect(updates[1]?.info.translation).toBe("");
  });

  it("excludes dropped conflict-group members and missing keys", () => {
    const kept = makeNode({ id: "kept", key: "dup" });
    const dropped = makeNode({ id: "dropped", key: "dup" });
    const missing = makeNode({ id: "missing", key: "gone" });
    const ok = makeNode({ id: "ok", key: "fine" });

    const updates = buildConnectBackUpdates(
      makeDiff({
        conflictingNodes: [{ key: "dup", nodes: [kept, dropped] }],
        missingKeys: [missing],
      }),
      [kept, dropped, missing, ok],
      null,
      true,
    );

    expect(updates.map((u) => u.id)).toEqual(["kept", "ok"]);
  });

  it("REGRESSION: reads only the snapshot, never the current selection", () => {
    // The push started over snapshot A…
    const pushedNode = makeNode({ id: "pushed", key: "title", translation: "Hello" });
    const snapshotDiff = makeDiff({ newKeys: [pushedNode] });
    const snapshotSelection = [pushedNode];

    // …but by the time the awaits resolved, the user selected something else
    // entirely (this is what the reactive `diff`/`connectedNodes` would show).
    const strayNode = makeNode({
      id: "stray",
      key: "other",
      connected: false,
      characters: "Never pushed",
    });
    const currentSelection = [strayNode];

    const updates = buildConnectBackUpdates(snapshotDiff, snapshotSelection, null, true);

    // Only the pushed node gets connected — the stray selection must not
    // appear (previously it got `connected: true` with a bogus baseline).
    expect(updates.map((u) => u.id)).toEqual(["pushed"]);
    expect(currentSelection.every((n) => !updates.some((u) => u.id === n.id))).toBe(true);
  });

  it("REGRESSION: ns-disabled — a node with a stale ns still gets the canonical translation", () => {
    // Server (namespaces disabled) returns the key under the DEFAULT namespace…
    const canonical = new Map([
      [nsKeyIndex(undefined, "greeting"), { translation: "Canonical", isPlural: false }],
    ]);
    // …while the local node still carries a stale, invisible "web" ns.
    const node = makeNode({ id: "n", key: "greeting", ns: "web", translation: "Old" });

    const updates = buildConnectBackUpdates(
      makeDiff({ newKeys: [node] }),
      [node],
      canonical,
      false,
    );

    // Before the fix the lookup ("web|greeting") missed the map ("|greeting")
    // and fell back to the node's own stale "Old" → phantom diff next push.
    expect(updates[0]?.info.translation).toBe("Canonical");
  });

  it("with namespaces ENABLED, ns is honoured — no cross-namespace match", () => {
    // A default-ns canonical row must NOT feed a node living in a real ns.
    const canonical = new Map([
      [nsKeyIndex(undefined, "greeting"), { translation: "Default ns", isPlural: false }],
    ]);
    const node = makeNode({ id: "n", key: "greeting", ns: "web", translation: "Own" });

    const updates = buildConnectBackUpdates(
      makeDiff({ newKeys: [node] }),
      [node],
      canonical,
      true,
    );

    // "web|greeting" ≠ "|greeting" → falls back to the node's own translation.
    expect(updates[0]?.info.translation).toBe("Own");
  });
});
