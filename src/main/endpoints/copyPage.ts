import { NodeInfo } from "@/types";
import { createEndpoint } from "../utils/createEndpoint";
import { getAllPages, getPageData, setPageData } from "../utils/pages";
import { findTextNodes, getNodeInfo } from "../utils/nodeTools";
import { loadFontsAsync } from "@create-figma-plugin/utilities";
import { compareNs } from "@/tools/compareNs";

type Props = {
  language: string;
  nodes: NodeInfo[];
};

export const copyPageEndpoint = createEndpoint<Props | undefined, void>(
  "COPY_PAGE",
  async (data) => {
    const newPage = figma.currentPage.clone();
    const name = `${figma.currentPage.name} - ${
      data?.language ? data.language : "keys"
    }`;
    getAllPages().forEach((page) => {
      if (page.name === name && getPageData(page).pageCopy === true) {
        page.remove();
      }
    });
    newPage.name = name;
    setPageData(
      { pageCopy: true, pageInfo: true, language: data?.language },
      newPage
    );
    const textNodes = findTextNodes(newPage.children).filter(
      (n) => getNodeInfo(n).key
    );

    try {
      await loadFontsAsync(textNodes);
    } catch (e) {
      console.error(e);
    }
    for (const node of textNodes) {
      const { key, ns } = getNodeInfo(node);

      if (node.hasMissingFont) {
        continue;
      }

      if (data?.language) {
        const newText = data.nodes.find(
          (n) => n.key === key && compareNs(n.ns, ns)
        )?.characters;

        if (newText) {
          node.characters = newText;
        }
      } else {
        node.characters = key;
      }
    }

    figma.notify(`Created page "${name}"`);
  }
);
