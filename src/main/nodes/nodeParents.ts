/**
 * MAIN-THREAD — ported from the v2 plugin's `src/main/utils/nodeParents.ts`
 * (`getAllParents`), adapted for this plugin's `documentAccess: "dynamic-page"`
 * manifest:
 *   - traverses the LIVE `node.parent` chain instead of `figma.getNodeById(id)`
 *     (the sync lookup is unavailable under dynamic-page — and we already hold
 *     the node during the scan), and
 *   - resolves an INSTANCE's main component via the async
 *     `getMainComponentAsync()` (the sync `.mainComponent` getter is deprecated
 *     under dynamic-page).
 *
 * NOTE FOR THE COLLEAGUE (main-thread owner): this is new main code. It's
 * additive — a read-only ancestor walk used only to fill the parent key-format
 * placeholders; please review the dynamic-page assumptions above.
 */

import type { KeyParentNames } from "$shared/keyFormat";

export type NodeParentNames = KeyParentNames;

/**
 * Cache for `getMainComponentAsync` lookups within one batch (one selection
 * scan / one bulk generate). Keyed by the INSTANCE node's id, holding the
 * resolved component name promise — text nodes sharing an instance ancestor
 * would otherwise each pay the same async round-trip. Scoped to the batch
 * (not module-level) so component renames are picked up by the next scan.
 */
export type MainComponentNameCache = Map<string, Promise<string | undefined>>;

async function resolveMainComponentName(
  instance: InstanceNode,
  cache?: MainComponentNameCache,
): Promise<string | undefined> {
  const cached = cache?.get(instance.id);
  if (cached) return cached;
  const promise = instance.getMainComponentAsync().then((main) => {
    if (!main) return undefined;
    return main.parent?.type === "COMPONENT_SET" ? main.parent.name : main.name;
  });
  cache?.set(instance.id, promise);
  return promise;
}

/**
 * Single upward traversal collecting the names of the node's relevant
 * ancestors for key placeholders. `frame` = nearest FRAME, `artboard` = topmost
 * FRAME; `component` prefers a real COMPONENT/COMPONENT_SET, and for an INSTANCE
 * resolves the main component it was created from (using the whole COMPONENT_SET
 * name when the main is a variant, so the key reads "Button" rather than
 * "State=Hover"). `!== undefined` guards keep the NEAREST match of each kind.
 */
export async function resolveParentNames(
  node: BaseNode,
  cache?: MainComponentNameCache,
): Promise<NodeParentNames> {
  const result: NodeParentNames = {};
  let frame: string | undefined;
  let artboard: string | undefined;

  let parent = node.parent;
  while (parent) {
    if (parent.type === "FRAME") {
      if (frame === undefined) frame = parent.name;
      artboard = parent.name;
    } else if (
      (parent.type === "COMPONENT" || parent.type === "COMPONENT_SET") &&
      result.component === undefined
    ) {
      result.component = parent.name;
    } else if (parent.type === "INSTANCE") {
      // The instance's OWN layer name feeds `{instance}`; its main component
      // (resolved async, cached per batch) feeds `{component}`. Both keep the
      // nearest match.
      if (result.instance === undefined) result.instance = parent.name;
      if (result.component === undefined) {
        result.component = await resolveMainComponentName(parent, cache);
      }
    } else if (parent.type === "SECTION" && result.section === undefined) {
      result.section = parent.name;
    } else if (parent.type === "GROUP" && result.group === undefined) {
      result.group = parent.name;
    }
    parent = parent.parent;
  }

  result.frame = frame;
  result.artboard = artboard;
  return result;
}
