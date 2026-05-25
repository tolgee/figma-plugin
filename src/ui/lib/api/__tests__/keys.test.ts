import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTolgeeClient } from "../client";
import { searchKeys } from "../keys";

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
    const mock = installFetchMock(async () =>
      okResponse({ _embedded: { keys: [] } }),
    );
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    await searchKeys(client, "search-term", "de", 10);

    const calledUrl: string = mock.mock.calls[0]?.[0] instanceof Request
      ? mock.mock.calls[0][0].url
      : String(mock.mock.calls[0]?.[0] ?? "");

    expect(calledUrl).toContain("languageTag=de");
    expect(calledUrl).toContain("search=search-term");
    expect(calledUrl).toContain("size=10");
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
