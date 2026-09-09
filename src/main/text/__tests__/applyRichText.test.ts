import { afterEach, describe, expect, it, vi } from "vitest";

import { __test__, applyRichText } from "../applyRichText";

const { findRanges, BR_REGEX } = __test__;

function makeNode(characters: string, fontName: unknown) {
  return {
    characters,
    autoRename: true,
    fontName,
    getRangeAllFontNames: vi.fn(() => {
      throw new Error("must not read a font range on an empty node");
    }),
  };
}

afterEach(() => {
  (globalThis as unknown as { figma?: unknown }).figma = undefined;
});

describe("findRanges", () => {
  it("returns empty when the tag is absent", () => {
    expect(findRanges("plain text", "b")).toEqual([]);
  });

  it("finds a single bold range and normalises to plain-text offsets", () => {
    // "Hello <b>world</b>!" — after stripping `<b>` and `</b>`, the inner
    // "world" lives at index 6..11 of the plain text "Hello world!".
    expect(findRanges("Hello <b>world</b>!", "b")).toEqual([{ start: 6, end: 11 }]);
  });

  it("finds multiple ranges on the same kind with correct plain-text offsets", () => {
    // "<b>bold</b> and <b>bolder</b>" → plain "bold and bolder".
    const html = "<b>bold</b> and <b>bolder</b>";
    expect(findRanges(html, "b")).toEqual([
      { start: 0, end: 4 },
      { start: 9, end: 15 },
    ]);
  });

  it("normalises offsets across previously stripped sibling tags", () => {
    // "<i>x</i> <b>y</b>" → plain "x y". `<b>` starts at HTML index 9; after
    // stripping the prior <i> (3 chars) and </i> (4 chars), the bold range
    // sits at plain index 2..3.
    const html = "<i>x</i> <b>y</b>";
    expect(findRanges(html, "b")).toEqual([{ start: 2, end: 3 }]);
  });
});

describe("BR_REGEX", () => {
  it.each([
    ["a<br>b", "a\nb"],
    ["a<br/>b", "a\nb"],
    ["a<br />b", "a\nb"],
    ["a</br>b", "a\nb"],
    ["a<br></br>b", "a\nb"],
  ])("normalises %s", (input, expected) => {
    expect(input.replace(BR_REGEX, "\n")).toBe(expected);
  });
});

describe("applyRichText — empty node", () => {
  it("loads the node's own fontName directly instead of reading a font range", async () => {
    const font = { family: "EmptyNodeTestFont", style: "Regular" };
    const loadFontAsync = vi.fn(async () => {});
    (globalThis as unknown as { figma: unknown }).figma = { mixed: Symbol("mixed"), loadFontAsync };

    const node = makeNode("", font);
    await applyRichText(node as never, "Hello");

    expect(node.getRangeAllFontNames).not.toHaveBeenCalled();
    expect(loadFontAsync).toHaveBeenCalledWith(font);
    expect(node.characters).toBe("Hello");
  });

  it("skips loading entirely when an empty node reports a mixed font", async () => {
    const MIXED = Symbol("mixed");
    const loadFontAsync = vi.fn(async () => {});
    (globalThis as unknown as { figma: unknown }).figma = { mixed: MIXED, loadFontAsync };

    const node = makeNode("", MIXED);
    await applyRichText(node as never, "Hello");

    expect(node.getRangeAllFontNames).not.toHaveBeenCalled();
    expect(loadFontAsync).not.toHaveBeenCalled();
    // Still writes the plain text even though no font could be pre-loaded.
    expect(node.characters).toBe("Hello");
  });
});
