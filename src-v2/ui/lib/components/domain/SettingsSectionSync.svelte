<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import Input from "$ui/lib/components/ui/input.svelte";
  import Label from "$ui/lib/components/ui/label.svelte";
  import Switch from "$ui/lib/components/ui/switch.svelte";

  type Props = { form: Partial<TolgeeConfig> };
  let { form = $bindable() }: Props = $props();

  const ignoreHiddenLayers = $derived(form.ignoreHiddenLayers ?? true);
</script>

<div class="space-y-4">
  <section class="space-y-2">
    <h2 class="text-xs font-semibold text-[var(--color-text)]">
      Ignore strings
    </h2>

    <div class="flex items-center justify-between gap-2">
      <Label for="settings-ignore-numbers">Ignore pure numbers</Label>
      <Switch
        id="settings-ignore-numbers"
        checked={form.ignoreNumbers ?? true}
        onCheckedChange={(v) => (form.ignoreNumbers = v)}
      />
    </div>

    <div class="flex items-center justify-between gap-2">
      <Label for="settings-ignore-hidden">Ignore hidden layers</Label>
      <Switch
        id="settings-ignore-hidden"
        checked={ignoreHiddenLayers}
        onCheckedChange={(v) => (form.ignoreHiddenLayers = v)}
      />
    </div>

    {#if ignoreHiddenLayers}
      <div class="flex items-center justify-between gap-2 pl-3">
        <Label for="settings-ignore-hidden-children">
          Including all child texts
        </Label>
        <Switch
          id="settings-ignore-hidden-children"
          checked={form.ignoreHiddenLayersIncludingChildren ?? false}
          onCheckedChange={(v) =>
            (form.ignoreHiddenLayersIncludingChildren = v)}
        />
      </div>
    {/if}

    <div class="flex items-center justify-between gap-2">
      <Label for="settings-ignore-text-layers">
        Ignore text layers with prefix
      </Label>
      <Switch
        id="settings-ignore-text-layers"
        checked={form.ignoreTextLayers ?? false}
        onCheckedChange={(v) => (form.ignoreTextLayers = v)}
      />
    </div>

    <div class="space-y-1">
      <Label for="settings-ignore-prefix">Ignore prefix</Label>
      <Input
        id="settings-ignore-prefix"
        placeholder="e.g. _"
        bind:value={form.ignorePrefix}
        class="w-full"
      />
    </div>
  </section>

  <section class="space-y-2">
    <h2 class="text-xs font-semibold text-[var(--color-text)]">Key name</h2>

    <div class="flex items-center justify-between gap-2">
      <Label for="settings-prefill-key">Prefill key name</Label>
      <Switch
        id="settings-prefill-key"
        checked={form.prefillKeyFormat ?? false}
        onCheckedChange={(v) => (form.prefillKeyFormat = v)}
      />
    </div>

    {#if form.prefillKeyFormat}
      <div class="space-y-1">
        <Label for="settings-key-format">Key format</Label>
        <Input
          id="settings-key-format"
          placeholder={"{artboard}.{frame}.{elementName}"}
          bind:value={form.keyFormat}
          class="w-full"
        />
        <p class="text-[10px] text-[var(--color-text-secondary)]">
          Placeholders:
          <code>{"{artboard}"}</code>
          <code>{"{frame}"}</code>
          <code>{"{elementName}"}</code>
          <code>{"{elementText}"}</code>
          <code>{"{component}"}</code>
          <code>{"{section}"}</code>
          <code>{"{group}"}</code>
        </p>
      </div>
    {/if}
  </section>
</div>
