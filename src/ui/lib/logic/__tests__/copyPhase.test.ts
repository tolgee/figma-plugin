import { describe, expect, it } from "vitest";

import { copyPhaseBar, copyPhaseLabel } from "../copyPhase";

describe("copyPhaseLabel", () => {
  it("names every phase of a copy run", () => {
    expect(copyPhaseLabel("fetching", "x")).toMatch(/Loading translations/);
    expect(copyPhaseLabel("top-up", "x")).toMatch(/Loading translations/);
    expect(copyPhaseLabel("preparing", "x")).toMatch(/Preparing/);
    expect(copyPhaseLabel("removing", "x")).toMatch(/Removing/);
    expect(copyPhaseLabel("updating", "x")).toMatch(/Updating frames/);
    expect(copyPhaseLabel("cloning", "x")).toMatch(/Cloning/);
    expect(copyPhaseLabel("scanning-en", "x")).toMatch(/Scanning/);
    expect(copyPhaseLabel("writing-keys", "x")).toMatch(/key names/);
    expect(copyPhaseLabel("writing", "x")).toMatch(/Writing translations/);
  });

  it("falls back for unknown or missing phases", () => {
    expect(copyPhaseLabel(undefined, "Creating copy…")).toBe("Creating copy…");
    expect(copyPhaseLabel(null, "Creating copy…")).toBe("Creating copy…");
    expect(copyPhaseLabel("whatever", "Creating copy…")).toBe("Creating copy…");
  });
});

describe("copyPhaseBar", () => {
  it("glides (unknown total) for phases without a counter", () => {
    expect(copyPhaseBar(null)).toEqual({ loaded: 0, total: null, detail: null });
    expect(copyPhaseBar({ current: 0, total: 0, phase: "cloning" })).toEqual({
      loaded: 0,
      total: null,
      detail: null,
    });
  });

  it("drives the bar with the scan scale but prints no counter for it", () => {
    expect(copyPhaseBar({ current: 40, total: 100, phase: "scanning-en" })).toEqual({
      loaded: 40,
      total: 100,
      detail: null,
    });
  });

  it("prints the node counter for the write phases, clamped", () => {
    expect(copyPhaseBar({ current: 3, total: 10, phase: "writing" })).toEqual({
      loaded: 3,
      total: 10,
      detail: "3 / 10",
    });
    expect(copyPhaseBar({ current: 12, total: 10, phase: "writing-keys" }).detail).toBe("10 / 10");
  });
});
