import type { FrameScreenshot } from "$shared/types";

// TODO: Capture screenshots for the given frame node ids.
// Should call `node.exportAsync({ format: "PNG" })`, deduplicate by hash,
// and return base64-encoded payloads along with the keys/areas overlaid on
// each frame.
export async function captureScreenshots(
  _nodeIds: string[],
): Promise<FrameScreenshot[]> {
  // TODO
  return [];
}
