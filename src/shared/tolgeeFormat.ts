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

/**
 * If an ICU `'`-escape starts at `i`, the index just past it; `-1` when `i`
 * isn't an escape at all. Unterminated runs report the end of the string, so a
 * caller consumes the rest as literal rather than looping.
 *
 * Every brace-aware pass in this file (`findMatchingBrace` inline, the escaper,
 * the scanners) has to agree on these rules — `''` is a literal apostrophe,
 * `'{` / `'}` / `'#` open a literal run that ends at the next `'`, and a lone
 * `'` is just an apostrophe — so they share one implementation of them.
 */
function skipEscape(input: string, i: number): number {
  if (input[i] !== "'") return -1;
  const next = input[i + 1];
  if (next === "'") return i + 2;
  if (next === "{" || next === "}" || next === "#") {
    const close = input.indexOf("'", i + 2);
    return close < 0 ? input.length : close + 1;
  }
  return i + 1;
}

/**
 * Does `input` contain a real ICU argument (`{name}`, `{count, plural, …}`)?
 *
 * A brace pair is NOT enough: Tolgee stores a plain translation with literal
 * braces as ICU-escaped text (`Use '{'braces'}'`), and treating that as an
 * argument makes callers read the string as "advanced" — which, in
 * `textOfNode`, means the stored translation outranks the live canvas
 * `characters` and a designer's edit is silently dropped from the push.
 */
export function hasIcuArgument(input: string): boolean {
  let i = 0;
  while (i < input.length) {
    const skipped = skipEscape(input, i);
    if (skipped >= 0) {
      i = skipped;
      continue;
    }
    if (input[i] === "{") {
      const close = findMatchingBrace(input, i);
      if (close > i) {
        if (ICU_ARGUMENT_RE.test(input.slice(i + 1, close))) return true;
        i = close + 1;
        continue;
      }
    }
    i += 1;
  }
  return false;
}

/** Header of a plural argument: `name, plural,` — the `{` and the variants
 *  are matched separately by the walker below. */
const PLURAL_HEADER_RE = /^\s*([\w.-]+)\s*,\s*plural\s*,/;

/** The argument NAME at the head of `{name}` / `{name, type, …}`. */
const ARGUMENT_NAME_RE = /^\s*([\w.-]+)/;

/** An argument that is followed by a VARIANT LIST rather than by a value —
 *  `plural`, `select`, `selectordinal`. */
const VARIANT_HEADER_RE = /^\s*[\w.-]+\s*,\s*(?:plural|select|selectordinal)\s*,/i;

/**
 * Visit the body of every ARGUMENT `{…}` run in `input`, at any depth.
 *
 * Walks by the same `'`-escape rules `findMatchingBrace` uses, so an escaped
 * brace never opens a phantom run.
 *
 * The `inVariantList` flag is what keeps this honest. Inside a plural or
 * select, the immediate `{…}` runs are variant BODIES, not arguments — in
 * `{gender, select, other {x}}`, `{x}` is the body of `other`, and reporting
 * it as an argument named `x` would invent a parameter nobody declared. Their
 * CONTENTS are ordinary again, so `one {Hello {name}}` still yields `name`.
 */
function walkIcuArguments(
  input: string,
  visit: (inner: string) => void,
  inVariantList = false,
): void {
  let i = 0;
  while (i < input.length) {
    const skipped = skipEscape(input, i);
    if (skipped >= 0) {
      i = skipped;
      continue;
    }
    if (input[i] === "{") {
      const close = findMatchingBrace(input, i);
      if (close > i) {
        const inner = input.slice(i + 1, close);
        if (inVariantList) {
          // A variant body: not an argument, but its contents can hold them.
          walkIcuArguments(inner, visit, false);
        } else {
          visit(inner);
          // `inner` is strictly shorter, so this terminates.
          walkIcuArguments(inner, visit, VARIANT_HEADER_RE.test(inner));
        }
        i = close + 1;
        continue;
      }
    }
    i += 1;
  }
}

/**
 * Every plural argument NAME in `input`, at any nesting depth.
 *
 * Deliberately NOT `getTolgeeFormat(...).parameter`: that one answers "is this
 * whole string one plural form?" — the right question for push diffing, and it
 * rejects `"{count, plural, …} left"` because the string doesn't END at the
 * plural's closing brace. Callers that only need to know "does a plural live
 * somewhere in here, and what is it called?" (seeding a sample count before a
 * render) must not reuse that stricter answer: a plural with any literal text
 * around it would go unseeded and `IntlMessageFormat` would throw
 * `MISSING_VALUE` on it.
 */
export function findPluralParameters(input: string): string[] {
  const out: string[] = [];
  walkIcuArguments(input, (inner) => {
    const name = inner.match(PLURAL_HEADER_RE)?.[1];
    if (name && !out.includes(name)) out.push(name);
  });
  return out;
}

/**
 * Every ICU argument NAME in `input`, at any nesting depth — `{name}`,
 * `{count, plural, …}`, `{gender, select, …}`.
 *
 * A regex can't do this: an argument whose own body contains braces (any
 * `select`, or a plural wrapping one) has no bounded `[^{}]*` tail to match,
 * so it goes unseen. That's not academic — an unseeded argument makes
 * `IntlMessageFormat` throw `MISSING_VALUE`, which drops the node in
 * `copyApply` and leaves stale text on the canvas after Pull.
 */
export function findArgumentNames(input: string): string[] {
  const out: string[] = [];
  walkIcuArguments(input, (inner) => {
    if (!ICU_ARGUMENT_RE.test(inner)) return;
    const name = inner.match(ARGUMENT_NAME_RE)?.[1];
    if (name && !out.includes(name)) out.push(name);
  });
  return out;
}

// ============================================================
// ICU generator
// ============================================================

/**
 * Does the text between a `{` and its matching `}` read as a real ICU
 * argument (`{name}`, `{count, plural, …}`) rather than prose that happens to
 * sit between braces (`{not an argument}`)? An ICU argument name is one
 * unbroken token, optionally followed by `,` and the rest of the argument.
 */
const ICU_ARGUMENT_RE = /^\s*[\w.-]+\s*(?:,[\s\S]*)?$/;

/**
 * Escape *literal* ICU syntax characters (`{` and `}`) inside a plural variant
 * body so the body can never be misread as starting/ending a nested ICU
 * argument. ICU's own escaping wraps a literal brace in single quotes: `{` →
 * `'{'`, `}` → `'}'`.
 *
 * Three kinds of brace have to be told apart, which a blind replace cannot do:
 *
 *   - a real nested argument (`One for {name}`) — must survive verbatim, or it
 *     stops interpolating and gets uploaded in that corrupted form;
 *   - an already-escaped literal (`a '{' b`) — escaping it again yields
 *     `a ''{'' b`, a literal apostrophe followed by an *unclosed* argument that
 *     `intl-messageformat` throws on;
 *   - a genuinely stray brace (`co{unt`) — the only one that needs escaping.
 *
 * So walk the string once by the same `'`-escape rules `findMatchingBrace`
 * uses, skip over both of the first two kinds, and wrap only what is left.
 */
function escapeIcuBraces(text: string): string {
  let out = "";
  let i = 0;

  while (i < text.length) {
    // An escaped run (or a bare apostrophe) is copied through untouched —
    // escaping it again would turn `a '{' b` into `a ''{'' b`, an unclosed
    // argument. An unterminated run reports end-of-string, so the rest is
    // copied verbatim rather than half-escaped.
    const skipped = skipEscape(text, i);
    if (skipped >= 0) {
      out += text.slice(i, skipped);
      i = skipped;
      continue;
    }

    const ch = text[i];

    if (ch === "{") {
      const close = findMatchingBrace(text, i);
      if (close > i && ICU_ARGUMENT_RE.test(text.slice(i + 1, close))) {
        out += text.slice(i, close + 1);
        i = close + 1;
        continue;
      }
      out += "'{'";
      i += 1;
      continue;
    }

    // Every `}` closing a real argument was consumed by the branch above, so
    // whatever reaches here is stray.
    if (ch === "}") {
      out += "'}'";
      i += 1;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}

/**
 * Reconstruct an ICU plural string from a `TolgeeFormat` object.
 * Mirrors `tolgeeFormatGenerateIcu` from `@tginternal/editor`.
 *
 * Two invariants the raw structural rebuild above didn't enforce, both
 * fixed here to match upstream and keep the result parseable by
 * `intl-messageformat`:
 *   - a missing `other` variant is force-appended as `other {}` — ICU
 *     requires every plural to have an `other` fallback;
 *   - literal `{`/`}` inside a variant body are escaped (see
 *     `escapeIcuBraces`) so they can't be mistaken for the start/end of a
 *     nested argument.
 * If every variant body ends up empty, the plural wrapper is pointless
 * (and, per upstream, actively dropped) — return `""` instead.
 */
export function tolgeeFormatGenerateIcu(format: TolgeeFormat, _raw: boolean): string {
  const { parameter, variants } = format;
  if (!parameter) return variants.other ?? "";

  // Force-append `other {}` when absent, preserving key order otherwise —
  // matches upstream's `s.other || (s.other = "")`.
  const withOther: Record<string, string | undefined> =
    variants.other !== undefined ? variants : { ...variants, other: "" };

  // All variant bodies empty (or undefined) → no meaningful plural to emit.
  const allEmpty = Object.values(withOther).every((v) => !v);
  if (allEmpty) return "";

  const parts = Object.entries(withOther)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([k, v]) => `${k} {${escapeIcuBraces(v)}}`)
    .join(" ");
  return `{${parameter}, plural, ${parts}}`;
}

// ============================================================
// Plural variant helpers
// ============================================================

const CLDR_ORDER = ["zero", "one", "two", "few", "many", "other"] as const;

// `new Intl.PluralRules(locale)` allocates locale data and is the costly part of
// the helpers below. They run inside the plural editor's per-keystroke render
// loop (once per variant), so cache the instance per locale — locales are few
// and the rules are immutable.
const pluralRulesCache = new Map<string, Intl.PluralRules>();
function pluralRules(locale: string): Intl.PluralRules {
  let rules = pluralRulesCache.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRulesCache.set(locale, rules);
  }
  return rules;
}

/**
 * Return the CLDR plural categories active for `locale`, in canonical order.
 * Uses `Intl.PluralRules` probing for compatibility with all environments.
 * Mirrors `getPluralVariants` from `@tginternal/editor`.
 */
export function getPluralVariants(locale: string): string[] {
  try {
    const rules = pluralRules(locale);
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
    return Number.isNaN(n) ? undefined : n;
  }
  try {
    const rules = pluralRules(locale);
    // Probe "nice" representative numbers in priority order — same examples
    // Tolgee's editor shows (en: one→1, other→10). `0` is intentionally last so
    // the "other" form shows a real plural count, not the zero edge case; the
    // fractional probes resolve categories like Czech "many".
    for (const n of [1, 10, 100, 2, 3, 4, 5, 0, 1.5, 0.5]) {
      if (rules.select(n) === variant) return n;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Which CLDR plural category a concrete number falls into for `locale`
 * (e.g. en: 1 → "one", 6 → "other"; cs: 2 → "few", 5 → "other"). Used to drop a
 * literal count from a string into the matching plural form. Falls back to
 * "other" for unknown locales.
 */
export function getPluralCategory(locale: string, n: number): string {
  try {
    return pluralRules(locale).select(n);
  } catch {
    return "other";
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

function _scanText(input: string, from: number, to: number, inPlural: boolean, out: Token[]): void {
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
    out.push({ kind: "variable", text: m[1] ?? "" });
    out.push({ kind: "text", text: m[2] ?? "" });
    out.push({ kind: "keyword", text: m[3] ?? "" });
    out.push({ kind: "text", text: m[4] ?? "" });
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
