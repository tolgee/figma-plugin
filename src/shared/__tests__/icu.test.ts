import { formatIcuMessage } from "$shared/icu";
import { describe, expect, it } from "vitest";

describe("formatIcuMessage", () => {
  it("returns plain text unchanged when there are no placeholders and no params", () => {
    const out = formatIcuMessage("Hello world", {}, "en");
    expect(out.result).toBe("Hello world");
    expect(out.error).toBeNull();
  });

  it("returns the raw message when params is an empty object (fast path)", () => {
    // Even with ICU syntax in the source, an empty params bag short-circuits
    // so the caller never pays the parser cost.
    const out = formatIcuMessage("{name} likes {fruit}", {}, "en");
    expect(out.result).toBe("{name} likes {fruit}");
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
