import { TOLGEE_PLUGIN_CONFIG_NAME } from "@/constants";
import {
  ConfigChangeHandler,
  CurrentDocumentSettings,
  CurrentPageSettings,
  GlobalSettings,
  TolgeeConfig,
} from "@/types";
import { emit } from "@create-figma-plugin/utilities";
import { setPageData } from "./pages";

const getGlobalSettings = async (): Promise<Partial<GlobalSettings>> => {
  const pluginData = await figma.clientStorage.getAsync(
    TOLGEE_PLUGIN_CONFIG_NAME,
  );
  if (!pluginData) return {};
  // clientStorage may return an already-parsed object (Figma auto-parses JSON
  // strings, or old data was stored without JSON.stringify). Handle both.
  if (typeof pluginData === "string") {
    try {
      return JSON.parse(pluginData) as Partial<GlobalSettings>;
    } catch {
      return {};
    }
  }
  return pluginData as Partial<GlobalSettings>;
};

const setGlobalSettings = async (data: Partial<GlobalSettings>) => {
  await figma.clientStorage.setAsync(TOLGEE_PLUGIN_CONFIG_NAME, data);
};

export const deleteGlobalSettings = async () => {
  await figma.clientStorage.deleteAsync(TOLGEE_PLUGIN_CONFIG_NAME);
};

export const getDocumentData = (): Partial<CurrentDocumentSettings> => {
  const pluginData = figma.root.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  // Parse into a loose record first so the self-heal can strip a field the
  // declared type no longer admits, then narrow on return.
  const stored = pluginData
    ? (JSON.parse(pluginData) as Record<string, unknown>)
    : {};

  // Self-heal: older versions persisted the apiKey into the shared document.
  // Drop it so a leaked key can never override the per-user key from
  // clientStorage (and so it stops being surfaced to other collaborators).
  delete stored.apiKey;

  return {
    ignorePrefix: "_",
    ignoreNumbers: true,
    ...(stored as Partial<CurrentDocumentSettings>),
  };
};

const setDocumentData = (data: Partial<CurrentDocumentSettings>) => {
  // Defense in depth: never write the apiKey into the shared document, even if
  // a caller bypasses the type. The secret belongs in clientStorage only.
  const documentData = { ...data };
  delete (documentData as { apiKey?: string }).apiKey;
  figma.root.setPluginData(
    TOLGEE_PLUGIN_CONFIG_NAME,
    JSON.stringify(documentData),
  );
};

export const deleteDocumentData = () => {
  figma.root.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
};

const getPageData = (page = figma.currentPage) => {
  const pluginData = page.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return pluginData
    ? (JSON.parse(pluginData) as Partial<CurrentPageSettings>)
    : {};
};

export const deletePageData = (page = figma.currentPage) => {
  page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, "");
};

export const getPluginData = async () => {
  return {
    ...(await getGlobalSettings()),
    ...getDocumentData(),
    ...getPageData(),
  };
};

export const setPluginData = async (data: Partial<TolgeeConfig>) => {
  const {
    addTags,
    apiKey,
    apiUrl,
    branch,
    ignoreHiddenLayers,
    ignoreHiddenLayersIncludingChildren,
    ignoreNumbers,
    ignorePrefix,
    ignoreTextLayers,
    keyFormat,
    language,
    namespace,
    prefillKeyFormat,
    tags,
    updateScreenshots,
    variableCasing,
  } = data;
  // apiKey -> per-user clientStorage only (never the shared document).
  await setGlobalSettings({ apiKey, apiUrl, ignorePrefix, ignoreNumbers });
  setDocumentData({
    addTags,
    apiUrl,
    branch,
    documentInfo: true,
    ignoreHiddenLayers,
    ignoreHiddenLayersIncludingChildren,
    ignoreNumbers,
    ignorePrefix,
    ignoreTextLayers,
    keyFormat,
    namespace,
    prefillKeyFormat,
    tags,
    updateScreenshots,
    variableCasing,
  });
  setPageData({ language, pageInfo: true });
  emit<ConfigChangeHandler>("CONFIG_CHANGE", await getPluginData());
};
