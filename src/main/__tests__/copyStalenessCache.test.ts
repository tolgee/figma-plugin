import { describe, expect, it } from "vitest";

import { createCopyStalenessCache } from "$main/copyStalenessCache";

describe("copy staleness cache", () => {
  it("answers 'fresh' exactly once for a page the plugin just created", () => {
    const cache = createCopyStalenessCache();
    cache.seedFresh(["a", "b"]);
    expect(cache.take("a")).toEqual({ ok: true, missingCount: 0, removedCount: 0 });
    expect(cache.take("a")).toBeNull();
    expect(cache.size()).toBe(1);
  });

  it("never answers for pages it wasn't told about, and clears on demand", () => {
    const cache = createCopyStalenessCache();
    expect(cache.take("nope")).toBeNull();
    cache.seedFresh(["a"]);
    cache.clear();
    expect(cache.take("a")).toBeNull();
  });
});
