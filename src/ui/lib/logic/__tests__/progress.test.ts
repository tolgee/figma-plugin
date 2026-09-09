import { describe, expect, it } from "vitest";
import { computeProgressPercent, formatProgressCount } from "$ui/lib/logic/progress";

describe("computeProgressPercent", () => {
  it("returns null (indeterminate) when total is null", () => {
    expect(computeProgressPercent(0, null)).toBeNull();
    expect(computeProgressPercent(50, null)).toBeNull();
  });

  it("returns null (indeterminate) when total is 0 or negative", () => {
    expect(computeProgressPercent(0, 0)).toBeNull();
    expect(computeProgressPercent(10, -5)).toBeNull();
  });

  it("computes a normal ratio, rounded to the nearest percent", () => {
    expect(computeProgressPercent(50, 200)).toBe(25);
    expect(computeProgressPercent(1, 3)).toBe(33); // 33.33.. -> 33
    expect(computeProgressPercent(2, 3)).toBe(67); // 66.66.. -> 67
  });

  it("caps loaded exceeding total at 100", () => {
    expect(computeProgressPercent(150, 100)).toBe(100);
  });

  it("caps negative loaded at 0", () => {
    expect(computeProgressPercent(-10, 100)).toBe(0);
  });

  it("full/empty edges", () => {
    expect(computeProgressPercent(0, 100)).toBe(0);
    expect(computeProgressPercent(100, 100)).toBe(100);
  });
});

describe("formatProgressCount", () => {
  it("counts when the total is known", () => {
    expect(formatProgressCount(0, 1)).toBe("0 / 1");
    expect(formatProgressCount(3, 10)).toBe("3 / 10");
  });

  it("returns null when the total is unknown, so the caller omits the counter", () => {
    // Reported live: a single-translation upload showed "0 / …" — one request
    // has no sub-progress, so there is no honest denominator to print.
    expect(formatProgressCount(0, null)).toBeNull();
    expect(formatProgressCount(5, 0)).toBeNull();
    expect(formatProgressCount(0, -1)).toBeNull();
  });

  it("clamps a stale loaded value instead of printing 7 / 5", () => {
    expect(formatProgressCount(7, 5)).toBe("5 / 5");
    expect(formatProgressCount(-2, 5)).toBe("0 / 5");
  });
});
