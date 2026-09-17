import { formatIcuMessage } from "$shared/icu";
import { describe, expect, it } from "vitest";

describe("formatIcuMessage", () => {
  it("returns plain text unchanged when there are no placeholders and no params", () => {
    const out = formatIcuMessage("Hello world", {}, "en");
    expect(out.result).toBe("Hello world");
    expect(out.error).toBeNull();
  });

  it("still formats a message containing braces even with empty params (H10 fast-path fix)", () => {
    // A message with real, unfilled placeholders and no params can't be
    // formatted — this is a genuine caller error, not the "plain ICU-escaped
    // text" case the guard is for. It must fail LOUD (error populated), not
    // silently short-circuit like the old fast path did.
    const out = formatIcuMessage("{name} likes {fruit}", {}, "en");
    expect(out.result).toBe("{name} likes {fruit}");
    expect(out.error).not.toBeNull();
  });

  it("unescapes Tolgee's own ICU escaping even with no params (H10 regression)", () => {
    // Tolgee escapes literal braces/apostrophes as `'{'`/`'}'`/`''` in the
    // stored source. The old fast path (short-circuit on empty params)
    // returned this escaped source untouched, writing it verbatim to the
    // canvas instead of the intended literal text.
    const out = formatIcuMessage("It''s a '{'test'}'", {}, "en");
    expect(out.result).toBe("It's a {test}");
    expect(out.error).toBeNull();
  });

  it("returns plain text with a brace unchanged in effect after unescaping", () => {
    const out = formatIcuMessage("100 '{'", {}, "en");
    expect(out.result).toBe("100 {");
    expect(out.error).toBeNull();
  });

  it("skips the parser entirely for text with no apostrophe or brace (guard fast path)", () => {
    const out = formatIcuMessage("Hello world", {}, "en");
    expect(out.result).toBe("Hello world");
    expect(out.error).toBeNull();
  });

  it("substitutes a single {name} placeholder", () => {
    const out = formatIcuMessage("Hello, {name}!", { name: "Alice" }, "en");
    expect(out.result).toBe("Hello, Alice!");
    expect(out.error).toBeNull();
  });

  it("formats an ICU plural with count=5 to '5 items'", () => {
    const out = formatIcuMessage(
      "{count, plural, one {1 item} other {# items}}",
      { count: "5" },
      "en",
    );
    expect(out.result).toBe("5 items");
    expect(out.error).toBeNull();
  });

  it("formats an ICU plural with count=1 to '1 item'", () => {
    const out = formatIcuMessage(
      "{count, plural, one {1 item} other {# items}}",
      { count: "1" },
      "en",
    );
    expect(out.result).toBe("1 item");
    expect(out.error).toBeNull();
  });

  it("falls back to the raw message and sets error on malformed ICU", () => {
    // Missing closing brace — intl-messageformat throws on parse.
    const malformed = "Hello {name";
    const out = formatIcuMessage(malformed, { name: "Alice" }, "en");
    expect(out.result).toBe(malformed);
    expect(out.error).not.toBeNull();
    expect(out.error).toBeInstanceOf(Error);
  });
});
