/**
 * Returns the nearest frame to the node.
 */
export function getFrame(nodeId: string): FrameNode | undefined {
  const realNode: BaseNode | null = figma.getNodeById(
    nodeId
  ) as BaseNode | null;
  if (!realNode) return undefined;
  let parent = realNode.parent;
  while (parent) {
    if (parent.type === "FRAME") {
      return parent as FrameNode;
    }
    parent = parent.parent;
  }
  return undefined;
}
/**
 * Returns the page name for the node.
 */
export function getPage(nodeId: string): PageNode | undefined {
  const realNode: BaseNode | null = figma.getNodeById(
    nodeId
  ) as BaseNode | null;
  if (!realNode) return undefined;
  let parent = realNode.parent;
  while (parent) {
    if (parent.type === "PAGE") {
      return parent as PageNode;
    }
    parent = parent.parent;
  }
}

/**
 * Returns the component name if the node is inside a component.
 */
export function getComponent(
  nodeId: string
): ComponentNode | ComponentSetNode | undefined {
  const realNode: BaseNode | null = figma.getNodeById(
    nodeId
  ) as BaseNode | null;
  if (!realNode) return undefined;
  let parent = realNode.parent;
  while (parent) {
    if (parent.type === "COMPONENT" || parent.type === "COMPONENT_SET") {
      return parent;
    }
    parent = parent.parent;
  }
  return undefined;
}

/**
 * Returns the section name based on parent group/frame naming.
 */
export function getSection(nodeId: string): FrameNode | GroupNode | undefined {
  const realNode: BaseNode | null = figma.getNodeById(
    nodeId
  ) as BaseNode | null;
  if (!realNode) return undefined;
  let parent = realNode.parent;
  while (parent) {
    // Consider groups or frames with names starting with "section" or containing "/"
    if (
      (parent.type === "GROUP" || parent.type === "FRAME") &&
      (parent.name.toLowerCase().startsWith("section") ||
        parent.name.includes("/"))
    ) {
      return parent;
    }
    parent = parent.parent;
  }
  return undefined;
}

export function getElement(nodeId: string): BaseNode | undefined {
  const realNode: BaseNode | null = figma.getNodeById(
    nodeId
  ) as BaseNode | null;
  if (!realNode) return undefined;
  return realNode;
}
