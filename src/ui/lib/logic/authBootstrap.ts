/**
 * Decides what the silent startup auth-validation should do with its
 * result, split out of `App.svelte` so it's testable without a component
 * harness (this repo has none — see tasks 3/7/11).
 *
 * The distinction that matters: `auth.invalid_api_key` (401/403) means the
 * credentials themselves are wrong. Every other failure (a network blip,
 * a 5xx, a malformed payload) says nothing about whether the credentials
 * are good — it must never log out a session that was already working, and
 * the fingerprint must NOT be remembered so the next `config-changed` /
 * `page-changed` event retries instead of getting stuck showing "sign in"
 * with a perfectly valid key on file.
 */

export type AuthValidationOutcome =
  | { ok: true }
  | { ok: false; error: string };

export type AuthBootstrapDecision = {
  /** Whether to call `auth.clear()`. */
  clearAuth: boolean;
  /**
   * Whether to remember this fingerprint as validated (skip re-validating
   * it next time). `false` means the next bootstrap call for the same
   * credentials will try again.
   */
  rememberFingerprint: boolean;
};

export function decideAuthBootstrap(
  result: AuthValidationOutcome,
  wasAuthenticated: boolean,
): AuthBootstrapDecision {
  if (result.ok) {
    return { clearAuth: false, rememberFingerprint: true };
  }
  if (result.error === "auth.invalid_api_key") {
    // The key really is wrong — clear (if there was anything to clear) so
    // the UI honestly reflects it, and remember the fingerprint: retrying
    // immediately would just get the same 401 again.
    return { clearAuth: wasAuthenticated, rememberFingerprint: true };
  }
  // Soft failure (network_error, request_failed, missing_project_id, or any
  // future error code): not evidence the credentials are wrong.
  return { clearAuth: false, rememberFingerprint: false };
}
