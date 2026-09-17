/**
 * Compute the position of `node` relative to the top-left corner of `frame`.
 *
 * Both nodes expose `absoluteBoundingBox` in document space; subtracting the
 * frame origin yields coordinates suitable for overlaying the key marker on
 * the exported PNG. If either bounding box is unavailable (rare — e.g. nodes
 * that have just been detached) we fall back to a zero-position so callers
 * never have to special-case null.
 */
export function getNodeRelativePosition(
  node: SceneNode,
  frame: FrameNode,
): { x: number; y: number; width: number; height: number } {
  const nodeBox = node.absoluteBoundingBox;
  const frameBox = frame.absoluteBoundingBox;
  if (!nodeBox || !frameBox) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  return {
    x: nodeBox.x - frameBox.x,
    y: nodeBox.y - frameBox.y,
    width: nodeBox.width,
    height: nodeBox.height,
  };
}
