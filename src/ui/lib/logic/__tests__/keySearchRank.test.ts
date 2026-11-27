import { describe, expect, it } from "vitest";
import type { KeySearchResult } from "$ui/lib/api/keys";
import {
  buildExactTextIndex,
  canonicalFormatted,
  isExactResult,
  normalizeForSearch,
  rankKeySearch,
  sameFormattedText,
  scoreResult,
  searchKeyIndex,
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
  it("turns every <br> spelling into a space so neighbouring words don't fuse", () => {
    expect(normalizeForSearch("Dobrý den,<br/><br/>je")).toBe("dobry den, je");
    expect(normalizeForSearch("Dear customer</br>thank you<BR >again")).toBe(
      "dear customer thank you again",
    );
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

describe("rankKeySearch — preferred namespace", () => {
  it("puts the string's own namespace first among equally good matches", () => {
    const inEmail = key("Fibrilace síní", "email", { namespace: "email-template" });
    const inApi = key("Fibrilace síní", "api", { namespace: "api" });
    expect(names(rankKeySearch([[inEmail, inApi]], "Fibrilace síní", "api"))).toEqual([
      "api",
      "email",
    ]);
  });

  it("never lifts a worse match above a better one", () => {
    const exactElsewhere = key("Fibrilace síní", "exact", { namespace: "email-template" });
    const partialOwn = key("Fibrilace síní zjištěna", "partial", { namespace: "api" });
    expect(names(rankKeySearch([[partialOwn, exactElsewhere]], "Fibrilace síní", "api"))[0]).toBe(
      "exact",
    );
  });

  it('treats "" as the no-namespace preference', () => {
    const none = key("Same", "none", { namespace: null });
    const api = key("Same", "api2", { namespace: "api" });
    expect(names(rankKeySearch([[api, none]], "Same", ""))[0]).toBe("none");
  });
});

describe("sameFormattedText (auto-connect)", () => {
  it("treats every <br> spelling and a real newline as the same break", () => {
    const tolgee = "Dobrý den, <br/><br/>je nám potěšením";
    for (const local of [
      "Dobrý den,<br><br>je nám potěšením",
      "Dobrý den, <br /> <br />je nám potěšením",
      "Dobrý den,\n\nje nám potěšením",
      "dobrý den, <BR/><br></br>je nám  potěšením",
    ]) {
      expect(sameFormattedText(local, tolgee)).toBe(true);
    }
  });

  it("ignores tag-name case and attributes, but not the formatting itself", () => {
    expect(sameFormattedText('<B class="x">Hi</B>', "<b>Hi</b>")).toBe(true);
    expect(sameFormattedText("Hi", "<b>Hi</b>")).toBe(false);
  });

  it("keeps diacritics and parameters significant", () => {
    expect(sameFormattedText("Fibrilace sini", "Fibrilace síní")).toBe(false);
    expect(sameFormattedText("Hello Jana", "Hello {name}")).toBe(false);
    expect(sameFormattedText("Hello {name}", "Hello {name}")).toBe(true);
  });

  it("never matches two empty strings", () => {
    expect(sameFormattedText("", "  ")).toBe(false);
    expect(canonicalFormatted(" <br/> ")).toBe("");
  });
});

describe("searchKeyIndex", () => {
  const index = [
    key("Ve výše uvedeném období <b>byla vyhodnocena fibrilace síní</b>", "long", { namespace: "api" }),
    key("Fibrilace síní", "exact-email", { namespace: "email-template" }),
    key("Fibrilace síní", "exact-api", { namespace: "api" }),
    key("Úplně jiný text", "other", { namespace: "api" }),
  ];

  it("finds and ranks locally, the string's namespace first among equals", () => {
    const { results, total } = searchKeyIndex(index, "fibrilace sini", { preferredNamespace: "api" });
    expect(names(results)).toEqual(["exact-api", "exact-email", "long"]);
    expect(total).toBe(3);
  });

  it("filters to one namespace", () => {
    const { results } = searchKeyIndex(index, "Fibrilace síní", { namespace: "email-template" });
    expect(names(results)).toEqual(["exact-email"]);
  });

  it("drops keys sharing fewer than half of a long query's words", () => {
    const { results } = searchKeyIndex(
      index,
      "jiný dlouhý dotaz s mnoha slovy který nesedí",
    );
    expect(names(results)).not.toContain("other");
  });

  it("caps the list but reports the full count", () => {
    const many = Array.from({ length: 10 }, (_, i) => key(`Save ${i}`, `save${i}`));
    const { results, total } = searchKeyIndex(many, "save", { limit: 3 });
    expect(results).toHaveLength(3);
    expect(total).toBe(10);
  });
});

describe("buildExactTextIndex", () => {
  it("maps canonical text, base text and key name to keys", () => {
    const a = key("Dobrý den, <br/>vítejte", "greeting", { baseTranslation: "Hello, <br/>welcome" });
    const map = buildExactTextIndex([a]);
    expect(map.get(canonicalFormatted("Dobrý den,<br>vítejte"))).toEqual([a]);
    expect(map.get(canonicalFormatted("Hello,\nwelcome"))).toEqual([a]);
    expect(map.get(canonicalFormatted("greeting"))).toEqual([a]);
  });
});
