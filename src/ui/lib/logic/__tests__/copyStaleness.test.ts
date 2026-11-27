import { describe, expect, it } from "vitest";

import { canUpdateFrames, stalenessSummary } from "../copyStaleness";

describe("stalenessSummary", () => {
  it("lists what changed, with plural handling", () => {
    expect(stalenessSummary({ added: 1, changed: 0, removed: 0, mappable: true })).toBe("1 new frame");
    expect(stalenessSummary({ added: 2, changed: 1, removed: 3, mappable: true })).toBe(
      "2 new frames, 1 with changed keys, 3 removed",
    );
  });

  it("is empty when nothing changed at frame level", () => {
    expect(stalenessSummary({ added: 0, changed: 0, removed: 0, mappable: true })).toBeNull();
    expect(stalenessSummary(null)).toBeNull();
  });
});

describe("canUpdateFrames", () => {
  it("needs the mapping and a frame-level change", () => {
    expect(canUpdateFrames({ added: 1, changed: 0, removed: 0, mappable: true })).toBe(true);
    expect(canUpdateFrames({ added: 1, changed: 0, removed: 0, mappable: false })).toBe(false);
    expect(canUpdateFrames({ added: 0, changed: 0, removed: 0, mappable: true })).toBe(false);
    expect(canUpdateFrames(undefined)).toBe(false);
  });
});
