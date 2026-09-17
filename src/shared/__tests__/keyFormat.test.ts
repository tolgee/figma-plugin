import { applyCasing, formatKey } from "$shared/keyFormat";
import type { GlobalSettings } from "$shared/types";
import { describe, expect, it } from "vitest";

type Casing = NonNullable<GlobalSettings["variableCasing"]>;

describe("applyCasing", () => {
  it("produces snake_case", () => {
    expect(applyCasing("My Frame Title", "snake_case")).toBe("my_frame_title");
  });

  it("produces snake_case_capitalized (capitalises every word, joined by '_')", () => {
    // The implementation uppercases the first char of every word and keeps
    // the rest of the word as-is — it does NOT lowercase the tail.
    expect(applyCasing("my frame title", "snake_case_capitalized")).toBe("My_Frame_Title");
    // Already-mixed casing in the tail is preserved.
    expect(applyCasing("hello WORLD", "snake_case_capitalized")).toBe("Hello_WORLD");
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

  it("keeps the original format for \"\" / undefined (no transformation)", () => {
    // "keep original format" — the default, matching the original plugin. Must
    // NOT snake_case, or configs that kept the original would be transformed.
    expect(applyCasing("My Frame Title", "")).toBe("My Frame Title");
    expect(applyCasing("My Frame Title", undefined)).toBe("My Frame Title");
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
    expect(applyCasing("My/Frame Element-1", "snake_case")).toBe("my/frame_element-1");
    expect(applyCasing("My/Frame Element-1", "camelCase")).toBe("my/frameElement-1");
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
    expect(formatKey("", { frame: "Anything", elementName: "Whatever" }, "snake_case")).toBe("");
  });

  it("collapses to empty when every placeholder value is missing", () => {
    // Both empty → the placeholders AND the separator between them are removed,
    // rather than leaving a bare "_".
    expect(formatKey("{frame}_{elementName}", {}, "snake_case")).toBe("");
  });

  it("drops the separator BEFORE an empty middle placeholder", () => {
    expect(
      formatKey(
        "{frame}.{component}.{elementName}",
        { frame: "Hero", elementName: "title" },
        "snake_case",
      ),
    ).toBe("hero.title");
  });

  it("drops the separator AFTER a leading empty placeholder", () => {
    // No component → no dangling leading dot.
    expect(
      formatKey("{component}.{elementName}", { elementName: "log in" }, "snake_case"),
    ).toBe("log_in");
  });

  it("drops the separator BEFORE a trailing empty placeholder", () => {
    expect(
      formatKey("{elementName}.{component}", { elementName: "log in" }, "snake_case"),
    ).toBe("log_in");
  });

  it("collapses consecutive empty placeholders and their separators", () => {
    expect(
      formatKey(
        "{component}.{instance}.{elementName}",
        { elementName: "title" },
        "snake_case",
      ),
    ).toBe("title");
  });

  it("keeps a literal prefix when the following placeholder is empty", () => {
    expect(
      formatKey("app.{component}.{elementName}", { elementName: "title" }, "snake_case"),
    ).toBe("app.title");
  });

  it("substitutes the {instance} placeholder", () => {
    expect(
      formatKey(
        "{component}.{instance}.{elementName}",
        { component: "Button", instance: "Primary Button", elementName: "label" },
        "snake_case",
      ),
    ).toBe("button.primary_button.label");
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
      formatKey("{section}.{group}", { section: "Header", group: "Buttons" }, "PascalCase"),
    ).toBe("Header.Buttons");
  });

  it("leaves unknown placeholders untouched", () => {
    // The implementation only knows the documented placeholders; an unknown
    // `{unknown}` must pass through verbatim.
    expect(formatKey("{unknown}_{frame}", { frame: "Hero" }, "snake_case")).toBe("{unknown}_hero");
  });
});

describe("formatKey — an empty placeholder trims a separator, not a literal", () => {
  it("keeps fixed text that sits between two placeholders", () => {
    // The reported bug: the whole adjacent literal was dropped, so `bar`
    // vanished from a key that then got persisted and uploaded. Only the
    // separator should go — and `bar` isn't one.
    expect(
      formatKey("foo{component}bar{elementName}", { elementName: "Name" }, "snake_case"),
    ).toBe("foobarname");
  });

  it("keeps a fixed prefix ahead of the empty placeholder", () => {
    // `app.` is the user's own prefix, not a separator to be eaten.
    expect(
      formatKey("app.{component}.{elementName}", { elementName: "Title" }, "snake_case"),
    ).toBe("app.title");
  });

  it("still drops a leading separator so the key can't start with one", () => {
    expect(
      formatKey("{component}.{elementName}", { elementName: "my element" }, "snake_case"),
    ).toBe("my_element");
  });

  it("still collapses a separator between two present placeholders", () => {
    expect(
      formatKey(
        "{frame}.{component}.{elementName}",
        { frame: "Web", elementName: "Title" },
        "snake_case",
      ),
    ).toBe("web.title");
  });

  it("treats an underscore as a separator, not as word content", () => {
    // `\w` would keep `_`, which is exactly the separator most templates use.
    expect(formatKey("{component}_{elementName}", { elementName: "Title" }, "snake_case")).toBe(
      "title",
    );
  });

  it("handles consecutive empty placeholders without eating extra characters", () => {
    expect(
      formatKey("{frame}.{component}.{elementName}", { elementName: "Title" }, "snake_case"),
    ).toBe("title");
  });

  it("leaves a trailing empty placeholder's separator off the end", () => {
    expect(formatKey("{frame}.{component}", { frame: "Home" }, "snake_case")).toBe("home");
  });
});
