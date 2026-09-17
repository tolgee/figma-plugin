<script lang="ts">
  import type { NodeInfo } from "$shared/types";
  import { connectedKeySig, effectiveNs } from "$ui/lib/api/keyExistence";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import NodeListItem from "./NodeListItem.svelte";

  type Props = {
    nodes: NodeInfo[];
    emptyText: string;
    /** Selection-wide count of nodes sharing each (trimmed) source string. */
    duplicateCounts?: Map<string, number>;
    /** `ns + key` → how many strings share that key with DIFFERENT text (push
     *  conflict). Count drives a clickable "filter to these" badge. */
    conflictCounts?: Map<string, number>;
    /** Per-row manual-change check (advanced string edited directly in
     *  Figma). A callback, not a precomputed set — the windowed list only
     *  evaluates it for rendered rows, so the underlying ICU render never
     *  runs for the whole selection at once. */
    getManualChange?: (node: NodeInfo) => boolean;
    /** Signatures (see `connectedKeySig`) of connected keys that no longer exist
     *  in the Tolgee project — their rows get a stale-link warning. */
    missingKeys?: ReadonlySet<string>;
    /** Apply an exact-text filter (duplicate-badge click). */
    onFilterText?: (node: NodeInfo) => void;
    /** Apply an exact-key filter (conflict-warning click). */
    onFilterKey?: (node: NodeInfo) => void;
    /** Bulk selection: the row checkbox is always shown; these drive it. */
    selectedIds?: Set<string>;
    onToggleSelect?: (id: string) => void;
    /** Namespace options for the rows' inline pickers — computed once by the
     *  list owner, not per row (see `NodeListItem`). */
    namespaceNames?: string[];
  };

  let {
    nodes,
    emptyText,
    duplicateCounts,
    conflictCounts,
    getManualChange,
    missingKeys,
    onFilterText,
    onFilterKey,
    selectedIds,
    onToggleSelect,
    namespaceNames,
  }: Props = $props();

  // ---- Windowing -------------------------------------------------------------
  // Each row is a rich component (~20 child instances: tooltips, menu, inputs),
  // so mounting hundreds of them blocks the iframe for hundreds of ms. Above
  // the threshold we render only the rows near the viewport plus a small
  // overscan, with spacer divs standing in for the rest — the same approach the
  // previous plugin's NodeList used. Below it, windowing is bypassed entirely
  // (identical DOM to a plain list, no measurement or scroll math).
  //
  // Rows share a uniform two-line layout; the exact height is measured from the
  // first rendered row rather than hardcoded, so styling tweaks can't silently
  // desync the spacer math.
  const VIRTUALIZE_FROM = 60;
  const OVERSCAN = 6;
  const FALLBACK_ROW_PX = 60;

  let viewport = $state<HTMLElement | null>(null);
  let scrollTop = $state(0);
  let viewportHeight = $state(0);
  let rowHeight = $state(FALLBACK_ROW_PX);

  const virtual = $derived(nodes.length >= VIRTUALIZE_FROM);
  const start = $derived(
    virtual
      ? Math.min(
          Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN),
          Math.max(0, nodes.length - 1),
        )
      : 0,
  );
  const end = $derived(
    virtual
      ? Math.min(nodes.length, Math.ceil((scrollTop + viewportHeight) / rowHeight) + OVERSCAN)
      : nodes.length,
  );
  const visible = $derived(nodes.slice(start, end));
  const padTop = $derived(start * rowHeight);
  const padBottom = $derived(Math.max(0, nodes.length - end) * rowHeight);

  // Keep the spacer math honest: measure the AVERAGE height of the rendered
  // window whenever it changes. Connected and unconnected rows differ by a few
  // px (key text vs. input line), so a single-row sample would oscillate as
  // the window's first row flips type — the window average stays stable for
  // mixed lists. Guarded by a 2px tolerance so re-measuring the same layout
  // never loops the derived chain.
  $effect(() => {
    void visible;
    if (!virtual || !viewport) return;
    const list = viewport.querySelector("ul");
    const count = list?.children.length ?? 0;
    if (!list || count === 0) return;
    const measured = list.getBoundingClientRect().height / count;
    if (measured > 0 && Math.abs(measured - rowHeight) > 2) rowHeight = measured;
  });
</script>

{#if nodes.length === 0}
  <div
    class="flex items-center justify-center py-6 text-center text-xs text-text-secondary"
  >
    {emptyText}
  </div>
{:else}
  <Tooltip.Provider delayDuration={300}>
    <div
      bind:this={viewport}
      bind:clientHeight={viewportHeight}
      onscroll={() => (scrollTop = viewport?.scrollTop ?? 0)}
      class="h-full overflow-auto py-1"
    >
      {#if padTop > 0}
        <div style="height: {padTop}px" aria-hidden="true"></div>
      {/if}
      <ul class="flex flex-col">
        {#each visible as node (node.id)}
          <NodeListItem
            {node}
            duplicateCount={duplicateCounts?.get((node.characters ?? "").trim()) ??
              1}
            conflictCount={node.key
              ? (conflictCounts?.get(`${node.ns ?? ""} ${node.key.trim()}`) ?? 0)
              : 0}
            manualChange={getManualChange?.(node) ?? false}
            keyMissing={node.connected && node.key
              ? (missingKeys?.has(
                  connectedKeySig(
                    effectiveNs(node.ns, auth.value.namespacesEnabled),
                    node.key,
                  ),
                ) ?? false)
              : false}
            onFilterText={() => onFilterText?.(node)}
            onFilterKey={() => onFilterKey?.(node)}
            selected={selectedIds?.has(node.id) ?? false}
            onToggleSelect={() => onToggleSelect?.(node.id)}
            {namespaceNames}
          />
        {/each}
      </ul>
      {#if padBottom > 0}
        <div style="height: {padBottom}px" aria-hidden="true"></div>
      {/if}
    </div>
  </Tooltip.Provider>
{/if}
