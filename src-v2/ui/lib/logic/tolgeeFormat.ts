/**
 * Local, dependency-free re-implementation of the helpers from
 * `@tginternal/editor` that the plugin needs — without dragging in
 * `@codemirror/{state,view}` (~500 kB raw / ~125 kB gzip).
 *
 * Exports:
 *   - `getTolgeeFormat`          — ICU → TolgeeFormat (for push diffing)
 *   - `tolgeeFormatGenerateIcu`  — TolgeeFormat → ICU string
 *   - `tokenize`                 — ICU → Token[] for syntax highlighting
 *   - `getPluralVariants`        — CLDR plural categories for a locale
 *   - `getVariantExample`        — example number for a plural category
 *
 * Behavior we mirror for `getTolgeeFormat`:
 *
 *   - `plural=false` → `{ variants: { other: input } }` (verbatim, no parsing)
 *   - `plural=true` and the input parses as a top-level ICU plural form
 *     `{paramName, plural, variant1 {body1} variant2 {body2} ...}` →
 *     `{ parameter, variants: { variant1: body1, ... } }`
 *   - any parse failure → falls back to `{ variants: { other: input } }`
 *
 * NOTE: the result is intended to be compared via `JSON.stringify`, so the
 * exact key ordering of `variants` doesn't matter as long as both sides go
 * through this same parser.
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
 *
 * Exported so the tokenizer can use it outside `parsePlural`.
 */
export function findMatchingBrace(input: string, start: number): number {
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

// ============================================================
// ICU generator
// ============================================================

/**
 * Reconstruct an ICU plural string from a `TolgeeFormat` object.
 * Mirrors `tolgeeFormatGenerateIcu` from `@tginternal/editor`.
 */
export function tolgeeFormatGenerateIcu(format: TolgeeFormat, _raw: boolean): string {
  const { parameter, variants } = format;
  if (!parameter) return variants.other ?? "";
  const parts = Object.entries(variants)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([k, v]) => `${k} {${v}}`)
    .join(" ");
  return `{${parameter}, plural, ${parts}}`;
}

// ============================================================
// Plural variant helpers
// ============================================================

const CLDR_ORDER = ["zero", "one", "two", "few", "many", "other"] as const;

/**
 * Return the CLDR plural categories active for `locale`, in canonical order.
 * Uses `Intl.PluralRules` probing for compatibility with all environments.
 * Mirrors `getPluralVariants` from `@tginternal/editor`.
 */
export function getPluralVariants(locale: string): string[] {
  try {
    const rules = new Intl.PluralRules(locale);
    const found = new Set<string>(["other"]);
    const probes: Array<[Intl.LDMLPluralRule, number[]]> = [
      ["zero", [0]],
      ["one", [1]],
      ["two", [2]],
      ["few", [3, 4, 5]],
      ["many", [11, 20, 100]],
    ];
    for (const [cat, values] of probes) {
      for (const n of values) {
        if (rules.select(n) === cat) {
          found.add(cat);
          break;
        }
      }
    }
    return CLDR_ORDER.filter((c) => found.has(c));
  } catch {
    return ["one", "other"];
  }
}

/**
 * Return a representative example number for `variant` in `locale`.
 * Numeric selectors like `=0` return their own value.
 * Mirrors `getVariantExample` from `@tginternal/editor`.
 */
export function getVariantExample(locale: string, variant: string): number | undefined {
  if (variant.startsWith("=")) {
    const n = Number(variant.slice(1));
    return isNaN(n) ? undefined : n;
  }
  try {
    const rules = new Intl.PluralRules(locale);
    for (const n of [0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 20, 100]) {
      if (rules.select(n) === variant) return n;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

// ============================================================
// Tokenizer for IcuTextarea syntax highlighting
// ============================================================

/** Distinct highlight roles for the `IcuTextarea` overlay. */
export type TokenKind = "text" | "variable" | "keyword" | "hash" | "tag";
export type Token = { kind: TokenKind; text: string };

const INLINE_TAG_RE = /^<\/?(?:b|strong|i|em|u|br)\s*\/?>/i;

/**
 * Tokenize a Tolgee/ICU string for the `IcuTextarea` highlight overlay.
 *
 * `nested` — set `true` when the input is a plural variant body so bare `#`
 * is highlighted as a `hash` token instead of plain text.
 */
export function tokenize(input: string, nested = false): Token[] {
  const out: Token[] = [];
  _scanText(input, 0, input.length, nested, out);
  return out;
}

function _scanText(
  input: string,
  from: number,
  to: number,
  inPlural: boolean,
  out: Token[],
): void {
  let textStart = from;
  let i = from;

  const flush = (end: number) => {
    if (end > textStart) out.push({ kind: "text", text: input.slice(textStart, end) });
    textStart = end;
  };

  while (i < to) {
    const ch = input[i];

    if (ch === "#" && inPlural) {
      flush(i);
      out.push({ kind: "hash", text: "#" });
      i++;
      textStart = i;
      continue;
    }

    if (ch === "<") {
      const slice = input.slice(i, Math.min(i + 25, to));
      const m = slice.match(INLINE_TAG_RE);
      if (m) {
        flush(i);
        out.push({ kind: "tag", text: m[0] });
        i += m[0].length;
        textStart = i;
        continue;
      }
    }

    if (ch === "{") {
      const close = findMatchingBrace(input, i);
      if (close > i && close < to) {
        flush(i);
        _scanBlock(input, i, close, out);
        i = close + 1;
        textStart = i;
        continue;
      }
    }

    i++;
  }

  flush(to);
}

function _scanBlock(input: string, open: number, close: number, out: Token[]): void {
  const inner = input.slice(open + 1, close);

  // Plural / select structure: `paramName , keyword , variants`
  const m = inner.match(/^(\w+)(\s*,\s*)(plural|select|selectordinal)(\s*,\s*)/i);
  if (m) {
    const variantsFrom = open + 1 + m[0].length;
    out.push({ kind: "text", text: "{" });
    out.push({ kind: "variable", text: m[1]! });
    out.push({ kind: "text", text: m[2]! });
    out.push({ kind: "keyword", text: m[3]! });
    out.push({ kind: "text", text: m[4]! });
    _scanVariants(input, variantsFrom, close, out);
    out.push({ kind: "text", text: "}" });
    return;
  }

  // Simple `{name}` — emit braces + name as a single variable token so the
  // pill background in the overlay covers the whole placeholder.
  if (/^\s*\w+\s*$/.test(inner)) {
    out.push({ kind: "variable", text: input.slice(open, close + 1) });
    return;
  }

  // Unknown format — emit the whole block in variable colour
  out.push({ kind: "variable", text: input.slice(open, close + 1) });
}

function _scanVariants(input: string, from: number, to: number, out: Token[]): void {
  let i = from;
  let textStart = from;

  const flush = (end: number) => {
    if (end > textStart) out.push({ kind: "text", text: input.slice(textStart, end) });
    textStart = end;
  };

  while (i < to) {
    // Leading whitespace
    const wsM = input.slice(i, to).match(/^\s+/);
    if (wsM) {
      flush(i);
      out.push({ kind: "text", text: wsM[0] });
      i += wsM[0].length;
      textStart = i;
      continue;
    }

    // Variant name: `one`, `other`, `few`, `=0`, …
    const nameM = input.slice(i, to).match(/^(=\d+|[a-z]+)/i);
    if (nameM) {
      flush(i);
      out.push({ kind: "keyword", text: nameM[0] });
      i += nameM[0].length;
      textStart = i;

      // Optional whitespace before `{`
      const ws2 = input.slice(i, to).match(/^\s*/);
      if (ws2?.[0]) {
        out.push({ kind: "text", text: ws2[0] });
        i += ws2[0].length;
        textStart = i;
      }

      // Variant body `{…}`
      if (input[i] === "{") {
        const bodyClose = findMatchingBrace(input, i);
        if (bodyClose > i && bodyClose < to) {
          out.push({ kind: "text", text: "{" });
          _scanText(input, i + 1, bodyClose, true, out);
          out.push({ kind: "text", text: "}" });
          i = bodyClose + 1;
          textStart = i;
          continue;
        }
      }
      continue;
    }

    i++;
  }

  flush(to);
}
