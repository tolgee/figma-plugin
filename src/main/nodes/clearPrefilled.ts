import { TOLGEE_NODE_INFO } from "$shared/constants";

/** Yield to the event loop after this many examined nodes so a heavily
 *  prefilled document can't freeze the canvas mid-clear. The candidate set is
 *  already engine-filtered (only nodes carrying our pluginData). */
const YIELD_EVERY = 200;

/**
 * Undo auto-generated key names when the user turns "Prefill key format" OFF:
 * clear the persisted key of unconnected text nodes across the document — but
 * ONLY where the key is still exactly the value the prefill generated for it,
 * recorded in the `prefilledKey` provenance marker (written by the prefill
 * effect in Index.svelte).
 *
 *   key === prefilledKey  → untouched auto value        → cleared
 *   key !== prefilledKey  → hand-typed or edited        → preserved
 *   no prefilledKey        → never auto (manual)          → preserved
 *
 * The marker is self-invalidating: any manual key change diverges it from the
 * key, and a format change re-generates both together, so it stays correct even
 * across format changes — which a "regenerate and compare" approach could not.
 *
 * Fast by construction: each page uses the engine-side `findAllWithCriteria`
 * pluginData filter (like `scanConnectedNodes`), so only nodes carrying our
 * data are examined — never a full JS walk of every layer. The per-node work is
 * a parse plus a string compare; no regeneration, no ancestor walks. Each page
 * is `loadAsync`-ed first (dynamic-page), mirroring `resetConfig`.
 *
 * Returns the number of nodes cleared.
 */
export async function clearPrefilledKeys(): Promise<number> {
  let cleared = 0;
  let examined = 0;
  for (const page of figma.root.children) {
    if (page.type !== "PAGE") continue;
    await page.loadAsync();
    const nodes = page.findAllWithCriteria({
      types: ["TEXT"],
      pluginData: { keys: [TOLGEE_NODE_INFO] },
    });
    for (const node of nodes) {
      const raw = node.getPluginData(TOLGEE_NODE_INFO);
      if (!raw) continue;
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        continue;
      }
      // Keep real Tolgee links, and skip nodes with nothing to clear.
      if (data.connected) continue;
      const key = data.key;
      if (typeof key !== "string" || key === "") continue;

      examined++;
      if (examined % YIELD_EVERY === 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }

      // Only an UNTOUCHED auto key still equals its provenance marker. A manual
      // edit / hand-typed key (or one with no marker) diverges → preserve it.
      if (data.prefilledKey !== key) continue;

      // Drop both the key and its now-meaningless marker.
      const { prefilledKey: _drop, ...rest } = data;
      node.setPluginData(TOLGEE_NODE_INFO, JSON.stringify({ ...rest, key: "" }));
      cleared++;
    }
  }
  return cleared;
}
