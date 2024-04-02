import { TOLGEE_PLUGIN_CONFIG_NAME } from "@/constants";
import { CurrentPageSettings } from "@/types";

export const getAllPages = () => {
  const document = figma.root;
  return document.children.filter((node) => node.type === "PAGE");
};

export const getPageData = (page = figma.currentPage) => {
  const pluginData = page.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  return pluginData
    ? (JSON.parse(pluginData) as Partial<CurrentPageSettings>)
    : {};
};

export const setPageData = (
  data: Partial<CurrentPageSettings>,
  page = figma.currentPage
) => {
  page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(data));
};
