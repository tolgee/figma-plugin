import { describe, expect, it } from "vitest";
import { computeVirtualWindow } from "../virtualWindow";

describe("computeVirtualWindow", () => {
  it("returns the full range unclipped when everything fits the viewport", () => {
    const w = computeVirtualWindow(10, 0, 1000, 60, 6);
    expect(w).toEqual({ start: 0, end: 10, padTop: 0, padBottom: 0 });
  });

  it("clips to a window around the scroll position, with overscan", () => {
    // 1000 rows, 60px each, scrolled to row 100, 600px tall viewport.
    const w = computeVirtualWindow(1000, 100 * 60, 600, 60, 6);
    // floor(6000/60) - 6 = 94
    expect(w.start).toBe(94);
    // ceil((6000+600)/60) + 6 = 116
    expect(w.end).toBe(116);
    expect(w.padTop).toBe(94 * 60);
    expect(w.padBottom).toBe((1000 - 116) * 60);
  });

  it("never lets start go negative near the top", () => {
    const w = computeVirtualWindow(1000, 0, 600, 60, 6);
    expect(w.start).toBe(0);
    expect(w.padTop).toBe(0);
  });

  it("never lets end exceed the item count near the bottom", () => {
    const w = computeVirtualWindow(100, 100 * 60, 600, 60, 6);
    expect(w.end).toBe(100);
    expect(w.padBottom).toBe(0);
  });

  it("clamps start below the last index for a very large scrollTop (stale scroll position)", () => {
    const w = computeVirtualWindow(10, 999999, 600, 60, 6);
    expect(w.start).toBeLessThanOrEqual(9);
    expect(w.end).toBe(10);
  });

  it("returns an empty window for zero items", () => {
    expect(computeVirtualWindow(0, 0, 600, 60, 6)).toEqual({
      start: 0,
      end: 0,
      padTop: 0,
      padBottom: 0,
    });
  });

  it("falls back to the unclipped range when rowHeight isn't known yet (0)", () => {
    const w = computeVirtualWindow(500, 0, 600, 0, 6);
    expect(w).toEqual({ start: 0, end: 500, padTop: 0, padBottom: 0 });
  });
});
