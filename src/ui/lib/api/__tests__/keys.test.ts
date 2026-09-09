import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NodeInfo } from "$shared/types";
import { createTolgeeClient } from "../client";
import { connectInfoFromKey, searchKeys, type KeySearchResult } from "../keys";

type FetchMock = ReturnType<typeof vi.fn>;

const ORIGINAL_FETCH = globalThis.fetch;

function installFetchMock(impl: (...args: unknown[]) => Promise<Response>) {
  const mock: FetchMock = vi.fn(impl as never);
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

function okResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(status = 500) {
  return new Response(JSON.stringify({ code: "server_error" }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("searchKeys", () => {
  it("returns [] when query is an empty string", async () => {
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const result = await searchKeys(client, "", "en");
    expect(result).toEqual([]);
  });

  it("returns [] when query is only whitespace", async () => {
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const result = await searchKeys(client, "   ", "en");
    expect(result).toEqual([]);
  });

  it("returns [] when the API returns an error status", async () => {
    installFetchMock(async () => errorResponse(500));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const result = await searchKeys(client, "hello", "en");
    expect(result).toEqual([]);
  });

  it("maps _embedded.keys to KeySearchResult[]", async () => {
    const keys = [
      {
        id: 1,
        name: "key.one",
        namespace: "common",
        description: "First key",
        translation: "Hello",
        baseTranslation: "Hello base",
        plural: false,
      },
      {
        id: 2,
        name: "key.two",
        namespace: null,
        description: undefined,
        translation: "World",
        baseTranslation: undefined,
        plural: true,
      },
    ];
    installFetchMock(async () => okResponse({ _embedded: { keys } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await searchKeys(client, "key", "en");

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      name: "key.one",
      namespace: "common",
      description: "First key",
      translation: "Hello",
      baseTranslation: "Hello base",
      plural: false,
    });
    expect(result[1]).toMatchObject({
      id: 2,
      name: "key.two",
      namespace: null,
      plural: true,
    });
  });

  it("passes the correct languageTag as a query param", async () => {
    const mock = installFetchMock(async () => okResponse({ _embedded: { keys: [] } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    await searchKeys(client, "search-term", "de", 10);

    const calledUrl: string =
      mock.mock.calls[0]?.[0] instanceof Request
        ? mock.mock.calls[0][0].url
        : String(mock.mock.calls[0]?.[0] ?? "");

    expect(calledUrl).toContain("languageTag=de");
    expect(calledUrl).toContain("search=search-term");
    expect(calledUrl).toContain("size=10");
  });

  it("passes the branch as a query param when set", async () => {
    const mock = installFetchMock(async () => okResponse({ _embedded: { keys: [] } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    await searchKeys(client, "term", "en", 20, "feature-x");

    const calledUrl: string =
      mock.mock.calls[0]?.[0] instanceof Request
        ? mock.mock.calls[0][0].url
        : String(mock.mock.calls[0]?.[0] ?? "");

    expect(calledUrl).toContain("branch=feature-x");
  });

  it("omits the branch param when empty (no-branching projects)", async () => {
    const mock = installFetchMock(async () => okResponse({ _embedded: { keys: [] } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    await searchKeys(client, "term", "en", 20, "");

    const calledUrl: string =
      mock.mock.calls[0]?.[0] instanceof Request
        ? mock.mock.calls[0][0].url
        : String(mock.mock.calls[0]?.[0] ?? "");

    expect(calledUrl).not.toContain("branch=");
  });

  it("handles missing optional fields (namespace, description, translation)", async () => {
    const keys = [
      {
        id: 99,
        name: "bare.key",
        // namespace, description, translation, baseTranslation, plural all absent
      },
    ];
    installFetchMock(async () => okResponse({ _embedded: { keys } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await searchKeys(client, "bare", undefined);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 99,
      name: "bare.key",
      namespace: null,
      description: undefined,
      translation: undefined,
      baseTranslation: undefined,
      plural: undefined,
    });
  });
});

describe("connectInfoFromKey", () => {
  function node(overrides: Partial<NodeInfo> = {}): NodeInfo {
    return {
      id: "1",
      name: "Layer",
      characters: "Figma text",
      key: "",
      ns: undefined,
      connected: false,
      isPlural: false,
      ...overrides,
    } as NodeInfo;
  }

  function result(overrides: Partial<KeySearchResult> = {}): KeySearchResult {
    return { id: 1, name: "greeting", namespace: "common", ...overrides };
  }

  it("adopts the key's translation instead of keeping the Figma text", () => {
    const info = connectInfoFromKey(
      result({ translation: "Ahoj" }),
      node({ characters: "Figma text" }),
      "en",
    );
    expect(info.translation).toBe("Ahoj");
    expect(info).toMatchObject({
      key: "greeting",
      ns: "common",
      connected: true,
      isPlural: false,
    });
    expect(info.pluralParamValue).toBeUndefined();
  });

  it("falls back to the node's characters when the key has no translation yet", () => {
    const info = connectInfoFromKey(
      result({ translation: undefined, baseTranslation: undefined }),
      node({ characters: "Figma text" }),
      "en",
    );
    expect(info.translation).toBe("Figma text");
  });

  it("uses '' (not undefined) for a no-namespace key", () => {
    const info = connectInfoFromKey(result({ namespace: null }), node(), "en");
    expect(info.ns).toBe("");
  });

  it("infers the plural sample COUNT from the layer's current text", () => {
    const icu = "{count, plural, one {# item} other {# items}}";
    const info = connectInfoFromKey(
      result({ plural: true, translation: icu }),
      node({ characters: "5 items" }),
      "en",
    );
    expect(info.isPlural).toBe(true);
    expect(info.pluralParamValue).toBe("5");
  });

  it("infers the count from baseTranslation when the working-language translation is empty", () => {
    const info = connectInfoFromKey(
      result({
        plural: true,
        translation: undefined,
        baseTranslation: "{n, plural, one {# item} other {# items}}",
      }),
      node({ characters: "10 items" }),
      "en",
    );
    expect(info.pluralParamValue).toBe("10");
  });

  it("keeps a numeric stored count when the canvas can't be matched, else '1'", () => {
    const icu = "{count, plural, one {# item} other {# items}}";
    const withStored = connectInfoFromKey(
      result({ plural: true, translation: icu }),
      node({ characters: "no match", pluralParamValue: "7" }),
      "en",
    );
    expect(withStored.pluralParamValue).toBe("7");

    const bare = connectInfoFromKey(
      result({ plural: true, translation: icu }),
      node({ characters: "no match" }),
      "en",
    );
    expect(bare.pluralParamValue).toBe("1");
  });
});
