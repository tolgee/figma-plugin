import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getProjectMeta } from "../projectMeta";

type FetchMock = ReturnType<typeof vi.fn>;

const ORIGINAL_FETCH = globalThis.fetch;

function installFetchMock(impl: (...args: unknown[]) => Promise<Response>) {
  const mock: FetchMock = vi.fn(impl as never);
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

function okResponse(body: object) {
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

describe("getProjectMeta", () => {
  it("returns correct metadata from API response", async () => {
    installFetchMock(async () => okResponse({ useNamespaces: true, useBranching: true }));

    const result = await getProjectMeta("https://app.tolgee.io", "tg-key", 42);

    expect(result.namespacesFeaturesEnabled).toBe(true);
    expect(result.branchingEnabled).toBe(true);
  });

  it("strips trailing slash from apiUrl", async () => {
    const mock = installFetchMock(async () =>
      okResponse({ useNamespaces: false, useBranching: false }),
    );

    await getProjectMeta("https://app.tolgee.io/", "tg-key", 1);

    const firstArg = mock.mock.calls[0]?.[0];
    const calledUrl = firstArg instanceof Request ? firstArg.url : String(firstArg ?? "");
    expect(calledUrl).not.toContain("//v2");
    expect(calledUrl).toMatch(/^https:\/\/app\.tolgee\.io\/v2\//);
  });

  it("sends request to the correct URL /v2/projects/{projectId}", async () => {
    const mock = installFetchMock(async () =>
      okResponse({ useNamespaces: false, useBranching: false }),
    );

    await getProjectMeta("https://app.tolgee.io", "tg-key", 99);

    const firstArg = mock.mock.calls[0]?.[0];
    const calledUrl = firstArg instanceof Request ? firstArg.url : String(firstArg ?? "");
    expect(calledUrl).toBe("https://app.tolgee.io/v2/projects/99");
  });

  it("throws on non-ok HTTP response", async () => {
    installFetchMock(
      async () =>
        new Response(JSON.stringify({ code: "project_not_found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
    );

    await expect(getProjectMeta("https://app.tolgee.io", "tg-key", 1)).rejects.toThrow(
      "Failed to load project meta (status 404)",
    );
  });

  it("maps missing/undefined flags as false", async () => {
    installFetchMock(async () => okResponse({}));

    const result = await getProjectMeta("https://app.tolgee.io", "tg-key", 1);

    expect(result.namespacesFeaturesEnabled).toBe(false);
    expect(result.branchingEnabled).toBe(false);
  });
});
