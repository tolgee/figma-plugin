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
    installFetchMock(async () => okResponse({ _embedded: { keys: [SAMPLE_ROW] } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchRemoteKeys(client, {
      filterKeyName: ["key.one"],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(SAMPLE_ROW);
  });

  it("falls back to pagedModel._embedded.keys when _embedded is missing", async () => {
    installFetchMock(async () => okResponse({ pagedModel: { _embedded: { keys: [SAMPLE_ROW] } } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchRemoteKeys(client, {
      filterKeyName: ["key.one"],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(SAMPLE_ROW);
  });

  it("throws on API error instead of silently returning []", async () => {
    installFetchMock(async () => errorResponse(500));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    await expect(
      fetchRemoteKeys(client, {
        filterKeyName: ["key.one"],
      }),
    ).rejects.toThrow();
  });

  it("passes branch param in query when provided", async () => {
    const mock = installFetchMock(async () => okResponse({ _embedded: { keys: [] } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    await fetchRemoteKeys(client, {
      filterKeyName: ["key.one"],
      branch: "feature/my-branch",
    });

    const calledUrl: string =
      mock.mock.calls[0]?.[0] instanceof Request
        ? mock.mock.calls[0][0].url
        : String(mock.mock.calls[0]?.[0] ?? "");

    expect(calledUrl).toContain("branch=feature%2Fmy-branch");
  });

  // ---------------------------------------------------------------------
  // Batching (>200 names split into multiple parallel requests)
  // ---------------------------------------------------------------------

  function calledUrl(mock: FetchMock, callIndex: number): URL {
    const arg = mock.mock.calls[callIndex]?.[0];
    const raw = arg instanceof Request ? arg.url : String(arg ?? "");
    return new URL(raw);
  }

  function rowFor(name: string) {
    return {
      keyName: name,
      keyNamespace: undefined,
      keyIsPlural: false,
      translations: { en: { text: `text-${name}` } },
    };
  }

  it("splits 450 short key names into batches whose cumulative length stays under the max, and merges the results", async () => {
    const mock = installFetchMock(async (input) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      const names = url.searchParams.getAll("filterKeyName");
      const totalChars = names.reduce((sum, n) => sum + n.length, 0);
      expect(totalChars).toBeLessThanOrEqual(3000);
      return okResponse({ _embedded: { keys: names.map(rowFor) } });
    });

    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const filterKeyName = Array.from({ length: 450 }, (_, i) => `key-${i}`);

    const result = await fetchRemoteKeys(client, { filterKeyName });

    // 450 short names (~6-7 chars each, ~3000 chars total) now split by length
    // rather than by a fixed count of 200 — with these short names that
    // happens to land on 2 batches, not 3 (short names pack far more than
    // 200 per batch before the character budget is hit).
    expect(mock).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(450);
    expect(new Set(result.map((r) => r.keyName))).toEqual(new Set(filterKeyName));
  });

  it("does not batch a small request (<=200 names) — still a single request", async () => {
    const mock = installFetchMock(async () => okResponse({ _embedded: { keys: [] } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const filterKeyName = Array.from({ length: 150 }, (_, i) => `key-${i}`);

    await fetchRemoteKeys(client, { filterKeyName });

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("propagates an error from any single batch as a failure of the whole call", async () => {
    let callCount = 0;
    installFetchMock(async () => {
      callCount++;
      // Fail the 2nd batch specifically.
      if (callCount === 2) return errorResponse(500);
      return okResponse({ _embedded: { keys: [] } });
    });

    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const filterKeyName = Array.from({ length: 450 }, (_, i) => `key-${i}`);

    await expect(fetchRemoteKeys(client, { filterKeyName })).rejects.toThrow();
  });

  it("follows cursor pagination within a single batch and merges all pages", async () => {
    const filterKeyName = ["a", "b"];
    let callCount = 0;
    const mock = installFetchMock(async () => {
      callCount++;
      if (callCount === 1) {
        return okResponse({
          _embedded: { keys: [rowFor("a")] },
          nextCursor: "cursor-1",
        });
      }
      return okResponse({ _embedded: { keys: [rowFor("b")] } });
    });

    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const result = await fetchRemoteKeys(client, { filterKeyName });

    expect(mock).toHaveBeenCalledTimes(2);
    expect(calledUrl(mock, 1).searchParams.get("cursor")).toBe("cursor-1");
    expect(result.map((r) => r.keyName).sort()).toEqual(["a", "b"]);
  });

  // ---------------------------------------------------------------------
  // Length-based batching (task 12: full-sentence camelCase key names can
  // overflow the URL budget well under the 200-name count cap)
  // ---------------------------------------------------------------------

  function sentenceLikeName(i: number, len: number): string {
    const base = `sentenceKeyNumber${i}`;
    return base.length >= len ? base.slice(0, len) : base + "x".repeat(len - base.length);
  }

  it("batches full-sentence-length key names (~80 chars each) by cumulative length, producing more (smaller) batches than a naive 200-count chunk would", async () => {
    const mock = installFetchMock(async (input) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      const names = url.searchParams.getAll("filterKeyName");
      const totalChars = names.reduce((sum, n) => sum + n.length, 0);
      expect(totalChars).toBeLessThanOrEqual(3000);
      return okResponse({ _embedded: { keys: names.map(rowFor) } });
    });

    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    // 250 names x ~80 chars: a naive count-based chunk of 200 would produce
    // ceil(250/200) = 2 batches. By length (3000-char budget), ~37 such
    // names fit per batch, so this must split into noticeably more batches.
    const filterKeyName = Array.from({ length: 250 }, (_, i) => sentenceLikeName(i, 80));

    const result = await fetchRemoteKeys(client, { filterKeyName });

    expect(mock.mock.calls.length).toBeGreaterThan(2);
    expect(result).toHaveLength(250);
    expect(new Set(result.map((r) => r.keyName))).toEqual(new Set(filterKeyName));
  });

  it("still sends a single name longer than MAX_BATCH_CHARS on its own, rather than dropping it", async () => {
    const mock = installFetchMock(async (input) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      const names = url.searchParams.getAll("filterKeyName");
      return okResponse({ _embedded: { keys: names.map(rowFor) } });
    });

    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const hugeName = sentenceLikeName(0, 3500); // longer than the 3000-char batch budget on its own

    const result = await fetchRemoteKeys(client, { filterKeyName: [hugeName] });

    expect(mock).toHaveBeenCalledTimes(1);
    const names = calledUrl(mock, 0).searchParams.getAll("filterKeyName");
    expect(names).toEqual([hugeName]);
    expect(result.map((r) => r.keyName)).toEqual([hugeName]);
  });

  // ---------------------------------------------------------------------
  // onProgress (task 7f: Push diff-computation progress bar)
  // ---------------------------------------------------------------------

  it("reports progress per batch as each resolves (not after Promise.all settles), ending at done === total", async () => {
    // Each name alone exceeds MAX_BATCH_CHARS, so each becomes its own
    // single-name batch — 3 names -> 3 batches, guaranteed by `chunkByLength`.
    const filterKeyName = [
      sentenceLikeName(1, 3500),
      sentenceLikeName(2, 3500),
      sentenceLikeName(3, 3500),
    ];

    let callCount = 0;
    installFetchMock(async (input) => {
      callCount++;
      const thisCall = callCount;
      const url = new URL(input instanceof Request ? input.url : String(input));
      const names = url.searchParams.getAll("filterKeyName");
      // Stagger resolution deliberately out of call order — the 2nd request
      // resolves fastest, proving progress isn't just tracking call order.
      const delay = thisCall === 1 ? 15 : thisCall === 2 ? 1 : 8;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return okResponse({ _embedded: { keys: names.map(rowFor) } });
    });

    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const onProgress = vi.fn();

    const result = await fetchRemoteKeys(client, { filterKeyName }, onProgress);

    expect(result).toHaveLength(3);
    expect(onProgress).toHaveBeenCalledTimes(3);
    const doneValues = onProgress.mock.calls.map((c) => c[0] as number);
    expect(doneValues).toEqual([...doneValues].sort((a, b) => a - b));
    expect(new Set(doneValues).size).toBe(doneValues.length); // strictly increasing
    expect(onProgress.mock.calls.every((c) => c[1] === 3)).toBe(true);
    expect(onProgress.mock.calls.at(-1)).toEqual([3, 3]);
  });

  it("packs a mix of short and long names efficiently — short names group together instead of one-per-batch", async () => {
    const mock = installFetchMock(async (input) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      const names = url.searchParams.getAll("filterKeyName");
      const totalChars = names.reduce((sum, n) => sum + n.length, 0);
      expect(totalChars).toBeLessThanOrEqual(3000);
      return okResponse({ _embedded: { keys: names.map(rowFor) } });
    });

    const client = createTolgeeClient("https://app.tolgee.io", "test-key");
    const shortNames = Array.from({ length: 50 }, (_, i) => `s${i}`); // ~140 chars total
    const longNames = [sentenceLikeName(1, 2000), sentenceLikeName(2, 2000)];
    const filterKeyName = [...shortNames, ...longNames];

    const result = await fetchRemoteKeys(client, { filterKeyName });

    // All 50 short names (~140 chars) comfortably pack alongside the first
    // 2000-char long name in one batch; the second long name needs its own
    // batch since it would push the first over budget. That's 2 requests
    // total, not 52 (one-per-name) and not 1 (everything crammed together).
    expect(mock).toHaveBeenCalledTimes(2);
    const firstBatchNames = calledUrl(mock, 0).searchParams.getAll("filterKeyName");
    expect(firstBatchNames.length).toBeGreaterThan(1);
    expect(result).toHaveLength(52);
    expect(new Set(result.map((r) => r.keyName))).toEqual(new Set(filterKeyName));
  });
});
