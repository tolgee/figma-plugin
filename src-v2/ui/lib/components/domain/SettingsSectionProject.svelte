<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import Input from "$ui/lib/components/ui/input.svelte";
  import Label from "$ui/lib/components/ui/label.svelte";

  type Props = { form: Partial<TolgeeConfig> };
  let { form = $bindable() }: Props = $props();
</script>

<div class="space-y-3">
  {#if auth.value.namespacesEnabled}
    <div class="space-y-1">
      <Label for="settings-namespace">Default namespace</Label>
      <Input
        id="settings-namespace"
        placeholder="(empty for default)"
        bind:value={form.namespace}
        class="w-full"
      />
      <p class="text-[10px] text-[var(--color-text-secondary)]">
        Keys created from this document will use this namespace by default.
      </p>
    </div>
  {/if}

  <div class="space-y-1">
    <Label for="settings-language">Default language</Label>
    <Input
      id="settings-language"
      placeholder="en"
      bind:value={form.language}
      class="w-full"
    />
    <p class="text-[10px] text-[var(--color-text-secondary)]">
      The language tag used when reading translations into the document.
    </p>
  </div>
</div>
