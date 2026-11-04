import { describe, expect, it } from "vitest";

import { getNodeInfo, setNodeInfo } from "$main/nodes/getNodeInfo";
import { disconnectedInfo } from "$ui/lib/logic/disconnect";
import { hasManualChange, isAdvancedString } from "$ui/lib/logic/manualChange";

/** Minimal TEXT-node stand-in with live pluginData and editable canvas text. */
function makeTextNode(characters: string) {
  const store = new Map<string, string>();
  return {
    id: "1:1",
    name: "Layer",
    characters,
    visible: true,
    getPluginData: (key: string) => store.get(key) ?? "",
    setPluginData: (key: string, value: string) => {
      store.set(key, value);
    },
  } as unknown as TextNode & { characters: string };
}

/** What `set-nodes-data` does to the patch on its way to the main thread. */
const overTheBus = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

describe("disconnectedInfo", () => {
  it("leaves a formerly formatted string plain, so a canvas edit is no conflict", () => {
    // Customer case: a connected `Test {value}` string was duplicated with its
    // frame, the copy disconnected, then its text edited in Figma. The old
    // disconnect kept the ICU + samples, so the copy still counted as an
    // ADVANCED string: red "edited in Figma" warning, and a later push would
    // have sent the stale `Test {value}` instead of the designer's text.
    const node = makeTextNode("Test Babeta");
    setNodeInfo(node, {
      key: "greeting",
      ns: "web",
      connected: true,
      translation: "Test {value}",
      paramsValues: { value: "Babeta" },
    });

    setNodeInfo(node, overTheBus(disconnectedInfo()));
    node.characters = "Test change Babeta";

    const info = getNodeInfo(node);
    expect(info).toMatchObject({ key: "", ns: "", connected: false, translation: "", isPlural: false });
    expect(isAdvancedString(info)).toBe(false);
    expect(hasManualChange(info, "en")).toBe(false);
  });

  it("drops the plural flag and its sample count too", () => {
    const node = makeTextNode("3 women");
    setNodeInfo(node, {
      key: "women",
      connected: true,
      isPlural: true,
      translation: "{value, plural, one {# woman} other {# women}}",
      pluralParamValue: "3",
      paramsValues: { value: "3" },
    });

    setNodeInfo(node, overTheBus(disconnectedInfo()));

    const info = getNodeInfo(node);
    expect(info.isPlural).toBe(false);
    expect(info.pluralParamValue ?? "").toBe("");
    expect(Object.keys(info.paramsValues ?? {})).toHaveLength(0);
    expect(isAdvancedString(info)).toBe(false);
  });

  it("returns a fresh object each call (callers may spread or mutate it)", () => {
    expect(disconnectedInfo()).not.toBe(disconnectedInfo());
  });
});
