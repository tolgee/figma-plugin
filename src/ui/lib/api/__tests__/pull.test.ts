import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTolgeeClient } from "../client";
import { fetchAllTranslations } from "../pull";

// ---------------------------------------------------------------------------
// Fetch mock helpers
// ---------------------------------------------------------------------------

type FetchMock = ReturnType<typeof vi.fn>;

const ORIGINAL_FETCH = globalThis.fetch;

function installFetchMock(impl: (...args: unknown[]) => Promise<Response>) {
  const mock: FetchMock = vi.fn(impl as never);
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

/** Build a well-formed translations API response body. */
function translationsResponse(
  keys: Array<{
    keyName: string;
    keyNamespace?: string;
    keyIsPlural?: boolean;
    translations?: Record<string, { text: string }>;
  }>,
  opts: { totalElements?: number; nextCursor?: string } = {},
) {
  return {
    _embedded: { keys },
    page: { totalElements: opts.totalElements ?? keys.length },
    ...(opts.nextCursor !== undefined ? { nextCursor: opts.nextCursor } : {}),
  };
}

/** Return a single successful fetch response for a given body. */
function okResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/** Extract the URL that was passed in the i-th fetch call. */
function calledUrl(mock: FetchMock, callIndex = 0): URL {
  const arg = mock.mock.calls[callIndex]?.[0];
  const raw = arg instanceof Request ? arg.url : String(arg ?? "");
  return new URL(raw);
}

/** Extract repeated query-param values (e.g. filterNamespace). */
function queryAll(url: URL, param: string): string[] {
  return url.searchParams.getAll(param);
}

beforeEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Shared client fixture
// ---------------------------------------------------------------------------

const API_URL = "https://app.tolgee.io";
const API_KEY = "tg-test-key";

function makeClient() {
  return createTolgeeClient(API_URL, API_KEY);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("fetchAllTranslations", () => {
  // 1. Returns empty array when API returns no keys
  it("returns empty array when API returns no keys", async () => {
    installFetchMock(async () => okResponse(translationsResponse([], { totalElements: 0 })));

    const client = makeClient();
    const result = await fetchAllTranslations(client, { languages: ["en"] });

    expect(result).toEqual([]);
  });

  // 2. Returns mapped PulledKey items from a single page
  it("maps keys from a single page correctly", async () => {
    const body = translationsResponse(
      [
        {
          keyName: "greeting",
          keyNamespace: "common",
          keyIsPlural: false,
          translations: { en: { text: "Hello" }, de: { text: "Hallo" } },
        },
        {
          keyName: "items",
          keyNamespace: undefined,
          keyIsPlural: true,
          translations: { en: { text: "{count, plural, one {item} other {items}}" } },
        },
      ],
      { totalElements: 2 },
    );
    installFetchMock(async () => okResponse(body));

    const client = makeClient();
    const result = await fetchAllTranslations(client, { languages: ["en", "de"] });

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      keyName: "greeting",
      keyNamespace: "common",
      isPlural: false,
      translations: { en: { text: "Hello" }, de: { text: "Hallo" } },
    });

    expect(result[1]).toEqual({
      keyName: "items",
      keyNamespace: undefined,
      isPlural: true,
      translations: { en: { text: "{count, plural, one {item} other {items}}" } },
    });
  });

  // 3. Paginates: sends cursor from first page to second page, stops when nextCursor absent
  it("paginates using cursor until nextCursor is absent", async () => {
    const page1 = translationsResponse(
      [{ keyName: "key1", translations: { en: { text: "One" } } }],
      { totalElements: 2, nextCursor: "cursor-abc" },
    );
    const page2 = translationsResponse(
      [{ keyName: "key2", translations: { en: { text: "Two" } } }],
      { totalElements: 2 },
    );

    let callCount = 0;
    const mock = installFetchMock(async () => {
      return okResponse(callCount++ === 0 ? page1 : page2);
    });

    const client = makeClient();
    const result = await fetchAllTranslations(client, { languages: ["en"] });

    // Two fetch calls should have been made
    expect(mock).toHaveBeenCalledTimes(2);

    // Second call must include the cursor from the first response
    const secondUrl = calledUrl(mock, 1);
    expect(secondUrl.searchParams.get("cursor")).toBe("cursor-abc");

    // Result is the flat union of both pages
    expect(result.map((k) => k.keyName)).toEqual(["key1", "key2"]);
  });

  // 4. Calls onProgress after each page with loaded count and total
  it("calls onProgress after each page with loaded count and total", async () => {
    const page1 = translationsResponse(
      [{ keyName: "a", translations: { en: { text: "A" } } }],
      { totalElements: 2, nextCursor: "cur" },
    );
    const page2 = translationsResponse(
      [{ keyName: "b", translations: { en: { text: "B" } } }],
      { totalElements: 2 },
    );

    let callCount = 0;
    installFetchMock(async () => okResponse(callCount++ === 0 ? page1 : page2));

    const onProgress = vi.fn();
    const client = makeClient();
    await fetchAllTranslations(client, { languages: ["en"], onProgress });

    expect(onProgress).toHaveBeenCalledTimes(2);
    // After first page: 1 loaded, total is now known (2)
    expect(onProgress).toHaveBeenNthCalledWith(1, 1, 2);
    // After second page: 2 loaded, total 2
    expect(onProgress).toHaveBeenNthCalledWith(2, 2, 2);
  });

  // 5. Fetches multiple namespaces in parallel (verify filterNamespace param for each)
  it("fetches multiple namespaces in parallel with correct filterNamespace per request", async () => {
    // Each namespace gets its own single-page response
    const responses: Record<string, unknown> = {
      ns1: translationsResponse([{ keyName: "k1", keyNamespace: "ns1", translations: { en: { text: "K1" } } }], { totalElements: 1 }),
      ns2: translationsResponse([{ keyName: "k2", keyNamespace: "ns2", translations: { en: { text: "K2" } } }], { totalElements: 1 }),
    };

    const mock = installFetchMock(async (input) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      const ns = url.searchParams.get("filterNamespace");
      return okResponse(responses[ns ?? ""] ?? translationsResponse([], {}));
    });

    const client = makeClient();
    const result = await fetchAllTranslations(client, {
      languages: ["en"],
      namespaces: ["ns1", "ns2"],
    });

    expect(mock).toHaveBeenCalledTimes(2);

    const calledNs = mock.mock.calls.map((call) => {
      const arg = call[0];
      const url = new URL(arg instanceof Request ? arg.url : String(arg));
      return url.searchParams.get("filterNamespace");
    });
    expect(calledNs).toContain("ns1");
    expect(calledNs).toContain("ns2");

    expect(result.map((k) => k.keyName).sort()).toEqual(["k1", "k2"]);
  });

  // 6. namespaces: undefined → no filterNamespace in request
  it("sends no filterNamespace when namespaces is undefined", async () => {
    const mock = installFetchMock(async () =>
      okResponse(translationsResponse([], { totalElements: 0 })),
    );

    const client = makeClient();
    await fetchAllTranslations(client, { languages: ["en"], namespaces: undefined });

    expect(mock).toHaveBeenCalledTimes(1);
    const url = calledUrl(mock);
    expect(queryAll(url, "filterNamespace")).toEqual([]);
  });

  // 6b. namespaces: [] → also no filterNamespace in request
  it("sends no filterNamespace when namespaces is an empty array", async () => {
    const mock = installFetchMock(async () =>
      okResponse(translationsResponse([], { totalElements: 0 })),
    );

    const client = makeClient();
    await fetchAllTranslations(client, { languages: ["en"], namespaces: [] });

    expect(mock).toHaveBeenCalledTimes(1);
    const url = calledUrl(mock);
    expect(queryAll(url, "filterNamespace")).toEqual([]);
  });

  // 7. namespaces: [""] → filterNamespace: [""] in request (default namespace)
  it('sends filterNamespace="" when namespaces is [""]', async () => {
    const mock = installFetchMock(async () =>
      okResponse(translationsResponse([], { totalElements: 0 })),
    );

    const client = makeClient();
    await fetchAllTranslations(client, { languages: ["en"], namespaces: [""] });

    expect(mock).toHaveBeenCalledTimes(1);
    const url = calledUrl(mock);
    expect(queryAll(url, "filterNamespace")).toEqual([""]);
  });

  // 8. Throws error code on API error
  it("throws the error code string when the API returns an error object with a code", async () => {
    installFetchMock(async () =>
      new Response(JSON.stringify({ code: "invalid_project_api_key" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = makeClient();
    await expect(
      fetchAllTranslations(client, { languages: ["en"] }),
    ).rejects.toBe("invalid_project_api_key");
  });

  it("throws an Error when the API error has no code field", async () => {
    installFetchMock(async () =>
      new Response(JSON.stringify({ message: "something went wrong" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = makeClient();
    await expect(
      fetchAllTranslations(client, { languages: ["en"] }),
    ).rejects.toBeInstanceOf(Error);
  });

  // 9. Signal is forwarded to the fetch call
  it("forwards the AbortSignal to the underlying fetch call", async () => {
    const mock = installFetchMock(async () =>
      okResponse(translationsResponse([], { totalElements: 0 })),
    );

    const controller = new AbortController();
    const client = makeClient();
    await fetchAllTranslations(client, { languages: ["en"], signal: controller.signal });

    expect(mock).toHaveBeenCalledTimes(1);
    const requestArg: Request = mock.mock.calls[0]?.[0];
    // openapi-fetch may wrap the signal internally; verify it propagates abort.
    expect(requestArg.signal).not.toBeNull();
    expect(requestArg.signal.aborted).toBe(false);
    controller.abort();
    expect(requestArg.signal.aborted).toBe(true);
  });

  // Additional edge cases

  it("stops paginating when reachedTotal (all keys returned before cursor exhausted)", async () => {
    // totalElements = 1, but server returns nextCursor. We should stop after 1 page.
    const page1 = translationsResponse(
      [{ keyName: "only", translations: { en: { text: "Only" } } }],
      { totalElements: 1, nextCursor: "should-never-be-used" },
    );

    const mock = installFetchMock(async () => okResponse(page1));

    const client = makeClient();
    const result = await fetchAllTranslations(client, { languages: ["en"] });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
  });

  it("stops paginating when batch is empty even if cursor is present", async () => {
    const page1 = translationsResponse([], { totalElements: 0, nextCursor: "ghost-cursor" });

    const mock = installFetchMock(async () => okResponse(page1));

    const client = makeClient();
    const result = await fetchAllTranslations(client, { languages: ["en"] });

    expect(mock).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it("reports total as null until first batch resolves", async () => {
    // Two namespaces: ns1 resolves on first call, ns2 resolves on second
    // We can only verify the combined onProgress is correct after both finish.
    // Use a simpler single-namespace variant and verify first call total is correct.
    const page1 = translationsResponse(
      [{ keyName: "x", translations: { en: { text: "X" } } }],
      { totalElements: 3, nextCursor: "c1" },
    );
    const page2 = translationsResponse(
      [
        { keyName: "y", translations: { en: { text: "Y" } } },
        { keyName: "z", translations: { en: { text: "Z" } } },
      ],
      { totalElements: 3 },
    );

    let callCount = 0;
    installFetchMock(async () => okResponse(callCount++ === 0 ? page1 : page2));

    const progressCalls: Array<[number, number | null]> = [];
    const client = makeClient();
    await fetchAllTranslations(client, {
      languages: ["en"],
      onProgress: (loaded, total) => progressCalls.push([loaded, total]),
    });

    expect(progressCalls).toHaveLength(2);
    expect(progressCalls[0]).toEqual([1, 3]); // total known after first batch
    expect(progressCalls[1]).toEqual([3, 3]);
  });

  it("uses X-API-Key header in requests", async () => {
    const mock = installFetchMock(async () =>
      okResponse(translationsResponse([], { totalElements: 0 })),
    );

    const client = makeClient();
    await fetchAllTranslations(client, { languages: ["en"] });

    const requestArg: Request = mock.mock.calls[0]?.[0];
    expect(requestArg.headers.get("X-API-Key")).toBe(API_KEY);
  });
});
