import { satisfiesMinimalVersion } from "./satisfiesMinimalVersion";

describe("checks platform version correctly", () => {
  it("returns true if version is lower", () => {
    expect(satisfiesMinimalVersion("v1.2.3", "v1.2.2")).toEqual(false);
    expect(satisfiesMinimalVersion("v1.2.3", "v1.2.1")).toEqual(false);
    expect(satisfiesMinimalVersion("v1.2.3", "v1.1.4")).toEqual(false);
    expect(satisfiesMinimalVersion("v1.2.3", "v0.0.0")).toEqual(false);
  });

  it("returns true if version is higher", () => {
    expect(satisfiesMinimalVersion("v1.2.3", "v1.2.3")).toEqual(true);
    expect(satisfiesMinimalVersion("v1.2.3", "v1.2.4")).toEqual(true);
    expect(satisfiesMinimalVersion("v1.2.3", "v1.4.2")).toEqual(true);
    expect(satisfiesMinimalVersion("v1.2.3", "v2.0.0")).toEqual(true);
  });

  it("returns undefined if version is invalid", () => {
    expect(satisfiesMinimalVersion("v1.2.3", "local")).toBeUndefined();
    expect(satisfiesMinimalVersion("v1.2.3", "??")).toBeUndefined();
    expect(satisfiesMinimalVersion("v1.2.3", "invalid")).toBeUndefined();
    expect(satisfiesMinimalVersion("v1.2.3", undefined)).toBeUndefined();
  });
});
