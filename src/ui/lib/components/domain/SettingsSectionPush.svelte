<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { ICON } from "$shared/iconSizes";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { fetchProjectTags } from "$ui/lib/api/tags";
  import Label from "$ui/lib/components/ui/label.svelte";
  import CheckboxField from "$ui/lib/components/ui/checkboxField.svelte";
  import TagInput from "$ui/lib/components/ui/tagInput.svelte";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import Info from "lucide-svelte/icons/info";

  type Props = { form: Partial<TolgeeConfig> };
  let { form = $bindable() }: Props = $props();

  const addTags = $derived(form.addTags ?? false);

  // Autocomplete the tag picker from the project's existing tags.
  async function suggestTags(query: string): Promise<string[]> {
    const client = auth.value.client;
    if (!client) return [];
    return fetchProjectTags(client, query);
  }
</script>

{#snippet infoHint(label: string)}
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <span
        {...props}
        class="text-text-secondary transition-colors hover:text-text-brand"
        role="button"
        tabindex={-1}
        aria-label={label}
      >
        <Info size={ICON.inline} />
      </span>
    {/snippet}
  </Tooltip.Trigger>
{/snippet}

<Tooltip.Provider delayDuration={200}>
  <section class="space-y-2.5">
    <h2 class="text-xs font-semibold uppercase tracking-wide text-primary">
      On upload
    </h2>

    <CheckboxField
      label="Update screenshots"
      checked={form.updateScreenshots ?? true}
      onChange={(v) => (form.updateScreenshots = v)}
    >
      {#snippet trailing()}
        <Tooltip.Root>
          {@render infoHint("What update screenshots does")}
          <Tooltip.Content
            side="left"
            align="center"
            class="max-w-[16rem] leading-snug"
          >
            Re-uploads a screenshot of each pushed key, so translators see where
            it's used in the design.
          </Tooltip.Content>
        </Tooltip.Root>
      {/snippet}
    </CheckboxField>

    <CheckboxField
      label="Add tags"
      checked={addTags}
      onChange={(v) => (form.addTags = v)}
    >
      {#snippet trailing()}
        <Tooltip.Root>
          {@render infoHint("What add tags does")}
          <Tooltip.Content
            side="left"
            align="center"
            class="max-w-[16rem] leading-snug"
          >
            Adds the tags below to every new key created from the plugin — handy
            for finding them later in Tolgee.
          </Tooltip.Content>
        </Tooltip.Root>
      {/snippet}
    </CheckboxField>

    {#if addTags}
      <!-- Tag picker, indented under the checkbox it belongs to. Suggests the
           project's existing tags; a new tag is created on push. -->
      <div class="space-y-1 pl-6">
        <Label for="settings-tags">Tags</Label>
        <TagInput
          id="settings-tags"
          value={form.tags ?? []}
          onChange={(t) => (form.tags = t)}
          fetchSuggestions={suggestTags}
          class="w-full"
        />
        <p class="text-[10px] text-text-secondary">
          Pick existing tags or type a new one.
        </p>
      </div>
    {/if}
  </section>
</Tooltip.Provider>
