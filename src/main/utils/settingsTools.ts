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

const getGlobalSettings = async () => {
  const pluginData = await figma.clientStorage.getAsync(
    TOLGEE_PLUGIN_CONFIG_NAME
  );
  return pluginData ? (JSON.parse(pluginData) as Partial<GlobalSettings>) : {};
};

const setGlobalSettings = async (data: Partial<GlobalSettings>) => {
  await figma.clientStorage.setAsync(
    TOLGEE_PLUGIN_CONFIG_NAME,
    JSON.stringify(data)
  );
};

export const deleteGlobalSettings = async () => {
  await figma.clientStorage.deleteAsync(TOLGEE_PLUGIN_CONFIG_NAME);
};

export const getDocumentData = (): Partial<CurrentDocumentSettings> => {
  const pluginData = figma.root.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  const result = pluginData
    ? (JSON.parse(pluginData) as Partial<CurrentDocumentSettings>)
    : {};

  return {
    ignorePrefix: "_",
    ignoreNumbers: true,
    ...result,
  };
};

const setDocumentData = (data: Partial<CurrentDocumentSettings>) => {
  figma.root.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(data));
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
    apiKey,
    apiUrl,
    language,
    namespace,
    namespacesDisabled,
    ignorePrefix,
    ignoreNumbers,
    addTags,
    keyFormat,
    prefillKeyFormat,
    ignoreHiddenLayers,
    ignoreTextLayers,
    textLayersPrefix,
    tags,
    updateScreenshots,
  } = data;
  await setGlobalSettings({ apiKey, apiUrl, ignorePrefix, ignoreNumbers });
  setDocumentData({
    apiKey,
    apiUrl,
    namespace,
    namespacesDisabled,
    ignorePrefix,
    ignoreNumbers,
    addTags,
    tags,
    updateScreenshots,
    keyFormat,
    prefillKeyFormat,
    ignoreHiddenLayers,
    ignoreTextLayers,
    textLayersPrefix,
    documentInfo: true,
  });
  setPageData({ language, pageInfo: true });
  emit<ConfigChangeHandler>("CONFIG_CHANGE", await getPluginData());
};
