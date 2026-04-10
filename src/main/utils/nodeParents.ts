export type NodeParents = {
  element: BaseNode | undefined;
  frame: FrameNode | undefined;
  artboard: FrameNode | undefined;
  component: ComponentNode | ComponentSetNode | undefined;
  section: SectionNode | undefined;
  group: GroupNode | undefined;
};

/**
 * Single traversal to collect all relevant parent types at once.
 */
export function getAllParents(nodeId: string): NodeParents {
  const result: NodeParents = {
    element: undefined,
    frame: undefined,
    artboard: undefined,
    component: undefined,
    section: undefined,
    group: undefined,
  };

  const realNode = figma.getNodeById(nodeId);
  if (!realNode) return result;

  result.element = realNode;

  let parent = realNode.parent;
  while (parent) {
    if (parent.type === "FRAME") {
      if (!result.frame) result.frame = parent as FrameNode;
      result.artboard = parent as FrameNode;
    } else if (
      (parent.type === "COMPONENT" || parent.type === "COMPONENT_SET") &&
      !result.component
    ) {
      result.component = parent;
    } else if (parent.type === "SECTION" && !result.section) {
      result.section = parent;
    } else if (parent.type === "GROUP" && !result.group) {
      result.group = parent as GroupNode;
    }
    parent = parent.parent;
  }

  return result;
}

/**
 * Returns the nearest frame to the node.
 */
export function getFrame(nodeId: string): FrameNode | undefined {
  return getAllParents(nodeId).frame;
}
/**
 * Returns the topmost frame in the node's hierarchy.
 */
export function getArtboard(nodeId: string): FrameNode | undefined {
  return getAllParents(nodeId).artboard;
}

/**
 * Returns the component name if the node is inside a component.
 */
export function getComponent(
  nodeId: string,
): ComponentNode | ComponentSetNode | undefined {
  return getAllParents(nodeId).component;
}

/**
 * Returns the section name based on parent group/frame naming.
 */
export function getSection(nodeId: string): SectionNode | undefined {
  return getAllParents(nodeId).section;
}

export function getGroup(nodeId: string): GroupNode | undefined {
  return getAllParents(nodeId).group;
}

export function getElement(nodeId: string): BaseNode | undefined {
  const realNode = figma.getNodeById(nodeId);
  return realNode ?? undefined;
}
