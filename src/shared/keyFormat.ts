import type { GlobalSettings } from "./types";

/**
 * Context values used to substitute placeholders in a key-format template.
 *
 * Mirrors the placeholders defined in `constants.ts` /
 * `TOLGEE_KEY_FORMAT_PLACEHOLDERS`.
 */
export type KeyFormatContext = {
  artboard?: string;
  frame?: string;
  elementName?: string;
  elementText?: string;
  component?: string;
  /** Layer name of the nearest component INSTANCE (distinct from `component`,
   *  which is the name of the main component it was created from). */
  instance?: string;
  section?: string;
  group?: string;
};

/**
 * The subset of placeholders that must be resolved by walking the Figma tree
 * (as opposed to `elementName`/`elementText`, which a node already carries).
 */
export type KeyParentNames = Pick<
  KeyFormatContext,
  "component" | "instance" | "frame" | "artboard" | "section" | "group"
>;

/**
 * Whether a key-format template references any parent-derived placeholder.
 * Resolving parents means an upward tree walk (main-thread only), so callers
 * on BOTH sides gate that work behind this check.
 */
export function keyFormatUsesParents(keyFormat: string | undefined): boolean {
  return /\{(component|instance|frame|artboard|section|group)\}/.test(keyFormat ?? "");
}

/**
 * Applies the requested casing transformation to a free-form string.
 *
 * Reference implementation: `src/utilities.ts#formatString`.
 */
export function applyCasing(input: string, casing: GlobalSettings["variableCasing"]): string {
  const str = input ?? "";
  switch (casing) {
    case "camelCase":
      return str
        .split(/\s+/)
        .filter(Boolean)
        .map((word, index) =>
          index > 0
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase(),
        )
        .join("");
    case "PascalCase":
      return str
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
    case "snake_case":
      return str
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.toLowerCase())
        .join("_");
    case "snake_case_capitalized":
      return str
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("_");
    case "noSpaces":
      return str.replace(/\s/g, "");
    default:
      // "keep original format": "" / undefined / anything unrecognised → return
      // the string untouched. Matches the original plugin's `formatString`
      // fallthrough; must NOT snake_case, or configs that kept the original
      // format would be silently transformed.
      return str;
  }
}

/** A template split into literal text and (resolved) placeholder parts. */
type KeyPart =
  | { ph: false; value: string }
  | { ph: true; value: string; empty: boolean };

const PLACEHOLDER =
  /\{(elementName|elementText|component|instance|frame|artboard|section|group)\}/g;

/**
 * Formats a Tolgee key from a template string and a context object.
 *
 * Reference implementation: `src/main/endpoints/preformatKey.ts`.
 *
 * An empty placeholder value is removed together with ONE adjacent separator,
 * so the result never carries a leading, trailing, or doubled separator — e.g.
 * `{component}.{elementName}` with no component yields `element_name`, not
 * `.element_name`.
 */
export function formatKey(
  template: string,
  context: KeyFormatContext,
  casing: GlobalSettings["variableCasing"],
): string {
  // Split into literal + placeholder parts, resolving each placeholder to its
  // casing-applied value; literals (separators, fixed text) pass through as-is.
  const parts: KeyPart[] = [];
  let last = 0;
  for (const m of template.matchAll(PLACEHOLDER)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push({ ph: false, value: template.slice(last, idx) });
    const value = applyCasing(context[m[1] as keyof KeyFormatContext] ?? "", casing);
    parts.push({ ph: true, value, empty: value === "" });
    last = idx + m[0].length;
  }
  if (last < template.length) parts.push({ ph: false, value: template.slice(last) });

  // Drop each empty placeholder plus ONE adjacent separator CHARACTER: prefer
  // the literal immediately BEFORE it, or the one AFTER when nothing precedes
  // it (so a leading empty placeholder doesn't leave a dangling separator).
  //
  // One character, not the whole literal. A literal can carry fixed text as
  // well as a separator — `app.{component}.{elementName}` holds `app.` — and
  // removing all of it silently drops text the user put in their template,
  // straight into a key name that then gets persisted and uploaded.
  const drop = new Set<number>();
  let contentBefore = false;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part?.ph) continue;
    if (!part.empty) {
      contentBefore = true;
      continue;
    }
    drop.add(i);
    const prev = parts[i - 1];
    const next = parts[i + 1];
    if (contentBefore && prev && !prev.ph) {
      prev.value = trimTrailingSeparator(prev.value);
    } else if (next && !next.ph) {
      next.value = trimLeadingSeparator(next.value);
    }
  }

  return parts
    .filter((_, i) => !drop.has(i))
    .map((p) => p.value)
    .join("");
}

/** Anything that isn't a letter or a digit reads as a separator here — `.`,
 *  `-`, `/` and `_` are all in common use in key templates, so `\w` (which
 *  keeps `_`) would be the wrong test. */
const SEPARATOR = /[^\p{L}\p{N}]/u;

function trimTrailingSeparator(value: string): string {
  const last = value.slice(-1);
  return last && SEPARATOR.test(last) ? value.slice(0, -1) : value;
}

function trimLeadingSeparator(value: string): string {
  const first = value.slice(0, 1);
  return first && SEPARATOR.test(first) ? value.slice(1) : value;
}
