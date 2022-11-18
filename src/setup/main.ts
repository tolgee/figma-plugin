import { once, showUI } from '@create-figma-plugin/utilities'
import { TOLGEE_PLUGIN_CONFIG_NAME, TOLGEE_PREFIX } from '../tolgee';

import { CloseHandler, SetupHandle, TolgeeConfig } from '../types';

export default async function () {
  once<SetupHandle>("SETUP", (config) => {
    figma.currentPage.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(config));
    figma.notify("Tolgee credentials saved.");
    figma.closePlugin();
  })
  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin();
  })

  const nodes = (figma.currentPage.children
    .filter(node => node.type === "TEXT" && node.name.startsWith(TOLGEE_PREFIX)) as unknown as TextNode[])
    .map(node => ({ name: node.name, characters: node.characters, id: node.id }));

  const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  const config = pluginData !== "" ? JSON.parse(figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME)) as Partial<TolgeeConfig> : null;

  showUI({
    height: 320,
    width: 300,
    title: "Tolgee Settings",
  }, { config, nodes });
}