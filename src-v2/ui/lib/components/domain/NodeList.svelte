<script lang="ts">
  import type { NodeInfo } from "$shared/types";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { send } from "$ui/lib/bus";

  type Props = {
    nodes: NodeInfo[];
    emptyText: string;
  };

  let { nodes, emptyText }: Props = $props();

  function formatKey(node: NodeInfo): string {
    if (!node.key) return "(no key)";
    return node.ns ? `${node.ns}.${node.key}` : node.key;
  }

  function handleClick(node: NodeInfo): void {
    send({ type: "scroll-to-node", id: node.id });
    appState.navigate({ name: "stringDetails", node });
  }

  function handleKeydown(event: KeyboardEvent, node: NodeInfo): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(node);
    }
  }
</script>

{#if nodes.length === 0}
  <div
    class="flex items-center justify-center py-6 text-center text-xs text-[var(--color-text-secondary)]"
  >
    {emptyText}
  </div>
{:else}
  <ul class="flex flex-col gap-1.5">
    {#each nodes as node (node.id)}
      <li>
        <button
          type="button"
          onclick={() => handleClick(node)}
          onkeydown={(e) => handleKeydown(e, node)}
          class="flex w-full flex-col gap-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-left transition-colors hover:bg-[var(--figma-color-bg-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-border-brand)]"
        >
          <div class="flex items-center justify-between gap-2">
            <span
              class="truncate text-xs font-semibold text-[var(--color-text)]"
              title={formatKey(node)}
            >
              {formatKey(node)}
            </span>
            {#if node.connected}
              <span
                class="flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)]"
                title="Connected"
              >
                <span
                  class="inline-block h-1.5 w-1.5 rounded-full bg-green-500"
                ></span>
                connected
              </span>
            {/if}
          </div>
          <span
            class="truncate text-[11px] text-[var(--color-text-secondary)]"
            title={node.translation || node.characters}
          >
            {node.translation || node.characters || ""}
          </span>
        </button>
      </li>
    {/each}
  </ul>
{/if}
