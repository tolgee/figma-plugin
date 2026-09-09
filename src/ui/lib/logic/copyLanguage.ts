import type { TolgeeConfig } from "$shared/types";

// A BCP-47-ish language tag shape: `cs`, `en`, `pt-BR`, `zh-Hans`, `en-US`.
// Only consulted while the project's language list hasn't loaded — see
// `copyLanguageFromPageName`. A "keys" copy (named "…- keys") and a source name
// ending in "…- API" don't match, so they're never misread as a language.
const LANG_TAG_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

/**
 * A page copy's language, read from its NAME suffix — e.g. "Home - cs" → "cs".
 *
 * Both this plugin and the ORIGINAL name a language copy `${sourceName} - ${lang}`
 * (and a keys copy `${sourceName} - keys`), so the suffix is a backward-compatible
 * signal that survives even when the stored/merged config language gets repointed
 * to the main/default. The last " - " segment is always the copy's language (any
 * " - " inside the source name stays to its left).
 *
 * The suffix is accepted when it is a KNOWN project tag. Only while that list
 * is still empty does the shape check stand in for it — which is the common
 * case on a copy page, where the list is usually still in flight when
 * Recreate/Download runs, and where requiring a loaded list meant a legitimate
 * "cs" got rejected and the copy fell back to the main language.
 *
 * Requiring membership ONCE the list has loaded is what stops an unrelated
 * rename from being read as a language: "Home - cs" renamed to "Home - wip"
 * matches the tag SHAPE, and treating it as a language silently overrides the
 * immutable `copyLanguage` marker and breaks Download for that page.
 */
export function copyLanguageFromPageName(
  pageName: string | undefined,
  knownTags: ReadonlySet<string>,
): string | undefined {
  if (!pageName) return undefined;
  const i = pageName.lastIndexOf(" - ");
  if (i < 0) return undefined;
  const suffix = pageName.slice(i + 3).trim();
  if (!suffix) return undefined;
  const accepted = knownTags.size > 0 ? knownTags.has(suffix) : LANG_TAG_RE.test(suffix);
  return accepted ? suffix : undefined;
}

/**
 * The language a page copy actually holds — resolved most-reliable first, so
 * Recreate/Download always target the language the copy was made in:
 *
 *   1. the page-name suffix — set at creation by BOTH this plugin and the
 *      original, and independent of the (repointable, sometimes poisoned)
 *      config; also self-healing — a correct name overrides a stale marker;
 *   2. `copyLanguage` — the immutable marker this plugin writes on new copies
 *      (covers a copy whose page was renamed away from the "…- lang" pattern);
 *   3. `config.language` — last resort. It's the selectable Push/Pull language,
 *      which shares the page scope and can be repointed to the main/default —
 *      exactly why (1) and (2) take precedence.
 *
 * Returns undefined for a "keys" copy (no language).
 */
export function resolveCopyLanguage(
  config: Partial<TolgeeConfig> | null | undefined,
  pageName: string | undefined,
  knownTags: ReadonlySet<string>,
): string | undefined {
  return (
    copyLanguageFromPageName(pageName, knownTags) ||
    config?.copyLanguage ||
    config?.language ||
    undefined
  );
}
