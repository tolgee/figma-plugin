import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadScreenshot } from "../screenshots";

type FetchMock = ReturnType<typeof vi.fn>;

const ORIGINAL_FETCH = globalThis.fetch;

function installFetchMock(impl: (...args: unknown[]) => Promise<Response>) {
  const mock: FetchMock = vi.fn(impl as never);
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

function makeImage(bytes = [0x89, 0x50, 0x4e, 0x47]): Uint8Array {
  return new Uint8Array(bytes);
}

const DEFAULT_INFO = { location: "figma-frame-1" };

beforeEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("uploadScreenshot", () => {
  it("returns { id: N } on success", async () => {
    installFetchMock(
      async () =>
        new Response(JSON.stringify({ id: 7 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    const result = await uploadScreenshot(
      "https://app.tolgee.io",
      "tg-key",
      makeImage(),
      DEFAULT_INFO,
    );

    expect(result).toEqual({ id: 7 });
  });

  it("throws when apiUrl is empty string", async () => {
    // No fetch mock needed — the guard runs before the request.
    await expect(uploadScreenshot("", "tg-key", makeImage(), DEFAULT_INFO)).rejects.toThrow(
      "Cannot upload screenshot: API URL is empty",
    );
  });

  it("throws on non-ok HTTP response", async () => {
    installFetchMock(
      async () =>
        new Response(JSON.stringify({ code: "unauthorized" }), {
          status: 401,
          statusText: "Unauthorized",
          headers: { "Content-Type": "application/json" },
        }),
    );

    await expect(
      uploadScreenshot("https://app.tolgee.io", "bad-key", makeImage(), DEFAULT_INFO),
    ).rejects.toThrow("Screenshot upload failed (status 401: Unauthorized)");
  });

  it("throws when response body has no numeric id", async () => {
    installFetchMock(
      async () =>
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    await expect(
      uploadScreenshot("https://app.tolgee.io", "tg-key", makeImage(), DEFAULT_INFO),
    ).rejects.toThrow("Screenshot upload returned no image id");
  });

  it("strips trailing slash from apiUrl", async () => {
    const mock = installFetchMock(
      async () =>
        new Response(JSON.stringify({ id: 1 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    await uploadScreenshot("https://app.tolgee.io/", "tg-key", makeImage(), DEFAULT_INFO);

    const firstArg = mock.mock.calls[0]?.[0];
    const calledUrl = firstArg instanceof Request ? firstArg.url : String(firstArg ?? "");
    expect(calledUrl).not.toContain("//v2");
    expect(calledUrl).toMatch(/^https:\/\/app\.tolgee\.io\/v2\//);
  });

  it("sends POST to the correct URL /v2/image-upload", async () => {
    const mock = installFetchMock(
      async () =>
        new Response(JSON.stringify({ id: 3 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    await uploadScreenshot("https://app.tolgee.io", "tg-key", makeImage(), DEFAULT_INFO);

    const firstArg = mock.mock.calls[0]?.[0];
    const calledUrl = firstArg instanceof Request ? firstArg.url : String(firstArg ?? "");
    expect(calledUrl).toBe("https://app.tolgee.io/v2/image-upload");

    const options = mock.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(options?.method).toBe("POST");
  });
});
