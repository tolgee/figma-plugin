import { describe, expect, it } from "vitest";

import { createPhaseTimer } from "$shared/perf";

describe("createPhaseTimer", () => {
  it("reports each phase's own duration, its annotation and the total on one line", () => {
    const times = [1000, 1120, 1460, 1460];
    const perf = createPhaseTimer(() => times.shift() as number);

    perf.mark("page keys", "12 connected");
    perf.mark("fetch");

    expect(perf.summary("recreate")).toBe(
      "[tolgee:perf] recreate: page keys 120 ms (12 connected), fetch 340 ms; total 460 ms",
    );
  });
});
