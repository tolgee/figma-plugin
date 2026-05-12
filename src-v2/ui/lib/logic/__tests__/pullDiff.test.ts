import { describe, expect, it } from "vitest";
import { formatNodeText, pullDiff } from "$ui/lib/logic/pullDiff";
import type { NodeInfo } from "$shared/types";
import type { PulledKey } from "$ui/lib/api/pull";

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

function makeRemoteKey(overrides: Partial<PulledKey> = {}): PulledKey {
  return {
    keyName: overrides.keyName ?? "",
    keyNamespace: overrides.keyNamespace,
    isPlural: overrides.isPlural ?? false,
    translations: overrides.translations ?? {},
  };
}

describe("pullDiff", () => {
  it("classifies a node as changed when remote text differs", () => {
    const node = makeNode({
      key: "greeting",
      translation: "Hello",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "greeting",
      translations: { en: { text: "Hi" } },
    });
    const diff = pullDiff([node], [remote], "en");

    expect(diff.changedNodes).toHaveLength(1);
    expect(diff.changedNodes[0]?.node).toBe(node);
    expect(diff.changedNodes[0]?.newText).toBe("Hi");
    expect(diff.changedNodes[0]?.isPlural).toBe(false);
    expect(diff.missingKeys).toEqual([]);
    expect(diff.unchangedNodes).toEqual([]);
  });

  it("classifies a node as missing when remote has no matching key", () => {
    const node = makeNode({
      key: "ghost",
      translation: "Hello",
      connected: true,
    });
    const diff = pullDiff([node], [], "en");

    expect(diff.missingKeys).toHaveLength(1);
    expect(diff.missingKeys[0]).toBe(node);
    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toEqual([]);
  });

  it("classifies a node as unchanged when remote text matches", () => {
    const node = makeNode({
      key: "greeting",
      translation: "Hello",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "greeting",
      translations: { en: { text: "Hello" } },
    });
    const diff = pullDiff([node], [remote], "en");

    expect(diff.unchangedNodes).toHaveLength(1);
    expect(diff.unchangedNodes[0]).toBe(node);
    expect(diff.changedNodes).toEqual([]);
    expect(diff.missingKeys).toEqual([]);
  });

  it("classifies an empty remote translation as missing (no destructive overwrite)", () => {
    const node = makeNode({
      key: "greeting",
      translation: "Hello",
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "greeting",
      translations: { en: { text: "" } },
    });
    const diff = pullDiff([node], [remote], "en");

    // Matches legacy plugin behaviour: a key without a translation for the
    // selected language is surfaced under "missing" so the user can see they
    // still need to translate it. We never overwrite a local string with "".
    expect(diff.missingKeys).toHaveLength(1);
    expect(diff.missingKeys[0]).toBe(node);
    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toEqual([]);
  });

  it("ignores nodes that are not connected", () => {
    const node = makeNode({
      key: "greeting",
      translation: "Hello",
      connected: false,
    });
    const diff = pullDiff([node], [], "en");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.missingKeys).toEqual([]);
    expect(diff.unchangedNodes).toEqual([]);
  });

  it("flags plural mismatch as changed even when text matches", () => {
    const node = makeNode({
      key: "items",
      translation: "1 item",
      isPlural: false,
      connected: true,
    });
    const remote = makeRemoteKey({
      keyName: "items",
      isPlural: true,
      translations: { en: { text: "1 item" } },
    });
    const diff = pullDiff([node], [remote], "en");

    expect(diff.changedNodes).toHaveLength(1);
    expect(diff.changedNodes[0]?.isPlural).toBe(true);
  });

  it("disambiguates by namespace", () => {
    const nodeA = makeNode({
      id: "a",
      key: "greeting",
      ns: "ui",
      translation: "Hi (UI)",
      connected: true,
    });
    const nodeB = makeNode({
      id: "b",
      key: "greeting",
      ns: "marketing",
      translation: "Hi (mkt)",
      connected: true,
    });
    const remoteUi = makeRemoteKey({
      keyName: "greeting",
      keyNamespace: "ui",
      translations: { en: { text: "Hi (UI)" } },
    });
    const remoteMkt = makeRemoteKey({
      keyName: "greeting",
      keyNamespace: "marketing",
      translations: { en: { text: "Hello (mkt)" } },
    });
    const diff = pullDiff([nodeA, nodeB], [remoteUi, remoteMkt], "en");

    expect(diff.unchangedNodes).toContain(nodeA);
    expect(diff.changedNodes).toHaveLength(1);
    expect(diff.changedNodes[0]?.node).toBe(nodeB);
    expect(diff.changedNodes[0]?.newText).toBe("Hello (mkt)");
  });
});

describe("formatNodeText", () => {
  it("formats a plural ICU message using node.pluralParamValue", () => {
    const node = makeNode({
      key: "items",
      pluralParamValue: "3",
      isPlural: true,
    });
    const out = formatNodeText(
      node,
      "{count, plural, one {1 item} other {# items}}",
      "en",
    );
    expect(out.text).toBe("3 items");
    expect(out.error).toBeUndefined();
  });

  it("formats with explicit paramsValues taking precedence", () => {
    const node = makeNode({
      key: "greet",
      paramsValues: { name: "Alice" },
    });
    const out = formatNodeText(node, "Hello, {name}!", "en");
    expect(out.text).toBe("Hello, Alice!");
    expect(out.error).toBeUndefined();
  });

  it("does not overwrite an existing `count` in paramsValues", () => {
    // pluralParamValue should not replace an explicit `count` already provided.
    const node = makeNode({
      key: "items",
      pluralParamValue: "99",
      paramsValues: { count: "7" },
      isPlural: true,
    });
    const out = formatNodeText(
      node,
      "{count, plural, one {1 item} other {# items}}",
      "en",
    );
    expect(out.text).toBe("7 items");
    expect(out.error).toBeUndefined();
  });

  it("returns the raw text and an Error on malformed ICU", () => {
    const node = makeNode({
      key: "broken",
      paramsValues: { name: "Alice" },
    });
    const malformed = "Hello {name";
    const out = formatNodeText(node, malformed, "en");
    expect(out.text).toBe(malformed);
    expect(out.error).toBeInstanceOf(Error);
  });

  it("returns the raw text untouched when there are no params at all", () => {
    const node = makeNode({ key: "k" });
    const out = formatNodeText(node, "Just a string", "en");
    expect(out.text).toBe("Just a string");
    expect(out.error).toBeUndefined();
  });
});
