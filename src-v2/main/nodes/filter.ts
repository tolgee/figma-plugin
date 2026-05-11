import type { GlobalSettings } from "$shared/types";

export type IgnoreSettings = Pick<
  GlobalSettings,
  | "ignorePrefix"
  | "ignoreNumbers"
  | "ignoreHiddenLayers"
  | "ignoreHiddenLayersIncludingChildren"
  | "ignoreTextLayers"
>;

/**
 * Matches strings that consist only of digits, whitespace and the punctuation
 * typically used in numeric formatting (`.`, `,`, `+`, `-`). Empty strings are
 * accepted on purpose so a freshly inserted text node is treated as "numeric"
 * for the purposes of the ignore filter.
 */
const NUMERIC_ONLY = /^[\d\s.,+\-]*$/;

/**
 * Walk a node's parent chain and return `true` as soon as any ancestor has
 * `visible === false`. The starting node itself is NOT inspected — callers
 * usually check the node's own visibility separately.
 */
export const isInHiddenSubtree = (node: SceneNode): boolean => {
  let current: BaseNode | null = node.parent;
  while (current) {
    // `visible` only exists on `SceneNode`s — pages and the document root
    // don't expose it, which is fine: those are always considered visible.
    if ("visible" in current && (current as SceneNode).visible === false) {
      return true;
    }
    current = current.parent;
  }
  return false;
};

/**
 * Returns `true` when the given text node should be skipped by the Tolgee
 * sync flow. The rules mirror the legacy `shouldIncludeNode` / `findTextNodes`
 * behaviour 1:1.
 *
 * @param node     The text node under consideration.
 * @param _parent  Reserved — kept in the signature so callers can pass the
 *                 already-known parent without re-reading it. The current
 *                 implementation walks the live `node.parent` chain via
 *                 `isInHiddenSubtree`, which is more robust against detached
 *                 SceneNode references.
 * @param settings Subset of `GlobalSettings` describing the active filters.
 */
export const shouldIgnoreNode = (
  node: TextNode,
  _parent: BaseNode | null,
  settings: IgnoreSettings,
): boolean => {
  if (settings.ignoreNumbers && NUMERIC_ONLY.test(node.characters)) {
    return true;
  }

  if (
    settings.ignoreTextLayers &&
    settings.ignorePrefix &&
    node.name.startsWith(settings.ignorePrefix)
  ) {
    return true;
  }

  if (settings.ignoreHiddenLayers && !node.visible) {
    return true;
  }

  if (
    settings.ignoreHiddenLayersIncludingChildren &&
    isInHiddenSubtree(node)
  ) {
    return true;
  }

  return false;
};
