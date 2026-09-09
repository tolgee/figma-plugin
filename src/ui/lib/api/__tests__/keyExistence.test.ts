import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTolgeeClient } from "../client";
import {
  connectedKeySig,
  effectiveNs,
  fetchMissingKeys,
} from "../keyExistence";

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

function keysInfoResponse(keys: { name: string; namespace?: string }[]) {
  return okResponse({ _embedded: { keys } });
}

// openapi-fetch invokes fetch with a single Request object.
function sentRequest(mock: FetchMock): Request {
  return mock.mock.calls[0]?.[0] as Request;
}

async function sentBody(mock: FetchMock): Promise<Record<string, unknown>> {
  return (await sentRequest(mock).clone().json()) as Record<string, unknown>;
}

beforeEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("effectiveNs", () => {
  it("keeps a real namespace when the feature is enabled", () => {
    expect(effectiveNs("web", true)).toBe("web");
  });

  it("normalises '' and undefined to undefined when enabled", () => {
    expect(effectiveNs("", true)).toBeUndefined();
    expect(effectiveNs(undefined, true)).toBeUndefined();
  });

  it("drops ANY stored ns when the feature is disabled (matches push)", () => {
    expect(effectiveNs("stale-ns", false)).toBeUndefined();
    expect(effectiveNs(undefined, false)).toBeUndefined();
  });
});

describe("fetchMissingKeys", () => {
  const client = () => createTolgeeClient("https://app.tolgee.io", "test-key");

  it("returns an empty set without a request for no keys", async () => {
    const mock = installFetchMock(async () => keysInfoResponse([]));
    const missing = await fetchMissingKeys(client(), [], "", "en", true);
    expect(missing.size).toBe(0);
    expect(mock).not.toHaveBeenCalled();
  });

  it("flags only the keys absent from the response (namespaces enabled)", async () => {
    installFetchMock(async () =>
      keysInfoResponse([{ name: "kept", namespace: "web" }]),
    );
    const missing = await fetchMissingKeys(
      client(),
      [
        { name: "kept", ns: "web" },
        { name: "deleted", ns: "web" },
      ],
      "",
      "en",
      true,
    );
    expect(missing).toEqual(new Set([connectedKeySig("web", "deleted")]));
  });

  it("sends the stored ns in the request when namespaces are enabled", async () => {
    const mock = installFetchMock(async () => keysInfoResponse([]));
    await fetchMissingKeys(client(), [{ name: "a", ns: "web" }], "", "en", true);
    const body = await sentBody(mock);
    expect(body.keys).toEqual([{ name: "a", namespace: "web" }]);
  });

  it("does NOT false-flag a node carrying a stale ns when namespaces are disabled", async () => {
    // The push pipeline ignores `ns` with the feature off, so the key lives in
    // the default namespace. The check must look it up there too.
    const mock = installFetchMock(async () =>
      keysInfoResponse([{ name: "Tue.Test" }]),
    );
    const missing = await fetchMissingKeys(
      client(),
      [{ name: "Tue.Test", ns: "stale-ns" }],
      "",
      "en",
      false,
    );
    expect(missing.size).toBe(0);
    // And the request itself must not mention the stale ns.
    const body = await sentBody(mock);
    expect(body.keys).toEqual([{ name: "Tue.Test" }]);
  });

  it("still flags a truly deleted key under a stale ns when namespaces are disabled", async () => {
    installFetchMock(async () => keysInfoResponse([]));
    const missing = await fetchMissingKeys(
      client(),
      [{ name: "gone", ns: "stale-ns" }],
      "",
      "en",
      false,
    );
    // Sig uses the effective (default) namespace — the same one lookups use.
    expect(missing).toEqual(new Set([connectedKeySig(undefined, "gone")]));
  });

  it("treats response ns '' and request ns undefined as the same default namespace", async () => {
    installFetchMock(async () =>
      keysInfoResponse([{ name: "a", namespace: "" }]),
    );
    const missing = await fetchMissingKeys(
      client(),
      [{ name: "a", ns: undefined }],
      "",
      "en",
      true,
    );
    expect(missing.size).toBe(0);
  });

  it("reports nothing missing on a request error (fail-safe)", async () => {
    installFetchMock(async () => errorResponse(500));
    const missing = await fetchMissingKeys(
      client(),
      [{ name: "a", ns: undefined }],
      "",
      "en",
      true,
    );
    expect(missing.size).toBe(0);
  });

  it("passes the branch as a query param when set", async () => {
    const mock = installFetchMock(async () => keysInfoResponse([]));
    await fetchMissingKeys(
      client(),
      [{ name: "a", ns: undefined }],
      "feature-x",
      "en",
      true,
    );
    expect(sentRequest(mock).url).toContain("branch=feature-x");
  });
});
