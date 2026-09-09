import { mergeConfig, splitConfig } from "$main/settings/merge";
import type {
  CurrentDocumentSettings,
  CurrentPageSettings,
  GlobalSettings,
  NodeInfo,
  TolgeeConfig,
} from "$shared/types";
import { describe, expect, it } from "vitest";

describe("mergeConfig", () => {
  it("page wins over doc wins over global (right-wins precedence)", () => {
    const merged = mergeConfig(
      { apiUrl: "a" } as Partial<GlobalSettings>,
      { apiUrl: "b" } as Partial<CurrentDocumentSettings>,
      {} as Partial<CurrentPageSettings>,
    );
    expect(merged.apiUrl).toBe("b");
  });

  it("includes fields from all three scopes when keys don't collide", () => {
    const merged = mergeConfig(
      { apiKey: "x" } as Partial<GlobalSettings>,
      {} as Partial<CurrentDocumentSettings>,
      { language: "en" } as Partial<CurrentPageSettings>,
    );
    expect(merged.apiKey).toBe("x");
    expect(merged.language).toBe("en");
  });

  it("page overrides global on the same key", () => {
    const merged = mergeConfig(
      { apiUrl: "fromGlobal" } as Partial<GlobalSettings>,
      {} as Partial<CurrentDocumentSettings>,
      // `apiUrl` isn't part of CurrentPageSettings but the merge is structural
      // — cast through unknown to drive the right-wins behaviour intentionally.
      { apiUrl: "fromPage" } as unknown as Partial<CurrentPageSettings>,
    );
    expect(merged.apiUrl).toBe("fromPage");
  });
});

describe("splitConfig", () => {
  it("routes page-only fields to `page`", () => {
    const nodeInfo: NodeInfo = {
      id: "n1",
      name: "node",
      characters: "hi",
      translation: "hi",
      isPlural: false,
      key: "k",
      ns: undefined,
      connected: true,
    };
    const split = splitConfig({
      language: "en",
      pageInfo: true,
      pageCopy: false,
      nodeInfo,
    } as Partial<TolgeeConfig>);

    expect(split.page.language).toBe("en");
    expect(split.page.pageInfo).toBe(true);
    expect(split.page.pageCopy).toBe(false);
    expect(split.page.nodeInfo).toBe(nodeInfo);
    // `language` is page-only — it should never leak onto `doc` or `global`.
    // Access through Record so TS doesn't complain about the missing key.
    expect((split.doc as Record<string, unknown>).language).toBeUndefined();
    expect((split.global as Record<string, unknown>).language).toBeUndefined();
  });

  it("routes the immutable `copyLanguage` marker to `page` only (survives writeConfig, no doc leak)", () => {
    // A repointed selectable `language` must not drag the copy's true language
    // with it — `copyLanguage` stays page-scoped so a later config write echoes
    // it straight back onto the copy page instead of leaking onto the document.
    const split = splitConfig({
      language: "en",
      copyLanguage: "cs",
      pageCopy: true,
      sourcePageId: "1:2",
    } as Partial<TolgeeConfig>);

    expect(split.page.copyLanguage).toBe("cs");
    expect((split.doc as Record<string, unknown>).copyLanguage).toBeUndefined();
    expect((split.global as Record<string, unknown>).copyLanguage).toBeUndefined();
    // Round-trip: it comes back out of the merged view unchanged.
    expect(mergeConfig(split.global, split.doc, split.page).copyLanguage).toBe("cs");
  });

  it("routes doc-only fields (namespace, branch, documentInfo) to `doc`", () => {
    const split = splitConfig({
      namespace: "ns",
      branch: "main",
      documentInfo: true,
    } as Partial<TolgeeConfig>);

    expect(split.doc.namespace).toBe("ns");
    expect(split.doc.branch).toBe("main");
    expect(split.doc.documentInfo).toBe(true);
    // `namespace` is doc-only — verify it doesn't leak onto `global` or `page`.
    expect((split.global as Record<string, unknown>).namespace).toBeUndefined();
    expect((split.page as Record<string, unknown>).namespace).toBeUndefined();
  });

  it("mirrors the global preferences (apiKey/apiUrl/ignorePrefix/ignoreNumbers) to both `global` and `doc`", () => {
    const split = splitConfig({
      apiUrl: "https://app.tolgee.io",
      apiKey: "tg-abc",
      ignorePrefix: "//",
      ignoreNumbers: true,
    } as Partial<TolgeeConfig>);

    for (const scope of [split.global, split.doc] as Record<string, unknown>[]) {
      expect(scope.apiUrl).toBe("https://app.tolgee.io");
      expect(scope.apiKey).toBe("tg-abc");
      expect(scope.ignorePrefix).toBe("//");
      expect(scope.ignoreNumbers).toBe(true);
    }
    expect((split.page as Record<string, unknown>).apiUrl).toBeUndefined();
  });

  it("keeps document-level settings (keyFormat, variableCasing, tags) OUT of global — no cross-document leak", () => {
    const split = splitConfig({
      keyFormat: "{frame}.{elementName}",
      variableCasing: "snake_case",
      tags: ["a", "b"],
      addTags: true,
      ignoreHiddenLayers: true,
    } as Partial<TolgeeConfig>);

    // They belong to the document only…
    expect(split.doc.keyFormat).toBe("{frame}.{elementName}");
    expect(split.doc.variableCasing).toBe("snake_case");
    expect(split.doc.tags).toEqual(["a", "b"]);
    expect(split.doc.addTags).toBe(true);
    expect(split.doc.ignoreHiddenLayers).toBe(true);

    // …never on global (would otherwise pre-fill other documents).
    const g = split.global as Record<string, unknown>;
    expect(g.keyFormat).toBeUndefined();
    expect(g.variableCasing).toBeUndefined();
    expect(g.tags).toBeUndefined();
    expect(g.addTags).toBeUndefined();
    expect(g.ignoreHiddenLayers).toBeUndefined();
  });

  it("skips undefined values during split", () => {
    const split = splitConfig({
      apiUrl: undefined,
      apiKey: "keep",
    } as Partial<TolgeeConfig>);

    expect("apiUrl" in split.global).toBe(false);
    expect("apiUrl" in split.doc).toBe(false);
    expect(split.global.apiKey).toBe("keep");
    expect(split.doc.apiKey).toBe("keep");
  });

  it("round-trip: splitConfig(mergeConfig(g, d, p)) preserves all fields", () => {
    const global: Partial<GlobalSettings> = {
      apiUrl: "https://app.tolgee.io",
      apiKey: "tg-key",
      ignorePrefix: "//",
      ignoreNumbers: true,
    };
    const doc: Partial<CurrentDocumentSettings> = {
      namespace: "myns",
      branch: "feat/foo",
      documentInfo: true,
    };
    const page: Partial<CurrentPageSettings> = {
      language: "de",
      pageInfo: true,
      pageCopy: false,
      pageStringDetails: true,
    };

    const merged = mergeConfig(global, doc, page);
    const split = splitConfig(merged);

    // Global keys land in both `global` and `doc` after split.
    expect(split.global.apiUrl).toBe(global.apiUrl);
    expect(split.global.apiKey).toBe(global.apiKey);
    expect(split.doc.apiUrl).toBe(global.apiUrl);
    expect(split.doc.apiKey).toBe(global.apiKey);

    // Doc-only keys stay on `doc`.
    expect(split.doc.namespace).toBe(doc.namespace);
    expect(split.doc.branch).toBe(doc.branch);
    expect(split.doc.documentInfo).toBe(doc.documentInfo);

    // Page-only keys stay on `page`.
    expect(split.page.language).toBe(page.language);
    expect(split.page.pageInfo).toBe(page.pageInfo);
    expect(split.page.pageCopy).toBe(page.pageCopy);
    expect(split.page.pageStringDetails).toBe(page.pageStringDetails);

    // Re-merging the split must yield an equivalent merged view.
    const remerged = mergeConfig(split.global, split.doc, split.page);
    expect(remerged).toEqual(merged);
  });

  it("routes unknown keys to `doc` only (self-contained, no global leak), not dropped", () => {
    const config = { someLegacyKey: 42 } as unknown as Partial<TolgeeConfig>;
    const split = splitConfig(config);

    expect((split.doc as Record<string, unknown>).someLegacyKey).toBe(42);
    expect((split.global as Record<string, unknown>).someLegacyKey).toBeUndefined();
    expect((split.page as Record<string, unknown>).someLegacyKey).toBeUndefined();
  });
});
