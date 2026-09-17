import { describe, expect, it } from "vitest";
import { DEV_ALLOWED_IMPACTS, MESSAGE_IMPACT } from "../messagePolicy";

/**
 * Exhaustiveness is enforced by the compiler (the `Record` over
 * `UiToMain["type"]`); these tests are the RECLASSIFICATION guard — a
 * refactor that quietly moves a canvas write out of the blocked class (or
 * widens what Dev Mode may process) must fail here, visibly.
 */
describe("MESSAGE_IMPACT", () => {
  it("classifies exactly the two canvas-writing messages as canvas", () => {
    const canvas = Object.entries(MESSAGE_IMPACT)
      .filter(([, impact]) => impact === "canvas")
      .map(([type]) => type)
      .sort();
    expect(canvas).toEqual(["apply-translations", "create-copy"]);
  });

  it("classifies the staleness check (added after the original 17 types) as read", () => {
    expect(MESSAGE_IMPACT["request-copy-staleness"]).toBe("read");
  });

  it("allows everything except canvas in Dev Mode", () => {
    expect(DEV_ALLOWED_IMPACTS.has("canvas")).toBe(false);
    expect(DEV_ALLOWED_IMPACTS.has("read")).toBe(true);
    expect(DEV_ALLOWED_IMPACTS.has("metadata")).toBe(true);
    expect(DEV_ALLOWED_IMPACTS.has("ui")).toBe(true);
  });
});
