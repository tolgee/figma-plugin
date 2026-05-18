import { TOLGEE_NODE_INFO } from "$shared/constants";
import type { NodeInfo } from "$shared/types";

import { getNodeInfo } from "$main/nodes/getNodeInfo";

import { ensureTolgeeCategory } from "./category";

/**
 * Build the label shown on the canvas. Plain text — the Tolgee category
 * already differentiates these from other annotations, no need for bold.
 */
function buildLabel(info: NodeInfo): string {
  return info.ns ? `${info.ns}.${info.key}` : info.key;
}

/**
 * Write `next` into `node.annotations`. We deliberately do NOT normalize or
 * clone foreign annotations — they're handed back from Figma's reader and
 * the setter accepts them verbatim. Cloning into plain objects has caused
 * silent reverts when the foreign annotation carries internal markers our
 * naive clone drops, so it's safer to round-trip the read-only references.
 *
 * Wrapped in try/catch so a single bad node doesn't abort the entire sync.
 */
function writeAnnotations(node: TextNode, next: ReadonlyArray<Annotation>): boolean {
  try {
    node.annotations = next;
    return true;
  } catch (err) {
    console.warn(
      `[tolgee] failed to update annotations on ${node.id}:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

/**
 * Apply Tolgee annotations to the given text nodes. Annotations of unrelated
 * categories are preserved. Returns the number of nodes whose annotation
 * array we actually mutated.
 *
 * Identical-write detection is intentional: every mutation can race with
 * concurrent co-editors and produce visible "blink" in the canvas. Skipping
 * no-ops keeps the experience quiet for everyone in the file.
 */
export async function applyAnnotations(nodes: TextNode[], categoryId: string): Promise<number> {
  let updated = 0;
  for (const node of nodes) {
    const info = getNodeInfo(node);
    const others = node.annotations.filter((a) => a.categoryId !== categoryId);

    if (info.connected && info.key) {
      const label = buildLabel(info);
      const existing = node.annotations.find((a) => a.categoryId === categoryId);
      if (
        existing &&
        existing.labelMarkdown === label &&
        others.length === node.annotations.length - 1
      ) {
        // Nothing changed for our annotation; leave the node alone.
        continue;
      }
      const ok = writeAnnotations(node, [...others, { labelMarkdown: label, categoryId }]);
      if (ok) updated++;
    } else if (others.length !== node.annotations.length) {
      // The node lost its Tolgee key — strip our annotation but keep others.
      const ok = writeAnnotations(node, [...others]);
      if (ok) updated++;
    }
  }
  return updated;
}

/**
 * Remove Tolgee annotations from the given nodes. Annotations of unrelated
 * categories are preserved.
 */
export async function removeAnnotations(nodes: TextNode[], categoryId: string): Promise<number> {
  let updated = 0;
  for (const node of nodes) {
    const filtered = node.annotations.filter((a) => a.categoryId !== categoryId);
    if (filtered.length === node.annotations.length) continue;
    const ok = writeAnnotations(node, [...filtered]);
    if (ok) updated++;
  }
  return updated;
}

/**
 * Reconcile annotations across every connected text node on the current page.
 * Returns `{ updated: 0 }` in dev mode, where the API is read-only.
 */
export async function syncCurrentPage(): Promise<{ updated: number }> {
  if (figma.editorType === "dev") {
    return { updated: 0 };
  }
  await figma.currentPage.loadAsync();
  const categoryId = await ensureTolgeeCategory();
  const nodes = figma.currentPage.findAllWithCriteria({
    types: ["TEXT"],
    pluginData: { keys: [TOLGEE_NODE_INFO] },
  });
  const updated = await applyAnnotations(nodes, categoryId);
  return { updated };
}

/**
 * Strip every Tolgee annotation from the current page. Used when the user
 * turns the toggle off.
 */
export async function clearCurrentPage(): Promise<{ updated: number }> {
  if (figma.editorType === "dev") {
    return { updated: 0 };
  }
  await figma.currentPage.loadAsync();
  const categoryId = await ensureTolgeeCategory();
  const all = figma.currentPage.findAllWithCriteria({ types: ["TEXT"] });
  // Narrow to text nodes that actually carry a Tolgee annotation so we don't
  // touch unrelated nodes. (`findAllWithCriteria` doesn't filter on
  // annotations, hence the manual pass.)
  const affected = all.filter((n) => n.annotations.some((a) => a.categoryId === categoryId));
  const updated = await removeAnnotations(affected, categoryId);
  return { updated };
}
