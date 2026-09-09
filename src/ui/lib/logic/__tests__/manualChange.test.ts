import type { NodeInfo } from "$shared/types";
import { describe, expect, it } from "vitest";
import { hasManualChange, isAdvancedString } from "$ui/lib/logic/manualChange";

const PLURAL = "{value, plural, one {# woman} other {# women}}";

function makeNode(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: "n",
    name: "Layer",
    characters: "",
    translation: "",
    isPlural: false,
    key: "plural-W",
    ns: undefined,
    connected: false,
    ...overrides,
  } as NodeInfo;
}

describe("hasManualChange", () => {
  it("flags an UNCONNECTED plural whose canvas was edited (matches the original)", () => {
    // Regression: the rewrite gated on `connected`, so a locally-created plural
    // edited on canvas ("9 women-" vs the rendered "9 women") showed no warning.
    const node = makeNode({
      isPlural: true,
      connected: false,
      translation: PLURAL,
      pluralParamValue: "9",
      characters: "9 women-",
    });
    expect(hasManualChange(node, "en")).toBe(true);
  });

  it("does NOT flag a plural whose canvas matches its render", () => {
    const node = makeNode({
      isPlural: true,
      connected: false,
      translation: PLURAL,
      pluralParamValue: "9",
      characters: "9 women",
    });
    expect(hasManualChange(node, "en")).toBe(false);
  });

  it("does NOT flag a plain string (only advanced strings can diverge)", () => {
    const node = makeNode({
      connected: true,
      translation: "Hello",
      characters: "Hello, edited",
    });
    expect(hasManualChange(node, "en")).toBe(false);
  });

  it("does NOT flag a node with no stored translation", () => {
    const node = makeNode({ isPlural: true, translation: "", characters: "10 women" });
    expect(hasManualChange(node, "en")).toBe(false);
  });
});

describe("isAdvancedString", () => {
  it("does NOT treat ICU-escaped literal braces as advanced", () => {
    // Regression: the check was a bare `\{[^}]*\}` brace-pair regex. Tolgee
    // stores a plain translation containing literal braces as ICU-escaped text,
    // which has no argument in it — reading it as advanced makes `textOfNode`
    // prefer the stale stored value over the designer's canvas edit, and the
    // Push diff then reports the key as unchanged.
    expect(isAdvancedString(makeNode({ translation: "Use '{'braces'}' here" }))).toBe(false);
    expect(isAdvancedString(makeNode({ translation: "a '{' b" }))).toBe(false);
  });

  it("still treats a real ICU argument as advanced", () => {
    expect(isAdvancedString(makeNode({ translation: "Hello, {name}!" }))).toBe(true);
    expect(isAdvancedString(makeNode({ translation: PLURAL }))).toBe(true);
  });

  it("still treats inline markup as advanced", () => {
    expect(isAdvancedString(makeNode({ translation: "<b>bold</b>" }))).toBe(true);
  });

  it("treats a stray unbalanced brace as plain text, not an argument", () => {
    expect(isAdvancedString(makeNode({ translation: "co{unt" }))).toBe(false);
  });

  it("still honours the isPlural flag and sample params", () => {
    expect(isAdvancedString(makeNode({ isPlural: true, translation: "plain" }))).toBe(true);
    expect(isAdvancedString(makeNode({ translation: "plain", paramsValues: { n: "1" } }))).toBe(
      true,
    );
  });
});
