// TODO: Implement API key validation against the Tolgee backend.
// Should perform a request against `${url}/v2/api-keys/current` (or similar)
// to verify the key, extract the project id, and read scopes.

export async function validateApiKey(
  _url: string,
  _key: string,
): Promise<{ ok: boolean; projectId?: number; scopes?: string[] }> {
  // TODO
  return { ok: false };
}
