import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchBranches,
  isConfiguredBranchMissing,
  pickDefaultBranch,
} from "../branches";
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
            { name: "main", isDefault: true },
            { name: "feature/x", isDefault: false },
          ],
        },
      }),
    );
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchBranches(client);

    expect(result).toEqual([
      { name: "main", isDefault: true },
      { name: "feature/x", isDefault: false },
    ]);
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
            { name: "main", isDefault: true },
            { isDefault: false }, // name undefined
            { name: "", isDefault: false }, // name empty string (falsy)
          ],
        },
      }),
    );
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchBranches(client);

    expect(result).toEqual([{ name: "main", isDefault: true }]);
  });

  it("returns [] when the branches array is empty", async () => {
    installFetchMock(async () => okResponse({ _embedded: { branches: [] } }));
    const client = createTolgeeClient("https://app.tolgee.io", "test-key");

    const result = await fetchBranches(client);

    expect(result).toEqual([]);
  });
});

describe("pickDefaultBranch", () => {
  it("prefers the default branch (isDefault, like the original plugin)", () => {
    expect(
      pickDefaultBranch([
        { name: "main", isDefault: false },
        { name: "feature/x", isDefault: true },
      ]),
    ).toBe("feature/x");
  });

  it('falls back to "main" when none is marked default', () => {
    expect(
      pickDefaultBranch([{ name: "dev" }, { name: "main" }]),
    ).toBe("main");
  });

  it('falls back to the first branch when no default and no "main"', () => {
    expect(pickDefaultBranch([{ name: "dev" }, { name: "staging" }])).toBe("dev");
  });

  it("returns an empty string when there are no branches", () => {
    expect(pickDefaultBranch([])).toBe("");
  });
});

describe("isConfiguredBranchMissing", () => {
  const BRANCHES = [{ name: "main", isDefault: true }, { name: "feature/x" }];

  it("flags a configured branch absent from the loaded list", () => {
    expect(isConfiguredBranchMissing("deleted", BRANCHES, true)).toBe(true);
  });

  it("does not flag a branch present in the loaded list", () => {
    expect(isConfiguredBranchMissing("feature/x", BRANCHES, true)).toBe(false);
  });

  it("does not flag when no branch is configured", () => {
    expect(isConfiguredBranchMissing("", BRANCHES, true)).toBe(false);
  });

  it("does not flag while branches have not loaded yet (or the fetch failed)", () => {
    // The empty list here means "nothing fetched", not "no branches exist" —
    // trusting it would warn on every startup before hydration finishes.
    expect(isConfiguredBranchMissing("main", [], false)).toBe(false);
  });

  it("flags when the fetch succeeded with an empty branch list", () => {
    expect(isConfiguredBranchMissing("main", [], true)).toBe(true);
  });
});

describe("fetchBranches — failed request", () => {
  it("throws instead of reporting an empty branch list", async () => {
    // `openapi-fetch` RESOLVES on 4xx/5xx with an `error` field rather than
    // throwing. Discarding it turned a failed request into "this project has
    // no branches" on the SUCCESS path — `hydrateBranches` then set
    // `loaded: true` and the UI announced that the user's configured branch
    // had been deleted, offering an empty picker to replace it.
    const client = {
      GET: async () => ({ error: { message: "Forbidden" } }),
    } as unknown as Parameters<typeof fetchBranches>[0];

    await expect(fetchBranches(client)).rejects.toThrow("Forbidden");
  });

  it("still returns the list on success", async () => {
    const client = {
      GET: async () => ({
        data: { _embedded: { branches: [{ name: "main", isDefault: true }] } },
      }),
    } as unknown as Parameters<typeof fetchBranches>[0];

    await expect(fetchBranches(client)).resolves.toEqual([{ name: "main", isDefault: true }]);
  });
});
