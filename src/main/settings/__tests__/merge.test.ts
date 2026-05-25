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

  it("writes global keys to both `global` and `doc` (legacy behaviour)", () => {
    const split = splitConfig({
      apiUrl: "https://app.tolgee.io",
      apiKey: "tg-abc",
    } as Partial<TolgeeConfig>);

    expect(split.global.apiUrl).toBe("https://app.tolgee.io");
    expect(split.global.apiKey).toBe("tg-abc");
    expect(split.doc.apiUrl).toBe("https://app.tolgee.io");
    expect(split.doc.apiKey).toBe("tg-abc");
    expect((split.page as Record<string, unknown>).apiUrl).toBeUndefined();
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

  it("routes unknown keys to global (and mirrors to doc), not dropped", () => {
    // An unknown legacy key should default to global routing — the implementation
    // intentionally avoids silently dropping it.
    const config = { someLegacyKey: 42 } as unknown as Partial<TolgeeConfig>;
    const split = splitConfig(config);

    expect((split.global as Record<string, unknown>).someLegacyKey).toBe(42);
    expect((split.doc as Record<string, unknown>).someLegacyKey).toBe(42);
    expect((split.page as Record<string, unknown>).someLegacyKey).toBeUndefined();
  });
});
