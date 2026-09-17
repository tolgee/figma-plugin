import { beforeEach, describe, expect, it } from "vitest";

import type { NodeInfo, TolgeeConfig } from "$shared/types";
import { pendingPrefills, resetPrefillSettled } from "$ui/lib/logic/prefillKey";

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

beforeEach(() => {
  resetPrefillSettled();
});

describe("pendingPrefills", () => {
  it("fills empty-key unconnected nodes once, then settles", () => {
    const nodes = [makeNode({ id: "1:1" }), makeNode({ id: "1:2", characters: "Log out" })];
    const first = pendingPrefills(nodes, CONFIG);
    expect(first.map((p) => p.id)).toEqual(["1:1", "1:2"]);
    expect(first[0]?.key).toBe("Sign in");
    // Once the caller has persisted the generated keys, a re-scan is a no-op
    // (the keys are now non-empty, so nothing regenerates).
    const persisted = [
      makeNode({ id: "1:1", key: "Sign in" }),
      makeNode({ id: "1:2", key: "Log out", characters: "Log out" }),
    ];
    expect(pendingPrefills(persisted, CONFIG)).toEqual([]);
  });

  it("plugin open never rewrites keys persisted earlier (boot is not a format change)", () => {
    // Fresh session memory = reopen. Keyed nodes stay untouched, empty fill.
    const nodes = [
      makeNode({ id: "1:1", key: "my.manual.key" }),
      makeNode({ id: "1:2", characters: "Log out" }),
      makeNode({ id: "1:3", key: "linked", connected: true }),
    ];
    expect(pendingPrefills(nodes, CONFIG)).toEqual([
      { id: "1:2", key: "Log out", ns: "" },
    ]);
  });

  it("a cleared key REGENERATES on the same format (clearing = 'give me a fresh auto value')", () => {
    const node = makeNode({ id: "1:1" });
    pendingPrefills([node], CONFIG); // prefill applied → settled
    const cleared = makeNode({ id: "1:1", key: "" }); // user deleted the key
    // Matches upstream (fills any keyless unconnected node); a clear no longer
    // "sticks" — the empty key is refilled with the current-format value.
    expect(pendingPrefills([cleared], CONFIG)).toEqual([{ id: "1:1", key: "Sign in", ns: "" }]);
  });

  it("a manual (non-empty) key is NOT overwritten on re-scan under the same format", () => {
    const node = makeNode({ id: "1:1" });
    pendingPrefills([node], CONFIG); // generated "Sign in", settled
    const edited = makeNode({ id: "1:1", key: "my.custom" }); // user edited it
    // The non-empty edit is protected: regeneration only touches empty keys.
    expect(pendingPrefills([edited], CONFIG)).toEqual([]);
  });

  it("on a format change, regenerates UNTOUCHED auto keys but preserves manual edits", () => {
    const nodes = [
      // Auto key: still equals the marker we generated → follows the new format.
      makeNode({ id: "1:1", key: "Sign in", prefilledKey: "Sign in" }),
      // Manual edit: key differs from the marker → left alone.
      makeNode({ id: "1:2", key: "manual.key", prefilledKey: "Log out", characters: "Log out" }),
      makeNode({ id: "1:3", key: "linked", connected: true }),
    ];
    pendingPrefills(nodes, CONFIG); // decisions made under {elementText}
    const regenerated = pendingPrefills(nodes, { ...CONFIG, keyFormat: "{elementName}" });
    // Only the untouched auto key reflows; the manual edit and the connected
    // node are never rewritten.
    expect(regenerated).toEqual([{ id: "1:1", key: "Layer", ns: "" }]);
  });

  it("a format change also refills keys the user had cleared", () => {
    const node = makeNode({ id: "1:1" });
    pendingPrefills([node], CONFIG);
    const cleared = makeNode({ id: "1:1", key: "" });
    pendingPrefills([cleared], CONFIG); // still cleared under the same format
    expect(pendingPrefills([cleared], { ...CONFIG, keyFormat: "{elementName}" })).toEqual([
      { id: "1:1", key: "Layer", ns: "" },
    ]);
  });

  it("regenerates an untouched auto key when variable casing changes", () => {
    const node = makeNode({ id: "1:1" });
    pendingPrefills([node], CONFIG);
    // Auto key (equals the marker) reflows on a casing change too.
    const keyed = makeNode({ id: "1:1", key: "Sign in", prefilledKey: "Sign in" });
    const regenerated = pendingPrefills([keyed], { ...CONFIG, variableCasing: "camelCase" });
    expect(regenerated).toEqual([{ id: "1:1", key: "signIn", ns: "" }]);
  });

  it("preserves a manual edit when the style changes (the reported bug)", () => {
    const node = makeNode({ id: "1:1" });
    const [applied] = pendingPrefills([node], CONFIG); // auto-generated "Sign in", marker set
    // User hand-edits the key; the marker still holds the old auto value.
    const edited = makeNode({ id: "1:1", key: "my.custom", prefilledKey: applied?.key });
    // Changing the format must NOT overwrite the manual edit…
    expect(pendingPrefills([edited], { ...CONFIG, keyFormat: "{elementName}" })).toEqual([]);
    // …nor a casing change.
    expect(pendingPrefills([edited], { ...CONFIG, variableCasing: "camelCase" })).toEqual([]);
  });

  it("toggling prefill off is inert; re-enabling with a NEW format regenerates", () => {
    const node = makeNode({ id: "1:1" });
    const [applied] = pendingPrefills([node], CONFIG);
    // Auto key: key still equals the marker we generated.
    const keyed = makeNode({ id: "1:1", key: applied?.key, prefilledKey: applied?.key });
    expect(pendingPrefills([keyed], { prefillKeyFormat: false })).toEqual([]);
    expect(pendingPrefills([keyed], { ...CONFIG, keyFormat: "{elementName}" })).toEqual([
      { id: "1:1", key: "Layer", ns: "" },
    ]);
  });

  it("finding 65 round-trip: prefill-off clears the key (main), re-enabling regenerates it", () => {
    // While on, the key is generated + persisted. Turning prefill off clears
    // the persisted key on the main thread (clearPrefilledKeys). Re-enabling
    // with the same format regenerates it — no session-memory reset needed,
    // because an empty key always regenerates.
    const node = makeNode({ id: "1:1" });
    expect(pendingPrefills([node], CONFIG)[0]?.key).toBe("Sign in"); // generated + settled
    const cleared = makeNode({ id: "1:1", key: "" }); // main thread cleared it on prefill-off
    expect(pendingPrefills([cleared], CONFIG)).toEqual([{ id: "1:1", key: "Sign in", ns: "" }]);
  });

  it("waits for parent names before regenerating an auto key from a parent-based format", () => {
    // Auto key (equals the marker) so a format change is allowed to reflow it.
    const node = makeNode({ id: "1:1", key: "old", prefilledKey: "old" });
    pendingPrefills([node], CONFIG); // decided under {elementText}
    const parentConfig = { ...CONFIG, keyFormat: "{frame}.{elementName}" };
    // Stale snapshot (scan under the old format resolved no ancestors) —
    // generating now would persist a partial key. Stay undecided instead.
    expect(pendingPrefills([node], parentConfig)).toEqual([]);
    // Re-scan delivered the frame → full key generated.
    const withParents = makeNode({ id: "1:1", key: "old", prefilledKey: "old", frame: "Login" });
    expect(pendingPrefills([withParents], parentConfig)).toEqual([
      { id: "1:1", key: "Login.Layer", ns: "" },
    ]);
  });
});
