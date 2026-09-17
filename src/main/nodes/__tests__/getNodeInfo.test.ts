import { describe, expect, it } from "vitest";

import { TOLGEE_NODE_INFO } from "$shared/constants";
import { getNodeInfo, setNodeInfo } from "$main/nodes/getNodeInfo";

/** Minimal TEXT-node stand-in with live pluginData. */
function makeTextNode(id = "1:1") {
  const store = new Map<string, string>();
  return {
    id,
    name: `Layer ${id}`,
    characters: "Hello",
    visible: true,
    getPluginData: (key: string) => store.get(key) ?? "",
    setPluginData: (key: string, value: string) => {
      store.set(key, value);
    },
  } as unknown as TextNode;
}

describe("getNodeInfo / setNodeInfo — prefilledKey provenance marker", () => {
  it("persists prefilledKey and reads it back", () => {
    const node = makeTextNode();
    setNodeInfo(node, { key: "auto.key", prefilledKey: "auto.key", connected: false });
    expect(getNodeInfo(node).prefilledKey).toBe("auto.key");
    expect(getNodeInfo(node).key).toBe("auto.key");
  });

  it("a manual key edit keeps the STALE marker (key diverges from prefilledKey)", () => {
    const node = makeTextNode();
    // Prefill wrote an auto key + marker…
    setNodeInfo(node, { key: "auto.key", prefilledKey: "auto.key", connected: false });
    // …then a manual edit changes only the key (no prefilledKey in the patch).
    setNodeInfo(node, { key: "my.custom.key" });

    const info = getNodeInfo(node);
    expect(info.key).toBe("my.custom.key");
    // Marker unchanged → key !== prefilledKey → clearPrefilledKeys preserves it.
    expect(info.prefilledKey).toBe("auto.key");
  });

  it("a format regeneration updates both key and marker together", () => {
    const node = makeTextNode();
    setNodeInfo(node, { key: "old", prefilledKey: "old", connected: false });
    // Prefill regenerates under a new format: writes the new value to both.
    setNodeInfo(node, { key: "new", prefilledKey: "new" });

    const info = getNodeInfo(node);
    expect(info.key).toBe("new");
    expect(info.prefilledKey).toBe("new"); // stays in sync → still clearable
  });

  it("leaves prefilledKey undefined for a plain manual node", () => {
    const node = makeTextNode();
    setNodeInfo(node, { key: "hand.typed", connected: false });
    expect(getNodeInfo(node).prefilledKey).toBeUndefined();
  });
});

describe("setNodeInfo — merge semantics", () => {
  it("preserves persisted fields that the patch omits", () => {
    const node = makeTextNode();
    setNodeInfo(node, { key: "k", ns: "common", translation: "Hi {name}" });
    // A patch that touches only the key must not wipe ns / translation.
    setNodeInfo(node, { key: "k2" });

    const info = getNodeInfo(node);
    expect(info.key).toBe("k2");
    expect(info.ns).toBe("common");
    expect(info.translation).toBe("Hi {name}");
  });

  it("clears `ns` only on an explicit `ns: undefined`, not on omission", () => {
    const node = makeTextNode();
    setNodeInfo(node, { key: "k", ns: "common" });

    setNodeInfo(node, { key: "k" }); // ns omitted → kept
    expect(getNodeInfo(node).ns).toBe("common");

    setNodeInfo(node, { ns: undefined }); // ns present-but-undefined → cleared
    expect(getNodeInfo(node).ns).toBeUndefined();
  });

  it("uses presence (not nullishness) for paramsValues and pluralParamValue", () => {
    const node = makeTextNode();
    setNodeInfo(node, { paramsValues: { name: "World" }, pluralParamValue: "3" });

    setNodeInfo(node, { key: "k" }); // both omitted → kept
    let info = getNodeInfo(node);
    expect(info.paramsValues).toEqual({ name: "World" });
    expect(info.pluralParamValue).toBe("3");

    setNodeInfo(node, { paramsValues: undefined, pluralParamValue: undefined }); // cleared
    info = getNodeInfo(node);
    expect(info.paramsValues).toBeUndefined();
    expect(info.pluralParamValue).toBeUndefined();
  });

  it("can clear the key to an empty string", () => {
    const node = makeTextNode();
    setNodeInfo(node, { key: "was.set" });
    setNodeInfo(node, { key: "" });
    expect(getNodeInfo(node).key).toBe("");
  });

  it("coerces connected / isPlural to booleans and defaults them to false", () => {
    const node = makeTextNode();
    const info = setNodeInfo(node, { key: "k" });
    expect(info.connected).toBe(false);
    expect(info.isPlural).toBe(false);

    const info2 = setNodeInfo(node, { connected: true, isPlural: true });
    expect(info2.connected).toBe(true);
    expect(info2.isPlural).toBe(true);
  });

  it("strips undefined values so the stored payload round-trips cleanly", () => {
    const node = makeTextNode();
    setNodeInfo(node, { key: "k", ns: undefined, pluralParamValue: undefined });
    const raw = node.getPluginData(TOLGEE_NODE_INFO);
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect("ns" in parsed).toBe(false);
    expect("pluralParamValue" in parsed).toBe(false);
    expect(parsed.key).toBe("k");
  });
});

describe("getNodeInfo — defensive read", () => {
  it("reads shape-stable defaults from invalid plugin-data JSON", () => {
    const node = makeTextNode();
    node.setPluginData(TOLGEE_NODE_INFO, "{ not valid json");

    const info = getNodeInfo(node);
    expect(info.key).toBe("");
    expect(info.translation).toBe("");
    expect(info.connected).toBe(false);
    expect(info.isPlural).toBe(false);
    expect(info.ns).toBeUndefined();
  });
});
