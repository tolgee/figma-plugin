<script lang="ts">
  import type { NodeInfo } from "$shared/types";
  import NodeListItem from "./NodeListItem.svelte";

  type Props = {
    nodes: NodeInfo[];
    emptyText: string;
  };

  let { nodes, emptyText }: Props = $props();
</script>

{#if nodes.length === 0}
  <div
    class="flex items-center justify-center py-6 text-center text-xs text-text-secondary"
  >
    {emptyText}
  </div>
{:else}
  <ul class="flex flex-col gap-1.5">
    {#each nodes as node (node.id)}
      <NodeListItem {node} />
    {/each}
  </ul>
{/if}
