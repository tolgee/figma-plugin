import { describe, expect, it } from "vitest";

import { LARGE_PAGE_LAYERS, LARGE_PAGE_TEXTS, copyMemoryWarning } from "../copyGuard";

describe("copyMemoryWarning", () => {
  it("stays quiet for small pages, however many copies exist", () => {
    expect(copyMemoryWarning({ textCount: LARGE_PAGE_TEXTS - 1, existingCopies: 5, recreate: false })).toBeNull();
  });

  it("counts a page as big by layers too (image/vector-heavy pages with few texts)", () => {
    expect(
      copyMemoryWarning({ textCount: 200, layerCount: LARGE_PAGE_LAYERS, existingCopies: 2, recreate: false }),
    ).toMatch(/100,000 layers, 200 texts/);
    expect(
      copyMemoryWarning({ textCount: 200, layerCount: LARGE_PAGE_LAYERS - 1, existingCopies: 2, recreate: false }),
    ).toBeNull();
  });

  it("stays quiet for the first and second copy of a large page", () => {
    expect(copyMemoryWarning({ textCount: 14258, existingCopies: 0, recreate: false })).toBeNull();
    expect(copyMemoryWarning({ textCount: 14258, existingCopies: 1, recreate: false })).toBeNull();
  });

  it("asks from two other copies up, naming them, without scare words", () => {
    const w = copyMemoryWarning({
      textCount: 14258,
      existingCopies: 2,
      copyNames: ["Page 1 - de", "Page 1 - es"],
      recreate: false,
    });
    expect(w).toMatch(/14,258 texts/);
    expect(w).toMatch(/2 copies of it\./);
    expect(w).not.toMatch(/Page 1 - de/);
    expect(w).toMatch(/\n\nKeep only the copies you need/);
    expect(w).not.toMatch(/recovery/);
  });

  it("recreate leaves the recreated copy out: quiet with one other copy, asks with two", () => {
    expect(copyMemoryWarning({ textCount: 14258, existingCopies: 2, recreate: true })).toBeNull();
    const w = copyMemoryWarning({
      textCount: 14258,
      existingCopies: 3,
      copyNames: ["Page 1 - de", "Page 1 - en", "Page 1 - es"],
      recreate: true,
      currentPageName: "Page 1 - en",
    });
    expect(w).toMatch(/2 copies of it\./);
  });
});
