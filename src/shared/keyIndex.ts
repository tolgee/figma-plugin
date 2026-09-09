/**
 * Composite lookup key for a `(namespace, key)` pair.
 *
 * Joins on NUL rather than `|`, which several maps in this codebase used: `|`
 * is a legal character in both a namespace and a key name, and neither the
 * inline key input nor the namespace input forbids it — so `(ns "a|b", key
 * "c")` and `(ns "a", key "b|c")` collapsed onto the same index `a|b|c`. The
 * later entry overwrote the earlier one, and in the copy flow that meant one
 * translation being written onto BOTH cloned nodes.
 *
 * NUL cannot occur in a Tolgee key or namespace, and is the separator the
 * published plugin uses for its own composite keys.
 *
 * Lives in `$shared` because BOTH threads key maps this way — the main
 * thread's copy-staleness counts as much as the UI's translation lookups.
 * Keeping it UI-side is exactly what left the main thread on the old separator
 * after the first sweep.
 *
 * Every map keyed this way MUST build and read through this function: the copy
 * flow builds its index in one file and reads it in another, so a separator
 * changed in only one of them silently finds nothing.
 */
export function nsKeyIndex(ns: string | undefined, key: string): string {
  return `${ns ?? ""}\u0000${key}`;
}
