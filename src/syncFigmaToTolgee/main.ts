import { loadFontsAsync, on, once, showUI } from '@create-figma-plugin/utilities'
import { TOLGEE_PLUGIN_CONFIG_NAME, TOLGEE_PREFIX } from '../tolgee';

import { CloseHandler, Node, SyncCompleteHandler, TolgeeConfig, TranslationsUpdateHandler } from '../types';

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
  })

  let nodes: Array<Node> = [];
  const conflictingNodes: Array<Node> = [];
  (figma.currentPage.children
    .filter(node => node.type === "TEXT" && node.name.startsWith(TOLGEE_PREFIX)) as unknown as TextNode[])
    .map(node => ({ name: node.name, characters: node.characters, id: node.id }))
    .forEach(node => {
      // Remove key and value duplicates.
      if (nodes.findIndex(n => n.characters === node.characters && node.name === n.name) === -1) {
        nodes.push(node)
      }
      const conflictingNode = nodes.find(n => n.name === node.name && n.characters !== node.characters);
      if (conflictingNode) {
        conflictingNodes.push(conflictingNode);
      }
    });

  nodes = nodes.sort((n1, n2) => {
    if (conflictingNodes.includes(n1) && conflictingNodes.includes(n2) && n1.name === n2.name) {
      return -1;
    } else {
      return 0;
    }
  });

  const pluginData = figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  const config = pluginData !== "" ? JSON.parse(figma.currentPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME)) as Partial<TolgeeConfig> : null;

  if (config && config.lang && config.apiKey && config.url) {
    showUI({
      height: 800,
      width: 500,
      title: "Sync Figma to Tolgee",
    }, { config, nodes, conflictingNodes });
  } else {
    figma.notify("Please run \"Setup Tolgee\" first.");
    figma.closePlugin();
  }

}
