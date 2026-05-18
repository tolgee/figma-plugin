import { TOLGEE_NODE_INFO } from "$shared/constants";

/**
 * Load the current page (no-op if already loaded) and return every `TextNode`
 * on it. Uses `findAllWithCriteria`, which short-circuits inside the Figma
 * runtime instead of recursing through every child in the JS bridge.
 */
export const scanCurrentPageTextNodes = async (): Promise<TextNode[]> => {
  await figma.currentPage.loadAsync();
  // TODO: for very large pages we may want to yield to the event loop here
  // (e.g. via `setTimeout`/`requestAnimationFrame`) once we have telemetry.
  return figma.currentPage.findAllWithCriteria({ types: ["TEXT"] });
};

/**
 * Return only the text nodes on the current page that carry our plugin data
 * key. The `pluginData.keys` filter is a 2024 addition to the Plugin API and
 * works with `api: 1.0.0` + `documentAccess: "dynamic-page"`, which is what
 * this plugin targets.
 */
export const scanConnectedNodes = async (): Promise<TextNode[]> => {
  await figma.currentPage.loadAsync();
  // TODO: yield periodically for huge documents once measurement exists.
  return figma.currentPage.findAllWithCriteria({
    types: ["TEXT"],
    pluginData: { keys: [TOLGEE_NODE_INFO] },
  });
};

const collectTextNodes = (node: SceneNode, out: TextNode[]): void => {
  if (node.type === "TEXT") {
    out.push(node);
    return;
  }
  if ("children" in node) {
    for (const child of node.children) {
      collectTextNodes(child, out);
    }
  }
};

/**
 * Walk the current selection and return every reachable `TextNode`. Containers
 * (frames, groups, components, instances, …) are descended into so the user
 * can select an arbitrary subtree and still get all its text nodes back.
 */
export const scanSelectedTextNodes = async (): Promise<TextNode[]> => {
  // `figma.currentPage` is implicitly loaded — selection access requires it —
  // but calling `loadAsync` again is cheap and keeps the contract explicit.
  await figma.currentPage.loadAsync();
  const out: TextNode[] = [];
  for (const node of figma.currentPage.selection) {
    collectTextNodes(node, out);
  }
  return out;
};
