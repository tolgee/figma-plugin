export { nsKeyIndex } from "$shared/keyIndex";

import type { NodeInfo } from "$shared/types";

/**
 * The namespace names to offer in a namespace picker.
 *
 * Merges the project's SERVER namespaces (from the API) with any used LOCALLY
 * on Figma nodes — including ones just created in the plugin that don't exist in
 * Tolgee yet (a new namespace is only created once a key using it is pushed) —
 * plus the configured default. Deduped and sorted.
 */
export function collectNamespaceNames(
  serverNamespaces: { name: string }[],
  nodes: NodeInfo[],
  defaultNs?: string,
): string[] {
  const set = new Set<string>();
  for (const n of serverNamespaces) if (n.name) set.add(n.name);
  for (const node of nodes) if (node.ns) set.add(node.ns);
  if (defaultNs) set.add(defaultNs);
  return [...set].sort((a, b) => a.localeCompare(b));
}

/**
 * A key's display label, with its namespace prefixed — unless the project
 * has namespaces disabled, in which case the prefix is always hidden (it
 * would just be confusing UI noise for a concept the project doesn't use).
 * Display-only: never affects what's stored/pushed.
 */
export function namespacedKeyLabel(
  ns: string | undefined,
  key: string,
  namespacesEnabled: boolean,
): string {
  return ns && namespacesEnabled ? `${ns}.${key}` : key;
}
