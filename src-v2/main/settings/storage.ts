import { TOLGEE_PLUGIN_CONFIG_NAME } from "$shared/constants";
import type {
  CurrentDocumentSettings,
  CurrentPageSettings,
  GlobalSettings,
} from "$shared/types";

/**
 * Defensive JSON parsing: returns the parsed value if it is a non-null object,
 * otherwise an empty object. Never throws.
 */
function safeParseObject<T>(raw: unknown): Partial<T> {
  if (raw === null || raw === undefined || raw === "") {
    return {};
  }
  if (typeof raw === "object") {
    return raw as Partial<T>;
  }
  if (typeof raw !== "string") {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Partial<T>;
    }
    return {};
  } catch {
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
  const raw: unknown = await figma.clientStorage.getAsync(
    TOLGEE_PLUGIN_CONFIG_NAME,
  );
  return safeParseObject<GlobalSettings>(raw);
}

export async function writeGlobalSettings(
  settings: Partial<GlobalSettings>,
): Promise<void> {
  if (isEmptyObject(settings as Record<string, unknown>)) {
    await figma.clientStorage.deleteAsync(TOLGEE_PLUGIN_CONFIG_NAME);
    return;
  }
  await figma.clientStorage.setAsync(TOLGEE_PLUGIN_CONFIG_NAME, settings);
}

export async function deleteGlobalSettings(): Promise<void> {
  await figma.clientStorage.deleteAsync(TOLGEE_PLUGIN_CONFIG_NAME);
}

// --- Document (figma.root pluginData) ----------------------------------------

export function readDocumentSettings(): Partial<CurrentDocumentSettings> {
  const raw = figma.root.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return safeParseObject<CurrentDocumentSettings>(raw);
}

export function writeDocumentSettings(
  settings: Partial<CurrentDocumentSettings>,
): void {
  if (isEmptyObject(settings as Record<string, unknown>)) {
    // Figma's documented "delete" pattern for pluginData is to write "".
    figma.root.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
    return;
  }
  figma.root.setPluginData(
    TOLGEE_PLUGIN_CONFIG_NAME,
    JSON.stringify(settings),
  );
}

export function deleteDocumentSettings(): void {
  figma.root.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
}

// --- Page (PageNode pluginData) ----------------------------------------------

export function readPageSettings(
  page: PageNode,
): Partial<CurrentPageSettings> {
  const raw = page.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return safeParseObject<CurrentPageSettings>(raw);
}

export function writePageSettings(
  page: PageNode,
  settings: Partial<CurrentPageSettings>,
): void {
  if (isEmptyObject(settings as Record<string, unknown>)) {
    page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
    return;
  }
  page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(settings));
}

export function deletePageSettings(page: PageNode): void {
  page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
}
