import type { NodeInfo } from "$shared/types";
import { translationDiffersFromNodeCached } from "$shared/interpolate";
import { hasIcuArgument } from "$shared/tolgeeFormat";

/**
 * Detection for the "manual changes detected" conflict — an ADVANCED connected
 * string (plural / params / markup) whose stored translation no longer matches
 * the Figma canvas, i.e. it was edited directly in Figma and its formatting was
 * lost. Purely read-only UI logic; never touches main thread / pushDiff.
 *
 * Deliberately ADVANCED-only: a plain connected string edited in Figma is just a
 * normal "changed" push (the old plugin treats it that way), so flagging it only
 * adds friction. Plain edits are NOT flagged.
 */

// Inline HTML markup we render (b/i/u/strong/em) — formatting a plain Figma
// edit would drop. The ICU side is `hasIcuArgument`, NOT a brace-pair regex:
// Tolgee stores a plain translation containing literal braces as ICU-escaped
// text (`Use '{'braces'}'`), which has no argument in it at all.
const INLINE_MARKUP = /<\/?(?:b|i|u|strong|em)\b/i;

/**
 * Does this string rely on advanced ICU / formatting features (plural, params,
 * or inline markup)?
 *
 * Getting this wrong in the permissive direction is not cosmetic: `textOfNode`
 * hands ADVANCED strings their stored `translation` and PLAIN strings their
 * live canvas `characters`. So a plain string misread as advanced has its
 * designer edit outranked by the stale stored value — the Push diff then sees
 * no change and drops the edit without a word.
 */
export function isAdvancedString(node: NodeInfo): boolean {
  if (node.isPlural) return true;
  if (node.paramsValues && Object.keys(node.paramsValues).length > 0) return true;
  const translation = node.translation ?? "";
  return INLINE_MARKUP.test(translation) || hasIcuArgument(translation);
}

export function hasManualChange(node: NodeInfo, language: string): boolean {
  // Any ADVANCED string (plural / params / markup) whose canvas text diverges
  // from its rendered stored translation — connected or NOT, matching the
  // published plugin, which shows the warning + "Revert" regardless of link
  // state (`NodeRow` / `StringDetails` gate purely on `translationDiffersFromNode`).
  // That render/compare is a no-op for "simple" strings, so plain edits aren't
  // flagged (they're a normal "changed" push), and a string with no stored
  // translation has nothing to diverge from.
  if (!(node.translation ?? "")) return false;
  return translationDiffersFromNodeCached(node, language);
}
