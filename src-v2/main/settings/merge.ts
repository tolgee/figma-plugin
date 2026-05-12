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
] as const satisfies ReadonlyArray<keyof CurrentPageSettings>;

const DOCUMENT_ONLY_KEYS = [
  "namespace",
  "branch",
  "documentInfo",
  "projectId",
] as const satisfies ReadonlyArray<Exclude<keyof CurrentDocumentSettings, keyof GlobalSettings>>;

type PageKey = (typeof PAGE_KEYS)[number];
type DocumentOnlyKey = (typeof DOCUMENT_ONLY_KEYS)[number];

const PAGE_KEY_SET: ReadonlySet<string> = new Set(PAGE_KEYS);
const DOCUMENT_ONLY_KEY_SET: ReadonlySet<string> = new Set(DOCUMENT_ONLY_KEYS);

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
 * lands in the right place. Page-only fields go to `page`, document-only
 * fields go to `doc`, and any remaining field is treated as a global setting.
 */
export function splitConfig(config: Partial<TolgeeConfig>): {
  global: Partial<GlobalSettings>;
  doc: Partial<CurrentDocumentSettings>;
  page: Partial<CurrentPageSettings>;
} {
  const global: Partial<GlobalSettings> = {};
  const doc: Partial<CurrentDocumentSettings> = {};
  const page: Partial<CurrentPageSettings> = {};

  // We intentionally iterate the input object rather than a fixed key list so
  // unknown/legacy keys still get routed (defaulting to global) rather than
  // silently dropped.
  for (const key of Object.keys(config) as Array<keyof TolgeeConfig>) {
    const value = (config as Record<string, unknown>)[key];
    if (value === undefined) continue;

    if (PAGE_KEY_SET.has(key)) {
      (page as Record<string, unknown>)[key as PageKey] = value;
    } else if (DOCUMENT_ONLY_KEY_SET.has(key)) {
      (doc as Record<string, unknown>)[key as DocumentOnlyKey] = value;
    } else {
      // Global settings live on both the global scope (for cross-document
      // reuse) and the document scope (so a document remains self-contained
      // when opened on another machine). This matches the legacy behaviour
      // where keys like `apiKey`/`apiUrl` were written to both scopes.
      (global as Record<string, unknown>)[key] = value;
      (doc as Record<string, unknown>)[key] = value;
    }
  }

  return { global, doc, page };
}
