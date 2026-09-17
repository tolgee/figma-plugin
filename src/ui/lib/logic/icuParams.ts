import type { NodeInfo } from "$shared/types";

/**
 * Named ICU parameter names in a string, e.g. `"Hi {name}"` → `["name"]`.
 *
 * Skips the `#` plural placeholder, positional/numeric args, and ICU STRUCTURE
 * selectors (`{count, plural, …}` / `{x, select, …}`) — those aren't a value
 * the user fills, and for plurals the "Plural" badge already conveys them.
 */
export function extractParamNames(text: string): string[] {
  const re = /\{(\w+)((?:,[^}]*)?)\}/g;
  const names: string[] = [];
  for (const match of text.matchAll(re)) {
    const name = match[1];
    const tail = match[2] ?? "";
    if (!name || name === "#" || /^\d+$/.test(name)) continue;
    if (/^,\s*(plural|select|selectordinal)\b/.test(tail)) continue;
    names.push(name);
  }
  return names;
}

// Inline formatting tags Tolgee supports (mirrors the editor's allow-list), so
// stray `a < b` text isn't mistaken for markup.
const MARKUP_RE = /<\/?(?:b|strong|i|em|u|br)\b[^>]*>/i;

/**
 * Whether a node's translation is "rich" — it carries fillable ICU parameters
 * (`{name}`) OR inline markup (`<b>`, `<i>`, …). Such strings aren't plain text
 * and shouldn't be edited raw, so the list flags them with a "Format" badge
 * (alongside the separate "Plural" one). Reads the stored ICU `translation`;
 * `characters` (the rendered canvas text) has values/formatting applied, so it
 * doesn't carry the source `{…}` / tags.
 */
export function hasRichFormat(node: NodeInfo): boolean {
  const src = node.translation ?? "";
  return extractParamNames(src).length > 0 || MARKUP_RE.test(src);
}
