const TOLGEE_PREFIX = "t:";

const initialTextNodeTexts = (figma.currentPage.children
  .filter(node => node.type === "TEXT" && node.name.startsWith(TOLGEE_PREFIX)) as unknown as TextNode[])
    .map(node => ({name: node.name, characters: node.characters, id: node.id}));

let tolgeeConfig: { apiKey: string, url: string, lang: string };

const setupTolgee = async () => {
  const tolgeeConfigStr = await figma.clientStorage.getAsync("tolgee_config");
  if (!tolgeeConfigStr) {
    figma.ui.onmessage = async (setupData: { url: string, apiKey: string, lang: string }) => {
      await figma.clientStorage.setAsync("tolgee_config", JSON.stringify(setupData));
      tolgeeConfig = setupData;
      getTolgeeTranslations();
    };
    figma.showUI(__html__, { visible: true, position: {x: 100, y: 100},height: 400, width: 400, themeColors: true, title: "Tolgee Setup" })
  } else {
    tolgeeConfig = JSON.parse(tolgeeConfigStr);
    getTolgeeTranslations();
  }
}
let previouslySelectedTextNode: string | null = null;

const getTolgeeTranslations = async () => {
  setupTolgeeListener();
  figma.showUI(__html__, { visible: false })
  figma.ui.postMessage({ type: 'networkRequest', tolgeeConfig });
}


function updateKey(key: string, value: string, node: string) {
  figma.ui.postMessage({ type: 'updateKey', key, value, node, tolgeeConfig } )
}

async function updateNodeText(newText: string, node: string | TextNode) {
  const n = typeof node === "string" ? figma.getNodeById(node) as TextNode : node;
  if (!n || n.characters === newText) {
    return;
  }
  await figma.loadFontAsync(n.fontName as FontName);
  n.autoRename = false;
  n.characters = newText;
}

const setupTolgeeListener = async () => {
  figma.ui.onmessage = async (translations: Record<string, any>) => {
    initialTextNodeTexts.forEach(node => {
      const tolgee_key = node.name.replace(TOLGEE_PREFIX, "");
      if (translations[tolgee_key] && translations[tolgee_key] !== node.characters) {
        updateNodeText(translations[tolgee_key], node.id);
        node.characters = translations[tolgee_key];
      }
    })

    figma.ui.onmessage = async (updatedTranslation: { key: string, value: string, node: string}) => {
      translations[updatedTranslation.key] = updatedTranslation.value;
      updateNodeText(translations[updatedTranslation.key], updatedTranslation.node);
    }
    figma.on("selectionchange", async () => {
        const currentSelection = figma.currentPage.selection;
        if (currentSelection.length > 1) {
          previouslySelectedTextNode = null
          return;
        }
        if(currentSelection && currentSelection.length === 1 && currentSelection[0].id === previouslySelectedTextNode) {
          return;
        }
         if (currentSelection.length === 1 && currentSelection[0].type === "TEXT") {
          previouslySelectedTextNode = currentSelection[0].id;
          return
        }

        if (previouslySelectedTextNode) {
          const unselectedTextNode = figma.getNodeById(previouslySelectedTextNode) as TextNode;

          if (!unselectedTextNode.name.startsWith("t:")) {
            previouslySelectedTextNode = null;
            return;
          }

          const cachedNode = initialTextNodeTexts.find(node => node.id === unselectedTextNode.id);
          if (!cachedNode) {
            unselectedTextNode.autoRename = false;
            initialTextNodeTexts.push({characters: unselectedTextNode.characters, id: unselectedTextNode.id, name: unselectedTextNode.name});
            updateKey(unselectedTextNode.name.replace(TOLGEE_PREFIX, ""), unselectedTextNode.characters, unselectedTextNode.id);
          } else {
            if (cachedNode.name !== unselectedTextNode.name) {
              if (!cachedNode.name.startsWith(TOLGEE_PREFIX) || translations[cachedNode.name.replace(TOLGEE_PREFIX, "")]) {
                // Previously wasn't a tolgee key -> we can safely add it.
                updateKey(unselectedTextNode.name.replace(TOLGEE_PREFIX, ""), unselectedTextNode.characters, unselectedTextNode.id);
              } else {
                console.log("ASK");
                // TODO: Ask user if key should be changed or new key should be created
              }
            } else if (cachedNode.characters !== unselectedTextNode.characters) {
              // We can only get here if the key already exists -> so we can safely update it
              updateKey(unselectedTextNode.name.replace(TOLGEE_PREFIX, ""), unselectedTextNode.characters, unselectedTextNode.id);
            }
          }
        }
        previouslySelectedTextNode = null;
    })
  }
}


setupTolgee();