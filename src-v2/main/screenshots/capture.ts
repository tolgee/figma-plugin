import type { FrameInfo, FrameScreenshot, NodeInfo } from "$shared/types";
import { getNodeInfo } from "$main/nodes/getNodeInfo";
import { groupNodesByFrame } from "./groupByFrame";
import { getNodeRelativePosition } from "./position";

// Tolgee renders position overlays against the exported image at 1x. The node
// x/y/width/height we send come from `absoluteBoundingBox` (in design-space
// pixels) so the screenshot must match — exporting at 2x while keeping
// positions at 1x makes the overlay boxes appear half-size and offset. The
// legacy plugin exported at 1x for the same reason.
const EXPORT_SCALE = 1;

/**
 * How many frames we may export back-to-back before yielding to the event
 * loop. The Figma plugin host runs JS on the same thread as the canvas, so
 * a tight `await Promise.all` over hundreds of frames can starve UI input.
 */
const YIELD_EVERY_N_FRAMES = 5;

const yieldToEventLoop = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Walk up from any node until we find the enclosing `PageNode`. Returns
 * `null` if the node is detached from the document tree.
 */
function findParentPage(node: BaseNode): PageNode | null {
  let current: BaseNode | null = node;
  while (current) {
    if (current.type === "PAGE") {
      return current;
    }
    current = current.parent;
  }
  return null;
}

/**
 * Ensure the page containing `node` is loaded. Required when the plugin runs
 * with `documentAccess: "dynamic-page"` — exporting or reading geometry on a
 * node whose page hasn't been loaded throws at runtime.
 */
async function ensurePageLoaded(node: BaseNode): Promise<void> {
  const page = findParentPage(node);
  if (page) {
    await page.loadAsync();
  }
}

/**
 * Export a single frame to a PNG byte buffer at `EXPORT_SCALE`. The caller is
 * responsible for guaranteeing the frame's page has been loaded — we still
 * defensively load it here so the helper is safe to use in isolation.
 */
export async function exportFrame(frame: FrameNode): Promise<Uint8Array> {
  await ensurePageLoaded(frame);
  return frame.exportAsync({
    format: "PNG",
    constraint: { type: "SCALE", value: EXPORT_SCALE },
  });
}

/**
 * Capture screenshots for the supplied node ids.
 *
 * Each id is resolved (via `getNodeByIdAsync` to respect dynamic-page access),
 * filtered down to `TextNode`s, then grouped by closest enclosing frame. Each
 * frame is exported once as a PNG and the contained text nodes contribute
 * positioned `NodeInfo` entries.
 */
export async function captureScreenshots(
  nodeIds: string[],
): Promise<FrameScreenshot[]> {
  // 1. Resolve ids → nodes. Missing nodes are skipped silently; the UI is
  //    free to pass a stale selection without crashing the export.
  const resolved = await Promise.all(
    nodeIds.map((id) => figma.getNodeByIdAsync(id)),
  );

  // 2. Keep only text nodes — screenshots are anchored to translatable text.
  const textNodes: TextNode[] = [];
  for (const node of resolved) {
    if (node && node.type === "TEXT") {
      textNodes.push(node);
    }
  }

  // 3. Group by closest frame so each frame is exported at most once.
  const frameToNodes = groupNodesByFrame(textNodes);

  // 4. Export each frame and assemble the FrameScreenshot payload. We loop
  //    sequentially (rather than Promise.all) so we can yield to the event
  //    loop and keep the plugin UI responsive on large selections.
  const screenshots: FrameScreenshot[] = [];
  let processed = 0;
  for (const [frame, nodes] of frameToNodes) {
    await ensurePageLoaded(frame);

    const frameBox = frame.absoluteBoundingBox;
    const image = await exportFrame(frame);

    const info: FrameInfo = {
      id: frame.id,
      name: frame.name,
      width: frameBox?.width ?? 0,
      height: frameBox?.height ?? 0,
    };

    const keys: FrameScreenshot["keys"] = nodes.map((node) => {
      const position = getNodeRelativePosition(node, frame);
      const nodeInfo: NodeInfo = getNodeInfo(node);
      return {
        ...nodeInfo,
        ...position,
      };
    });

    screenshots.push({ image, info, keys });

    processed += 1;
    if (processed % YIELD_EVERY_N_FRAMES === 0) {
      await yieldToEventLoop();
    }
  }

  return screenshots;
}
