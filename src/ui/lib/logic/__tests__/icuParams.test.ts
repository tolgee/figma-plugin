import type { NodeInfo } from "$shared/types";
import { extractParamNames, hasRichFormat } from "$ui/lib/logic/icuParams";
import { describe, expect, it } from "vitest";

describe("extractParamNames", () => {
  it("returns named parameters in order", () => {
    expect(extractParamNames("Hi {name}")).toEqual(["name"]);
    expect(extractParamNames("{firstName} {lastName}")).toEqual(["firstName", "lastName"]);
  });

  it("keeps params that carry a non-selector format (e.g. number/date)", () => {
    expect(extractParamNames("You have {count, number} left")).toEqual(["count"]);
    expect(extractParamNames("on {when, date, short}")).toEqual(["when"]);
  });

  it("skips positional/numeric args", () => {
    expect(extractParamNames("{0} then {1}")).toEqual([]);
  });

  it("skips plural and selectordinal selectors — their `#` bodies aren't params", () => {
    expect(extractParamNames("{count, plural, one {# item} other {# items}}")).toEqual([]);
    expect(extractParamNames("{n, selectordinal, one {#st} other {#th}}")).toEqual([]);
  });

  it("skips the `select` selector itself; its word-form variant bodies are a known limitation", () => {
    // The selector `g` is correctly skipped (its tail matches the guard, which
    // also swallows the first variant `{he}`). But `{she}` / `{they}` are plain
    // `{word}` tokens, so this naive regex mis-reads them as parameters.
    // Harmless for the Format badge (a `select` string is "rich" either way);
    // captured here so the edge case is visible, not silently relied upon.
    // Plural/selectordinal avoid it because their bodies start with `#`.
    expect(extractParamNames("{g, select, male {he} female {she} other {they}}")).toEqual([
      "she",
      "they",
    ]);
  });

  it("returns nothing for plain text", () => {
    expect(extractParamNames("Just some words.")).toEqual([]);
  });

  it("collects the fillable param alongside a plural selector", () => {
    // The selector `count` is skipped; the standalone `{name}` is a real value.
    expect(extractParamNames("{name} has {count, plural, one {# msg} other {# msgs}}")).toEqual([
      "name",
    ]);
  });
});

/** Minimal NodeInfo stand-in — only `translation` (and, for the negative
 *  contract test, `characters`) matter to hasRichFormat. */
function node(fields: Partial<NodeInfo>): NodeInfo {
  return fields as NodeInfo;
}

describe("hasRichFormat", () => {
  it("is true when the translation carries a fillable parameter", () => {
    expect(hasRichFormat(node({ translation: "Hi {name}" }))).toBe(true);
  });

  it("is true when the translation carries inline markup", () => {
    expect(hasRichFormat(node({ translation: "This is <b>bold</b>" }))).toBe(true);
    expect(hasRichFormat(node({ translation: "line one<br>line two" }))).toBe(true);
    expect(hasRichFormat(node({ translation: "an <em>emphasis</em>" }))).toBe(true);
  });

  it("is false for plain text", () => {
    expect(hasRichFormat(node({ translation: "Just some words." }))).toBe(false);
  });

  it("is false when there is no translation", () => {
    expect(hasRichFormat(node({}))).toBe(false);
  });

  it("does not mistake a stray `<` comparison for markup", () => {
    expect(hasRichFormat(node({ translation: "keep if a < b and c > d" }))).toBe(false);
  });

  it("is false for a bare plural with no params or markup", () => {
    expect(hasRichFormat(node({ translation: "{count, plural, one {# item} other {# items}}" }))).toBe(
      false,
    );
  });

  it("reads the stored translation, not the rendered characters", () => {
    // `characters` is the canvas text with formatting already applied; the
    // source `{…}` / tags live only on `translation`.
    expect(hasRichFormat(node({ translation: "plain", characters: "<b>rendered</b>" }))).toBe(false);
  });
});
