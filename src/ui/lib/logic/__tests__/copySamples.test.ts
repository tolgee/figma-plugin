import { describe, expect, it } from "vitest";

import type { NodeInfo } from "$shared/types";
import { buildSampleUpdates, invalidSample, sameKey, sampleFields } from "../copySamples";

function node(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: "n1",
    name: "Text",
    characters: "Hello, Zuzko",
    translation: "Hello, {name}",
    isPlural: false,
    key: "key.hello.name",
    ns: undefined,
    connected: true,
    paramsValues: { name: "Zuzko" },
    ...overrides,
  };
}

describe("sampleFields", () => {
  it("lists the named params of a connected string with their current values", () => {
    expect(sampleFields(node())).toEqual([{ name: "name", value: "Zuzko", plural: false }]);
  });

  it("puts the plural count first, read from paramsValues or the legacy pluralParamValue", () => {
    const plural = node({
      translation: "{count, plural, one {# dog} other {# dogs}}",
      isPlural: true,
      paramsValues: {},
      pluralParamValue: "3",
    });
    expect(sampleFields(plural)).toEqual([{ name: "count", value: "3", plural: true }]);
  });

  it("is empty for plain strings and for unconnected ones", () => {
    expect(sampleFields(node({ translation: "Hello", paramsValues: {} }))).toEqual([]);
    expect(sampleFields(node({ connected: false }))).toEqual([]);
  });
});

describe("invalidSample", () => {
  it("requires a number for the plural count only", () => {
    expect(invalidSample({ name: "count", value: "1", plural: true }, "abc")).toBe("Use a number");
    expect(invalidSample({ name: "count", value: "1", plural: true }, "12")).toBeNull();
    expect(invalidSample({ name: "name", value: "", plural: false }, "anything")).toBeNull();
  });
});

describe("buildSampleUpdates", () => {
  it("re-renders every target from its own translation and stores the values like String details", () => {
    const a = node({ id: "a" });
    const b = node({ id: "b", translation: "Hi {name}!" });
    const { updates, failed } = buildSampleUpdates([a, b], { name: "John" }, "en");
    expect(failed).toBe(0);
    expect(updates).toEqual([
      {
        id: "a",
        text: "Hello, John",
        translation: "Hello, {name}",
        isPlural: false,
        pluralParamValue: undefined,
        paramsValues: { name: "John" },
      },
      {
        id: "b",
        text: "Hi John!",
        translation: "Hi {name}!",
        isPlural: false,
        pluralParamValue: undefined,
        paramsValues: { name: "John" },
      },
    ]);
  });

  it("stores a plural count in both paramsValues and pluralParamValue", () => {
    const plural = node({
      translation: "{count, plural, one {# dog} other {# dogs}}",
      isPlural: true,
      paramsValues: {},
    });
    const [u] = buildSampleUpdates([plural], { count: "5" }, "en").updates;
    expect(u?.text).toBe("5 dogs");
    expect(u?.pluralParamValue).toBe("5");
    expect(u?.paramsValues).toEqual({ count: "5" });
  });

  it("skips (and counts) a target whose translation can't be rendered", () => {
    const broken = node({ id: "x", translation: "Hello {name" });
    const { updates, failed } = buildSampleUpdates([broken, node()], { name: "John" }, "en");
    expect(failed).toBe(1);
    expect(updates.map((u) => u.id)).toEqual(["n1"]);
  });
});

describe("sameKey", () => {
  it("matches namespace + key, treating no namespace as empty", () => {
    expect(sameKey({ key: "k", ns: undefined }, { key: "k", ns: "" })).toBe(true);
    expect(sameKey({ key: "k", ns: "a" }, { key: "k", ns: "b" })).toBe(false);
  });
});
