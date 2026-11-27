import { describe, expect, it } from "vitest";
import { autoConnectSkipHint } from "../autoConnectHint";

describe("autoConnectSkipHint", () => {
  it("connects a single match, so there is no hint", () => {
    expect(
      autoConnectSkipHint({ candidateNamespaces: [""], matchCount: 1, truncated: false }),
    ).toBeNull();
  });

  it("names the other namespace when the exact match lives only there", () => {
    // Zuzka's case: a text without a namespace, its key in "cron-jobs".
    const hint = autoConnectSkipHint({
      candidateNamespaces: ["cron-jobs"],
      matchCount: 0,
      truncated: false,
    });
    expect(hint).toBe(
      "Exact match only in namespace “cron-jobs”. Run Auto-connect “in any namespace”, or connect it manually.",
    );
  });

  it("shows the default namespace as <none> and caps the list", () => {
    const hint = autoConnectSkipHint({
      candidateNamespaces: [null, "a", "b", "a"],
      matchCount: 0,
      truncated: false,
    });
    expect(hint).toContain("namespaces “<none>”, “a” and 1 more.");
  });

  it("says there is no match only when no namespace has one", () => {
    expect(
      autoConnectSkipHint({ candidateNamespaces: [], matchCount: 0, truncated: false }),
    ).toBe("No exact match in Tolgee — create the key or connect it manually.");
  });

  it("admits an incomplete search instead of claiming no match", () => {
    expect(
      autoConnectSkipHint({ candidateNamespaces: [], matchCount: 0, truncated: true }),
    ).toBe("Couldn't check every similar key — open Connect to search for it.");
  });

  it("asks to pick when several keys match", () => {
    expect(
      autoConnectSkipHint({ candidateNamespaces: ["a", "b"], matchCount: 2, truncated: false }),
    ).toBe("Several keys match this text exactly — open Connect to pick one.");
  });
});
