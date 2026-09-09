import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTolgeeClient } from "../client";
import { applyTags } from "../tags";
import type { TaggableKey } from "../tags";

type FetchMock = ReturnType<typeof vi.fn>;

const ORIGINAL_FETCH = globalThis.fetch;

function installFetchMock(impl: (...args: unknown[]) => Promise<Response>) {
  const mock: FetchMock = vi.fn(impl as never);
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

const SOME_TAGS: string[] = ["reviewed"];
const SOME_KEYS: TaggableKey[] = [{ name: "key.one" }, { name: "key.two", namespace: "ns" }];

function makeClient() {
  return createTolgeeClient("https://app.tolgee.io", "test-key");
}

beforeEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("applyTags", () => {
  it("returns immediately (no-op) when tagFiltered is empty", async () => {
    // No fetch mock — the function must not make any network calls.
    await expect(applyTags(makeClient(), [], SOME_KEYS)).resolves.toBeUndefined();
  });

  it("returns immediately (no-op) when keys is empty", async () => {
    await expect(applyTags(makeClient(), SOME_TAGS, [])).resolves.toBeUndefined();
  });

  it("does not throw on success", async () => {
    installFetchMock(
      async () =>
        new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    await expect(applyTags(makeClient(), SOME_TAGS, SOME_KEYS)).resolves.toBeUndefined();
  });

  it("throws when the API returns an error response", async () => {
    installFetchMock(
      async () =>
        new Response('{"code":"forbidden"}', {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
    );

    await expect(applyTags(makeClient(), SOME_TAGS, SOME_KEYS)).rejects.toThrow(
      "Failed to apply tags (status 403)",
    );
  });

  it("sends branch in query params when provided", async () => {
    const mock = installFetchMock(
      async () =>
        new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    await applyTags(makeClient(), SOME_TAGS, SOME_KEYS, "my-branch");

    const firstArg = mock.mock.calls[0]?.[0];
    const calledUrl = firstArg instanceof Request ? firstArg.url : String(firstArg ?? "");
    expect(calledUrl).toContain("branch=my-branch");
  });
});
