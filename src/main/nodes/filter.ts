import type { GlobalSettings } from "$shared/types";

export type IgnoreSettings = Pick<
  GlobalSettings,
  | "ignorePrefix"
  | "ignoreNumbers"
  | "ignoreFormattedNumbers"
  | "ignoreHiddenLayers"
  | "ignoreHiddenLayersIncludingChildren"
  | "ignoreTextLayers"
>;

/** Pure integers only — "100", "42" (matches the original plugin's `/^\d+$/`). */
const PURE_DIGITS = /^\d+$/;
/** Formatted numbers too — decimals, thousands separators, signs: "1,234.00",
 *  "3.14", "+420", "-5". Only used when `ignoreFormattedNumbers` is opted in. */
const FORMATTED_NUMERIC = /^[\d\s.,+\-]+$/;

/**
 * Returns `true` when the given text node should be skipped by the Tolgee sync
 * flow. Mirrors the original `shouldIncludeNode` (inverted): blank strings,
 * numbers, self-hidden layers, and — with "including children" — layers inside
 * a hidden subtree are ignored.
 *
 * @param node           The text node under consideration.
 * @param ancestorHidden Whether an ancestor within the scanned selection is
 *                       hidden — computed once during the scan traversal
 *                       (see `scanSelectedTextNodes`), so we don't walk each
 *                       node's parent chain here (the original's approach).
 * @param settings       Subset of `GlobalSettings` describing the active filters.
 */
export const shouldIgnoreNode = (
  node: TextNode,
  ancestorHidden: boolean,
  settings: Partial<IgnoreSettings>,
  // Callers that already read `characters` (the selection scan reads it for
  // `getNodeInfo` too) pass it in — every access copies the whole string
  // across the plugin bridge, and this runs per node of a large selection.
  characters: string = node.characters,
): boolean => {

  // Blank / whitespace-only nodes are never translatable — always skip them,
  // regardless of any toggle (matches the original `characters.trim() === ""`).
  if (characters.trim().length === 0) {
    return true;
  }

  if (settings.ignoreNumbers ?? true) {
    // Base "Numbers" = pure integers (original behaviour). Opt in to
    // `ignoreFormattedNumbers` to also skip decimals / separators / signs.
    const re = settings.ignoreFormattedNumbers ? FORMATTED_NUMERIC : PURE_DIGITS;
    if (re.test(characters)) return true;
  }

  // Default the prefix to "_" when the "text layers with prefix" filter is on
  // but no prefix was set — matches the original plugin's read-time default.
  const prefix = settings.ignorePrefix ?? "_";
  if (settings.ignoreTextLayers && prefix && node.name.startsWith(prefix)) {
    return true;
  }

  // Both hidden-layer rules are gated on `ignoreHiddenLayers` (like the
  // original `respectVisibility`): "including children" does nothing on its own
  // when visibility isn't being respected.
  const respectVisibility = settings.ignoreHiddenLayers ?? true;
  if (respectVisibility && !node.visible) {
    return true;
  }

  if (
    respectVisibility &&
    settings.ignoreHiddenLayersIncludingChildren &&
    ancestorHidden
  ) {
    return true;
  }

  return false;
};
