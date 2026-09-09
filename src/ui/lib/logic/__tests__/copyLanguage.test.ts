import type { TolgeeConfig } from "$shared/types";
import { copyLanguageFromPageName, resolveCopyLanguage } from "$ui/lib/logic/copyLanguage";
import { describe, expect, it } from "vitest";

const TAGS = new Set(["en", "cs", "de", "pt-BR"]);
const NO_TAGS = new Set<string>();

describe("copyLanguageFromPageName", () => {
  it("reads the language from the '…- <lang>' suffix", () => {
    expect(copyLanguageFromPageName("Page 1 - cs", TAGS)).toBe("cs");
    expect(copyLanguageFromPageName("Home - pt-BR", TAGS)).toBe("pt-BR");
  });

  it("works even before the project language list has loaded (tag-shape match)", () => {
    // The bug: on a copy page the language list is often still in flight, so
    // validating only against loaded tags failed and recreate fell back to en.
    expect(copyLanguageFromPageName("Page 1 - cs", NO_TAGS)).toBe("cs");
    expect(copyLanguageFromPageName("Home - zh-Hans", NO_TAGS)).toBe("zh-Hans");
  });

  it("takes the LAST segment when the source name itself contains ' - '", () => {
    expect(copyLanguageFromPageName("Docs - API - de", TAGS)).toBe("de");
  });

  it("ignores a suffix that is neither a known tag nor a language shape", () => {
    // A keys copy is named "… - keys"; and a plain source name ending in " - X".
    expect(copyLanguageFromPageName("Page 1 - keys", NO_TAGS)).toBeUndefined();
    expect(copyLanguageFromPageName("Docs - API", NO_TAGS)).toBeUndefined();
    expect(copyLanguageFromPageName("Docs - Landing", NO_TAGS)).toBeUndefined();
  });

  it("returns undefined with no suffix / no name", () => {
    expect(copyLanguageFromPageName("Page 1", TAGS)).toBeUndefined();
    expect(copyLanguageFromPageName(undefined, TAGS)).toBeUndefined();
  });
});

describe("resolveCopyLanguage — page name wins (self-healing, poison-proof)", () => {
  const cfg = (o: Partial<TolgeeConfig>) => o as Partial<TolgeeConfig>;

  it("uses the page-name suffix even when config.language was repointed to the main language", () => {
    // The reported bug: the copy is "Page 1 - cs" but the selectable language
    // reads 'en' — recreate must still target Czech, from the name.
    expect(resolveCopyLanguage(cfg({ language: "en" }), "Page 1 - cs", NO_TAGS)).toBe("cs");
  });

  it("lets the correct name override a stale/poisoned copyLanguage marker", () => {
    expect(
      resolveCopyLanguage(cfg({ copyLanguage: "en", language: "en" }), "Page 1 - cs", TAGS),
    ).toBe("cs");
  });

  it("falls back to the marker when the copy page was renamed off the pattern", () => {
    expect(resolveCopyLanguage(cfg({ copyLanguage: "cs", language: "en" }), "Renamed", TAGS)).toBe(
      "cs",
    );
  });

  it("uses the selectable language only as a last resort", () => {
    expect(resolveCopyLanguage(cfg({ language: "de" }), "Renamed", TAGS)).toBe("de");
  });

  it("returns undefined for a keys copy (name '…- keys', no marker/language)", () => {
    expect(resolveCopyLanguage(cfg({}), "Page 1 - keys", TAGS)).toBeUndefined();
  });
});

describe("name suffix vs the project's language list", () => {
  it("rejects a rename that merely LOOKS like a tag, once the list has loaded", () => {
    // "wip" matches the BCP-47 shape, so renaming "Home - cs" to "Home - wip"
    // used to be read as a language — silently overriding the immutable
    // `copyLanguage` marker and breaking Download for that page.
    const known = new Set(["en", "cs", "de"]);
    expect(copyLanguageFromPageName("Home - wip", known)).toBeUndefined();
    expect(copyLanguageFromPageName("Home - cs", known)).toBe("cs");
  });

  it("still accepts a well-shaped tag while the list is still loading", () => {
    // The regression this must not reintroduce: on a copy page the language
    // list is usually still in flight when Recreate/Download runs. Requiring
    // membership there rejected a legitimate "cs" and fell back to the main
    // language — the exact bug the name-first order was introduced to fix.
    const loading = new Set<string>();
    expect(copyLanguageFromPageName("Home - cs", loading)).toBe("cs");
    expect(copyLanguageFromPageName("Home - pt-BR", loading)).toBe("pt-BR");
  });

  it("falls through to the marker for a renamed copy instead of guessing", () => {
    const known = new Set(["en", "cs"]);
    expect(
      resolveCopyLanguage({ copyLanguage: "cs", language: "en" }, "Home - wip", known),
    ).toBe("cs");
  });

  it("prefers the name over a marker poisoned to the main language", () => {
    // Self-healing: copies made before the resolution was fixed carry
    // `copyLanguage: "en"`. Marker-first would keep them broken forever.
    const known = new Set(["en", "cs"]);
    expect(
      resolveCopyLanguage({ copyLanguage: "en", language: "en" }, "Home - cs", known),
    ).toBe("cs");
  });

  it("reads a copy made by the published plugin, which writes no marker", () => {
    // `copyPage.ts` stores `{pageCopy, pageInfo, language}` and nothing else,
    // so the name is the only stable signal such a copy leaves.
    const known = new Set(["en", "cs"]);
    expect(resolveCopyLanguage({ language: "en" }, "Home - cs", known)).toBe("cs");
  });

  it("still treats a keys copy as having no language", () => {
    const known = new Set(["en", "cs"]);
    expect(resolveCopyLanguage({}, "Home - keys", known)).toBeUndefined();
  });
});
