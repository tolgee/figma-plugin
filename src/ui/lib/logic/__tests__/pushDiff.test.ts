import type { NodeInfo } from "$shared/types";
import { buildRemoteMapFromKeys, pushDiff } from "$ui/lib/logic/pushDiff";
import type { RemoteTranslationMap } from "$ui/lib/logic/pushDiff";
import { describe, expect, it } from "vitest";

function makeNode(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: overrides.id ?? "node-1",
    name: overrides.name ?? "Node",
    characters: overrides.characters ?? "",
    translation: overrides.translation ?? "",
    isPlural: overrides.isPlural ?? false,
    key: overrides.key ?? "",
    ns: overrides.ns,
    connected: overrides.connected ?? true,
    visible: overrides.visible,
    paramsValues: overrides.paramsValues,
    pluralParamValue: overrides.pluralParamValue,
  };
}

describe("pushDiff", () => {
  it("returns empty buckets for empty input", () => {
    const diff = pushDiff([], {}, { hasNamespacesEnabled: false });
    expect(diff.newKeys).toEqual([]);
    expect(diff.changedKeys).toEqual([]);
    expect(diff.unchangedKeys).toEqual([]);
    expect(diff.conflictingNodes).toEqual([]);
  });

  it("marks a node as unchanged when remote text matches", () => {
    const node = makeNode({
      id: "n1",
      key: "greeting",
      translation: "Hello",
    });
    const remote: RemoteTranslationMap = {
      "": {
        greeting: {
          translation: "Hello",
          keyIsPlural: false,
          keyTags: [],
        },
      },
    };
    const diff = pushDiff([node], remote, { hasNamespacesEnabled: false });
    expect(diff.unchangedKeys).toHaveLength(1);
    expect(diff.unchangedKeys[0]).toBe(node);
    expect(diff.newKeys).toEqual([]);
    expect(diff.changedKeys).toEqual([]);
  });

  it("marks a node as changed and surfaces the remoteText when text differs", () => {
    const node = makeNode({
      id: "n1",
      key: "greeting",
      translation: "Hi",
    });
    const remote: RemoteTranslationMap = {
      "": {
        greeting: {
          translation: "Hello",
          keyIsPlural: false,
          keyTags: [],
        },
      },
    };
    const diff = pushDiff([node], remote, { hasNamespacesEnabled: false });
    expect(diff.changedKeys).toHaveLength(1);
    expect(diff.changedKeys[0]?.node).toBe(node);
    expect(diff.changedKeys[0]?.remoteText).toBe("Hello");
    expect(diff.unchangedKeys).toEqual([]);
  });

  it("marks a node as new when remote has no entry for the key", () => {
    const node = makeNode({
      id: "n1",
      key: "missing-key",
      translation: "Hello",
    });
    const diff = pushDiff([node], {}, { hasNamespacesEnabled: false });
    expect(diff.newKeys).toHaveLength(1);
    expect(diff.newKeys[0]).toBe(node);
  });

  it("reports two nodes with the same (key, ns) but different text as conflicting", () => {
    const nodeA = makeNode({
      id: "a",
      key: "shared",
      ns: "ui",
      translation: "Hello",
    });
    const nodeB = makeNode({
      id: "b",
      key: "shared",
      ns: "ui",
      translation: "Hi",
    });
    const diff = pushDiff([nodeA, nodeB], {}, { hasNamespacesEnabled: true });

    expect(diff.conflictingNodes).toHaveLength(1);
    expect(diff.conflictingNodes[0]?.key).toBe("shared");
    expect(diff.conflictingNodes[0]?.ns).toBe("ui");
    expect(diff.conflictingNodes[0]?.nodes).toHaveLength(2);
    expect(diff.conflictingNodes[0]?.nodes).toContain(nodeA);
    expect(diff.conflictingNodes[0]?.nodes).toContain(nodeB);
  });

  it("does NOT report duplicate (key, ns) pairs when the text agrees", () => {
    const nodeA = makeNode({
      id: "a",
      key: "shared",
      translation: "Hello",
    });
    const nodeB = makeNode({
      id: "b",
      key: "shared",
      translation: "Hello",
    });
    const diff = pushDiff([nodeA, nodeB], {}, { hasNamespacesEnabled: false });
    expect(diff.conflictingNodes).toEqual([]);
  });

  it("flags plural mismatch as changed even when text matches", () => {
    const node = makeNode({
      id: "n1",
      key: "items",
      translation: "1 item",
      isPlural: true,
    });
    const remote: RemoteTranslationMap = {
      "": {
        items: {
          translation: "1 item",
          keyIsPlural: false,
          keyTags: [],
        },
      },
    };
    const diff = pushDiff([node], remote, { hasNamespacesEnabled: false });
    expect(diff.changedKeys).toHaveLength(1);
    expect(diff.changedKeys[0]?.node).toBe(node);
  });

  it("flags missing configuredTags as changed", () => {
    const node = makeNode({
      id: "n1",
      key: "greeting",
      translation: "Hello",
    });
    const remote: RemoteTranslationMap = {
      "": {
        greeting: {
          translation: "Hello",
          keyIsPlural: false,
          keyTags: ["existing"],
        },
      },
    };
    const diff = pushDiff([node], remote, {
      hasNamespacesEnabled: false,
      configuredTags: ["needs-this-tag"],
    });
    expect(diff.changedKeys).toHaveLength(1);
  });

  it("ignores nodes without a key", () => {
    const node = makeNode({ id: "n1", key: "", translation: "Hello" });
    const diff = pushDiff([node], {}, { hasNamespacesEnabled: false });
    expect(diff.newKeys).toEqual([]);
    expect(diff.changedKeys).toEqual([]);
    expect(diff.unchangedKeys).toEqual([]);
  });

  it("falls back to `characters` when `translation` is empty", () => {
    const node = makeNode({
      id: "n1",
      key: "greeting",
      translation: "",
      characters: "Hello",
    });
    const remote: RemoteTranslationMap = {
      "": {
        greeting: {
          translation: "Hello",
          keyIsPlural: false,
          keyTags: [],
        },
      },
    };
    const diff = pushDiff([node], remote, { hasNamespacesEnabled: false });
    expect(diff.unchangedKeys).toHaveLength(1);
  });
});

describe("buildRemoteMapFromKeys", () => {
  it("returns an empty object when keys is undefined", () => {
    expect(buildRemoteMapFromKeys(undefined, "en")).toEqual({});
  });

  it("indexes by namespace ('' for default) and key", () => {
    const map = buildRemoteMapFromKeys(
      [
        {
          keyName: "greeting",
          translations: { en: { text: "Hello" } },
        },
        {
          keyName: "greeting",
          keyNamespace: "ui",
          keyIsPlural: true,
          keyTags: [{ name: "foo" }],
          translations: { en: { text: "Hi" } },
        },
      ],
      "en",
    );

    expect(map[""]?.greeting?.translation).toBe("Hello");
    expect(map[""]?.greeting?.keyIsPlural).toBe(false);
    expect(map.ui?.greeting?.translation).toBe("Hi");
    expect(map.ui?.greeting?.keyIsPlural).toBe(true);
    expect(map.ui?.greeting?.keyTags).toEqual(["foo"]);
  });

  it("returns undefined translation when no language entry is present", () => {
    const map = buildRemoteMapFromKeys([{ keyName: "k", translations: {} }], "en");
    expect(map[""]?.k?.translation).toBeUndefined();
  });
});
