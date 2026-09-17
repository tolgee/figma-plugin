import { createTolgeeClient } from "./client";

/**
 * Best-guess scope sets required by the plugin for different operations.
 * Tolgee scopes follow the `{resource}.{action}` pattern.
 *
 * TODO: revisit once the API surface used by the plugin is finalized — these
 * are intentionally conservative and may be refined later.
 */
export const REQUIRED_SCOPES = {
  pull: ["translations.view"],
  push: ["translations.edit", "keys.create"],
  screenshots: ["screenshots.upload"],
} as const;

export type ValidateApiKeySuccess = {
  ok: true;
  projectId: number;
  scopes: string[];
  userFullName?: string;
};

export type ValidateApiKeyFailure = {
  ok: false;
  error: string;
};

export type ValidateApiKeyResult = ValidateApiKeySuccess | ValidateApiKeyFailure;

/**
 * Validates an API key by calling `GET /v2/api-keys/current`.
 *
 * Returns a discriminated union so callers can branch on `result.ok` without
 * dealing with thrown errors. Network failures and unauthorized responses
 * are normalized into `{ ok: false, error }` with a stable, translatable
 * error key.
 */
export async function validateApiKey(
  apiUrl: string,
  apiKey: string,
): Promise<ValidateApiKeyResult> {
  const client = createTolgeeClient(apiUrl, apiKey);
  try {
    const { data, error, response } = await client.GET("/v2/api-keys/current");
    if (error || !data) {
      const status = response?.status;
      if (status === 401 || status === 403) {
        return { ok: false, error: "auth.invalid_api_key" };
      }
      return { ok: false, error: "auth.request_failed" };
    }

    // Schema says `projectId` and `scopes` are required on
    // `ApiKeyWithLanguagesModel`, but defensively guard runtime payloads.
    const projectId = (data as { projectId?: number }).projectId;
    const scopes = (data as { scopes?: string[] }).scopes ?? [];
    const userFullName = (data as { userFullName?: string }).userFullName;

    if (typeof projectId !== "number") {
      return { ok: false, error: "auth.missing_project_id" };
    }

    return {
      ok: true,
      projectId,
      scopes,
      ...(userFullName !== undefined ? { userFullName } : {}),
    };
  } catch (err) {
    // `openapi-fetch` propagates fetch network errors. Treat any thrown error
    // as a network/connectivity failure.
    void err;
    return { ok: false, error: "auth.network_error" };
  }
}

/**
 * Returns true iff every `required` scope is present in `scopes`.
 *
 * Note: Tolgee scopes are exact strings such as `translations.view`. We do
 * not implement implicit hierarchy expansion here — callers should pass the
 * exact scope strings they need.
 */
export function hasRequiredScopes(scopes: string[], required: string[]): boolean {
  if (required.length === 0) return true;
  const set = new Set(scopes);
  for (const r of required) {
    if (!set.has(r)) return false;
  }
  return true;
}
