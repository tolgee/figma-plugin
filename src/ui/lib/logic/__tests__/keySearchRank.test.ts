import { describe, expect, it } from "vitest";
import type { KeySearchResult } from "$ui/lib/api/keys";
import {
  isExactResult,
  normalizeForSearch,
  rankKeySearch,
  scoreResult,
  TIER,
} from "$ui/lib/logic/keySearchRank";

let nextId = 1;
function key(translation: string, name = `k${nextId}`, extra: Partial<KeySearchResult> = {}) {
  return { id: nextId++, name, namespace: "api", translation, ...extra } as KeySearchResult;
}

const names = (rs: KeySearchResult[]) => rs.map((r) => r.name);

describe("normalizeForSearch", () => {
  it("drops markup, case, diacritics and extra whitespace", () => {
    expect(normalizeForSearch("Ve <b>Fibrilace  Síní</b>")).toBe("ve fibrilace sini");
  });
  it("turns <br> into a space so neighbouring words don't fuse", () => {
    expect(normalizeForSearch("Dobrý den,<br/><br/>je")).toBe("dobry den, je");
  });
});

describe("rankKeySearch", () => {
  // Customer case: Tolgee returned the long texts first and the exact string last.
  const serverOrder = [
    key("Ve výše uvedeném období <b>byla vyhodnocena fibrilace síní</b> u pacienta", "long1"),
    key("Ve daném záznamu <b>byla vyhodnocena fibrilace síní</b> specialistou", "long2"),
    key("Fibrilace síní zjištěna", "starts"),
    key("Zaznamenaný signál ze sledovaného období", "unrelated"),
    key("Fibrilace síní", "exact"),
  ];

  it("puts the exact string first, then starts-with, then contains", () => {
    expect(names(rankKeySearch([serverOrder], "Fibrilace síní"))).toEqual([
      "exact",
      "starts",
      "long2", // shorter of the two "contains" texts
      "long1",
      "unrelated",
    ]);
  });

  it("matches without diacritics and regardless of case", () => {
    expect(names(rankKeySearch([serverOrder], "fibrilace sini"))[0]).toBe("exact");
  });

  it("ranks texts with all words (any order) above texts with only some", () => {
    const some = key("Byla vyhodnocena chyba", "some");
    const all = key("Síní byla vyhodnocena později", "all");
    const ranked = rankKeySearch([[some, all]], "vyhodnocena síní");
    expect(names(ranked)).toEqual(["all", "some"]);
    expect(scoreResult(all, "vyhodnocena síní").tier).toBe(TIER.ALL_WORDS);
    expect(scoreResult(some, "vyhodnocena síní").tier).toBe(TIER.SOME_WORDS);
  });

  it("treats a repeated word like the single word", () => {
    expect(names(rankKeySearch([serverOrder], "síní síní"))[0]).toBe(
      names(rankKeySearch([serverOrder], "síní"))[0],
    );
  });

  it("finds a key by its NAME as well as its text", () => {
    const byName = key("Something else entirely", "fibrilace");
    expect(names(rankKeySearch([[...serverOrder, byName]], "fibrilace"))[0]).toBe("fibrilace");
  });

  it("de-duplicates by key id, first list wins", () => {
    const a = key("Fibrilace síní", "dup");
    const fuzzyCopy = { ...a, translation: undefined };
    const ranked = rankKeySearch([[a], [fuzzyCopy, key("Other", "other")]], "Fibrilace síní");
    expect(ranked.filter((r) => r.id === a.id)).toHaveLength(1);
    expect(ranked[0]?.translation).toBe("Fibrilace síní");
  });

  it("keeps the incoming order for an empty query", () => {
    expect(names(rankKeySearch([serverOrder], "  "))).toEqual(names(serverOrder));
  });
});

describe("isExactResult", () => {
  it("is true for the same text ignoring case/diacritics/markup", () => {
    expect(isExactResult(key("<b>Fibrilace síní</b>"), "fibrilace sini")).toBe(true);
  });
  it("is false for a longer text and for an empty query", () => {
    expect(isExactResult(key("Fibrilace síní zjištěna"), "Fibrilace síní")).toBe(false);
    expect(isExactResult(key(""), "")).toBe(false);
  });
});
