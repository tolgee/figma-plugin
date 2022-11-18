import { loadFontsAsync, on, once, showUI } from '@create-figma-plugin/utilities'
import { TOLGEE_PLUGIN_CONFIG_NAME, TOLGEE_PREFIX } from '../tolgee';

import { CloseHandler, SyncCompleteHandler, TolgeeConfig, TranslationsUpdateHandler } from '../types';

export default async function () {
  once<SyncCompleteHandler>("SYNC_COMPLETE", () => {
    figma.notify("Synchronization completed.");
    figma.closePlugin();
  });
  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin();
  });
  on<TranslationsUpdateHandler>('UPDATE_NODES', async (nodes) => {
    const textNodes = nodes.map(n => figma.getNodeById(n.id) as TextNode);
    await loadFontsAsync(textNodes);
    nodes.forEach(async n => {
      const node = textNodes.find(nod => nod.id === n.id)!;
      node.autoRename = false;
      node.characters = n.characters;
    });
    figma.notify("Document translations updated")
    figma.closePlugin();
  })

  const nodes = (figma.currentPage.children
    .filter(node => node.type === "TEXT" && node.name.startsWith(TOLGEE_PREFIX)) as unknown as TextNode[])
    .map(node => ({ name: node.name, characters: node.characters, id: node.id }));

  const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  const config = pluginData !== "" ? JSON.parse(figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME)) as Partial<TolgeeConfig> : null;

  if (config && config.lang && config.apiKey && config.url) {
    console.log("CONFIG FOUND: ", config);
    showUI({
      height: 800,
      width: 500,
      title: "Sync Tolgee to Figma",
    }, { config, nodes });
  } else {
    console.log("NO CONFIG FOUND");
    figma.notify("Please run \"Setup Tolgee\" first.");
    figma.closePlugin();
  }

}
