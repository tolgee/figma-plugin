import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchBranches } from "../branches";
import { createTolgeeClient } from "../client";

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

beforeEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("fetchBranches", () => {
  it("returns branch names from the response", async () => {
    installFetchMock(async () =>
      okResponse({
        _embedded: {
          branches: [
            { name: "main", active: true },
            { name: "feature/x", active: false },
          ],
        },
      }),
    );
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchBranches(client);

    expect(result).toEqual([{ name: "main" }, { name: "feature/x" }]);
  });

  it("returns [] when _embedded is missing", async () => {
    installFetchMock(async () => okResponse({}));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchBranches(client);

    expect(result).toEqual([]);
  });

  it("filters out entries that have no name", async () => {
    installFetchMock(async () =>
      okResponse({
        _embedded: {
          branches: [
            { name: "main", active: true },
            { active: false }, // name undefined
            { name: "", active: false }, // name empty string (falsy)
          ],
        },
      }),
    );
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchBranches(client);

    expect(result).toEqual([{ name: "main" }]);
  });

  it("returns [] when the branches array is empty", async () => {
    installFetchMock(async () => okResponse({ _embedded: { branches: [] } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchBranches(client);

    expect(result).toEqual([]);
  });
});
