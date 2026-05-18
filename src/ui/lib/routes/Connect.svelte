<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { send, nextCorrelationId } from "$ui/lib/bus";
  import { Button, Input, Label, Switch } from "$ui/lib/components/ui";
  import KeySearch from "$ui/lib/components/domain/KeySearch.svelte";
  import { formatKey } from "$shared/keyFormat";
  import type { NodeInfo } from "$shared/types";

  // Extract node from route (MVP cast — route discriminator is checked first).
  const route = $derived(appState.value.route);
  const node = $derived<NodeInfo | null>(
    route.name === "connect"
      ? (route as { name: "connect"; node: NodeInfo }).node
      : null,
  );

  let key = $state("");
  let ns = $state("");
  let isPlural = $state(false);
  let pluralParamValue = $state("count");
  // Tracks the node id we have prefilled for, so the prefill effect doesn't
  // clobber user edits on every re-run.
  let prefilledForId = $state<string | null>(null);

  $effect(() => {
    const n = node;
    if (!n) {
      prefilledForId = null;
      return;
    }
    if (prefilledForId === n.id) return;

    const cfg = appState.value.config;
    if (n.key) {
      key = n.key;
    } else if (cfg?.prefillKeyFormat && cfg?.keyFormat) {
      key = formatKey(
        cfg.keyFormat,
        { elementName: n.name, elementText: n.characters },
        cfg.variableCasing,
      );
    } else {
      key = "";
    }
    ns = n.ns ?? cfg?.namespace ?? "";
    isPlural = n.isPlural ?? false;
    pluralParamValue = n.pluralParamValue ?? "count";
    prefilledForId = n.id;
  });

  function pickExisting(name: string, namespace: string | null): void {
    key = name;
    ns = namespace ?? "";
  }

  function connect(): void {
    const n = node;
    if (!n || !key.trim()) return;
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: [
        {
          id: n.id,
          info: {
            key: key.trim(),
            ns: ns.trim() || undefined,
            isPlural,
            pluralParamValue: isPlural ? pluralParamValue : undefined,
            connected: true,
          },
        },
      ],
    });
    appState.navigate({ name: "index" });
  }

  function removeConnection(): void {
    const n = node;
    if (!n) return;
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: [
        {
          id: n.id,
          info: {
            key: "",
            ns: undefined,
            connected: false,
          },
        },
      ],
    });
    appState.navigate({ name: "index" });
  }

  function cancel(): void {
    appState.navigate({ name: "index" });
  }
</script>

{#if !node}
  <div class="p-4 text-xs text-text-secondary">No node selected.</div>
{:else}
  <div class="flex flex-col h-full">
    <header
      class="border-b border-border px-3 py-2 flex items-center justify-between"
    >
      <h1 class="text-sm font-semibold">Connect to Tolgee</h1>
      <button
        type="button"
        onclick={cancel}
        class="text-xs text-text-secondary hover:text-text"
      >
        Cancel
      </button>
    </header>

    <div class="flex-1 overflow-auto p-3 space-y-4">
      <div>
        <Label>Current text</Label>
        <p
          class="mt-1 text-xs px-2 py-1 bg-bg-secondary rounded whitespace-pre-wrap wrap-break-word"
        >
          {node.characters}
        </p>
      </div>

      <div>
        <Label>Search existing keys</Label>
        <div class="mt-1">
          <KeySearch onSelect={pickExisting} />
        </div>
      </div>

      <div>
        <Label for="connect-key">Key</Label>
        <Input
          id="connect-key"
          bind:value={key}
          placeholder="my.tolgee.key"
          class="mt-1 w-full"
        />
      </div>

      <div>
        <Label for="connect-ns">Namespace</Label>
        <Input
          id="connect-ns"
          bind:value={ns}
          placeholder="optional"
          class="mt-1 w-full"
        />
      </div>

      <div class="flex items-center gap-2">
        <Switch bind:checked={isPlural} id="connect-plural" />
        <Label for="connect-plural">Plural message (ICU)</Label>
      </div>

      {#if isPlural}
        <div>
          <Label for="connect-param">Plural parameter</Label>
          <Input
            id="connect-param"
            bind:value={pluralParamValue}
            placeholder="count"
            class="mt-1 w-full"
          />
        </div>
      {/if}
    </div>

    <footer class="border-t border-border p-2 flex justify-end gap-2">
      {#if node.connected}
        <Button variant="outline" onclick={removeConnection}>
          Remove connection
        </Button>
      {/if}
      <Button variant="ghost" onclick={cancel}>Cancel</Button>
      <Button onclick={connect} disabled={!key.trim()}>Connect</Button>
    </footer>
  </div>
{/if}
