import { send } from "$main/bus";
import {
  type CreateCopyResult,
  collectConnectedKeyCounts,
  resolveSourcePage,
  writeTextSafely,
} from "$main/handlers/createCopy";
import type { IgnoreSettings } from "$main/nodes/filter";
import { collectConnectedKeyRefs, findTaggedTextNodes, readConnectedNodeInfo } from "$main/nodes/scan";
import { nsKeyIndex } from "$shared/keyIndex";
import { POST_CLONE_YIELD_BUDGET_MS, createYielder } from "$main/nodes/yield";
import { TOLGEE_COPY_SOURCE } from "$shared/constants";
import type { NodeInfo } from "$shared/types";

/**
 * "Update changed frames": refresh a copy page WITHOUT deleting and
 * re-cloning the whole page.
 *
 * Figma gives no stable link between a copy's layers and the original's, so
 * the plugin records one itself when it makes the copy: every top-level
 * layer of the clone gets the id of the source layer it came from
 * (`mapCopyChildren` — a clone keeps child order, so pairing by index at
 * that moment is exact). Later, `diffCopyFrames` pairs the two pages frame
 * by frame and `updateCopyFrames` clones only what is new or changed,
 * removes what the original lost, and leaves the rest alone.
 *
 * "Changed" is judged by CONNECTED keys (per-key counts inside the frame),
 * the same signal the staleness banner uses — a frame whose only changes
 * are visual (colours, a moved layer, an unconnected text) is NOT detected;
 * that is what the full "Recreate copy" remains for. Copies made by the
 * original plugin (no mapping) can only be recreated in full.
 *
 * Why this exists: a full Recreate of the customer-sized page cost a 10 s
 * clone, a second whole page in memory (which put the file into Figma's
 * recovery mode twice during testing) and ~30 s overall — to pick up one
 * new frame.
 */

export function mapCopyChildren(sourcePage: PageNode, copyPage: PageNode): void {
  const source = sourcePage.children;
  const copy = copyPage.children;
  const n = Math.min(source.length, copy.length);
  for (let i = 0; i < n; i++) {
    const s = source[i];
    const c = copy[i];
    if (s && c) c.setPluginData(TOLGEE_COPY_SOURCE, s.id);
  }
}

/** A top-level layer that can be cloned (every SceneNode but a slot). */
type Cloneable = SceneNode & { clone(): SceneNode };
const isCloneable = (n: SceneNode): n is Cloneable => "clone" in n && typeof n.clone === "function";

export type FrameDiff = {
  /** Source layers with no counterpart in the copy. */
  added: SceneNode[];
  /** Copy layers whose source layer no longer exists. */
  removed: SceneNode[];
  /** Pairs whose connected keys differ. */
  changed: { source: SceneNode; copy: SceneNode }[];
  kept: number;
  /** False when the copy has children but none carries a mapping — made by
   *  the original plugin or an older build; only a full recreate fits. */
  mappable: boolean;
};

function sameCounts(a: Map<string, number>, b: Map<string, number>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}

/** Connected-key counts of one top-level layer: a container is searched,
 *  a bare text layer is read as itself. */
async function keyCountsOf(node: SceneNode): Promise<Map<string, number>> {
  if ("findAllWithCriteria" in node) return collectConnectedKeyCounts(node);
  if (node.type === "TEXT") {
    return collectConnectedKeyCounts({
      findAllWithCriteria: (() => [node]) as unknown as PageNode["findAllWithCriteria"],
    });
  }
  return new Map();
}

export async function diffCopyFrames(sourcePage: PageNode, copyPage: PageNode): Promise<FrameDiff> {
  const bySourceId = new Map<string, SceneNode>();
  for (const child of copyPage.children) {
    const sourceId = child.getPluginData(TOLGEE_COPY_SOURCE);
    if (sourceId) bySourceId.set(sourceId, child);
  }
  const mappable = copyPage.children.length === 0 || bySourceId.size > 0;
  const diff: FrameDiff = { added: [], removed: [], changed: [], kept: 0, mappable };
  if (!mappable) return diff;

  const sourceIds = new Set<string>();
  for (const child of sourcePage.children) {
    sourceIds.add(child.id);
    const twin = bySourceId.get(child.id);
    if (!twin) {
      diff.added.push(child);
      continue;
    }
    const [a, b] = await Promise.all([keyCountsOf(child), keyCountsOf(twin)]);
    if (sameCounts(a, b)) diff.kept++;
    else diff.changed.push({ source: child, copy: twin });
  }
  for (const [sourceId, child] of bySourceId) {
    if (!sourceIds.has(sourceId)) diff.removed.push(child);
  }
  return diff;
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  return out;
}

export type UpdateCopyFramesOptions = {
  correlationId: string;
  sourcePageId: string;
  /** The copy's language; omitted for a keys copy (labels are written here). */
  language?: string;
  namespacesEnabled?: boolean;
};

/**
 * Apply `diffCopyFrames` to the CURRENT page (the copy). Progress goes out
 * as `create-copy-progress` and the result has the `create-copy-result`
 * shape, so the UI reuses the Recreate continuation unchanged.
 */
export async function updateCopyFrames(
  options: UpdateCopyFramesOptions,
  settings: Partial<IgnoreSettings> = {},
): Promise<CreateCopyResult> {
  const copyPage = figma.currentPage;
  const sourcePage = await resolveSourcePage(options.sourcePageId);
  if (!sourcePage) return { ok: false, createdPageIds: [], error: "The original page no longer exists." };
  await sourcePage.loadAsync();
  await copyPage.loadAsync();

  const announce = async (phase: string, current: number, total: number): Promise<void> => {
    send({ type: "create-copy-progress", correlationId: options.correlationId, current, total, phase });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  };

  const diff = await diffCopyFrames(sourcePage, copyPage);
  if (!diff.mappable) {
    return {
      ok: false,
      createdPageIds: [],
      error: "This copy has no frame mapping (made by an older version) — use Recreate copy.",
    };
  }

  const skippedMissingFont: string[] = [];
  const fresh: SceneNode[] = [];
  // Sample values the user set on the frames about to be replaced (language
  // copies may say "Hello, John" where the source says "Ahoj, Zuzko") —
  // read BEFORE removal and put back onto the fresh clones by key.
  const samples = new Map<string, Pick<NodeInfo, "paramsValues" | "pluralParamValue">>();
  if (options.language) {
    for (const pair of diff.changed) {
      if (!("findAllWithCriteria" in pair.copy)) continue;
      for (const ref of await collectConnectedKeyRefs(pair.copy)) {
        if (!ref.paramsValues && !ref.pluralParamValue) continue;
        const id = nsKeyIndex(ref.ns, ref.key);
        if (!samples.has(id)) {
          samples.set(id, { paramsValues: ref.paramsValues, pluralParamValue: ref.pluralParamValue });
        }
      }
    }
  }
  try {
    // Never "Removing the old copy…" here — nothing of the copy as a whole
    // goes away; frames the original lost are dropped under "Updating".
    await announce("updating", 0, 0);
    for (const node of diff.removed) node.remove();
    if (diff.changed.length + diff.added.length > 0) await announce("cloning", 0, 0);
    for (const pair of diff.changed) {
      if (!isCloneable(pair.source)) continue;
      const clone = pair.source.clone();
      const at = copyPage.children.indexOf(pair.copy);
      copyPage.insertChild(at >= 0 ? at : copyPage.children.length, clone);
      clone.setPluginData(TOLGEE_COPY_SOURCE, pair.source.id);
      pair.copy.remove();
      fresh.push(clone);
    }
    for (const source of diff.added) {
      if (!isCloneable(source)) continue;
      const clone = source.clone();
      copyPage.appendChild(clone);
      clone.setPluginData(TOLGEE_COPY_SOURCE, source.id);
      fresh.push(clone);
    }

    // Only the fresh clones are scanned — the kept frames already hold
    // their translations / labels.
    const needsAncestorHidden = Boolean(
      (settings.ignoreHiddenLayers ?? true) && settings.ignoreHiddenLayersIncludingChildren,
    );
    await announce(options.language ? `scanning-${options.language}` : "scanning-keys", 0, 0);
    const nodes: NodeInfo[] = [];
    const textNodes: TextNode[] = [];
    for (const clone of fresh) {
      if ("findAllWithCriteria" in clone) {
        textNodes.push(...(await findTaggedTextNodes(clone, POST_CLONE_YIELD_BUDGET_MS)));
      } else if (clone.type === "TEXT") {
        textNodes.push(clone);
      }
    }
    const yielder = createYielder(POST_CLONE_YIELD_BUDGET_MS);
    let processed = 0;
    for (const node of textNodes) {
      const info = readConnectedNodeInfo(node, settings, needsAncestorHidden);
      if (info) {
        if (options.language) {
          const carried = samples.get(nsKeyIndex(info.ns, info.key));
          nodes.push(carried ? { ...info, ...stripUndefined(carried) } : info);
        } else {
          const label = info.ns && options.namespacesEnabled ? `${info.ns}.${info.key}` : info.key;
          const written = await writeTextSafely(node, label, { plainOnly: true });
          if (!written) skippedMissingFont.push(node.name);
        }
      }
      processed++;
      if (await yielder.maybeYield()) {
        send({
          type: "create-copy-progress",
          correlationId: options.correlationId,
          current: processed,
          total: textNodes.length,
          phase: options.language ? `scanning-${options.language}` : "writing-keys",
        });
      }
    }
    console.log(
      `[tolgee:perf] update frames: ${diff.added.length} added, ${diff.changed.length} replaced, ${diff.removed.length} removed, ${diff.kept} kept; ${textNodes.length} tagged texts scanned`,
    );
    return {
      ok: true,
      createdPageIds: [],
      skippedMissingFont,
      pages: options.language ? [{ pageId: copyPage.id, language: options.language, nodes }] : undefined,
    };
  } catch (err) {
    return { ok: false, createdPageIds: [], error: err instanceof Error ? err.message : String(err) };
  }
}
