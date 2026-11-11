/**
 * Compute the position of `node` relative to the top-left corner of `frame`.
 *
 * Both nodes expose `absoluteBoundingBox` in document space; subtracting the
 * frame origin yields coordinates suitable for overlaying the key marker on
 * the exported PNG; `scale` is the scale the PNG was exported at. If either
 * bounding box is unavailable (rare — e.g. nodes that have just been detached)
 * we fall back to a zero-position so callers never have to special-case null.
 */
export function getNodeRelativePosition(
  node: SceneNode,
  frame: FrameNode,
  scale = 1,
): { x: number; y: number; width: number; height: number } {
  const nodeBox = node.absoluteBoundingBox;
  const frameBox = frame.absoluteBoundingBox;
  if (!nodeBox || !frameBox) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  return {
    x: Math.round((nodeBox.x - frameBox.x) * scale),
    y: Math.round((nodeBox.y - frameBox.y) * scale),
    width: Math.round(nodeBox.width * scale),
    height: Math.round(nodeBox.height * scale),
  };
}
