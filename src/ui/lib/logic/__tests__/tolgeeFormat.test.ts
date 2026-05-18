import { describe, expect, it } from "vitest";
import { getTolgeeFormat } from "$ui/lib/logic/tolgeeFormat";

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
