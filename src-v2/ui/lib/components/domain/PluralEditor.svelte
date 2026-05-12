<script lang="ts">
  import {
    getTolgeeFormat,
    tolgeeFormatGenerateIcu,
    getPluralVariants,
    getVariantExample,
  } from "$ui/lib/logic/tolgeeFormat";
  import IcuEditor from "$ui/lib/components/domain/IcuEditor.svelte";

  type Props = {
    /** Raw ICU plural source. Two-way bound — emitted whenever any variant edits. */
    value: string;
    /** Locale used to determine which plural categories to render (en, cs, …). */
    locale: string;
    /** Plural parameter name that drives the ICU expression. */
    parameter: string;
    /** Optional placeholder shown when a variant is empty. */
    placeholder?: string;
    /** Optional rows per variant editor. */
    rows?: number;
  };

  let {
    value = $bindable(""),
    locale,
    parameter,
    placeholder = "Translation…",
    rows = 2,
  }: Props = $props();

  // Parse the incoming ICU into a `{parameter, variants}` map. We re-derive
  // this every time the bound `value` changes externally, so route loads or
  // upstream resets correctly hydrate the per-variant editors.
  const parsed = $derived(getTolgeeFormat(value, true, false));

  // Resolve the set of plural categories to render. We always show every
  // CLDR-defined category for the target locale (e.g. en: one/other, cs:
  // one/few/many/other) plus any extra categories the current value declares
  // (e.g. `=0`, `=1`) so the user can keep editing anything Tolgee returned.
  const variantOrder = $derived<string[]>(
    (() => {
      const declared = Object.keys(parsed.variants);
      const required = getPluralVariants(locale);
      const extras = declared.filter((v) => !(required as readonly string[]).includes(v));
      // Extras like `=0` sort first — more specific, user expects them at top.
      return [...extras, ...required];
    })(),
  );

  function commitVariant(variant: string, next: string): void {
    const variants: Record<string, string | undefined> = { ...parsed.variants };
    variants[variant] = next;
    value = tolgeeFormatGenerateIcu({ parameter, variants }, false);
  }
</script>

<div class="plural-editor flex flex-col gap-2">
  {#each variantOrder as variant (variant)}
    {@const exampleValue = getVariantExample(locale, variant)}
    {@const content = (parsed.variants as Record<string, string | undefined>)[variant] ?? ""}
    <div class="grid grid-cols-[60px_1fr] items-start gap-2">
      <div
        class="flex items-baseline gap-1 pt-1 text-[10px] text-[var(--color-text-secondary)]"
      >
        <span class="font-semibold uppercase tracking-wide">{variant}</span>
        {#if exampleValue !== undefined}
          <span class="text-[var(--color-text-tertiary)]">({exampleValue})</span>
        {/if}
      </div>
      <IcuEditor
        value={content}
        onChange={(next) => commitVariant(variant, next)}
        nested
        {placeholder}
        {rows}
      />
    </div>
  {/each}
</div>
