<script lang="ts">
  import { onMount } from "svelte";
  import { attachBus, on, send } from "$inspect/lib/bus";
  import type { NodeInfo, TolgeeConfig } from "$shared/types";

  let nodes = $state<NodeInfo[]>([]);
  let config = $state<Partial<TolgeeConfig> | null>(null);

  const TRANSLATION_TRUNCATE = 200;

  onMount(() => {
    attachBus();
    on("init", (msg) => {
      config = msg.config;
      nodes = msg.selectedNodes;
    });
    on("selection-changed", (msg) => {
      nodes = msg.nodes;
    });
    on("config-changed", (msg) => {
      config = msg.config;
    });
    on("page-changed", (msg) => {
      config = msg.config;
    });
    send({ type: "ui-ready" });
  });

  function fullKey(node: NodeInfo): string {
    return node.ns ? `${node.ns}.${node.key}` : node.key;
  }

  function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return text.slice(0, max) + "…";
  }

  function buildTolgeeDeeplink(node: NodeInfo): string | null {
    const apiUrl = config?.apiUrl;
    if (!apiUrl || !node.key) return null;
    const params = new URLSearchParams();
    params.set("key", node.key);
    if (node.ns) params.set("ns", node.ns);
    return `${apiUrl}/projects/translations?${params.toString()}`;
  }

  function openInTolgee(node: NodeInfo): void {
    const url = buildTolgeeDeeplink(node);
    if (!url) return;
    send({ type: "open-external", url });
  }

  function copy(text: string): void {
    if (!text) return;
    void navigator.clipboard.writeText(text);
  }
</script>

<div class="p-3 space-y-3">
  {#if nodes.length === 0}
    <p class="text-text-secondary">
      Select a text layer to view its Tolgee key.
    </p>
  {:else}
    {#each nodes as node (node.id)}
      {@const deeplink = buildTolgeeDeeplink(node)}
      {@const hasKey = Boolean(node.key)}
      {@const hasTranslation = Boolean(node.translation)}
      <div class="border border-border rounded-md p-3 space-y-2 bg-bg">
        <div class="font-semibold text-text break-all">
          {#if hasKey}
            {fullKey(node)}
          {:else}
            <span class="text-text-secondary font-normal italic"
              >(no key)</span
            >
          {/if}
        </div>

        <div class="text-text-secondary text-xs whitespace-pre-wrap break-words">
          {#if hasTranslation}
            {truncate(node.translation, TRANSLATION_TRUNCATE)}
          {:else}
            <span class="italic">(no translation)</span>
          {/if}
        </div>

        <div class="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            class="text-text-brand text-xs disabled:text-text-secondary disabled:cursor-not-allowed"
            disabled={!deeplink}
            onclick={() => openInTolgee(node)}
          >
            Open in Tolgee
          </button>
          <button
            type="button"
            class="text-xs disabled:text-text-secondary disabled:cursor-not-allowed"
            disabled={!hasKey}
            onclick={() => copy(fullKey(node))}
          >
            Copy Key
          </button>
          <button
            type="button"
            class="text-xs disabled:text-text-secondary disabled:cursor-not-allowed"
            disabled={!hasTranslation}
            onclick={() => copy(node.translation)}
          >
            Copy Translation
          </button>
        </div>
      </div>
    {/each}
  {/if}
</div>
