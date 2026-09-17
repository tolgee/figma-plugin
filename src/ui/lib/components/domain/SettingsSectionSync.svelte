<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { ICON } from "$shared/iconSizes";
  import Input from "$ui/lib/components/ui/input.svelte";
  import CheckboxField from "$ui/lib/components/ui/checkboxField.svelte";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import Info from "lucide-svelte/icons/info";

  type Props = { form: Partial<TolgeeConfig> };
  let { form = $bindable() }: Props = $props();

  const ignoreNumbers = $derived(form.ignoreNumbers ?? true);
  const ignoreHiddenLayers = $derived(form.ignoreHiddenLayers ?? true);
  const ignoreTextLayers = $derived(form.ignoreTextLayers ?? false);
</script>

<Tooltip.Provider delayDuration={200}>
  <section class="space-y-2.5">
    <h2
      class="text-xs font-semibold uppercase tracking-wide text-primary"
    >
      Ignore strings
    </h2>

    <CheckboxField
      label="Numbers"
      checked={ignoreNumbers}
      onChange={(v) => (form.ignoreNumbers = v)}
    >
      {#snippet trailing()}
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <span
                {...props}
                class="text-text-secondary transition-colors hover:text-text-brand"
                role="button"
                tabindex={-1}
                aria-label="What ignoring numbers does"
              >
                <Info size={ICON.inline} />
              </span>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content
            side="left"
            align="center"
            class="max-w-[15rem] leading-snug"
          >
            <p>Skips strings made only of digits — "100", "42".</p>
          </Tooltip.Content>
        </Tooltip.Root>
      {/snippet}
    </CheckboxField>

    {#if ignoreNumbers}
      <CheckboxField
        class="pl-6"
        label="Including formatted numbers"
        checked={form.ignoreFormattedNumbers ?? false}
        onChange={(v) => (form.ignoreFormattedNumbers = v)}
      >
        {#snippet trailing()}
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <span
                  {...props}
                  class="text-text-secondary transition-colors hover:text-text-brand"
                  role="button"
                  tabindex={-1}
                  aria-label="What ignoring formatted numbers does"
                >
                  <Info size={ICON.inline} />
                </span>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content
              side="left"
              align="center"
              class="max-w-[15rem] space-y-1.5 leading-snug"
            >
              <p>
                Also skips numbers with decimals, thousands separators and signs
                — "1,234.00", "3.14", "+420", "-5".
              </p>
              <p>"12 apples" is still kept.</p>
            </Tooltip.Content>
          </Tooltip.Root>
        {/snippet}
      </CheckboxField>
    {/if}

    <CheckboxField
      label="Hidden layers"
      checked={ignoreHiddenLayers}
      onChange={(v) => (form.ignoreHiddenLayers = v)}
    >
      {#snippet trailing()}
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <span
                {...props}
                class="text-text-secondary transition-colors hover:text-text-brand"
                role="button"
                tabindex={-1}
                aria-label="What ignoring hidden layers does"
              >
                <Info size={ICON.inline} />
              </span>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content
            side="left"
            align="center"
            class="max-w-[15rem] space-y-1.5 leading-snug"
          >
            <p>Skips layers with visibility turned off in Figma.</p>
            <p>
              With "Including all child texts" enabled, all text layers inside
              hidden layers are also ignored, even if individually set to
              visible.
            </p>
            <p>Otherwise, only the hidden layer itself is ignored.</p>
          </Tooltip.Content>
        </Tooltip.Root>
      {/snippet}
    </CheckboxField>

    {#if ignoreHiddenLayers}
      <CheckboxField
        class="pl-6"
        label="Including all child texts"
        checked={form.ignoreHiddenLayersIncludingChildren ?? false}
        onChange={(v) => (form.ignoreHiddenLayersIncludingChildren = v)}
      />
    {/if}

    <CheckboxField
      label="Text layers with prefix"
      checked={ignoreTextLayers}
      onChange={(v) => (form.ignoreTextLayers = v)}
    >
      {#snippet trailing()}
        {#if ignoreTextLayers}
          <Input
            aria-label="Ignore prefix"
            placeholder="e.g. _"
            bind:value={form.ignorePrefix}
            class="h-6 flex-1"
          />
        {/if}
      {/snippet}
    </CheckboxField>
  </section>
</Tooltip.Provider>
