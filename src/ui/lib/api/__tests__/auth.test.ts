import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REQUIRED_SCOPES, hasRequiredScopes, validateApiKey } from "../auth";

type FetchMock = ReturnType<typeof vi.fn>;

const ORIGINAL_FETCH = globalThis.fetch;

function installFetchMock(impl: (...args: unknown[]) => Promise<Response>) {
  const mock: FetchMock = vi.fn(impl as never);
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

beforeEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("validateApiKey", () => {
  it("returns ok:true with projectId and scopes on success", async () => {
    const body = {
      projectId: 42,
      scopes: ["translations.view", "translations.edit"],
      userFullName: "Test User",
      branchingEnabled: false,
      id: 1,
      description: "",
      projectName: "Demo",
    };
    installFetchMock(
      async () =>
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    const result = await validateApiKey("https://app.tolgee.io", "tg-key");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.projectId).toBe(42);
      expect(result.scopes).toEqual(["translations.view", "translations.edit"]);
      expect(result.userFullName).toBe("Test User");
    }
  });

  it("returns ok:false with invalid_api_key on 401", async () => {
    installFetchMock(
      async () =>
        new Response(JSON.stringify({ code: "invalid_api_key" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
    );

    const result = await validateApiKey("https://app.tolgee.io", "bad");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("auth.invalid_api_key");
    }
  });

  it("returns ok:false on network error", async () => {
    installFetchMock(async () => {
      throw new TypeError("Failed to fetch");
    });

    const result = await validateApiKey("https://app.tolgee.io", "tg-key");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("auth.network_error");
    }
  });

  it("strips trailing slash from apiUrl when building the request", async () => {
    const mock = installFetchMock(
      async () =>
        new Response(
          JSON.stringify({
            projectId: 1,
            scopes: [],
            branchingEnabled: false,
            id: 1,
            description: "",
            projectName: "Demo",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    );

    await validateApiKey("https://app.tolgee.io/", "tg-key");
    const firstArg = mock.mock.calls[0]?.[0];
    const calledUrl = firstArg instanceof Request ? firstArg.url : String(firstArg ?? "");
    expect(calledUrl).toBe("https://app.tolgee.io/v2/api-keys/current");
  });
});

describe("hasRequiredScopes", () => {
  it("returns true when all required scopes are present", () => {
    expect(
      hasRequiredScopes(
        ["translations.view", "translations.edit", "keys.create"],
        [...REQUIRED_SCOPES.push],
      ),
    ).toBe(true);
  });

  it("returns false when a required scope is missing", () => {
    expect(hasRequiredScopes(["translations.view"], [...REQUIRED_SCOPES.push])).toBe(false);
  });

  it("returns true when the required list is empty", () => {
    expect(hasRequiredScopes([], [])).toBe(true);
  });

  it("exposes the documented scope groups", () => {
    expect(REQUIRED_SCOPES.pull).toContain("translations.view");
    expect(REQUIRED_SCOPES.push).toContain("translations.edit");
    expect(REQUIRED_SCOPES.push).toContain("keys.create");
    expect(REQUIRED_SCOPES.screenshots).toContain("screenshots.upload");
  });
});
