<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { formatKey } from "$shared/keyFormat";
  import { TOLGEE_KEY_FORMAT_PLACEHOLDERS_EXAMPLES } from "$shared/constants";
  import { ICON } from "$shared/iconSizes";
  import { send } from "$ui/lib/bus";
  import Label from "$ui/lib/components/ui/label.svelte";
  import CheckboxField from "$ui/lib/components/ui/checkboxField.svelte";
  import KeyFormatInput from "$ui/lib/components/ui/keyFormatInput.svelte";
  import Select from "$ui/lib/components/ui/select.svelte";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import Info from "lucide-svelte/icons/info";

  type VariableCasing = NonNullable<TolgeeConfig["variableCasing"]>;

  type Props = { form: Partial<TolgeeConfig> };
  let { form = $bindable() }: Props = $props();

  const prefillKeyFormat = $derived(form.prefillKeyFormat ?? false);

  // Tolgee guide linked from the Key format hint.
  const KEY_NAMING_GUIDE_URL =
    "https://tolgee.io/blog/naming-translation-keys";
  function openGuide(): void {
    send({ type: "open-external", url: KEY_NAMING_GUIDE_URL });
  }

  const formattingStyleOptions: Array<{ value: VariableCasing; label: string }> =
    [
      { value: "", label: "keep original format" },
      { value: "snake_case", label: "snake_case (element_name)" },
      { value: "snake_case_capitalized", label: "Snake_case (Element_name)" },
      { value: "camelCase", label: "camelCase (elementName)" },
      { value: "PascalCase", label: "PascalCase (ElementName)" },
      { value: "noSpaces", label: "noSpaces (elementname)" },
    ];

  // Live preview of the resulting key for a sample element. Fills EVERY
  // placeholder with its example value (like the original plugin), so a format
  // using {component}/{instance}/… shows a realistic key instead of collapsing
  // those to empty. Defaults to "keep original format" ("") when unset.
  const preview = $derived(
    formatKey(
      form.keyFormat || "{artboard}.{elementName}",
      TOLGEE_KEY_FORMAT_PLACEHOLDERS_EXAMPLES,
      form.variableCasing ?? "",
    ),
  );
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
    <h2
      class="text-xs font-semibold uppercase tracking-wide text-primary"
    >
      Key name
    </h2>

    <CheckboxField
      label="Prefill key name"
      checked={prefillKeyFormat}
      onChange={(v) => (form.prefillKeyFormat = v)}
    />

    {#if prefillKeyFormat}
      <!-- Expanded format options, indented under the checkbox they belong to. -->
      <div class="space-y-3 pl-6">
        <div class="space-y-1">
          <div class="flex items-center gap-1.5">
            <Label for="settings-key-format">Key format</Label>
            <Tooltip.Root>
              {@render infoHint("What key format does")}
              <Tooltip.Content
                side="left"
                align="center"
                class="max-w-[17rem] space-y-1.5 leading-snug"
              >
                <p>Define your key format to be consistent and fast.</p>
                <p>You can use variables, text and separators.</p>
                <p>Variables use names from your Figma structure:</p>
                <ul class="list-disc space-y-0.5 pl-4">
                  <li>element name, element text</li>
                  <li>frame, group, component, instance, artboard, section</li>
                  <li>
                    separators like <code>.</code> <code>:</code>
                    <code>_</code> <code>-</code>
                  </li>
                </ul>
                <p>
                  Read more in our guide
                  <button
                    type="button"
                    class="text-text-brand hover:underline"
                    onclick={openGuide}
                  >
                    How to name translation keys
                  </button>.
                </p>
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
          <KeyFormatInput
            id="settings-key-format"
            placeholder={"{artboard}.{elementName}"}
            value={form.keyFormat ?? ""}
            onChange={(v) => (form.keyFormat = v)}
            class="w-full"
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center gap-1.5">
            <Label for="settings-formatting-style">Formatting style</Label>
            <Tooltip.Root>
              {@render infoHint("What formatting style does")}
              <Tooltip.Content
                side="left"
                align="center"
                class="max-w-[16rem] space-y-1.5 leading-snug"
              >
                <p>This will help you preserve the same format style.</p>
                <p>Your style is automatically applied to the variables.</p>
                <p>
                  E.g. style <code>element_name</code>:
                  <br />
                  "My cool button" → <code>my_cool_button</code>
                </p>
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
          <Select
            id="settings-formatting-style"
            value={form.variableCasing ?? ""}
            options={formattingStyleOptions}
            onChange={(v) => (form.variableCasing = v as VariableCasing)}
            class="w-full"
          />
        </div>

        <!-- Live preview in a light grey box: visually separated but quiet. -->
        <div class="space-y-0.5 rounded-md bg-bg-secondary px-2.5 py-2">
          <span
            class="text-[10px] font-medium uppercase tracking-wide text-text-secondary"
          >
            Preview
          </span>
          <p class="font-mono text-xs font-semibold text-text">{preview}</p>
        </div>
      </div>
    {/if}
  </section>
</Tooltip.Provider>
