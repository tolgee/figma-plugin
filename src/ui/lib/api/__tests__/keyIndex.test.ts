import { afterEach, describe, expect, it, vi } from "vitest";
import { createTolgeeClient } from "../client";
import { QueryClient } from "@tanstack/svelte-query";
import type { KeySearchResult } from "../keys";
import {
  fetchKeyIndex,
  fetchKeyIndexWithNewest,
  fetchNewestKeys,
  keyIndexQueryKey,
  mergeNewestKeys,
  NEWEST_PAGE_SIZE,
  noteKeysPushed,
  resetKeyIndexTopUpState,
  topUpKeyIndex,
} from "../keyIndex";

const ORIGINAL_FETCH = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
  resetKeyIndexTopUpState();
});

function urlOf(input: unknown): URL {
  return new URL(String((input as Request).url ?? input));
}

function pageResponse(ids: number[], totalElements: number, nextCursor?: string) {
  return new Response(
    JSON.stringify({
      _embedded: {
        keys: ids.map((id) => ({
          keyId: id,
          keyName: `key${id}`,
          keyNamespace: id % 2 ? "api" : undefined,
          keyIsPlural: id === 2,
          translations: { cs: { text: `cs ${id}` }, en: { text: `en ${id}` } },
        })),
      },
      page: { totalElements },
      nextCursor,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("fetchKeyIndex", () => {
  it("loads every page by cursor and maps design + base language text", async () => {
    const mock = vi.fn(async (input: unknown) =>
      urlOf(input).searchParams.get("cursor") ? pageResponse([3], 3) : pageResponse([1, 2], 3, "c1"),
    );
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");

    const keys = await fetchKeyIndex(client, { apiUrl: "https://app.tolgee.io", projectId: 1, language: "cs", baseLanguage: "en" });

    expect(mock).toHaveBeenCalledTimes(2);
    const first = urlOf(mock.mock.calls[0]?.[0]);
    expect(first.pathname).toBe("/v2/projects/translations");
    expect(first.searchParams.getAll("languages")).toEqual(["cs", "en"]);
    expect(first.searchParams.get("size")).toBe("1000");
    expect(first.searchParams.has("search")).toBe(false);
    expect(keys?.map((k) => k.id)).toEqual([1, 2, 3]);
    expect(keys?.[0]).toMatchObject({
      name: "key1",
      namespace: "api",
      translation: "cs 1",
      baseTranslation: "en 1",
      plural: false,
    });
    expect(keys?.[1]).toMatchObject({ namespace: null, plural: true });
  });

  it("stops at the total instead of following a cursor to an empty page", async () => {
    const mock = vi.fn(async () => pageResponse([1, 2], 2, "still-a-cursor"));
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");
    await fetchKeyIndex(client, { apiUrl: "https://app.tolgee.io", projectId: 1, language: "cs" });
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("asks for one language only when the design language is the base", async () => {
    const mock = vi.fn(async (_input: unknown) => pageResponse([1], 1));
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");
    const keys = await fetchKeyIndex(client, { apiUrl: "https://app.tolgee.io", projectId: 1, language: "en", baseLanguage: "en" });
    expect(urlOf(mock.mock.calls[0]?.[0]).searchParams.getAll("languages")).toEqual(["en"]);
    expect(keys?.[0]?.baseTranslation).toBeUndefined();
  });

  it("gives up after ONE request when the project is too large", async () => {
    const mock = vi.fn(async () => pageResponse([1], 50_000, "more"));
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");
    expect(await fetchKeyIndex(client, { apiUrl: "https://app.tolgee.io", projectId: 1, language: "cs" }, undefined, 20_000)).toBeNull();
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("returns null without a request when no language is configured", async () => {
    const mock = vi.fn();
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");
    expect(await fetchKeyIndex(client, { apiUrl: "https://app.tolgee.io", projectId: 1, language: undefined })).toBeNull();
    expect(mock).not.toHaveBeenCalled();
  });

  it("throws on a server error (no silent empty index)", async () => {
    globalThis.fetch = vi.fn(async () => new Response("{}", { status: 429 })) as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");
    await expect(fetchKeyIndex(client, { apiUrl: "https://app.tolgee.io", projectId: 1, language: "cs" })).rejects.toThrow();
  });

  it("keys the cache per server, project, language, base language and branch", () => {
    const a = keyIndexQueryKey({ apiUrl: "https://app.tolgee.io", projectId: 1, language: "cs", baseLanguage: "en", branch: "" });
    const b = keyIndexQueryKey({ apiUrl: "https://app.tolgee.io", projectId: 1, language: "cs", baseLanguage: "en", branch: "dev" });
    expect(a).not.toEqual(b);
    expect(a[0]).toBe("key-index");
    // Project ids are only unique per server — switching to a self-hosted
    // Tolgee with the same project id must not serve the other server's keys.
    const otherServer = keyIndexQueryKey({
      apiUrl: "https://tolgee.example.com",
      projectId: 1,
      language: "cs",
      baseLanguage: "en",
      branch: "",
    });
    expect(otherServer).not.toEqual(a);
  });
});

const k = (id: number): KeySearchResult => ({ id, name: `key${id}`, namespace: null });

describe("fetchNewestKeys", () => {
  it("asks for the newest keys first in one request", async () => {
    const mock = vi.fn(async (_input: unknown) => pageResponse([9, 8], 9));
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");
    const keys = await fetchNewestKeys(client, { apiUrl: "https://app.tolgee.io", projectId: 1, language: "cs" });
    const url = urlOf(mock.mock.calls[0]?.[0]);
    expect(url.searchParams.get("sort")).toBe("keyId,desc");
    expect(url.searchParams.get("size")).toBe(String(NEWEST_PAGE_SIZE));
    expect(keys.map((x) => x.id)).toEqual([9, 8]);
  });
});

describe("mergeNewestKeys", () => {
  it("adds only keys the index doesn't have", () => {
    const merged = mergeNewestKeys([k(1), k(2)], [k(3), k(2)]);
    expect(merged?.map((x) => x.id)).toEqual([1, 2, 3]);
  });
  it("returns the same array when nothing is new", () => {
    const index = [k(1), k(2)];
    expect(mergeNewestKeys(index, [k(2), k(1)])).toBe(index);
  });
  it("asks for a full reload when a whole page of keys is new", () => {
    const newest = Array.from({ length: NEWEST_PAGE_SIZE }, (_, i) => k(1000 + i));
    expect(mergeNewestKeys([k(1)], newest)).toBeNull();
  });
});

describe("fetchKeyIndexWithNewest (auto-connect)", () => {
  const params = { apiUrl: "https://app.tolgee.io", projectId: 9, language: "cs" };

  it("serves the cached index plus ONE unthrottled newest-keys request — a key created seconds ago is found without a full reload", async () => {
    const qc = new QueryClient();
    qc.setQueryData(keyIndexQueryKey(params), [k(1)]);
    const mock = vi.fn(async (_input: unknown) => pageResponse([2, 1], 2));
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");

    const keys = await fetchKeyIndexWithNewest(qc, client, params);

    expect(keys?.map((x) => x.id)).toEqual([1, 2]);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(urlOf(mock.mock.calls[0]?.[0]).searchParams.get("sort")).toBe("keyId,desc");
    // The shared cache was updated too — Connect profits from the top-up.
    expect(qc.getQueryData<KeySearchResult[]>(keyIndexQueryKey(params))?.map((x) => x.id)).toEqual([1, 2]);
  });

  it("falls back to the full reload only when the whole newest page is new keys", async () => {
    const qc = new QueryClient();
    qc.setQueryData(keyIndexQueryKey(params), [k(1)]);
    const mock = vi.fn(async (input: unknown) => {
      const url = urlOf(input);
      if (url.searchParams.get("sort") === "keyId,desc") {
        return pageResponse(
          Array.from({ length: NEWEST_PAGE_SIZE }, (_, i) => 1000 + i),
          2000,
        );
      }
      return pageResponse([1, 2], 2);
    });
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");

    const keys = await fetchKeyIndexWithNewest(qc, client, params);

    expect(keys?.map((x) => x.id)).toEqual([1, 2]);
    // newest request + the forced full reload
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("still answers from the cached index when the newest-keys request fails", async () => {
    const qc = new QueryClient();
    qc.setQueryData(keyIndexQueryKey(params), [k(1)]);
    globalThis.fetch = vi.fn(async () => new Response("{}", { status: 500 })) as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");

    const keys = await fetchKeyIndexWithNewest(qc, client, params);

    expect(keys?.map((x) => x.id)).toEqual([1]);
  });

  it("returns null for an oversized project without spending a newest request", async () => {
    const qc = new QueryClient();
    const mock = vi.fn(async () => pageResponse([1], 50_000, "more"));
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");

    expect(await fetchKeyIndexWithNewest(qc, client, params)).toBeNull();
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("noteKeysPushed (after a push)", () => {
  it("patches the pushed texts into the cached index of that language and forces the next top-up — no full reload", async () => {
    const qc = new QueryClient();
    const params = { apiUrl: "https://app.tolgee.io", projectId: 11, language: "cs" };
    const loadedAt = 1_000_000;
    qc.setQueryData(keyIndexQueryKey(params), [k(1), { ...k(2), namespace: "api" }], {
      updatedAt: loadedAt,
    });
    const otherLang = { ...params, language: "en" };
    qc.setQueryData(keyIndexQueryKey(otherLang), [{ ...k(1), translation: "en 1" }]);

    noteKeysPushed(
      qc,
      [
        { name: "key1", namespace: null, text: "Nový" },
        { name: "key2", namespace: "api", text: "Dva" },
        { name: "key2", namespace: null, text: "wrong namespace" },
      ],
      "cs",
    );

    const cs = qc.getQueryData<KeySearchResult[]>(keyIndexQueryKey(params));
    expect(cs?.map((x) => x.translation)).toEqual(["Nový", "Dva"]);
    // Keeps the load time (the 5-minute full reload stays on schedule)…
    expect(qc.getQueryState(keyIndexQueryKey(params))?.dataUpdatedAt).toBe(loadedAt);
    // …and leaves other languages alone.
    expect(qc.getQueryData<KeySearchResult[]>(keyIndexQueryKey(otherLang))?.[0]?.translation).toBe(
      "en 1",
    );

    // A 1-second-old index would normally be skipped by the throttle — the
    // push forces ONE newest-keys request so the created keys show up.
    const mock = vi.fn(async (_input: unknown) => pageResponse([3, 2, 1], 3));
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");
    await topUpKeyIndex(qc, client, params, () => loadedAt + 1_000);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(cs && qc.getQueryData<KeySearchResult[]>(keyIndexQueryKey(params))?.map((x) => x.id)).toEqual([
      1, 2, 3,
    ]);
    // Forced once only — back to the throttle afterwards.
    await topUpKeyIndex(qc, client, params, () => loadedAt + 2_000);
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("topUpKeyIndex", () => {
  const params = { apiUrl: "https://app.tolgee.io", projectId: 7, language: "cs" };

  it("adds new keys, at most once per 30 s, keeping the index's load time", async () => {
    const qc = new QueryClient();
    const loadedAt = 1_000_000;
    qc.setQueryData(keyIndexQueryKey(params), [k(1)], { updatedAt: loadedAt });
    const mock = vi.fn(async (_input: unknown) => pageResponse([2, 1], 2));
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");

    // index just loaded → no top-up yet
    await topUpKeyIndex(qc, client, params, () => loadedAt + 5_000);
    expect(mock).not.toHaveBeenCalled();

    await topUpKeyIndex(qc, client, params, () => loadedAt + 31_000);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(qc.getQueryData<KeySearchResult[]>(keyIndexQueryKey(params))?.map((x) => x.id)).toEqual([1, 2]);
    expect(qc.getQueryState(keyIndexQueryKey(params))?.dataUpdatedAt).toBe(loadedAt);

    // throttled
    await topUpKeyIndex(qc, client, params, () => loadedAt + 40_000);
    expect(mock).toHaveBeenCalledTimes(1);
    await topUpKeyIndex(qc, client, params, () => loadedAt + 62_000);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("does nothing without a loaded index", async () => {
    const qc = new QueryClient();
    const mock = vi.fn();
    globalThis.fetch = mock as unknown as typeof fetch;
    const client = createTolgeeClient("https://app.tolgee.io", "k");
    await topUpKeyIndex(qc, client, { apiUrl: "https://app.tolgee.io", projectId: 8, language: "cs" }, () => 10 ** 9);
    expect(mock).not.toHaveBeenCalled();
  });
});
