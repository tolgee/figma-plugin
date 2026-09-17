import { TOLGEE_PLUGIN_CONFIG_NAME } from "$shared/constants";
import type { CurrentDocumentSettings, CurrentPageSettings, GlobalSettings } from "$shared/types";

/**
 * Defensive JSON parsing: returns the parsed value if it is a non-null object,
 * otherwise an empty object. Never throws.
 *
 * Falling back to `{}` means the caller silently resets to defaults — API key,
 * language, ignore rules and key format all gone. An ABSENT value is the
 * ordinary case (a fresh document) and stays quiet; anything present but
 * unreadable is a real anomaly and gets logged, so a corrupted or truncated
 * `clientStorage`/pluginData entry leaves a trace to explain the reset instead
 * of looking like the user's own settings vanishing for no reason.
 */
function safeParseObject<T>(raw: unknown, scope: string): Partial<T> {
  if (raw === null || raw === undefined || raw === "") {
    return {};
  }
  if (typeof raw === "object") {
    return raw as Partial<T>;
  }
  if (typeof raw !== "string") {
    console.warn(`[tolgee] ignoring non-string ${scope} settings of type ${typeof raw}`);
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Partial<T>;
    }
    console.warn(`[tolgee] ${scope} settings parsed to a non-object, resetting to defaults`);
    return {};
  } catch (err) {
    console.warn(`[tolgee] failed to parse stored ${scope} settings, resetting to defaults`, err);
    return {};
  }
}

/**
 * Returns `true` when an object has no own enumerable keys. Used to decide
 * whether to delete plugin data rather than persist an empty `"{}"` blob.
 */
function isEmptyObject(value: Record<string, unknown>): boolean {
  for (const _key in value) {
    return false;
  }
  return true;
}

// --- Global (clientStorage) ---------------------------------------------------

export async function readGlobalSettings(): Promise<Partial<GlobalSettings>> {
  // clientStorage may have been written by the legacy plugin as a JSON string,
  // or by this code path as a plain object. Handle both transparently.
  const raw: unknown = await figma.clientStorage.getAsync(TOLGEE_PLUGIN_CONFIG_NAME);
  return safeParseObject<GlobalSettings>(raw, "global");
}

export async function writeGlobalSettings(settings: Partial<GlobalSettings>): Promise<void> {
  if (isEmptyObject(settings as Record<string, unknown>)) {
    await figma.clientStorage.deleteAsync(TOLGEE_PLUGIN_CONFIG_NAME);
    return;
  }
  // MUST be a JSON string, not the raw object: the published plugin's reader
  // is an unguarded `JSON.parse(value)` at startup (settingsTools.ts), so a
  // plain object persisted here would make a ROLLBACK to that version throw
  // on launch — on every document, with no way out short of clearing plugin
  // storage. Our own reader accepts both shapes; production's does not.
  await figma.clientStorage.setAsync(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(settings));
}

export async function deleteGlobalSettings(): Promise<void> {
  await figma.clientStorage.deleteAsync(TOLGEE_PLUGIN_CONFIG_NAME);
}

// --- Document (figma.root pluginData) ----------------------------------------

export function readDocumentSettings(): Partial<CurrentDocumentSettings> {
  const raw = figma.root.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return safeParseObject<CurrentDocumentSettings>(raw, "document");
}

export function writeDocumentSettings(settings: Partial<CurrentDocumentSettings>): void {
  if (isEmptyObject(settings as Record<string, unknown>)) {
    // Figma's documented "delete" pattern for pluginData is to write "".
    figma.root.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
    return;
  }
  figma.root.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(settings));
}

// --- Page (PageNode pluginData) ----------------------------------------------

export function readPageSettings(page: PageNode): Partial<CurrentPageSettings> {
  const raw = page.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return safeParseObject<CurrentPageSettings>(raw, "page");
}

export function writePageSettings(page: PageNode, settings: Partial<CurrentPageSettings>): void {
  if (isEmptyObject(settings as Record<string, unknown>)) {
    page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
    return;
  }
  page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(settings));
}
