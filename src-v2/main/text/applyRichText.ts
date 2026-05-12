/**
 * Inline rich-text rendering for translated strings.
 *
 * Tolgee stores formatting hints inline as a tiny subset of HTML:
 *
 *   - `<b>` / `<strong>` → bold range
 *   - `<i>` / `<em>` → italic range
 *   - `<u>` → underline range
 *   - `<br>` / `<br/>` / `</br>` → newline
 *
 * When the UI writes the formatted ICU result into a `TextNode`, we need to:
 *
 *   1. parse out the tag positions,
 *   2. write the *plain* text (HTML tags stripped),
 *   3. find suitable bold/italic font variants for each range's existing
 *      family and apply them via `setRangeFontName`,
 *   4. apply `setRangeTextDecoration("UNDERLINE")` for `<u>` ranges.
 *
 * The legacy plugin shipped this in `src/main/endpoints/formatText.ts`. The
 * v2 rewrite dropped it, which made every `<b>…</b>` end up literal on the
 * canvas after a Pull — a regression for any project that uses inline HTML
 * (which is Tolgee's default plural / rich-text convention).
 */

const STRIPPED_TAGS = ["strong", "b", "em", "i", "u"] as const;
const BR_REGEX = /<br\s*\/?>\s*<\/br>|<br\s*\/?>|<\/br>/gi;

type Range = { start: number; end: number };

/**
 * Walk every `<${tag}>...</${tag}>` occurrence in `html` and return the
 * start/end indices of the *inner content* once every tag listed in
 * `STRIPPED_TAGS` has been removed. This is what makes the resulting indices
 * line up with `TextNode.characters` after we strip the tags.
 */
function findRanges(html: string, tag: string): Range[] {
  const ranges: Range[] = [];
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "g");

  for (const match of html.matchAll(regex)) {
    let offset = 0;
    let prefix = html.substring(0, match.index);
    for (const stripped of STRIPPED_TAGS) {
      const r = new RegExp(`</?${stripped}>`, "g");
      for (const m of prefix.matchAll(r)) {
        offset += m[0].length;
      }
      prefix = prefix.replace(r, "");
    }
    const inner = match[1] ?? "";
    const start = match.index - offset;
    const end = start + inner.length;
    ranges.push({ start, end });
  }
  return ranges;
}

const BOLD_STYLE_CANDIDATES = [
  "Bold",
  "Semibold",
  "Semi Bold",
  "Medium",
  "Extra Bold",
  "Heavy",
  "Black",
  "Ultra Bold",
] as const;

const ITALIC_STYLE_CANDIDATES = [
  "Italic",
  "Regular Italic",
  "Medium Italic",
  "Light Italic",
  "Semi Bold Italic",
  "Semibold Italic",
  "Bold Italic",
  "Oblique",
  "Regular Oblique",
] as const;

async function loadAvailableFontsOnce(): Promise<Font[]> {
  return figma.listAvailableFontsAsync();
}

/**
 * Pick the closest "bold" variant available for `family` and load it. Returns
 * the matched style name, or `null` if nothing suitable was found.
 */
async function findBestBoldStyle(family: string, available: Font[]): Promise<string | null> {
  for (const style of BOLD_STYLE_CANDIDATES) {
    const exists = available.some(
      (f) => f.fontName.family === family && f.fontName.style === style,
    );
    if (!exists) continue;
    try {
      await figma.loadFontAsync({ family, style });
      return style;
    } catch {
      // Some fonts list a style we can't actually load (licensing, missing
      // weight file). Try the next candidate.
    }
  }
  const fallback = available.find(
    (f) => f.fontName.family === family && f.fontName.style.toLowerCase().includes("bold"),
  );
  if (fallback) {
    try {
      await figma.loadFontAsync(fallback.fontName);
      return fallback.fontName.style;
    } catch {
      return null;
    }
  }
  return null;
}

async function findBestItalicStyle(family: string, available: Font[]): Promise<string | null> {
  for (const style of ITALIC_STYLE_CANDIDATES) {
    const exists = available.some(
      (f) => f.fontName.family === family && f.fontName.style === style,
    );
    if (!exists) continue;
    try {
      await figma.loadFontAsync({ family, style });
      return style;
    } catch {
      // skip
    }
  }
  const fallback = available.find(
    (f) =>
      f.fontName.family === family &&
      (f.fontName.style.toLowerCase().includes("italic") ||
        f.fontName.style.toLowerCase().includes("oblique")),
  );
  if (fallback) {
    try {
      await figma.loadFontAsync(fallback.fontName);
      return fallback.fontName.style;
    } catch {
      return null;
    }
  }
  return null;
}

/** Take the font of `range.start`, normalising over the "mixed" sentinel. */
function getFontAtRange(node: TextNode, range: Range): FontName | null {
  const len = node.characters.length;
  if (range.start >= len) return null;
  const probe = node.getRangeFontName(range.start, Math.min(len, range.start + 1));
  if (probe === figma.mixed) return null;
  return probe as FontName;
}

function applyFontRange(node: TextNode, range: Range, font: FontName): void {
  const end = Math.min(node.characters.length, range.end);
  if (range.start >= end) return;
  node.setRangeFontName(range.start, end, font);
}

function applyUnderlineRange(node: TextNode, range: Range): void {
  const end = Math.min(node.characters.length, range.end);
  if (range.start >= end) return;
  node.setRangeTextDecoration(range.start, end, "UNDERLINE");
}

export type ApplyRichTextOptions = {
  /**
   * Skip rich-text styling and just write plain characters. Useful for tests
   * that mock a minimal `figma` global without `setRangeFontName` etc.
   */
  plainOnly?: boolean;
};

/**
 * Parse `formatted` (Tolgee's tagged ICU result), write the plain text into
 * `node.characters`, and apply bold/italic/underline ranges to mirror the
 * source markup.
 *
 * Pre-loads every distinct font that already lives on the node so that
 * assigning `characters` doesn't throw, then walks the per-tag ranges and
 * resolves the closest bold/italic variant of each range's family. Underlines
 * are applied last so they stack cleanly with the font-name updates.
 */
export async function applyRichText(
  node: TextNode,
  formatted: string,
  options: ApplyRichTextOptions = {},
): Promise<void> {
  node.autoRename = false;

  // Pre-load every font already used on the node — required before we can
  // assign `characters` or call any of the `setRange*` methods.
  const existingFonts = node.getRangeAllFontNames(0, node.characters.length);
  await Promise.all(existingFonts.map((f) => figma.loadFontAsync(f)));

  const withoutBreaks = formatted.replace(BR_REGEX, "\n");
  const plainText = withoutBreaks.replace(/<[^>]*>/g, "");
  node.characters = plainText;

  if (options.plainOnly) return;

  const boldRanges = [...findRanges(withoutBreaks, "strong"), ...findRanges(withoutBreaks, "b")];
  const italicRanges = [...findRanges(withoutBreaks, "em"), ...findRanges(withoutBreaks, "i")];
  const underlineRanges = findRanges(withoutBreaks, "u");

  // Fast path: nothing to format, all done.
  if (boldRanges.length === 0 && italicRanges.length === 0 && underlineRanges.length === 0) {
    return;
  }

  const available = await loadAvailableFontsOnce();

  // Resolve every distinct (family, kind) pair we'll need up front so we
  // never call `loadFontAsync` for the same target twice — large pluralised
  // strings can re-use the same family across many ranges.
  const boldStyleByFamily = new Map<string, string | null>();
  const italicStyleByFamily = new Map<string, string | null>();

  for (const range of boldRanges) {
    const font = getFontAtRange(node, range);
    if (!font || boldStyleByFamily.has(font.family)) continue;
    boldStyleByFamily.set(font.family, await findBestBoldStyle(font.family, available));
  }
  for (const range of italicRanges) {
    const font = getFontAtRange(node, range);
    if (!font || italicStyleByFamily.has(font.family)) continue;
    italicStyleByFamily.set(font.family, await findBestItalicStyle(font.family, available));
  }

  for (const range of boldRanges) {
    const font = getFontAtRange(node, range);
    if (!font) continue;
    const style = boldStyleByFamily.get(font.family);
    if (style) {
      applyFontRange(node, range, { family: font.family, style });
    }
    // No bold variant: leave the existing font in place.
  }
  for (const range of italicRanges) {
    const font = getFontAtRange(node, range);
    if (!font) continue;
    const style = italicStyleByFamily.get(font.family);
    if (style) {
      applyFontRange(node, range, { family: font.family, style });
    }
  }
  for (const range of underlineRanges) {
    applyUnderlineRange(node, range);
  }
}

// Exported for tests.
export const __test__ = { findRanges, BR_REGEX };
