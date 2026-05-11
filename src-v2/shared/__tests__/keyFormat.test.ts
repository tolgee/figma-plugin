import { describe, expect, it } from "vitest";
import { applyCasing, formatKey } from "$shared/keyFormat";
import type { GlobalSettings } from "$shared/types";

type Casing = NonNullable<GlobalSettings["variableCasing"]>;

describe("applyCasing", () => {
  it("produces snake_case", () => {
    expect(applyCasing("My Frame Title", "snake_case")).toBe("my_frame_title");
  });

  it("produces snake_case_capitalized (capitalises every word, joined by '_')", () => {
    // The implementation uppercases the first char of every word and keeps
    // the rest of the word as-is — it does NOT lowercase the tail.
    expect(applyCasing("my frame title", "snake_case_capitalized")).toBe(
      "My_Frame_Title",
    );
    // Already-mixed casing in the tail is preserved.
    expect(applyCasing("hello WORLD", "snake_case_capitalized")).toBe(
      "Hello_WORLD",
    );
  });

  it("produces camelCase", () => {
    expect(applyCasing("My Frame Title", "camelCase")).toBe("myFrameTitle");
  });

  it("produces PascalCase", () => {
    expect(applyCasing("my frame title", "PascalCase")).toBe("MyFrameTitle");
  });

  it("produces noSpaces (preserves casing, strips whitespace only)", () => {
    expect(applyCasing("My Frame Title", "noSpaces")).toBe("MyFrameTitle");
  });

  it("returns empty string for empty input", () => {
    const casings: Casing[] = [
      "snake_case",
      "snake_case_capitalized",
      "camelCase",
      "PascalCase",
      "noSpaces",
    ];
    for (const casing of casings) {
      expect(applyCasing("", casing)).toBe("");
    }
  });

  it("preserves special chars like '/', '.', '-' inside a word", () => {
    expect(applyCasing("foo/bar.baz-qux", "snake_case")).toBe("foo/bar.baz-qux");
    expect(applyCasing("foo/bar.baz-qux", "camelCase")).toBe("foo/bar.baz-qux");
    // PascalCase uppercases the first char; the rest is preserved.
    expect(applyCasing("foo/bar.baz-qux", "PascalCase")).toBe("Foo/bar.baz-qux");
  });

  it("handles multi-word input with special chars", () => {
    expect(applyCasing("My/Frame Element-1", "snake_case")).toBe(
      "my/frame_element-1",
    );
    expect(applyCasing("My/Frame Element-1", "camelCase")).toBe(
      "my/frameElement-1",
    );
  });
});

describe("formatKey", () => {
  it("substitutes {frame}_{elementName} for snake_case", () => {
    expect(
      formatKey(
        "{frame}_{elementName}",
        { frame: "My Frame", elementName: "my element" },
        "snake_case",
      ),
    ).toBe("my_frame_my_element");
  });

  it("substitutes {frame}_{elementName} for snake_case_capitalized", () => {
    // Every word's first char is uppercased; the rest is preserved verbatim.
    expect(
      formatKey(
        "{frame}_{elementName}",
        { frame: "My Frame", elementName: "my element" },
        "snake_case_capitalized",
      ),
    ).toBe("My_Frame_My_Element");
  });

  it("substitutes {frame}_{elementName} for camelCase", () => {
    expect(
      formatKey(
        "{frame}_{elementName}",
        { frame: "My Frame", elementName: "my element" },
        "camelCase",
      ),
    ).toBe("myFrame_myElement");
  });

  it("substitutes {frame}_{elementName} for PascalCase", () => {
    expect(
      formatKey(
        "{frame}_{elementName}",
        { frame: "My Frame", elementName: "my element" },
        "PascalCase",
      ),
    ).toBe("MyFrame_MyElement");
  });

  it("substitutes {frame}_{elementName} for noSpaces", () => {
    expect(
      formatKey(
        "{frame}_{elementName}",
        { frame: "My Frame", elementName: "my element" },
        "noSpaces",
      ),
    ).toBe("MyFrame_myelement");
  });

  it("returns empty result for empty template", () => {
    expect(
      formatKey(
        "",
        { frame: "Anything", elementName: "Whatever" },
        "snake_case",
      ),
    ).toBe("");
  });

  it("leaves placeholder positions empty when value is missing", () => {
    // No values supplied — placeholders should still be replaced (with "")
    // so the separator survives but values disappear.
    expect(formatKey("{frame}_{elementName}", {}, "snake_case")).toBe("_");
  });

  it("preserves special chars '/', '.', '-' in placeholder values", () => {
    expect(
      formatKey(
        "{frame}/{elementName}",
        { frame: "foo.bar", elementName: "baz-qux" },
        "snake_case",
      ),
    ).toBe("foo.bar/baz-qux");
  });

  it("substitutes only the placeholders present in the template", () => {
    expect(
      formatKey(
        "{section}.{group}",
        { section: "Header", group: "Buttons" },
        "PascalCase",
      ),
    ).toBe("Header.Buttons");
  });

  it("leaves unknown placeholders untouched", () => {
    // The implementation only knows the documented placeholders; an unknown
    // `{unknown}` must pass through verbatim.
    expect(
      formatKey(
        "{unknown}_{frame}",
        { frame: "Hero" },
        "snake_case",
      ),
    ).toBe("{unknown}_hero");
  });
});
