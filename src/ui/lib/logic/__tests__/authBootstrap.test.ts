import { describe, expect, it } from "vitest";
import { decideAuthBootstrap } from "$ui/lib/logic/authBootstrap";

describe("decideAuthBootstrap", () => {
  it("a successful validation never clears and remembers the fingerprint", () => {
    expect(decideAuthBootstrap({ ok: true }, false)).toEqual({
      clearAuth: false,
      rememberFingerprint: true,
    });
    expect(decideAuthBootstrap({ ok: true }, true)).toEqual({
      clearAuth: false,
      rememberFingerprint: true,
    });
  });

  it("an invalid API key clears an authenticated session and remembers the fingerprint", () => {
    expect(
      decideAuthBootstrap({ ok: false, error: "auth.invalid_api_key" }, true),
    ).toEqual({ clearAuth: true, rememberFingerprint: true });
  });

  it("an invalid API key with nothing to clear still remembers the fingerprint", () => {
    expect(
      decideAuthBootstrap({ ok: false, error: "auth.invalid_api_key" }, false),
    ).toEqual({ clearAuth: false, rememberFingerprint: true });
  });

  it("REGRESSION: a network blip never clears an already-authenticated session, and is not remembered", () => {
    expect(
      decideAuthBootstrap({ ok: false, error: "auth.network_error" }, true),
    ).toEqual({ clearAuth: false, rememberFingerprint: false });
  });

  it("a non-401/403 request failure is treated the same as a network error", () => {
    expect(
      decideAuthBootstrap({ ok: false, error: "auth.request_failed" }, true),
    ).toEqual({ clearAuth: false, rememberFingerprint: false });
    expect(
      decideAuthBootstrap({ ok: false, error: "auth.request_failed" }, false),
    ).toEqual({ clearAuth: false, rememberFingerprint: false });
  });

  it("an unrecognized error code is treated as a soft failure, not an invalid key", () => {
    expect(
      decideAuthBootstrap({ ok: false, error: "auth.missing_project_id" }, true),
    ).toEqual({ clearAuth: false, rememberFingerprint: false });
  });
});
