import { describe, expect, it } from "vitest";
import { runWithConcurrency } from "../asyncPool";

describe("runWithConcurrency", () => {
  it("runs every item exactly once", async () => {
    const seen: number[] = [];
    await runWithConcurrency([1, 2, 3, 4, 5], 2, async (n) => {
      seen.push(n);
    });
    expect(seen.slice().sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it("never exceeds the concurrency limit, and actually overlaps work", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const items = Array.from({ length: 12 }, (_, i) => i);
    await runWithConcurrency(items, 3, async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      await Promise.resolve();
      inFlight--;
    });
    expect(maxInFlight).toBe(3);
  });

  it("caps the worker count at the item count when concurrency exceeds it", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    await runWithConcurrency([1, 2], 10, async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      inFlight--;
    });
    expect(maxInFlight).toBe(2);
  });

  it("resolves immediately for an empty list", async () => {
    let called = false;
    await runWithConcurrency([], 5, async () => {
      called = true;
    });
    expect(called).toBe(false);
  });

  it("propagates a worker error", async () => {
    await expect(
      runWithConcurrency([1, 2, 3], 2, async (n) => {
        if (n === 2) throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
  });
});
