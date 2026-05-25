import type { FrameScreenshot, NodeInfo } from "$shared/types";
import type { TolgeeClient } from "$ui/lib/api/client";
import type { SimpleImportConflictResult } from "$ui/lib/api/push";
import {
  buildPayload,
  canonicalKey,
  defaultResolutions,
  resolutionKey,
} from "$ui/lib/logic/pushFlow";
import type { PushContext } from "$ui/lib/logic/pushFlow";
import { describe, expect, it } from "vitest";

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

// ---------------------------------------------------------------------------
// canonicalKey
// ---------------------------------------------------------------------------

describe("canonicalKey", () => {
  it("formats ns|key when ns is provided", () => {
    const node = makeNode({ key: "greeting", ns: "common" });
    expect(canonicalKey(node)).toBe("common|greeting");
  });

  it("formats |key when ns is undefined", () => {
    const node = makeNode({ key: "greeting", ns: undefined });
    expect(canonicalKey(node)).toBe("|greeting");
  });
});

// ---------------------------------------------------------------------------
// resolutionKey
// ---------------------------------------------------------------------------

describe("resolutionKey", () => {
  it("formats ns|keyName when namespace is provided", () => {
    expect(resolutionKey("greeting", "common")).toBe("common|greeting");
  });

  it("formats |keyName when namespace is undefined", () => {
    expect(resolutionKey("greeting", undefined)).toBe("|greeting");
  });
});

// ---------------------------------------------------------------------------
// defaultResolutions
// ---------------------------------------------------------------------------

describe("defaultResolutions", () => {
  it("returns OVERRIDE for isOverridable:true conflicts", () => {
    const conflicts = [makeConflict({ keyName: "k1", isOverridable: true })];
    const result = defaultResolutions(conflicts);
    expect(result["|k1"]).toBe("OVERRIDE");
  });

  it("returns KEEP for isOverridable:false conflicts", () => {
    const conflicts = [makeConflict({ keyName: "k1", isOverridable: false })];
    const result = defaultResolutions(conflicts);
    expect(result["|k1"]).toBe("KEEP");
  });

  it("returns empty object for empty list", () => {
    expect(defaultResolutions([])).toEqual({});
  });

  it("uses resolutionKey format (ns|keyName) for map keys", () => {
    const conflicts = [makeConflict({ keyName: "btn", keyNamespace: "ui", isOverridable: true })];
    const result = defaultResolutions(conflicts);
    expect(Object.keys(result)).toContain("ui|btn");
  });

  it("handles mixed overridable and non-overridable conflicts", () => {
    const conflicts = [
      makeConflict({ keyName: "k1", isOverridable: true }),
      makeConflict({ keyName: "k2", isOverridable: false }),
    ];
    const result = defaultResolutions(conflicts);
    expect(result["|k1"]).toBe("OVERRIDE");
    expect(result["|k2"]).toBe("KEEP");
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
