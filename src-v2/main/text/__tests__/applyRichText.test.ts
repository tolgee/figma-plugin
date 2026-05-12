import { describe, expect, it } from "vitest";

import { __test__ } from "../applyRichText";

const { findRanges, BR_REGEX } = __test__;

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
