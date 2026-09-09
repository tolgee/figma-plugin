import type { NodeInfo } from "$shared/types";
import { describe, expect, it } from "vitest";
import {
  inferPluralCount,
  interpolatedText,
  isSimpleNode,
  renderIcuForNode,
  renderParams,
  translationDiffersFromNode,
} from "$shared/interpolate";

const PLURAL = "{count, plural, one {# item} other {# items}}";

function makeNode(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: "n",
    name: "Layer",
    characters: "",
    translation: "",
    isPlural: false,
    key: "k",
    ns: undefined,
    connected: true,
    ...overrides,
  } as NodeInfo;
}

describe("renderIcuForNode", () => {
  it("renders a plural with the count from a numeric pluralParamValue", () => {
    const node = makeNode({ isPlural: true, pluralParamValue: "10" });
    expect(renderIcuForNode(PLURAL, node, "en").text).toBe("10 items");
  });

  it("prefers a named sample in paramsValues over pluralParamValue", () => {
    const node = makeNode({ isPlural: true, pluralParamValue: "10", paramsValues: { count: "1" } });
    expect(renderIcuForNode(PLURAL, node, "en").text).toBe("1 item");
  });

  it("defaults the count to 1 and never injects a non-numeric value", () => {
    const node = makeNode({ isPlural: true, pluralParamValue: "value" });
    expect(renderIcuForNode(PLURAL, node, "en").text).toBe("1 item");
  });

  it("returns the raw text and an error on malformed ICU", () => {
    const node = makeNode({ paramsValues: { name: "x" } });
    const out = renderIcuForNode("Hello {name", node, "en");
    expect(out.text).toBe("Hello {name");
    expect(out.error).toBeInstanceOf(Error);
  });

  it("overrides a NON-NUMERIC plural sample instead of rendering NaN", () => {
    // Old node data can carry the plural arg's NAME as its own sample
    // (paramsValues: {value: "value"}) — IntlMessageFormat doesn't throw on
    // that, it silently coerces to NaN ("Mám NaN jablek" on canvas). The
    // numeric fallback chain must kick in: pluralParamValue, then "1".
    const CS =
      "{value, plural, one {Mám # jablko} few {Mám # jablka} many {Mám # jablka} other {Mám # jablek}}";
    const poisoned = makeNode({ paramsValues: { value: "value" }, pluralParamValue: "9" });
    expect(renderIcuForNode(CS, poisoned, "cs").text).toBe("Mám 9 jablek");

    const emptySample = makeNode({ paramsValues: { value: "" } });
    expect(renderIcuForNode(CS, emptySample, "cs").text).toBe("Mám 1 jablko");
  });

  it("renders a plural even when isPlural is false — the ICU's own structure wins", () => {
    // Real-world case: Tolgee's key-level "isPlural" setting disagreed with
    // the translation's actual ICU shape (typed as a plural without the key
    // ever being marked plural). Trusting the flag meant no sample was ever
    // seeded, IntlMessageFormat threw on the missing argument, and the whole
    // raw pattern landed on the canvas verbatim instead of rendering.
    const node = makeNode({ isPlural: false, pluralParamValue: "9" });
    const out = renderIcuForNode(
      "{value, plural, one {J'ai # pomme} many {J'ai # pommes} other {J'ai # pommes}}",
      node,
      "fr",
    );
    expect(out.error).toBeUndefined();
    expect(out.text).toBe("J'ai 9 pommes");
  });
});

describe("isSimpleNode", () => {
  it("is true for a plain string with no params/markup", () => {
    expect(isSimpleNode(makeNode({ translation: "Hello" }))).toBe(true);
  });
  it("is false for a plural / params / markup", () => {
    expect(isSimpleNode(makeNode({ isPlural: true }))).toBe(false);
    expect(isSimpleNode(makeNode({ paramsValues: { a: "1" } }))).toBe(false);
    expect(isSimpleNode(makeNode({ translation: "<b>Hi</b>" }))).toBe(false);
  });
});

describe("translationDiffersFromNode (manual change)", () => {
  it("flags a plural whose canvas was edited away from its rendered form", () => {
    const node = makeNode({
      isPlural: true,
      translation: PLURAL,
      pluralParamValue: "10",
      characters: "10 kittens", // edited on canvas, should be "10 items"
    });
    expect(translationDiffersFromNode(node, "en")).toBe(true);
  });

  it("does NOT flag a plural whose canvas matches its rendered form", () => {
    const node = makeNode({
      isPlural: true,
      translation: PLURAL,
      pluralParamValue: "10",
      characters: "10 items",
    });
    expect(translationDiffersFromNode(node, "en")).toBe(false);
  });

  it("does NOT flag a simple (plain) string", () => {
    const node = makeNode({ translation: "Hello", characters: "Hello, world (edited)" });
    expect(translationDiffersFromNode(node, "en")).toBe(false);
  });

  it("ignores inline markup when comparing", () => {
    const node = makeNode({ translation: "<b>Hi</b>", characters: "Hi" });
    expect(translationDiffersFromNode(node, "en")).toBe(false);
  });
});

describe("inferPluralCount", () => {
  it("finds the count that renders the canvas form", () => {
    expect(inferPluralCount(PLURAL, "5 items", "en")).toBe("5");
    expect(inferPluralCount(PLURAL, "1 item", "en")).toBe("1");
  });
  it("returns undefined when nothing matches or it isn't a plural", () => {
    expect(inferPluralCount(PLURAL, "totally different", "en")).toBeUndefined();
    expect(inferPluralCount("Just a string", "Just a string", "en")).toBeUndefined();
  });
});

describe("interpolatedText", () => {
  it("renders the stored translation for an advanced node", () => {
    const node = makeNode({ isPlural: true, translation: PLURAL, pluralParamValue: "2" });
    expect(interpolatedText(node, "en").text).toBe("2 items");
  });
  it("uses raw characters for a simple node", () => {
    const node = makeNode({ translation: "Hello", characters: "Hello" });
    expect(interpolatedText(node, "en").text).toBe("Hello");
  });
});

describe("plural embedded in surrounding text", () => {
  // Regression: the plural NAME used to come from `getTolgeeFormat`, which only
  // recognises a plural that is the WHOLE string. A plural with any literal
  // text around it — a very ordinary shape — left `count` unseeded, so
  // `IntlMessageFormat` threw MISSING_VALUE: the node was dropped in
  // `copyApply` and Pull kept the stale canvas text.
  const TRAILING = "{count, plural, one {# day} other {# days}} left";
  const LEADING = "Only {count, plural, one {# day} other {# days}}";

  it("renders a plural followed by literal text", () => {
    const node = makeNode({ isPlural: true, pluralParamValue: "10" });
    const out = renderIcuForNode(TRAILING, node, "en");
    expect(out.error).toBeUndefined();
    expect(out.text).toBe("10 days left");
  });

  it("renders a plural preceded by literal text", () => {
    const node = makeNode({ isPlural: true, pluralParamValue: "1" });
    const out = renderIcuForNode(LEADING, node, "en");
    expect(out.error).toBeUndefined();
    expect(out.text).toBe("Only 1 day");
  });

  it("renders a plural nested inside a select — BOTH arguments get seeded", () => {
    // This used to be asserted on the params alone, because the outer
    // `select`'s own `gender` argument was invisible to the placeholder regex
    // (no bounded `[^{}]*` tail when the body holds braces) and the full
    // render therefore threw MISSING_VALUE on it. Both are seeded now.
    const icu = "{gender, select, other {{count, plural, one {# reply} other {# replies}}}}";
    const node = makeNode({ isPlural: true, pluralParamValue: "5" });

    const params = renderParams(icu, node);
    expect(params.count).toBe("5");
    expect(params.gender).toBe("gender");

    const out = renderIcuForNode(icu, node, "en");
    expect(out.error).toBeUndefined();
    expect(out.text).toBe("5 replies");
  });

  it("seeds a plain select so it renders instead of throwing", () => {
    const icu = "{gender, select, female {her} male {his} other {their}} bag";
    const node = makeNode({ paramsValues: { gender: "female" } });

    const out = renderIcuForNode(icu, node, "en");
    expect(out.error).toBeUndefined();
    expect(out.text).toBe("her bag");
  });

  it("does not treat an ICU-escaped brace as a plural argument", () => {
    // `'{'count, plural…` is literal text, not an argument — seeding a sample
    // for it would be inventing a parameter that isn't there.
    const node = makeNode({ isPlural: false });
    const out = renderIcuForNode("literal '{'count, plural'}' here", node, "en");
    expect(out.error).toBeUndefined();
    expect(out.text).toBe("literal {count, plural} here");
  });

  it("infers the sample count for an embedded plural too", () => {
    expect(inferPluralCount(TRAILING, "3 days left", "en")).toBe("3");
    expect(inferPluralCount(TRAILING, "1 day left", "en")).toBe("1");
  });
});
