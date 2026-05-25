import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTolgeeClient } from "../client";
import { fetchRemoteKeys } from "../keysByName";

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

const SAMPLE_ROW = {
  keyName: "key.one",
  keyNamespace: "common",
  keyIsPlural: false,
  keyTags: [{ name: "tag-a" }],
  translations: { en: { text: "Hello" } },
};

beforeEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("fetchRemoteKeys", () => {
  it("returns [] when filterKeyName is an empty array", async () => {
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const result = await fetchRemoteKeys(client, { filterKeyName: [] });
    expect(result).toEqual([]);
  });

  it("returns keys from _embedded.keys", async () => {
    installFetchMock(async () =>
      okResponse({ _embedded: { keys: [SAMPLE_ROW] } }),
    );
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchRemoteKeys(client, {
      filterKeyName: ["key.one"],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(SAMPLE_ROW);
  });

  it("falls back to pagedModel._embedded.keys when _embedded is missing", async () => {
    installFetchMock(async () =>
      okResponse({ pagedModel: { _embedded: { keys: [SAMPLE_ROW] } } }),
    );
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchRemoteKeys(client, {
      filterKeyName: ["key.one"],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(SAMPLE_ROW);
  });

  it("returns [] on API error", async () => {
    installFetchMock(async () => errorResponse(500));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchRemoteKeys(client, {
      filterKeyName: ["key.one"],
    });

    expect(result).toEqual([]);
  });

  it("passes branch param in query when provided", async () => {
    const mock = installFetchMock(async () =>
      okResponse({ _embedded: { keys: [] } }),
    );
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    await fetchRemoteKeys(client, {
      filterKeyName: ["key.one"],
      branch: "feature/my-branch",
    });

    const calledUrl: string = mock.mock.calls[0]?.[0] instanceof Request
      ? mock.mock.calls[0][0].url
      : String(mock.mock.calls[0]?.[0] ?? "");

    expect(calledUrl).toContain("branch=feature%2Fmy-branch");
  });
});
