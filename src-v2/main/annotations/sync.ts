import { TOLGEE_NODE_INFO } from "$shared/constants";
import type { NodeInfo } from "$shared/types";

import { getNodeInfo } from "$main/nodes/getNodeInfo";

import { ensureTolgeeCategory } from "./category";

/**
 * Build the markdown label that gets shown on the canvas. Bolded so it reads
 * as a "tag" rather than a sentence in the annotation popover.
 */
function buildLabel(info: NodeInfo): string {
  const fullKey = info.ns ? `${info.ns}.${info.key}` : info.key;
  return `**${fullKey}**`;
}

/**
 * Figma rejects the `annotations` setter if any element is missing fields it
 * expects. Cloning each preserved entry into a fresh plain object guards
 * against subtle issues where the original read-only `Annotation` object
 * carries internal markers the setter can't round-trip.
 */
function normalizeAnnotation(a: Annotation): Annotation {
  return {
    ...(a.label !== undefined ? { label: a.label } : {}),
    ...(a.labelMarkdown !== undefined ? { labelMarkdown: a.labelMarkdown } : {}),
    ...(a.properties !== undefined
      ? { properties: a.properties.map((p) => ({ ...p })) }
      : {}),
    ...(a.categoryId !== undefined ? { categoryId: a.categoryId } : {}),
  };
}

/**
 * Write `next` into `node.annotations`, wrapping the call so a single bad
 * node doesn't abort the entire sync. Figma can throw on the setter for
 * reasons that are not always documented (e.g. an unrelated annotation that
 * was created manually and references a category the plugin can't touch).
 */
function writeAnnotations(node: TextNode, next: Annotation[]): boolean {
  try {
    node.annotations = next.map(normalizeAnnotation);
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
export async function applyAnnotations(
  nodes: TextNode[],
  categoryId: string,
): Promise<number> {
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
      const ok = writeAnnotations(node, [
        ...others,
        { labelMarkdown: label, categoryId },
      ]);
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
export async function removeAnnotations(
  nodes: TextNode[],
  categoryId: string,
): Promise<number> {
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
  const affected = all.filter((n) =>
    n.annotations.some((a) => a.categoryId === categoryId),
  );
  const updated = await removeAnnotations(affected, categoryId);
  return { updated };
}
