import { describe, expect, it } from "vitest";

import type { NodeInfo, TolgeeConfig } from "$shared/types";
import { followsSuggestion, suggestedKeyFor, withSuggestedKeys } from "$ui/lib/logic/prefillKey";

function makeNode(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: overrides.id ?? "1:1",
    name: "Layer",
    characters: "Sign in",
    key: "",
    ns: undefined,
    translation: "",
    isPlural: false,
    connected: false,
    ...overrides,
  };
}

const CONFIG: Partial<TolgeeConfig> = {
  prefillKeyFormat: true,
  keyFormat: "{elementText}",
  namespace: "",
};

describe("withSuggestedKeys — the prefill is a suggestion, never a write", () => {
  it("shows the suggestion on an empty-key unconnected node and lists it as pending", () => {
    const { nodes, pending } = withSuggestedKeys([makeNode()], { ...CONFIG, namespace: "web" });
    expect(nodes[0]).toMatchObject({ key: "Sign in", ns: "web", prefilledKey: "Sign in" });
    expect([...pending]).toEqual([["1:1", { key: "Sign in", ns: "web" }]]);
  });

  it("never touches a manual key — typed by the user, or persisted without our marker", () => {
    const typed = makeNode({ id: "a", key: "my.key", prefilledKey: "Sign in" });
    const fromOldPlugin = makeNode({ id: "b", key: "legacy" });
    const { nodes, pending } = withSuggestedKeys([typed, fromOldPlugin], CONFIG);
    expect(nodes[0]).toBe(typed);
    expect(nodes[1]).toBe(fromOldPlugin);
    expect(pending.size).toBe(0);
  });

  it("an UNTOUCHED auto key follows the layer and the format (the rename complaint)", () => {
    // Persisted earlier as "Sign in" (key === marker); the layer text changed since.
    const renamed = makeNode({ key: "Sign in", prefilledKey: "Sign in", characters: "Log in" });
    const { nodes, pending } = withSuggestedKeys([renamed], CONFIG);
    expect(nodes[0]?.key).toBe("Log in");
    expect(pending.get("1:1")?.key).toBe("Log in");

    const restyled = withSuggestedKeys(
      [makeNode({ key: "Sign in", prefilledKey: "Sign in" })],
      { ...CONFIG, keyFormat: "{elementName}" },
    );
    expect(restyled.nodes[0]?.key).toBe("Layer");
  });

  it("a stored auto key that already equals the suggestion is left as is and is NOT pending", () => {
    const stored = makeNode({ key: "Sign in", prefilledKey: "Sign in" });
    const { nodes, pending } = withSuggestedKeys([stored], CONFIG);
    expect(nodes[0]).toBe(stored);
    expect(pending.size).toBe(0);
  });

  it("connected nodes are untouched", () => {
    const connected = makeNode({ key: "k", connected: true });
    expect(withSuggestedKeys([connected], CONFIG).nodes[0]).toBe(connected);
  });

  it("with prefill off (or no format) returns the input array itself", () => {
    const input = [makeNode()];
    expect(withSuggestedKeys(input, { ...CONFIG, prefillKeyFormat: false }).nodes).toBe(input);
    expect(withSuggestedKeys(input, { prefillKeyFormat: true }).nodes).toBe(input);
    expect(withSuggestedKeys(input, null).nodes).toBe(input);
  });

  it("a cleared key shows the suggestion again (clearing = 'give me a fresh auto value')", () => {
    const cleared = makeNode({ key: "", prefilledKey: "Sign in" });
    expect(withSuggestedKeys([cleared], CONFIG).nodes[0]?.key).toBe("Sign in");
  });

  it("a parent-based format waits for the parent names, then suggests", () => {
    const parentConfig = { ...CONFIG, keyFormat: "{frame}.{elementText}" };
    const bare = makeNode();
    expect(withSuggestedKeys([bare], parentConfig).nodes[0]).toBe(bare);
    const withParents = makeNode({ frame: "Login" });
    expect(withSuggestedKeys([withParents], parentConfig).nodes[0]?.key).toBe("Login.Sign in");
  });

  it("formats each raw node once per config: the same snapshot in a later batch reuses the same overlay object", () => {
    // Streamed selection: batch 1 → [a], batch 2 → [a, b]. `a` must not be
    // re-formatted (nor get a new object) just because the array was rebuilt.
    const a = makeNode({ id: "a" });
    const b = makeNode({ id: "b", characters: "Cancel" });
    const first = withSuggestedKeys([a], CONFIG).nodes[0];
    const second = withSuggestedKeys([a, b], CONFIG);
    expect(second.nodes[0]).toBe(first);
    expect(second.nodes[1]?.key).toBe("Cancel");
    // A new config object is a new decision.
    expect(withSuggestedKeys([a], { ...CONFIG }).nodes[0]).not.toBe(first);
  });

  it("keeps the identity of untouched nodes and of the array when nothing changes", () => {
    const manual = makeNode({ id: "m", key: "manual" });
    const fresh = makeNode({ id: "f" });
    const { nodes } = withSuggestedKeys([manual, fresh], CONFIG);
    expect(nodes[0]).toBe(manual);
    expect(nodes[1]).not.toBe(fresh);
    const onlyManual = [manual];
    expect(withSuggestedKeys(onlyManual, CONFIG).nodes).toBe(onlyManual);
  });
});

describe("followsSuggestion / suggestedKeyFor", () => {
  it("empty key and untouched auto key follow; manual and connected don't", () => {
    expect(followsSuggestion(makeNode())).toBe(true);
    expect(followsSuggestion(makeNode({ key: "a", prefilledKey: "a" }))).toBe(true);
    expect(followsSuggestion(makeNode({ key: "a", prefilledKey: "b" }))).toBe(false);
    expect(followsSuggestion(makeNode({ key: "a" }))).toBe(false);
    expect(followsSuggestion(makeNode({ key: "", connected: true }))).toBe(false);
  });

  it("applies the configured casing", () => {
    expect(suggestedKeyFor(makeNode(), { ...CONFIG, variableCasing: "camelCase" })).toBe("signIn");
  });
});
