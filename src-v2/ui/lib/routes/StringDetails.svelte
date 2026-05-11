<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { send, nextCorrelationId } from "$ui/lib/bus";
  import { Button, Input, Label, Switch } from "$ui/lib/components/ui";
  import IcuPreview from "$ui/lib/components/domain/IcuPreview.svelte";
  import ParamsEditor from "$ui/lib/components/domain/ParamsEditor.svelte";
  import type { NodeInfo } from "$shared/types";

  const route = $derived(appState.value.route);
  const node = $derived<NodeInfo | null>(
    route.name === "stringDetails"
      ? (route as { name: "stringDetails"; node: NodeInfo }).node
      : null,
  );

  let translation = $state("");
  let isPlural = $state(false);
  let pluralParamValue = $state("count");
  let paramsValues = $state<Record<string, string>>({});
  // Tracks which node id we have prefilled for so the effect doesn't clobber
  // user edits on re-runs (e.g. when paramsValues updates).
  let prefilledForId = $state<string | null>(null);

  $effect(() => {
    const n = node;
    if (!n) {
      prefilledForId = null;
      return;
    }
    if (prefilledForId === n.id) return;

    translation = n.translation ?? "";
    isPlural = n.isPlural ?? false;
    pluralParamValue = n.pluralParamValue ?? "count";
    paramsValues = { ...(n.paramsValues ?? {}) };
    prefilledForId = n.id;
  });

  function save(): void {
    const n = node;
    if (!n) return;
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: [
        {
          id: n.id,
          info: {
            translation,
            isPlural,
            pluralParamValue: isPlural ? pluralParamValue : undefined,
            paramsValues,
          },
        },
      ],
    });
    appState.navigate({ name: "index" });
  }

  function cancel(): void {
    appState.navigate({ name: "index" });
  }

  const language = $derived(appState.value.config?.language ?? "en");
</script>

{#if !node}
  <div class="p-4 text-xs text-[var(--color-text-secondary)]">
    No node selected.
  </div>
{:else}
  <div class="flex flex-col h-full">
    <header
      class="border-b border-[var(--color-border)] px-3 py-2 flex items-center justify-between"
    >
      <h1 class="text-sm font-semibold">String details</h1>
      <button
        type="button"
        onclick={cancel}
        class="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        Cancel
      </button>
    </header>

    <div class="flex-1 overflow-auto p-3 space-y-3">
      <div>
        <Label>Key</Label>
        <p class="mt-1 font-mono text-xs break-all">
          {node.ns ? `${node.ns}.` : ""}{node.key || "(no key)"}
        </p>
      </div>

      <div>
        <Label for="string-details-translation">Translation ({language})</Label>
        <textarea
          id="string-details-translation"
          bind:value={translation}
          rows={4}
          class="w-full mt-1 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-xs focus:outline-none focus:border-[var(--color-border-brand)] placeholder:text-[var(--color-text-secondary)] resize-y"
        ></textarea>
      </div>

      <div class="flex items-center gap-2">
        <Switch bind:checked={isPlural} id="string-details-plural" />
        <Label for="string-details-plural">Plural message</Label>
      </div>

      {#if isPlural}
        <div>
          <Label for="string-details-param">Plural parameter</Label>
          <Input
            id="string-details-param"
            bind:value={pluralParamValue}
            placeholder="count"
            class="mt-1 w-full"
          />
        </div>
      {/if}

      <ParamsEditor
        {translation}
        values={paramsValues}
        onChange={(v) => (paramsValues = v)}
      />

      <IcuPreview {translation} params={paramsValues} {language} />
    </div>

    <footer
      class="border-t border-[var(--color-border)] p-2 flex justify-end gap-2"
    >
      <Button variant="ghost" onclick={cancel}>Cancel</Button>
      <Button onclick={save}>Save</Button>
    </footer>
  </div>
{/if}
