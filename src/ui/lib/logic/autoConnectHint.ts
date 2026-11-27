/**
 * Why "Auto-connect by exact match" left a string unconnected — the hint
 * shown next to it in the result dialog.
 *
 * In "same namespace" scope an exact match that lives only in ANOTHER
 * namespace is filtered out. Saying "No exact match in Tolgee" then was
 * false (Connect, which searches every namespace, finds it right away), so
 * that case names the namespace and the way to connect it instead.
 */
export function autoConnectSkipHint(input: {
  /** Exact matches in ANY namespace (before the scope filter). */
  candidateNamespaces: (string | null | undefined)[];
  /** Exact matches left after the scope filter. */
  matchCount: number;
  /** The fuzzy fallback page was full, so the search may have missed keys. */
  truncated: boolean;
}): string | null {
  if (input.matchCount === 1) return null;
  if (input.matchCount > 1) {
    return "Several keys match this text exactly — open Connect to pick one.";
  }
  const elsewhere = [...new Set(input.candidateNamespaces.map((ns) => ns || "<none>"))];
  if (elsewhere.length > 0) {
    const shown = elsewhere.slice(0, 2).map((ns) => `“${ns}”`).join(", ");
    const more = elsewhere.length > 2 ? ` and ${elsewhere.length - 2} more` : "";
    const label = elsewhere.length === 1 ? "namespace" : "namespaces";
    return `Exact match only in ${label} ${shown}${more}. Run Auto-connect “in any namespace”, or connect it manually.`;
  }
  if (input.truncated) {
    return "Couldn't check every similar key — open Connect to search for it.";
  }
  return "No exact match in Tolgee — create the key or connect it manually.";
}
