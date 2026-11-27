import { describe, expect, it } from "vitest";

import { createYielder } from "$main/nodes/yield";

describe("createYielder", () => {
  it("does not yield while the slice is under budget", async () => {
    let t = 0;
    const y = createYielder(50, () => t);
    t = 49;
    await expect(y.maybeYield()).resolves.toBe(false);
  });

  it("yields once the budget is used up and starts the next slice AFTER resuming", async () => {
    let t = 0;
    const y = createYielder(50, () => t);
    t = 50;
    const yielded = y.maybeYield();
    // Simulate Figma keeping the thread for a long time DURING the yield:
    // that time must not count against the new slice.
    t = 500;
    await expect(yielded).resolves.toBe(true);
    await expect(y.maybeYield()).resolves.toBe(false);
    t = 549;
    await expect(y.maybeYield()).resolves.toBe(false);
    t = 550;
    await expect(y.maybeYield()).resolves.toBe(true);
  });

  it("counts yields and the time Figma kept the thread", async () => {
    let t = 0;
    const y = createYielder(50, () => t);
    expect(y.stats()).toEqual({ yields: 0, waitedMs: 0 });
    t = 60;
    const p = y.maybeYield();
    t = 200; // Figma held the thread 140 ms during the yield
    await p;
    expect(y.stats()).toEqual({ yields: 1, waitedMs: 140 });
  });

  it("uses the 50 ms default budget", async () => {
    let t = 0;
    const y = createYielder(undefined, () => t);
    t = 49;
    await expect(y.maybeYield()).resolves.toBe(false);
    t = 50;
    await expect(y.maybeYield()).resolves.toBe(true);
  });
});
