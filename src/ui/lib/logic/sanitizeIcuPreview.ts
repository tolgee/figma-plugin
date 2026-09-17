/**
 * Sanitizes ICU preview HTML before it's rendered with `{@html ...}` in
 * `IcuPreview.svelte`.
 *
 * `formatIcuMessage()` (see `$shared/icu.ts`) formats an ICU message with
 * `ignoreTag: true`, which means any inline markup in the translation
 * (`<b>`, `<img src=x onerror=...>`, anything) survives into `result` as
 * completely unescaped literal text — `intl-messageformat` never parses or
 * strips it. That string comes straight from the connected Tolgee project
 * (any translator with project access can write it), so rendering it with
 * `{@html ...}` without sanitizing first is a stored-XSS hole: a malicious
 * translation executes arbitrary script inside the plugin's UI iframe, which
 * holds the live Tolgee API key and a postMessage channel that can mutate
 * the Figma document.
 *
 * The fix: escape the ENTIRE string first, then selectively un-escape only
 * the exact whitelisted formatting tags (bare, no attributes). This mirrors
 * the same whitelist `IcuTextarea.svelte`'s tokenizer already highlights
 * (`INLINE_TAG_RE` in `tolgeeFormat.ts`), so what the preview renders as a
 * real tag lines up with what the textarea highlights as a tag pill.
 *
 * Any tag with an attribute (`<b onclick="...">`), any non-whitelisted tag
 * (`<script>`, `<a href=...>`), and any stray `<`/`>` that isn't part of a
 * recognized bare tag all stay escaped — they render as inert, visible text,
 * never as a parsed element.
 */

/** Same tag set (and no-attributes rule) as `IcuTextarea.svelte`'s `INLINE_TAG_RE`. */
const WHITELISTED_TAGS = "b|strong|i|em|u|br";

// Matches an escaped bare tag: `&lt;`, optional closing `/`, tag name,
// optional trailing whitespace/self-closing `/`, `&gt;`. Nothing else is
// allowed between the tag name and `&gt;` — an attribute of any kind (an
// `=`, a quote, extra words) breaks the match, so the whole tag is left
// escaped rather than being partially un-escaped.
const ESCAPED_TAG_RE = new RegExp(`&lt;(/?)(${WHITELISTED_TAGS})(\\s*/?)&gt;`, "gi");

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escapes `input` as HTML, then re-opens only the whitelisted formatting
 * tags (`b`, `strong`, `i`, `em`, `u`, `br`) — with all attributes stripped,
 * since a bare-tag-only match never captures them. Safe to feed directly
 * into `{@html ...}`.
 */
export function sanitizeIcuPreview(input: string): string {
  const escaped = escapeHtml(input);
  return escaped.replace(ESCAPED_TAG_RE, (_match, slash: string, tag: string, trail: string) => {
    return `<${slash}${tag}${trail}>`;
  });
}
