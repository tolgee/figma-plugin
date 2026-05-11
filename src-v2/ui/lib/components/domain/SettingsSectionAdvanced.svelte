<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import Input from "$ui/lib/components/ui/input.svelte";
  import Label from "$ui/lib/components/ui/label.svelte";
  import Switch from "$ui/lib/components/ui/switch.svelte";
  import Select from "$ui/lib/components/ui/select.svelte";

  type VariableCasing = NonNullable<TolgeeConfig["variableCasing"]>;

  type Props = { form: Partial<TolgeeConfig> };
  let { form = $bindable() }: Props = $props();

  const variableCasingOptions: Array<{ value: VariableCasing; label: string }> =
    [
      { value: "snake_case", label: "snake_case (element_name)" },
      { value: "snake_case_capitalized", label: "Snake_case (Element_name)" },
      { value: "camelCase", label: "camelCase (elementName)" },
      { value: "PascalCase", label: "PascalCase (ElementName)" },
      { value: "noSpaces", label: "noSpaces (elementname)" },
    ];

  // Local tag input is comma-separated; we mirror into `form.tags` as an
  // array of trimmed, non-empty strings.
  let tagsInput = $state((form.tags ?? []).join(", "));

  function syncTags(value: string): void {
    tagsInput = value;
    form.tags = value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }
</script>

<div class="space-y-3">
  <div class="flex items-center justify-between gap-2">
    <Label for="settings-update-screenshots">Update screenshots on push</Label>
    <Switch
      id="settings-update-screenshots"
      checked={form.updateScreenshots ?? true}
      onCheckedChange={(v) => (form.updateScreenshots = v)}
    />
  </div>

  <div class="flex items-center justify-between gap-2">
    <Label for="settings-add-tags">Add tags to pushed keys</Label>
    <Switch
      id="settings-add-tags"
      checked={form.addTags ?? false}
      onCheckedChange={(v) => (form.addTags = v)}
    />
  </div>

  {#if form.addTags}
    <div class="space-y-1">
      <Label for="settings-tags">Tags</Label>
      <Input
        id="settings-tags"
        placeholder="tag-one, tag-two"
        value={tagsInput}
        oninput={(e) =>
          syncTags((e.currentTarget as HTMLInputElement).value ?? "")}
        class="w-full"
      />
      <p class="text-[10px] text-[var(--color-text-secondary)]">
        Comma-separated. Each new key pushed from the plugin will receive these
        tags.
      </p>
    </div>
  {/if}

  <div class="space-y-1">
    <Label for="settings-variable-casing">Variable casing</Label>
    <Select
      id="settings-variable-casing"
      value={form.variableCasing ?? "snake_case"}
      options={variableCasingOptions}
      onChange={(v) => (form.variableCasing = v as VariableCasing)}
      class="w-full"
    />
    <p class="text-[10px] text-[var(--color-text-secondary)]">
      Applied to placeholder variables (e.g. <code>{"{elementName}"}</code>) when
      generating keys.
    </p>
  </div>
</div>
