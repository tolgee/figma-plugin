import type { TolgeeClient } from "$ui/lib/api/client";
import { nsKeyIndex } from "$ui/lib/logic/namespaces";

/** A connected key to verify against the server. `ns` undefined = default namespace. */
export type ConnectedKey = { name: string; ns: string | undefined };

/**
 * Stable identity for a (namespace, name) pair — used to match a node against
 * the "missing" set. ` ` can't appear in a Figma-authored key/namespace,
 * so it's a collision-proof separator. `ns` is normalised so undefined and ""
 * (both "no namespace" / Tolgee's "<none>") map to the same signature.
 */
export function connectedKeySig(ns: string | undefined, name: string): string {
  // Delegates to the shared join so this identity and the `(ns, key)` map
  // indexes elsewhere can never drift apart — they answer the same question.
  return nsKeyIndex(ns, name);
}

/**
 * The namespace a node's key EFFECTIVELY lives under. When the project has
 * namespaces disabled, the whole write pipeline ignores the node's stored `ns`
 * (pushFlow/pushDiff strip it), so keys land in the default namespace — a node
 * can still carry a stale invisible `ns` (the ns badge is hidden with the
 * feature off). Every existence lookup must apply the same rule, or such a
 * node gets false-flagged as "key deleted in Tolgee".
 */
export function effectiveNs(
  ns: string | undefined,
  namespacesEnabled: boolean,
): string | undefined {
  return namespacesEnabled ? ns || undefined : undefined;
}

/**
 * Returns the connected keys that NO LONGER EXIST in the Tolgee project, as
 * `connectedKeySig` signatures (computed over the EFFECTIVE namespace — see
 * `effectiveNs`; lookups against the returned set must use it too).
 *
 * One `POST /keys/info` with explicit {name, namespace} pairs — the endpoint
 * omits keys it can't find, so anything we asked for that isn't in the response
 * has been deleted. Explicit pairs make namespace matching exact (including the
 * default "<none>" namespace, sent as `namespace: undefined`), with no reliance
 * on empty-string query-param quirks.
 *
 * Fail-safe: on any request error we report nothing missing, so a transient
 * failure never false-flags a live link.
 */
export async function fetchMissingKeys(
  client: TolgeeClient,
  keys: ConnectedKey[],
  branch: string,
  languageTag: string | undefined,
  namespacesEnabled: boolean,
): Promise<Set<string>> {
  const missing = new Set<string>();
  if (keys.length === 0) return missing;

  const { data, error } = await client.POST("/v2/projects/keys/info", {
    params: { query: { branch: branch || undefined } },
    body: {
      keys: keys.map((k) => ({
        name: k.name,
        namespace: effectiveNs(k.ns, namespacesEnabled),
      })),
      // Existence doesn't depend on a language, but the endpoint requires the
      // field; send one when we have it, else an empty list.
      languageTags: languageTag ? [languageTag] : [],
    },
  });
  if (error || !data) return missing; // fail-safe: never flag on error

  const present = new Set(
    (data._embedded?.keys ?? []).map((k) => connectedKeySig(k.namespace, k.name)),
  );
  for (const k of keys) {
    const sig = connectedKeySig(effectiveNs(k.ns, namespacesEnabled), k.name);
    if (!present.has(sig)) missing.add(sig);
  }
  return missing;
}
