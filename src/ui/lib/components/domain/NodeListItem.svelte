<script lang="ts">
  import type { NodeInfo } from "$shared/types";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { send, nextCorrelationId } from "$ui/lib/bus";
  import { formatKey as applyKeyFormat } from "$shared/keyFormat";
  import Link2 from "lucide-svelte/icons/link-2";

  type Props = { node: NodeInfo };
  let { node }: Props = $props();

  // Local edit state for unconnected nodes. Connected nodes are read-only here
  // (deeper editing happens in StringDetails / Connect).
  let key = $state("");
  let ns = $state("");

  // Track which node id we last hydrated for so the $effect below doesn't
  // clobber user typing every time the parent re-renders.
  let hydratedForId = $state<string | null>(null);

  $effect(() => {
    const n = node;
    if (hydratedForId === n.id) return;
    hydratedForId = n.id;
    const cfg = appState.value.config;
    if (n.connected) {
      key = n.key ?? "";
      ns = n.ns ?? cfg?.namespace ?? "";
      return;
    }
    if (n.key) {
      key = n.key;
    } else if (cfg?.prefillKeyFormat && cfg.keyFormat) {
      key = applyKeyFormat(
        cfg.keyFormat,
        { elementName: n.name, elementText: n.characters },
        cfg.variableCasing,
      );
    } else {
      key = "";
    }
    ns = n.ns ?? cfg?.namespace ?? "";
  });

  // Debounced auto-save for inline edits on unconnected nodes.
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  function scheduleSave(): void {
    if (node.connected) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const trimmedKey = key.trim();
      const trimmedNs = ns.trim() || undefined;
      if (trimmedKey === (node.key ?? "") && trimmedNs === node.ns) return;
      send({
        type: "set-nodes-data",
        correlationId: nextCorrelationId(),
        nodes: [
          {
            id: node.id,
            info: { key: trimmedKey, ns: trimmedNs, connected: false },
          },
        ],
      });
    }, 300);
  }

  function handleKeyInput(e: Event): void {
    key = (e.currentTarget as HTMLInputElement).value;
    scheduleSave();
  }

  function focusNode(): void {
    send({ type: "scroll-to-node", id: node.id });
  }

  function openDetails(): void {
    focusNode();
    if (node.connected) {
      appState.navigate({ name: "stringDetails", node });
    } else {
      appState.navigate({ name: "connect", node });
    }
  }

  function formatConnected(n: NodeInfo): string {
    return n.ns ? `${n.ns}.${n.key}` : n.key || "(no key)";
  }
</script>

<li class="flex flex-col gap-1 rounded-md border border-border bg-bg p-2">
  <div class="flex items-center justify-between gap-2">
    <button
      type="button"
      class="truncate text-left text-[11px] text-text-secondary hover:text-text"
      title={node.characters}
      onclick={focusNode}
    >
      {node.characters || "(empty)"}
    </button>
    {#if node.connected}
      <span
        class="flex shrink-0 items-center gap-1 text-[10px] text-text-secondary"
        title="Connected"
      >
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
        connected
      </span>
    {/if}
  </div>

  {#if node.connected}
    <button
      type="button"
      class="truncate text-left text-xs font-semibold text-text hover:text-text-brand"
      title={formatConnected(node)}
      onclick={openDetails}
    >
      {formatConnected(node)}
    </button>
  {:else}
    <div class="flex items-center gap-1.5">
      <input
        type="text"
        class="h-6 min-w-0 flex-1 rounded border border-border bg-bg px-1.5 text-xs text-text focus:border-border-brand focus:outline-none"
        placeholder="Key name"
        value={key}
        oninput={handleKeyInput}
      />
      <button
        type="button"
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-secondary hover:bg-(--figma-color-bg-hover) hover:text-text"
        title="Connect to existing key"
        onclick={openDetails}
      >
        <Link2 size={12} />
      </button>
    </div>
  {/if}
</li>
