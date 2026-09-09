import type {
  CurrentDocumentSettings,
  CurrentPageSettings,
  GlobalSettings,
  TolgeeConfig,
} from "$shared/types";

/**
 * Field allocation across the three storage scopes. Mirrors the split that
 * `setPluginData` performed in the legacy `settingsTools.ts`, generalised so
 * `splitConfig` can route any field to the correct scope.
 *
 * Right-wins precedence on read: global < document < page.
 */
const PAGE_KEYS = [
  "language",
  "pageInfo",
  "pageCopy",
  "pageStringDetails",
  "nodeInfo",
  // Written by `markPageAsCopy` directly (bypassing splitConfig), but listed
  // here so any future writeConfig echoing it back routes it to the PAGE
  // scope — doc-scoped it would leak onto every other page's merged config.
  "sourcePageId",
  "copyLanguage",
] as const satisfies ReadonlyArray<keyof CurrentPageSettings>;

/**
 * The ONLY keys mirrored into global (per-machine) clientStorage — user-level
 * credentials + number-ignoring preferences. Everything else is document-scoped
 * so it never leaks into other documents (e.g. `keyFormat` / `tags` set in doc
 * A must not pre-fill a fresh doc B). Matches the original `setGlobalSettings`
 * split exactly (plus `ignoreFormattedNumbers`, the sub-option of ignoreNumbers).
 */
const GLOBAL_KEYS = [
  "apiKey",
  "apiUrl",
  "ignorePrefix",
  "ignoreNumbers",
  "ignoreFormattedNumbers",
] as const satisfies ReadonlyArray<keyof GlobalSettings>;

type PageKey = (typeof PAGE_KEYS)[number];

const PAGE_KEY_SET: ReadonlySet<string> = new Set(PAGE_KEYS);
const GLOBAL_KEY_SET: ReadonlySet<string> = new Set(GLOBAL_KEYS);

/**
 * Flat right-wins merge of the three storage levels into a single config view.
 * Page values override document values, which override global values.
 */
export function mergeConfig(
  global: Partial<GlobalSettings>,
  doc: Partial<CurrentDocumentSettings>,
  page: Partial<CurrentPageSettings>,
): Partial<TolgeeConfig> {
  return { ...global, ...doc, ...page };
}

/**
 * Splits a merged config back into the three storage scopes so each field
 * lands in the right place:
 *
 *   - page-only fields (`PAGE_KEYS`) → `page`;
 *   - the few global preferences (`GLOBAL_KEYS`) → BOTH `global` (cross-machine
 *     reuse) AND `doc` (so the document stays self-contained);
 *   - EVERYTHING ELSE → `doc` only, so document-level settings like `keyFormat`,
 *     `variableCasing`, `tags`, ignore rules etc. never leak into other
 *     documents via the global merge. Matches the original `setPluginData`.
 */
export function splitConfig(config: Partial<TolgeeConfig>): {
  global: Partial<GlobalSettings>;
  doc: Partial<CurrentDocumentSettings>;
  page: Partial<CurrentPageSettings>;
} {
  const global: Partial<GlobalSettings> = {};
  const doc: Partial<CurrentDocumentSettings> = {};
  const page: Partial<CurrentPageSettings> = {};

  // Iterate the input object (not a fixed key list) so unknown/legacy keys are
  // still routed — to `doc` (self-contained, no cross-document leak).
  for (const key of Object.keys(config) as Array<keyof TolgeeConfig>) {
    const value = (config as Record<string, unknown>)[key];
    if (value === undefined) continue;

    if (PAGE_KEY_SET.has(key)) {
      (page as Record<string, unknown>)[key as PageKey] = value;
    } else if (GLOBAL_KEY_SET.has(key)) {
      (global as Record<string, unknown>)[key] = value;
      (doc as Record<string, unknown>)[key] = value;
    } else {
      (doc as Record<string, unknown>)[key] = value;
    }
  }

  return { global, doc, page };
}

/**
 * Keep only the fields that legitimately belong in global (per-machine)
 * clientStorage. Used on read AND write so any document-level keys a buggy
 * earlier build leaked into global are ignored on read and dropped on the next
 * save — no stale `keyFormat`/`tags`/… pre-filling fresh documents.
 */
export function pickGlobalSettings(
  settings: Partial<GlobalSettings>,
): Partial<GlobalSettings> {
  const out: Partial<GlobalSettings> = {};
  for (const key of GLOBAL_KEYS) {
    const value = (settings as Record<string, unknown>)[key];
    if (value !== undefined) (out as Record<string, unknown>)[key] = value;
  }
  return out;
}
