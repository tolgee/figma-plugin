<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import Select from "$ui/lib/components/ui/select.svelte";
  import Label from "$ui/lib/components/ui/label.svelte";

  const languageOptions = $derived(
    auth.value.languages.map((l) => ({ value: l.tag, label: l.name })),
  );

  const namespaceOptions = $derived.by(() => {
    const base = [
      { value: "", label: "(default namespace)" },
      ...auth.value.namespaces.map((n) => ({ value: n.name, label: n.name })),
    ];
    const current = form.namespace ?? "";
    return base.some((o) => o.value === current)
      ? base
      : [{ value: current, label: current }, ...base];
  });

  type Props = { form: Partial<TolgeeConfig> };
  let { form = $bindable() }: Props = $props();
</script>

<div class="space-y-3">
  {#if auth.value.namespacesEnabled}
    <div class="space-y-1">
      <Label for="settings-namespace">Default namespace</Label>
      <Select
        id="settings-namespace"
        bind:value={form.namespace}
        options={namespaceOptions}
        placeholder="Select namespace…"
        class="w-full"
      />
      <p class="text-[10px] text-text-secondary">
        Keys created from this document will use this namespace by default.
      </p>
    </div>
  {/if}

  <div class="space-y-1">
    <Label for="settings-language">Default language</Label>
    <Select
      id="settings-language"
      bind:value={form.language}
      options={languageOptions}
      placeholder="Select language…"
      class="w-full"
    />
    <p class="text-[10px] text-text-secondary">
      The language tag used when reading translations into the document.
    </p>
  </div>
</div>
