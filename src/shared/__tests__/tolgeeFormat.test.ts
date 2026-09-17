import {
  findArgumentNames,
  findPluralParameters,
  getTolgeeFormat,
  hasIcuArgument,
  tolgeeFormatGenerateIcu,
} from "$shared/tolgeeFormat";
import IntlMessageFormat from "intl-messageformat";
import { describe, expect, it } from "vitest";

/**
 * The whole point of `tolgeeFormatGenerateIcu`'s bug fixes is that the ICU it
 * produces must be ACCEPTED (parsed and formatted) by `intl-messageformat` —
 * the same library every render path in this app uses (`src/shared/icu.ts`).
 * Assert that directly instead of just checking the string shape.
 */
function expectValidIcu(icu: string): void {
  expect(() => {
    if (icu === "") return; // empty string is a valid "no message" sentinel, not ICU
    const formatter = new IntlMessageFormat(icu, "en", undefined, { ignoreTag: true });
    formatter.format({ value: 1, p: 1, count: 1, name: "x" });
  }).not.toThrow();
}

describe("getTolgeeFormat (non-plural)", () => {
  it("wraps plain text as the `other` variant", () => {
    expect(getTolgeeFormat("Hello", false, false)).toEqual({
      variants: { other: "Hello" },
    });
  });

  it("does not parse ICU when plural=false, even if the text looks like one", () => {
    const input = "{count, plural, one {one item} other {# items}}";
    expect(getTolgeeFormat(input, false, false)).toEqual({
      variants: { other: input },
    });
  });

  it("preserves empty strings", () => {
    expect(getTolgeeFormat("", false, false)).toEqual({
      variants: { other: "" },
    });
  });
});

describe("getTolgeeFormat (plural)", () => {
  it("parses a basic plural form", () => {
    const result = getTolgeeFormat("{count, plural, one {one item} other {# items}}", true, false);
    expect(result.parameter).toBe("count");
    expect(result.variants.one).toBe("one item");
    expect(result.variants.other).toBe("# items");
  });

  it("parses `=0` style match keys", () => {
    const result = getTolgeeFormat(
      "{count, plural, =0 {no items} one {one item} other {many}}",
      true,
      false,
    );
    expect(result.parameter).toBe("count");
    expect(result.variants["=0"]).toBe("no items");
    expect(result.variants.one).toBe("one item");
    expect(result.variants.other).toBe("many");
  });

  it("handles whitespace between the param, keyword, and variants", () => {
    const result = getTolgeeFormat(
      "{ value , plural , other {# tests} one {# test} }",
      true,
      false,
    );
    expect(result.parameter).toBe("value");
    expect(result.variants.other).toBe("# tests");
    expect(result.variants.one).toBe("# test");
  });

  it("respects ICU `'` escaped braces inside variant bodies", () => {
    // The variant body contains a literal `{` via `'{'`. The closing brace of
    // the variant should be the one AFTER the literal, not the one inside.
    const input = "{variable, plural, one {'{'} other {}}";
    const result = getTolgeeFormat(input, true, false);
    expect(result.parameter).toBe("variable");
    // Body returned RAW (no unescape).
    expect(result.variants.one).toBe("'{'");
    expect(result.variants.other).toBe("");
  });

  it("falls back to no-plural when the input is malformed", () => {
    const malformed = "not an icu plural";
    expect(getTolgeeFormat(malformed, true, false)).toEqual({
      variants: { other: malformed },
    });
  });

  it("falls back when the select function is not `plural`", () => {
    const input = "{gender, select, female {she} male {he} other {they}}";
    const result = getTolgeeFormat(input, true, false);
    expect(result.variants.other).toBe(input);
    expect(result.parameter).toBeUndefined();
  });

  it("falls back when input has trailing content past the outer brace", () => {
    const input = "{count, plural, other {x}} trailing";
    const result = getTolgeeFormat(input, true, false);
    expect(result.variants.other).toBe(input);
    expect(result.parameter).toBeUndefined();
  });

  it("falls back when a variant name is empty", () => {
    const input = "{count, plural, {x}}";
    const result = getTolgeeFormat(input, true, false);
    expect(result.variants.other).toBe(input);
    expect(result.parameter).toBeUndefined();
  });

  it("normalizes equivalent ICU forms to the same shape (whitespace agnostic)", () => {
    const a = getTolgeeFormat("{count, plural, one {x} other {y}}", true, false);
    const b = getTolgeeFormat("{ count ,plural,one {x}    other {y} }", true, false);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("falls back when a variant name repeats", () => {
    const input = "{count, plural, one {x} one {y} other {z}}";
    const result = getTolgeeFormat(input, true, false);
    expect(result.variants.other).toBe(input);
    expect(result.parameter).toBeUndefined();
  });
});

describe("tolgeeFormatGenerateIcu", () => {
  it("keeps the normal two-category case byte-identical (golden case)", () => {
    const icu = tolgeeFormatGenerateIcu(
      { parameter: "value", variants: { one: "# day", other: "# days" } },
      false,
    );
    expect(icu).toBe("{value, plural, one {# day} other {# days}}");
    expectValidIcu(icu);
  });

  it("escapes a literal `{` in a variant body and still parses", () => {
    const icu = tolgeeFormatGenerateIcu(
      { parameter: "value", variants: { one: "co{unt", other: "items" } },
      false,
    );
    // Exact reference output from the real `@tginternal/editor@1.15.2` package.
    expect(icu).toBe("{value, plural, one {co'{'unt} other {items}}");
    expectValidIcu(icu);
  });

  it("escapes a literal `}` in a variant body and still parses", () => {
    const icu = tolgeeFormatGenerateIcu(
      { parameter: "value", variants: { one: "wrong}brace", other: "ok" } },
      false,
    );
    expect(icu).toBe("{value, plural, one {wrong'}'brace} other {ok}}");
    expectValidIcu(icu);
  });

  it("force-appends `other {}` when `other` is absent, and the result parses", () => {
    const icu = tolgeeFormatGenerateIcu({ parameter: "value", variants: { one: "# day" } }, false);
    // Exact reference output from the real `@tginternal/editor@1.15.2` package.
    expect(icu).toBe("{value, plural, one {# day} other {}}");
    expectValidIcu(icu);
  });

  it("mirrors `makePluralFromNumber`'s single-category auto-plural (StringDetails.svelte) and it must parse", () => {
    // This is exactly the shape `makePluralFromNumber()` builds: one detected
    // CLDR category, no `other`. Before the fix this produced ICU with no
    // `other` fallback, which `IntlMessageFormat` rejects outright.
    const icu = tolgeeFormatGenerateIcu({ parameter: "value", variants: { one: "# item" } }, false);
    expect(icu).toContain("other {}");
    expectValidIcu(icu);
  });

  it("returns \"\" when every variant body is empty", () => {
    expect(tolgeeFormatGenerateIcu({ parameter: "value", variants: { one: "", other: "" } }, false)).toBe(
      "",
    );
    expect(tolgeeFormatGenerateIcu({ parameter: "value", variants: {} }, false)).toBe("");
  });

  it("does NOT collapse to \"\" when a variant body is whitespace-only (matches reference: only exactly-empty strings count)", () => {
    const icu = tolgeeFormatGenerateIcu(
      { parameter: "value", variants: { one: "   ", other: "" } },
      false,
    );
    // Exact reference output from the real `@tginternal/editor@1.15.2` package.
    expect(icu).toBe("{value, plural, one {   } other {}}");
    expectValidIcu(icu);
  });

  it("leaves the non-plural passthrough (no parameter) untouched", () => {
    expect(tolgeeFormatGenerateIcu({ variants: { other: "plain text" } }, false)).toBe("plain text");
    expect(tolgeeFormatGenerateIcu({ variants: {} }, false)).toBe("");
  });
});

describe("tolgeeFormatGenerateIcu — literal vs. argument braces", () => {
  it("keeps a nested `{name}` argument interpolating instead of escaping it to text", () => {
    // Regression: the generator used to escape EVERY brace, so a legitimate
    // nested argument became literal text — and, because Push regenerates the
    // whole ICU through this path when merging plural layers, it was uploaded
    // in that corrupted form.
    const icu = tolgeeFormatGenerateIcu(
      { parameter: "count", variants: { one: "One for {name}", other: "# for {name}" } },
      false,
    );
    expect(icu).toBe("{count, plural, one {One for {name}} other {# for {name}}}");
    expectValidIcu(icu);

    const rendered = new IntlMessageFormat(icu, "en", undefined, { ignoreTag: true }).format({
      count: 1,
      name: "Zuzka",
    });
    expect(rendered).toBe("One for Zuzka");
  });

  it("does not re-escape a brace that is already ICU-escaped", () => {
    // Regression: `a '{' b` used to round-trip to `a ''{'' b` — a literal
    // apostrophe followed by an unclosed argument, which throws downstream.
    const icu = tolgeeFormatGenerateIcu(
      { parameter: "value", variants: { one: "a '{' b", other: "ok" } },
      false,
    );
    expect(icu).toBe("{value, plural, one {a '{' b} other {ok}}");
    expectValidIcu(icu);

    const rendered = new IntlMessageFormat(icu, "en", undefined, { ignoreTag: true }).format({
      value: 1,
    });
    expect(rendered).toBe("a { b");
  });

  it("still escapes prose that merely sits between braces", () => {
    // `{not an argument}` is not a valid ICU argument (the name would have to
    // be one unbroken token), so it must keep being escaped to literal text.
    const icu = tolgeeFormatGenerateIcu(
      { parameter: "value", variants: { one: "{not an argument}", other: "ok" } },
      false,
    );
    expect(icu).toBe("{value, plural, one {'{'not an argument'}'} other {ok}}");
    expectValidIcu(icu);
  });

  it("round-trips a variant body through parse → generate unchanged", () => {
    // The property that actually matters for Push: parsing an ICU string and
    // regenerating it must not alter it, or a no-op edit reads as a change.
    const original = "{count, plural, one {One for {name}} other {# for {name}}}";
    const parsed = getTolgeeFormat(original, true, false);
    expect(tolgeeFormatGenerateIcu(parsed, false)).toBe(original);
  });
});

describe("findPluralParameters", () => {
  it("finds a plural that is the whole string", () => {
    expect(findPluralParameters("{count, plural, one {# day} other {# days}}")).toEqual(["count"]);
  });

  it("finds a plural surrounded by literal text", () => {
    expect(findPluralParameters("{count, plural, one {# day} other {# days}} left")).toEqual([
      "count",
    ]);
    expect(findPluralParameters("Only {n, plural, other {# x}}!")).toEqual(["n"]);
  });

  it("finds a plural nested inside another argument", () => {
    expect(
      findPluralParameters("{gender, select, other {{count, plural, other {# replies}}}}"),
    ).toEqual(["count"]);
  });

  it("ignores a non-plural argument and an escaped literal brace", () => {
    expect(findPluralParameters("Hello, {name}!")).toEqual([]);
    expect(findPluralParameters("literal '{'count, plural'}'")).toEqual([]);
  });

  it("leaves getTolgeeFormat's stricter whole-string semantics alone", () => {
    // The two answer different questions on purpose: push diffing needs "is
    // this string ONE plural form?", which must stay false here, while the
    // render path needs "is there a plural anywhere in it?".
    const embedded = "{count, plural, one {# day} other {# days}} left";
    expect(getTolgeeFormat(embedded, true, false).parameter).toBeUndefined();
    expect(findPluralParameters(embedded)).toEqual(["count"]);
  });
});

describe("hasIcuArgument", () => {
  it("is true for a real argument", () => {
    expect(hasIcuArgument("Hello, {name}!")).toBe(true);
    expect(hasIcuArgument("{count, plural, one {# day} other {# days}}")).toBe(true);
    expect(hasIcuArgument("{count, plural, other {# days}} left")).toBe(true);
  });

  it("is false for ICU-escaped literal braces", () => {
    expect(hasIcuArgument("Use '{'braces'}' here")).toBe(false);
    expect(hasIcuArgument("a '{' b")).toBe(false);
  });

  it("is false for stray or prose braces", () => {
    expect(hasIcuArgument("co{unt")).toBe(false);
    expect(hasIcuArgument("wrong}brace")).toBe(false);
    expect(hasIcuArgument("{not an argument}")).toBe(false);
  });

  it("is false for plain text", () => {
    expect(hasIcuArgument("")).toBe(false);
    expect(hasIcuArgument("just words")).toBe(false);
  });
});

describe("round-trip of ICU written by the PUBLISHED plugin", () => {
  // The property that decides whether a user migrating from the published
  // plugin gets phantom "changed" keys: parsing what that plugin stored and
  // regenerating it must return the identical string, or Push reports a
  // difference nobody made. `mergePluralForms` regenerates on every plural key
  // with more than one layer, so this is not a rare path.
  //
  // Values below are the real output of `@tginternal/editor@1.15.2`, captured
  // by running the package (it is deliberately not a dependency here — it
  // drags in ~500 kB of CodeMirror). To refresh them:
  //   npm i @tginternal/editor@1.15.2   # in a scratch dir
  //   node -e 'const {tolgeeFormatGenerateIcu}=require("<abs>/dist/tolgee-editor.cjs"); …'
  // The `exports` map blocks both bare-name ESM import and subpath require, so
  // the absolute path to the dist file is required.
  const WRITTEN_BY_THE_ORIGINAL = [
    "{count, plural, one {# day} other {x}}",
    "{count, plural, one {One for {name}} other {x}}",
    "{count, plural, one {a '{' b} other {x}}",
    "{count, plural, one {'{not an argument}'} other {x}}",
    "{count, plural, one {co'{'unt} other {x}}",
    "{count, plural, one {wrong'}'brace} other {x}}",
    "{count, plural, one {Hi '{name} and co{'unt} other {x}}",
    "{count, plural, one {100% '{'sure'}'} other {x}}",
    "{count, plural, one {# item — {a}, {b}} other {x}}",
  ];

  for (const icu of WRITTEN_BY_THE_ORIGINAL) {
    it(`survives parse → generate unchanged: ${icu}`, () => {
      expect(tolgeeFormatGenerateIcu(getTolgeeFormat(icu, true, false), false)).toBe(icu);
    });
  }
});

describe("findArgumentNames", () => {
  it("finds an argument whose own body contains braces", () => {
    // The gap a regex can't close: `{gender, select, …}` has no bounded
    // `[^{}]*` tail, so it was never seen — and an unseeded argument makes
    // IntlMessageFormat throw MISSING_VALUE.
    expect(findArgumentNames("{gender, select, other {x}}")).toEqual(["gender"]);
  });

  it("finds both the outer argument and one nested inside it", () => {
    expect(
      findArgumentNames("{gender, select, other {{count, plural, other {# replies}}}}"),
    ).toEqual(["gender", "count"]);
  });

  it("finds an argument inside a plural variant body", () => {
    expect(findArgumentNames("{count, plural, one {Hello {name}} other {hi}}")).toEqual([
      "count",
      "name",
    ]);
  });

  it("finds a plain argument and dedupes repeats", () => {
    expect(findArgumentNames("Hi {name}, bye {name}")).toEqual(["name"]);
  });

  it("ignores escaped braces and prose between braces", () => {
    expect(findArgumentNames("literal '{'name'}' here")).toEqual([]);
    expect(findArgumentNames("{not an argument}")).toEqual([]);
    expect(findArgumentNames("plain text")).toEqual([]);
  });
});
