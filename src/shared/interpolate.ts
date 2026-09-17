import { formatIcuMessage } from "$shared/icu";
import type { NodeInfo } from "$shared/types";
import { findArgumentNames, findPluralParameters } from "$shared/tolgeeFormat";

/**
 * Port of the published plugin's render/diff core
 * (`src/ui/hooks/useInterpolatedTranslation.ts`). ONE place that turns a node's
 * stored ICU into the string shown on the Figma canvas, so the pull render, the
 * live preview and the manual-change check all agree — as they did upstream.
 *
 * Plural handling matches the original: the plural variable's NAME comes from
 * the ICU itself, and its sample COUNT is a NUMBER. To also read files written
 * by the original (which stored the count in `pluralParamValue`) AND by this
 * rewrite (which edits it as a named sample in `paramsValues`), the count is
 * sourced tolerantly: `paramsValues[name]` first, then a numeric
 * `pluralParamValue`, then "1".
 */

type RenderNode = Pick<
  NodeInfo,
  "isPlural" | "translation" | "characters" | "paramsValues" | "pluralParamValue"
>;

/** A plain digits-only string, or undefined — so a plural arg NAME accidentally
 *  left in `pluralParamValue` is never used as a count. */
function numericCount(value: string | undefined): string | undefined {
  return value != null && /^\d+$/.test(value.trim()) ? value.trim() : undefined;
}

/** Named `{param}` placeholders in an ICU string (excludes `#` and positional
 *  numeric args).
 *
 *  Uses the brace-aware scan rather than a regex: the previous
 *  `\{\s*(\w+)\s*(?:,[^{}]*)?\}` couldn't match an argument whose own body
 *  contains braces, so a `select` — or a plural wrapped in one — was never
 *  seen and never seeded, and the render threw `MISSING_VALUE`. */
function namedPlaceholders(icu: string): string[] {
  return findArgumentNames(icu).filter((name) => name !== "#" && !/^\d+$/.test(name));
}

/**
 * ICU params for rendering `icu` with this node's samples: the named
 * `paramsValues`, plus the plural variable seeded with its sample count when the
 * ICU is a plural and no sample is already provided for it.
 *
 * Whether `icu` HOLDS a plural is decided by its own STRUCTURE
 * (`findPluralParameters` scans for a `{name, plural, ...}` argument anywhere
 * in it), not by the node's `isPlural` flag — that flag
 * mirrors Tolgee's KEY setting, which can be stale or simply wrong for a key
 * whose translation was typed as ICU plural syntax without the key itself
 * ever being marked plural. Trusting the flag there meant a correctly-shaped
 * plural silently rendered as its own raw ICU pattern (no sample ever seeded,
 * so `IntlMessageFormat` throws on the missing argument) whenever the two
 * disagreed — this makes the render succeed regardless of which side lied.
 *
 * The scan is used instead of `getTolgeeFormat(...).parameter` because that one
 * only recognises a plural that is the ENTIRE string; `"{count, plural, …} left"`
 * — a plural with literal text around it, a very ordinary shape — went unseeded
 * and threw `MISSING_VALUE`, dropping the node in `copyApply` and leaving stale
 * canvas text on Pull.
 */
export function renderParams(icu: string, node: RenderNode): Record<string, string> {
  const params: Record<string, string> = { ...(node.paramsValues ?? {}) };
  const pluralNames = findPluralParameters(icu);
  for (const pluralName of pluralNames) {
    // The plural argument MUST be numeric — IntlMessageFormat doesn't throw
    // on a non-numeric value, it silently coerces it to NaN ("Mám NaN
    // jablek" on the canvas). Old node data can carry the arg NAME (or "")
    // as its own sample, so a non-numeric `paramsValues` entry falls
    // through to `pluralParamValue`, then to "1".
    params[pluralName] =
      numericCount(params[pluralName]) ?? numericCount(node.pluralParamValue) ?? "1";
  }
  // Seed any other named placeholder with its OWN name so it renders as e.g.
  // "Hello, name!" instead of a literal "{name}" or an ICU throw — the original
  // pull behaviour. A real sample in `paramsValues` always wins.
  for (const name of namedPlaceholders(icu)) {
    if (!pluralNames.includes(name) && !(name in params)) params[name] = name;
  }
  return params;
}

/**
 * Render an explicit ICU string with a node's samples. Used for pulled text
 * (which may differ from the node's stored translation). Returns the raw ICU
 * plus the captured `Error` on any formatting failure so callers can warn.
 */
export function renderIcuForNode(
  icu: string,
  node: RenderNode,
  language: string,
): { text: string; error?: Error } {
  const { result, error } = formatIcuMessage(icu, renderParams(icu, node), language || "en");
  return error ? { text: icu, error } : { text: result };
}

/**
 * A node with no ICU interpolation to do — not plural, no sample params, no
 * inline markup. Mirrors the original `isSimpleNode`: such a node's canvas text
 * IS its value, so it's never treated as a manual-change divergence.
 */
export function isSimpleNode(node: RenderNode): boolean {
  return (
    !node.isPlural &&
    Object.keys(node.paramsValues ?? {}).length === 0 &&
    !/<[^>]*>/.test(node.translation ?? "")
  );
}

/** The string that should sit on the canvas for this node: the render of its
 *  stored translation (or the raw characters for a simple node). */
export function interpolatedText(
  node: RenderNode,
  language: string,
): { text: string; error?: Error } {
  const icu = isSimpleNode(node)
    ? node.characters || node.translation || ""
    : node.translation || node.characters || "";
  return renderIcuForNode(icu, node, language);
}

/**
 * The canvas `characters` no longer equal the rendered stored translation — an
 * advanced string edited directly in Figma (formatting lost). Mirrors the
 * original `translationDiffersFromNode`, comparing with inline tags stripped
 * from both sides.
 */
export function translationDiffersFromNode(node: RenderNode, language: string): boolean {
  if (isSimpleNode(node)) return false;
  const out = interpolatedText(node, language);
  // If the ICU can't be rendered we can't tell whether it diverged — don't
  // claim a manual change (avoids a false warning on a broken translation).
  if (out.error) return false;
  const rendered = out.text.replace(/<[^>]*>/g, "");
  const canvas = (node.characters ?? "").replace(/<[^>]*>/g, "");
  return rendered.trim() !== canvas.trim();
}

// The diff result is pure in the node's render inputs, but the render itself
// (ICU parse + IntlMessageFormat) is the priciest per-node work the Index list
// does — and it used to re-run for EVERY advanced node on every selection
// update. Cache by the exact inputs; entries for unchanged nodes survive the
// in-place patches that follow writes, so only edited nodes re-render.
const diffCache = new Map<string, boolean>();
const DIFF_CACHE_MAX = 2000;

function diffCacheKey(node: RenderNode, language: string): string {
  return JSON.stringify([
    language,
    node.isPlural ?? false,
    node.translation ?? "",
    node.characters ?? "",
    node.pluralParamValue ?? "",
    node.paramsValues ?? {},
  ]);
}

/** Memoised `translationDiffersFromNode` for hot list paths. */
export function translationDiffersFromNodeCached(node: RenderNode, language: string): boolean {
  const key = diffCacheKey(node, language);
  const hit = diffCache.get(key);
  if (hit !== undefined) return hit;
  const result = translationDiffersFromNode(node, language);
  // Unbounded growth guard; a full reset is fine, the next pass repopulates.
  if (diffCache.size >= DIFF_CACHE_MAX) diffCache.clear();
  diffCache.set(key, result);
  return result;
}

/**
 * Best sample count for `icu` whose plural render matches `canvas`, so a
 * freshly connected plural layer keeps the form it already shows instead of
 * snapping to a default. Returns undefined when `icu` isn't a plural or nothing
 * matches (caller falls back to "1"). The original stored the arg NAME here
 * instead — a latent bug — so inferring the count is the intended behaviour.
 */
export function inferPluralCount(
  icu: string,
  canvas: string,
  language: string,
): string | undefined {
  const name = findPluralParameters(icu)[0];
  if (!name) return undefined;
  const target = canvas.replace(/<[^>]*>/g, "").trim();
  if (!target) return undefined;
  for (const n of [0, 1, 2, 3, 4, 5, 6, 10, 11, 21, 100]) {
    const { result, error } = formatIcuMessage(icu, { [name]: String(n) }, language || "en");
    if (!error && result.replace(/<[^>]*>/g, "").trim() === target) return String(n);
  }
  return undefined;
}
