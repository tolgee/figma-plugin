import type { NodeInfo } from "$shared/types";
import { plainCanvasText } from "$shared/richText";
import { buildCopyUpdates, type CopyTranslations } from "$ui/lib/logic/copyApply";
import { pullDiff } from "$ui/lib/logic/pullDiff";
import type { PulledKey } from "$ui/lib/api/pull";
import { describe, expect, it } from "vitest";
import { nsKeyIndex } from "$ui/lib/logic/namespaces";

// Ported from the former main-thread `resolveCopyNodeText` tests — the render
// moved here (the UI) because Figma's main-thread sandbox has no `Intl`, so
// every `{param}`/plural render silently failed there and language copies came
// out half in the source language (the "polo španělská kopie" report).

function makeNode(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: overrides.id ?? "n1",
    name: "Layer",
    characters: "",
    translation: "",
    isPlural: false,
    key: "k",
    ns: undefined,
    connected: true,
    ...overrides,
  };
}

/** Single-node convenience: the update's text, or null when skipped. */
function resolvedText(
  node: NodeInfo,
  remote: { text: string; isPlural: boolean } | undefined,
  language: string,
): string | null {
  const translations: CopyTranslations = remote
    ? { [nsKeyIndex(node.ns, node.key)]: remote }
    : {};
  const updates = buildCopyUpdates([node], translations, language);
  return updates[0]?.text ?? null;
}

describe("buildCopyUpdates", () => {
  const PLURAL = "{count, plural, one {# apple} other {# apples}}";

  it("renders a plural remote translation using the NODE's own sample count, not the raw ICU", () => {
    const node = makeNode({ isPlural: true, pluralParamValue: "9" });
    expect(resolvedText(node, { text: PLURAL, isPlural: true }, "en")).toBe("9 apples");
  });

  it("renders a parametrized remote translation using the node's own paramsValues", () => {
    const node = makeNode({ paramsValues: { name: "Zuzana" } });
    expect(resolvedText(node, { text: "Hello {name}!", isPlural: false }, "en")).toBe(
      "Hello Zuzana!",
    );
  });

  it("trusts the remote isPlural flag over the node's own (possibly stale) one", () => {
    const node = makeNode({ isPlural: false, pluralParamValue: "3" });
    expect(resolvedText(node, { text: PLURAL, isPlural: true }, "en")).toBe("3 apples");
  });

  it("renders correctly even when BOTH isPlural flags say false but the ICU is a plural", () => {
    const node = makeNode({ isPlural: false, pluralParamValue: "9" });
    expect(
      resolvedText(
        node,
        {
          text: "{value, plural, one {J'ai # pomme} many {J'ai # pommes} other {J'ai # pommes}}",
          isPlural: false,
        },
        "fr",
      ),
    ).toBe("J'ai 9 pommes");
  });

  it("falls back to the node's persisted translation when there's no remote match", () => {
    const node = makeNode({ isPlural: true, pluralParamValue: "2", translation: PLURAL });
    expect(resolvedText(node, undefined, "en")).toBe("2 apples");
  });

  it("skips a node with neither a remote match nor a persisted translation", () => {
    const node = makeNode({ translation: "" });
    expect(resolvedText(node, undefined, "en")).toBeNull();
  });

  it("keeps inline HTML tags in the rendered output for applyRichText to consume", () => {
    const node = makeNode();
    expect(resolvedText(node, { text: "<b>Bold text</b>", isPlural: false }, "en")).toBe(
      "<b>Bold text</b>",
    );
  });

  it("skips an unrenderable ICU instead of dumping the raw pattern", () => {
    const node = makeNode();
    expect(resolvedText(node, { text: "Ahoj {name", isPlural: false }, "cs")).toBeNull();
  });

  it("persists the RAW remote translation alongside the rendered text", () => {
    // The whole point of routing copies through apply-translations: the raw
    // translation lands in plugin data too, so a Download right after a fresh
    // copy diffs to "No changes found" instead of rewriting every node.
    const node = makeNode({ paramsValues: { name: "Zuzana" } });
    const updates = buildCopyUpdates(
      [node],
      { [nsKeyIndex(undefined, "k")]: { text: "¡Hola {name}!", isPlural: false } },
      "es",
    );
    expect(updates).toEqual([
      { id: "n1", text: "¡Hola Zuzana!", translation: "¡Hola {name}!", isPlural: false },
    ]);
  });

  it("matches remote keys by namespace and skips unconnected nodes", () => {
    const inNs = makeNode({ id: "a", key: "greet", ns: "web" });
    const noNs = makeNode({ id: "b", key: "greet" });
    const unconnected = makeNode({ id: "c", key: "greet", connected: false });
    const updates = buildCopyUpdates(
      [inNs, noNs, unconnected],
      {
        [nsKeyIndex("web", "greet")]: { text: "Hola web", isPlural: false },
        [nsKeyIndex(undefined, "greet")]: { text: "Hola", isPlural: false },
      },
      "es",
    );
    expect(updates.map((u) => [u.id, u.text])).toEqual([
      ["a", "Hola web"],
      ["b", "Hola"],
    ]);
  });
});

describe("recreate -> immediate Download round trip", () => {
  // Zuzka reported that clicking "Recreate copy" and then immediately
  // "Download all" still shows a nonzero downloaded count, as if Recreate
  // hadn't actually applied the translations. This reproduces the FULL
  // pipeline end to end (buildCopyUpdates -> simulated apply-translations
  // write -> pullDiff) using the exact remote data Recreate itself would
  // have used, to check whether the two are genuinely idempotent or whether
  // there's a real logic bug hiding in the gap between them.
  function simulateWriteThenRediff(
    node: NodeInfo,
    remoteKey: PulledKey,
    language: string,
  ): ReturnType<typeof pullDiff> {
    const translations: CopyTranslations = {
      [nsKeyIndex(node.ns, node.key)]: {
        text: remoteKey.translations[language]?.text ?? "",
        isPlural: remoteKey.isPlural,
      },
    };
    const [update] = buildCopyUpdates([node], translations, language);
    if (!update) throw new Error("expected buildCopyUpdates to produce an update");

    // Exactly what applyTranslations (src/main/nodes/selection.ts) persists:
    // translation + isPlural from the update, characters via the SAME
    // plainCanvasText transform applyRichText uses. pluralParamValue/
    // paramsValues are untouched (buildCopyUpdates never sends them), so the
    // clone keeps whatever it inherited from the source at clone time.
    const postWrite: NodeInfo = {
      ...node,
      translation: update.translation,
      isPlural: update.isPlural ?? false,
      characters: plainCanvasText(update.text),
    };

    return pullDiff([postWrite], [remoteKey], language);
  }

  it("a simple string is unchanged after recreate + immediate download", () => {
    const node = makeNode({ translation: "old text", characters: "old text" });
    const remoteKey: PulledKey = {
      keyName: "k",
      isPlural: false,
      translations: { en: { text: "Hello there" } },
    };

    const diff = simulateWriteThenRediff(node, remoteKey, "en");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toHaveLength(1);
  });

  it("a plural string is unchanged after recreate + immediate download", () => {
    const node = makeNode({ isPlural: false, pluralParamValue: "9" });
    const remoteKey: PulledKey = {
      keyName: "k",
      isPlural: true,
      translations: { en: { text: "{count, plural, one {# apple} other {# apples}}" } },
    };

    const diff = simulateWriteThenRediff(node, remoteKey, "en");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toHaveLength(1);
  });

  it("a parametrized string is unchanged after recreate + immediate download", () => {
    const node = makeNode({ paramsValues: { name: "Zuzana" } });
    const remoteKey: PulledKey = {
      keyName: "k",
      isPlural: false,
      translations: { es: { text: "¡Hola {name}!" } },
    };

    const diff = simulateWriteThenRediff(node, remoteKey, "es");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toHaveLength(1);
  });

  it("a rich-text (bold/italic) string is unchanged after recreate + immediate download", () => {
    const node = makeNode();
    const remoteKey: PulledKey = {
      keyName: "k",
      isPlural: false,
      translations: { en: { text: "<b>Bold</b> and <i>italic</i>" } },
    };

    const diff = simulateWriteThenRediff(node, remoteKey, "en");

    expect(diff.changedNodes).toEqual([]);
    expect(diff.unchangedNodes).toHaveLength(1);
  });
});
