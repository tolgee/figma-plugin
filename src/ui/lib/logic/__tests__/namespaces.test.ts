import type { NodeInfo } from "$shared/types";
import { collectNamespaceNames, namespacedKeyLabel, nsKeyIndex } from "$ui/lib/logic/namespaces";
import { describe, expect, it } from "vitest";

describe("namespacedKeyLabel", () => {
  it("prefixes the namespace when namespaces are enabled", () => {
    expect(namespacedKeyLabel("common", "hello", true)).toBe("common.hello");
  });

  it("omits the prefix when there is no namespace", () => {
    expect(namespacedKeyLabel(undefined, "hello", true)).toBe("hello");
  });

  it("omits the prefix when namespaces are disabled, even with a namespace present", () => {
    expect(namespacedKeyLabel("common", "hello", false)).toBe("hello");
  });
});

describe("collectNamespaceNames", () => {
  it("merges server, node, and default namespaces, deduped and sorted", () => {
    const names = collectNamespaceNames(
      [{ name: "b" }, { name: "a" }],
      [{ ns: "c" }, { ns: "a" }] as NodeInfo[],
      "d",
    );
    expect(names).toEqual(["a", "b", "c", "d"]);
  });
});

describe("nsKeyIndex", () => {
  it("keeps pairs distinct when a name contains the old separator", () => {
    // The reported collision: joining on `|` made (ns "a|b", key "c") and
    // (ns "a", key "b|c") both spell `a|b|c`. The later entry overwrote the
    // earlier one, and in the copy flow that wrote one translation onto BOTH
    // cloned nodes. Neither the key nor the namespace input forbids `|`.
    expect(nsKeyIndex("a|b", "c")).not.toBe(nsKeyIndex("a", "b|c"));
  });

  it("treats an absent namespace as empty, not as the string 'undefined'", () => {
    expect(nsKeyIndex(undefined, "greeting")).toBe(nsKeyIndex("", "greeting"));
  });

  it("distinguishes a namespaced key from a bare one", () => {
    expect(nsKeyIndex("web", "greeting")).not.toBe(nsKeyIndex(undefined, "greeting"));
  });

  it("round-trips the same pair to the same index", () => {
    expect(nsKeyIndex("web", "greeting")).toBe(nsKeyIndex("web", "greeting"));
  });
});
