import { ensureTolgeeCategory } from "./category";
import { applyAnnotations } from "./sync";

const DEBOUNCE_MS = 200;

let timer: ReturnType<typeof setTimeout> | null = null;
const queue = new Set<string>();

/**
 * Schedule a coalesced reconcile pass for the given node ids. Multiple calls
 * within `DEBOUNCE_MS` collapse into a single async run, which keeps
 * `selectionchange`-driven calls cheap.
 *
 * The reconciler is a no-op in dev mode (annotations API is read-only) and
 * when the toggle is disabled.
 */
export function scheduleReconcile(nodeIds: string[], enabled: boolean): void {
  if (!enabled) return;
  if (figma.editorType === "dev") return;
  for (const id of nodeIds) {
    queue.add(id);
  }
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    void runReconcile();
  }, DEBOUNCE_MS);
}

async function runReconcile(): Promise<void> {
  const ids = Array.from(queue);
  queue.clear();
  timer = null;
  if (ids.length === 0) return;

  const categoryId = await ensureTolgeeCategory();
  const nodes: TextNode[] = [];
  for (const id of ids) {
    const node = await figma.getNodeByIdAsync(id);
    if (node && node.type === "TEXT") {
      nodes.push(node);
    }
  }
  if (nodes.length === 0) return;
  await applyAnnotations(nodes, categoryId);
}
