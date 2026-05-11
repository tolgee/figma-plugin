import { describe, expect, it } from "vitest";
import {
  findOutermostFrame,
  groupNodesByFrame,
} from "$main/screenshots/groupByFrame";

/**
 * Minimal subset of `BaseNode` we need to assemble fake parent chains.
 * We never touch real Figma globals — everything is plain objects cast
 * through `unknown` to the relevant Figma node interface.
 */
type FakeBase = {
  id: string;
  name: string;
  type: string;
  parent: FakeBase | null;
};

function frame(
  id: string,
  parent: FakeBase | null = null,
): FakeBase {
  return { id, name: id, type: "FRAME", parent };
}

function section(
  id: string,
  parent: FakeBase | null = null,
): FakeBase {
  return { id, name: id, type: "SECTION", parent };
}

function page(id: string): FakeBase {
  return { id, name: id, type: "PAGE", parent: null };
}

function textNode(
  id: string,
  parent: FakeBase,
): FakeBase {
  return { id, name: id, type: "TEXT", parent };
}

describe("findOutermostFrame", () => {
  it("returns the parent frame when the text node sits directly inside it", () => {
    const pageNode = page("page-1");
    const f = frame("frame-1", pageNode);
    const text = textNode("text-1", f);

    const result = findOutermostFrame(text as unknown as SceneNode);
    expect(result).toBe(f as unknown as FrameNode);
  });

  it("returns the frame when the text is wrapped in a section inside a frame", () => {
    const pageNode = page("page-1");
    const f = frame("frame-1", pageNode);
    const sec = section("section-1", f);
    const text = textNode("text-1", sec);

    const result = findOutermostFrame(text as unknown as SceneNode);
    expect(result).toBe(f as unknown as FrameNode);
  });

  it("returns the OUTERMOST frame when frames are nested", () => {
    const pageNode = page("page-1");
    const outer = frame("outer", pageNode);
    const inner = frame("inner", outer);
    const text = textNode("text-1", inner);

    const result = findOutermostFrame(text as unknown as SceneNode);
    expect(result).toBe(outer as unknown as FrameNode);
    expect(result).not.toBe(inner as unknown as FrameNode);
  });

  it("returns the outermost frame across a Frame > Section > Frame chain", () => {
    const pageNode = page("page-1");
    const outer = frame("outer", pageNode);
    const sec = section("section", outer);
    const inner = frame("inner", sec);
    const text = textNode("text-1", inner);

    const result = findOutermostFrame(text as unknown as SceneNode);
    expect(result).toBe(outer as unknown as FrameNode);
  });

  it("returns null when there is no frame parent at all", () => {
    const pageNode = page("page-1");
    const sec = section("section", pageNode);
    const text = textNode("text-1", sec);

    const result = findOutermostFrame(text as unknown as SceneNode);
    expect(result).toBeNull();
  });

  it("returns null when the text node has no parent", () => {
    const text: FakeBase = {
      id: "orphan",
      name: "orphan",
      type: "TEXT",
      parent: null,
    };
    const result = findOutermostFrame(text as unknown as SceneNode);
    expect(result).toBeNull();
  });
});

describe("groupNodesByFrame", () => {
  it("groups text nodes by their outermost enclosing frame", () => {
    const pageNode = page("page-1");
    const frameA = frame("a", pageNode);
    const frameB = frame("b", pageNode);

    const tA1 = textNode("t-a-1", frameA);
    const tA2 = textNode("t-a-2", frameA);
    const tB = textNode("t-b", frameB);

    const grouped = groupNodesByFrame([
      tA1 as unknown as TextNode,
      tA2 as unknown as TextNode,
      tB as unknown as TextNode,
    ]);

    expect(grouped.size).toBe(2);
    expect(grouped.get(frameA as unknown as FrameNode)).toEqual([
      tA1 as unknown as TextNode,
      tA2 as unknown as TextNode,
    ]);
    expect(grouped.get(frameB as unknown as FrameNode)).toEqual([
      tB as unknown as TextNode,
    ]);
  });

  it("drops text nodes that have no frame ancestor", () => {
    const pageNode = page("page-1");
    const orphan = textNode("orphan", pageNode);
    const grouped = groupNodesByFrame([orphan as unknown as TextNode]);
    expect(grouped.size).toBe(0);
  });
});
