/**
 * The plain-text side of Tolgee's inline markup, shared between the two
 * places that must agree on it EXACTLY:
 *
 * - `$main/text/applyRichText` — derives the string written into
 *   `TextNode.characters` (tags become font ranges, `<br>` becomes "\n"),
 * - `$ui/lib/logic/pullDiff` — decides whether a canvas has "drifted" from
 *   its translation by comparing `characters` against what apply WOULD write.
 *
 * If these two transforms diverge, every formatted string looks permanently
 * "drifted" and re-downloads forever — that's the bug that motivated
 * extracting this module, not hypothetical reuse.
 */

/** Every `<br>` spelling Tolgee's editor can produce (also the malformed
 *  `<br></br>` pair some tooling emits) — replaced with a real newline
 *  BEFORE generic tag stripping, which would otherwise just delete it. */
export const LINE_BREAK_TAG_REGEX = /<br\s*\/?>\s*<\/br>|<br\s*\/?>|<\/br>/gi;

/** Remove every remaining tag. Deliberately generic (`<anything>`), matching
 *  what `applyRichText` has always done — unknown tags disappear from the
 *  canvas rather than showing up literally. */
export function stripMarkupTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

/** The exact string `applyRichText` will put into `TextNode.characters` for
 *  a rendered translation: line-break tags → newlines, all other tags gone. */
export function plainCanvasText(formatted: string): string {
  return stripMarkupTags(formatted.replace(LINE_BREAK_TAG_REGEX, "\n"));
}
