import { describe, expect, it } from "vitest";
import { shouldIgnoreNode } from "../filter";

function node(
  overrides: Partial<{ characters: string; name: string; visible: boolean }> = {},
): TextNode {
  return {
    characters: overrides.characters ?? "Hello",
    name: overrides.name ?? "Layer",
    visible: overrides.visible ?? true,
    parent: null,
  } as unknown as TextNode;
}

describe("shouldIgnoreNode", () => {
  it("always ignores blank / whitespace, even with Numbers off", () => {
    expect(shouldIgnoreNode(node({ characters: "" }), false, { ignoreNumbers: false })).toBe(true);
    expect(shouldIgnoreNode(node({ characters: "   " }), false, { ignoreNumbers: false })).toBe(true);
  });

  it("ignores pure integers when Numbers is on (default)", () => {
    expect(shouldIgnoreNode(node({ characters: "100" }), false, {})).toBe(true);
    expect(shouldIgnoreNode(node({ characters: "42" }), false, { ignoreNumbers: true })).toBe(true);
  });

  it("KEEPS formatted numbers by default (base is pure-integer only)", () => {
    for (const c of ["1,234.00", "3.14", "+420", "-5", "1 000"]) {
      expect(shouldIgnoreNode(node({ characters: c }), false, { ignoreNumbers: true })).toBe(false);
    }
  });

  it("ignores formatted numbers only when opted in", () => {
    for (const c of ["1,234.00", "3.14", "+420", "-5"]) {
      expect(
        shouldIgnoreNode(node({ characters: c }), false, {
          ignoreNumbers: true,
          ignoreFormattedNumbers: true,
        }),
      ).toBe(true);
    }
  });

  it("keeps strings with letters regardless of the numeric toggles", () => {
    expect(
      shouldIgnoreNode(node({ characters: "12 apples" }), false, {
        ignoreNumbers: true,
        ignoreFormattedNumbers: true,
      }),
    ).toBe(false);
  });

  it("does not ignore numbers when Numbers is off", () => {
    expect(shouldIgnoreNode(node({ characters: "100" }), false, { ignoreNumbers: false })).toBe(false);
  });

  it("defaults the ignore prefix to '_' when the text-layer filter is on without a prefix", () => {
    expect(
      shouldIgnoreNode(node({ name: "_helper", characters: "x" }), false, {
        ignoreTextLayers: true,
      }),
    ).toBe(true);
    expect(
      shouldIgnoreNode(node({ name: "Title", characters: "x" }), false, {
        ignoreTextLayers: true,
      }),
    ).toBe(false);
  });

  it("respects an explicit prefix", () => {
    expect(
      shouldIgnoreNode(node({ name: "//skip", characters: "x" }), false, {
        ignoreTextLayers: true,
        ignorePrefix: "//",
      }),
    ).toBe(true);
  });

  it("prefix filter is inert unless ignoreTextLayers is enabled", () => {
    expect(shouldIgnoreNode(node({ name: "_helper", characters: "x" }), false, {})).toBe(false);
  });
});

describe("shouldIgnoreNode — hidden layers", () => {
  // `ancestorHidden` is the 2nd arg — precomputed during the scan (like the
  // original's threaded flag) rather than by walking parents here.
  it("ignores a self-hidden node when Hidden layers is on (default)", () => {
    expect(shouldIgnoreNode(node({ visible: false }), false, {})).toBe(true);
  });

  it("keeps a self-hidden node when Hidden layers is off", () => {
    expect(shouldIgnoreNode(node({ visible: false }), false, { ignoreHiddenLayers: false })).toBe(
      false,
    );
  });

  it("keeps a VISIBLE text inside a hidden subtree unless 'including children' is on", () => {
    expect(shouldIgnoreNode(node(), true, { ignoreHiddenLayers: true })).toBe(false);
    expect(
      shouldIgnoreNode(node(), true, {
        ignoreHiddenLayers: true,
        ignoreHiddenLayersIncludingChildren: true,
      }),
    ).toBe(true);
  });

  it("does NOT apply 'including children' when Hidden layers is off (gated, like the original)", () => {
    expect(
      shouldIgnoreNode(node(), true, {
        ignoreHiddenLayers: false,
        ignoreHiddenLayersIncludingChildren: true,
      }),
    ).toBe(false);
  });

  it("keeps a visible text that is not in a hidden subtree", () => {
    expect(
      shouldIgnoreNode(node(), false, {
        ignoreHiddenLayers: true,
        ignoreHiddenLayersIncludingChildren: true,
      }),
    ).toBe(false);
  });
});
