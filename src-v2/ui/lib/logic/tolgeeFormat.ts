/**
 * Local, dependency-free re-implementation of the small slice of
 * `@tginternal/editor`'s `getTolgeeFormat` that we need for push diffing.
 *
 * The original package drags in `@codemirror/state` + `@codemirror/view`
 * (~500 kB raw / ~125 kB gzip) to power its editor surface. We only use a
 * single normalization helper from it — so we replicate just that helper
 * here.
 *
 * Behavior we mirror:
 *
 *   - `plural=false` → `{ variants: { other: input } }` (verbatim, no parsing)
 *   - `plural=true` and the input parses as a top-level ICU plural form
 *     `{paramName, plural, variant1 {body1} variant2 {body2} ...}` →
 *     `{ parameter, variants: { variant1: body1, ... } }`
 *   - any parse failure (malformed ICU, unbalanced braces, leading text,
 *     trailing characters, wrong select function, etc.) → falls back to
 *     `{ variants: { other: input } }`, just like the upstream parser
 *
 * Variant bodies are returned RAW (no ICU unescape). This matches the
 * upstream `getTolgeeFormat(input, plural, raw=false)` call shape — the only
 * call site we have is in `pushDiff` and it always passes `false`.
 *
 * NOTE: the result is intended to be compared via `JSON.stringify`, so the
 * exact key ordering of `variants` doesn't matter as long as both sides go
 * through this same parser. Whitespace inside an ICU placeholder is
 * normalized because we re-extract just the variant bodies, dropping
 * whitespace between `,`, `plural`, and variant names.
 */

export type TolgeeFormat = {
  parameter?: string;
  variants: Record<string, string | undefined>;
};

const PLURAL_KEYWORD = "plural";

export function getTolgeeFormat(input: string, plural: boolean, _raw: boolean): TolgeeFormat {
  if (!plural) {
    return { variants: { other: input } };
  }

  const parsed = parsePlural(input);
  if (!parsed) {
    return { variants: { other: input } };
  }
  return parsed;
}

/**
 * Parse exactly one top-level ICU plural expression. Returns `null` for any
 * input that isn't a single, well-formed plural expression.
 */
function parsePlural(input: string): TolgeeFormat | null {
  // Find outermost `{ ... }`. We require the whole input (after trimming
  // surrounding whitespace) to be ONE plural form — anything else falls back
  // to "no plural", matching the upstream lezer parser behavior.
  const trimmed = input.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;

  // Walk respecting ICU `'` escapes so we don't get tripped by literal braces.
  const closeIdx = findMatchingBrace(trimmed, 0);
  if (closeIdx !== trimmed.length - 1) return null;

  // Inside the outermost braces: `paramName, plural, variant {body} ...`
  const inner = trimmed.slice(1, -1);

  // Find first comma (paramName boundary). `paramName` doesn't contain braces
  // or commas in a well-formed plural form.
  const firstComma = inner.indexOf(",");
  if (firstComma < 0) return null;
  const parameter = inner.slice(0, firstComma).trim();
  if (!parameter) return null;

  // Next token must be `plural`.
  const afterParam = inner.slice(firstComma + 1).trimStart();
  if (!afterParam.startsWith(PLURAL_KEYWORD)) return null;
  const afterKeyword = afterParam.slice(PLURAL_KEYWORD.length);
  // Must be followed by whitespace + `,`.
  const ws = afterKeyword.match(/^\s*,/);
  if (!ws) return null;
  let rest = afterKeyword.slice(ws[0].length);

  // Now parse zero or more `variantName {body}` chunks.
  const variants: Record<string, string | undefined> = {};
  while (true) {
    rest = rest.replace(/^\s+/, "");
    if (rest.length === 0) break;

    // Variant name: any non-whitespace, non-`{` run. ICU allows `=0`, `=1`,
    // `zero`, `one`, etc. — we don't validate the alphabet, we just split on
    // the first `{`.
    const braceAt = rest.indexOf("{");
    if (braceAt < 0) return null;
    const variantName = rest.slice(0, braceAt).trim();
    if (!variantName) return null;
    // Disallow further commas in variant header (would mean malformed input
    // we shouldn't try to interpret as plural).
    if (variantName.includes(",")) return null;

    const variantClose = findMatchingBrace(rest, braceAt);
    if (variantClose < 0) return null;
    const body = rest.slice(braceAt + 1, variantClose);

    // Duplicate variant — treat as malformed (mirrors upstream lezer
    // behavior of returning "no plural" on `nodes[Expression].nextSibling`).
    if (Object.prototype.hasOwnProperty.call(variants, variantName)) {
      return null;
    }

    variants[variantName] = body;
    rest = rest.slice(variantClose + 1);
  }

  if (Object.keys(variants).length === 0) return null;

  return { parameter, variants };
}

/**
 * Returns the index of the `}` that matches the `{` at `start`, accounting
 * for ICU `'`-escapes (e.g. `'{'` is a literal open brace and must be
 * skipped). Returns `-1` if no match is found.
 */
function findMatchingBrace(input: string, start: number): number {
  if (input[start] !== "{") return -1;
  let depth = 0;
  let i = start;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "'") {
      // ICU escape: `''` is a literal `'`. `'{`, `'}` or `'#` starts a
      // literal run that continues until the next `'`.
      const next = input[i + 1];
      if (next === "'") {
        i += 2;
        continue;
      }
      if (next === "{" || next === "}" || next === "#") {
        // Skip the literal run until the closing `'` (or end of input).
        const close = input.indexOf("'", i + 2);
        if (close < 0) {
          // unterminated — treat the rest as literal
          return -1;
        }
        i = close + 1;
        continue;
      }
      // Lone `'` not followed by an escapable — just advance.
      i += 1;
      continue;
    }
    if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
      if (depth < 0) return -1;
    }
    i += 1;
  }
  return -1;
}
