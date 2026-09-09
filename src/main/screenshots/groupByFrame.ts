/**
 * Walk the parent chain of `node` and return the outermost FrameNode.
 *
 * The legacy plugin (src/main/utils/nodeTools.ts#findLastParentFrame) walks all
 * the way to the root and returns the last frame seen, i.e. the top-level
 * frame on the page, not the innermost wrapper. Screenshots are produced for
 * that outermost frame so the captured area matches the artboard the designer
 * sees rather than a tightly cropped sub-frame. Components and instances are
 * intentionally ignored — only true FrameNodes count.
 */
export function findOutermostFrame(node: SceneNode): FrameNode | null {
  let current: BaseNode | null = node.parent;
  let outermost: FrameNode | null = null;
  while (current) {
    if (current.type === "FRAME") {
      outermost = current;
    }
    current = current.parent;
  }
  return outermost;
}

/**
 * Group text nodes by their outermost enclosing frame. Nodes without any
 * parent frame are silently dropped — they cannot be screenshotted in
 * isolation.
 */
export function groupNodesByFrame(nodes: TextNode[]): Map<FrameNode, TextNode[]> {
  const result = new Map<FrameNode, TextNode[]>();
  for (const node of nodes) {
    const frame = findOutermostFrame(node);
    if (!frame) continue;
    const existing = result.get(frame);
    if (existing) {
      existing.push(node);
    } else {
      result.set(frame, [node]);
    }
  }
  return result;
}
