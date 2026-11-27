import type { NodeInfo } from "$shared/types";
import { plainCanvasText } from "$shared/richText";
import {
  buildCopyUpdates,
  sampleValuesByKey,
  withCarriedSamples,
  type CopyFetch,
  type CopyPage,
  type CopyTranslations,
  topUpCopyTranslations,
  withTimeout,
} from "$ui/lib/logic/copyApply";
import { pullDiff } from "$ui/lib/logic/pullDiff";
import { fetchAllTranslations, type PulledKey } from "$ui/lib/api/pull";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nsKeyIndex } from "$ui/lib/logic/namespaces";
import type { TolgeeClient } from "$ui/lib/api/client";

// `topUpCopyTranslations` fetches through `fetchAllTranslations`; everything
// else in this file is pure. The mock keeps `PulledKey` (a type) intact.
vi.mock("$ui/lib/api/pull", () => ({ fetchAllTranslations: vi.fn() }));
const fetchAllTranslationsMock = vi.mocked(fetchAllTranslations);
afterEach(() => {
  vi.clearAllMocks();
});

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
  const { updates } = buildCopyUpdates([node], translations, language);
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

  it("never falls back to the node's persisted translation on a remote miss — skips and reports it", () => {
    // The persisted `translation` on a clone is whatever the SOURCE page last
    // pulled (usually source-language text); writing it back made the copy
    // look "untranslated" while masking that the key was simply missed.
    const node = makeNode({ isPlural: true, pluralParamValue: "2", translation: PLURAL });
    const { updates, skipped } = buildCopyUpdates([node], {}, "en");
    expect(updates).toEqual([]);
    expect(skipped.map((n) => n.id)).toEqual(["n1"]);
  });

  it("skips a node whose remote translation is empty in that language", () => {
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
    const { updates } = buildCopyUpdates(
      [node],
      { [nsKeyIndex(undefined, "k")]: { text: "¡Hola {name}!", isPlural: false } },
      "es",
    );
    expect(updates).toEqual([
      {
        id: "n1",
        text: "¡Hola Zuzana!",
        translation: "¡Hola {name}!",
        isPlural: false,
        paramsValues: { name: "Zuzana" },
      },
    ]);
  });

  it("matches remote keys by namespace and skips unconnected nodes", () => {
    const inNs = makeNode({ id: "a", key: "greet", ns: "web" });
    const noNs = makeNode({ id: "b", key: "greet" });
    const unconnected = makeNode({ id: "c", key: "greet", connected: false });
    const { updates } = buildCopyUpdates(
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

describe("topUpCopyTranslations", () => {
  const client = {} as TolgeeClient;
  const page = (nodes: NodeInfo[]): CopyPage => ({ pageId: "p1", language: "cs", nodes });
  const fetchedWith = (names: string[], cs: CopyTranslations = {}): CopyFetch => ({
    translations: { cs },
    fetchedKeyNames: new Set(names),
  });

  it("returns the fetch untouched (and requests nothing) when the pre-fetch already asked for every clone key", async () => {
    const fetched = fetchedWith(["k"], { [nsKeyIndex(undefined, "k")]: { text: "Ahoj", isPlural: false } });
    const result = await topUpCopyTranslations(client, [page([makeNode()])], fetched, undefined);
    expect(result).toBe(fetched);
    expect(fetchAllTranslationsMock).not.toHaveBeenCalled();
  });

  it("a fetched key that simply has NO translation yet is not asked for again", async () => {
    // It is absent from `translations` (empty texts are dropped) but was
    // covered by the fetch — re-requesting it on every copy could never add
    // anything and spent the rate-limited endpoint for nothing.
    const fetched = fetchedWith(["untranslated"]);
    const result = await topUpCopyTranslations(
      client,
      [page([makeNode({ key: "untranslated" })])],
      fetched,
      undefined,
    );
    expect(result).toBe(fetched);
    expect(fetchAllTranslationsMock).not.toHaveBeenCalled();
  });

  it("fetches ONLY the clone keys the pre-fetch didn't ask for and merges them in", async () => {
    // Recreate pre-fetches by the OLD copy's keys; a key connected on the
    // source since the copy was made shows up only on the fresh clone.
    const covered = makeNode({ id: "a", key: "k" });
    const newKey = makeNode({ id: "b", key: "fresh" });
    const fetched = fetchedWith(["k"], { [nsKeyIndex(undefined, "k")]: { text: "Ahoj", isPlural: false } });
    fetchAllTranslationsMock.mockResolvedValue([
      { keyName: "fresh", isPlural: false, translations: { cs: { text: "Nové" } } },
    ]);

    const result = await topUpCopyTranslations(client, [page([covered, newKey])], fetched, "dev");

    expect(fetchAllTranslationsMock).toHaveBeenCalledWith(client, {
      languages: ["cs"],
      branch: "dev",
      keyNames: ["fresh"],
    });
    expect(result.translations.cs).toEqual({
      [nsKeyIndex(undefined, "k")]: { text: "Ahoj", isPlural: false },
      [nsKeyIndex(undefined, "fresh")]: { text: "Nové", isPlural: false },
    });
    expect([...result.fetchedKeyNames]).toEqual(["k", "fresh"]);
  });

  it("returns the fetch unchanged when the top-up request fails — the canvas work already happened, a miss is only 'skipped'", async () => {
    const fetched = fetchedWith([]);
    fetchAllTranslationsMock.mockRejectedValue(new Error("rate limited"));
    const result = await topUpCopyTranslations(
      client,
      [page([makeNode({ key: "fresh" })])],
      fetched,
      undefined,
    );
    expect(result).toBe(fetched);
  });
});

describe("withTimeout", () => {
  it("passes a settlement through", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 1000, "late")).resolves.toBe("ok");
    await expect(withTimeout(Promise.reject(new Error("boom")), 1000, "late")).rejects.toThrow(
      "boom",
    );
  });

  it("rejects with the given message when nothing settles in time", async () => {
    vi.useFakeTimers();
    try {
      const hung = withTimeout(new Promise<never>(() => {}), 5000, "Timed out loading.");
      const assertion = expect(hung).rejects.toThrow("Timed out loading.");
      await vi.advanceTimersByTimeAsync(5001);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
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
    const [update] = buildCopyUpdates([node], translations, language).updates;
    if (!update) throw new Error("expected buildCopyUpdates to produce an update");

    // Exactly what applyTranslations (src/main/nodes/selection.ts) persists:
    // translation + isPlural from the update, characters via the SAME
    // plainCanvasText transform applyRichText uses. pluralParamValue/
    // paramsValues are the node's own (buildCopyUpdates re-sends the values
    // it rendered with), so they match what the node already holds here.
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

describe("sample values carried over a Recreate", () => {
  it("collects per-key values from the old copy, first occurrence wins, keys without values left out", () => {
    const samples = sampleValuesByKey([
      { key: "hello", paramsValues: { name: "John" } },
      { key: "hello", paramsValues: { name: "Ignored" } },
      { key: "dogs", ns: "app", pluralParamValue: "3" },
      { key: "plain" },
      { key: "empty", paramsValues: {} },
    ]);
    expect(samples.get(nsKeyIndex(undefined, "hello"))).toEqual({ paramsValues: { name: "John" } });
    expect(samples.get(nsKeyIndex("app", "dogs"))).toEqual({ pluralParamValue: "3" });
    expect(samples.has(nsKeyIndex(undefined, "plain"))).toBe(false);
    expect(samples.has(nsKeyIndex(undefined, "empty"))).toBe(false);
  });

  it("renders the fresh clone with the copy's values instead of the source's, and persists them", () => {
    // The clone inherited the SOURCE page's sample ("Zuzko"); the old copy had "John".
    const cloneNode = makeNode({ key: "hello", paramsValues: { name: "Zuzko" } });
    const samples = sampleValuesByKey([{ key: "hello", paramsValues: { name: "John" } }]);
    const [page] = withCarriedSamples([{ pageId: "p", language: "en", nodes: [cloneNode] }], samples);
    if (!page) throw new Error("expected a page");

    const { updates } = buildCopyUpdates(
      page.nodes,
      { [nsKeyIndex(undefined, "hello")]: { text: "Hello, {name}", isPlural: false } },
      "en",
    );
    expect(updates[0]?.text).toBe("Hello, John");
    expect(updates[0]?.paramsValues).toEqual({ name: "John" });
  });

  it("leaves nodes whose key the old copy didn't have on the source's values", () => {
    const fresh = makeNode({ key: "new", paramsValues: { name: "Zuzko" } });
    const [page] = withCarriedSamples(
      [{ pageId: "p", language: "en", nodes: [fresh] }],
      sampleValuesByKey([{ key: "hello", paramsValues: { name: "John" } }]),
    );
    expect(page?.nodes[0]?.paramsValues).toEqual({ name: "Zuzko" });
  });
});
