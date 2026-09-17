<script lang="ts">
  import {
    getTolgeeFormat,
    tolgeeFormatGenerateIcu,
    getPluralVariants,
    getVariantExample,
  } from "$shared/tolgeeFormat";
  import PluralVariantInput from "$ui/lib/components/domain/PluralVariantInput.svelte";

  type Props = {
    /** Raw ICU plural source. Two-way bound — emitted whenever any variant edits. */
    value: string;
    /** Locale used to determine which plural categories to render (en, cs, …). */
    locale: string;
    /** Plural parameter name that drives the ICU expression. */
    parameter: string;
    /** Optional placeholder shown when a variant is empty. Hints that `#` is
     *  the count, e.g. "# text (example)". */
    placeholder?: string;
  };

  let {
    value = $bindable(""),
    locale,
    parameter,
    placeholder = "# text (example)",
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
      const extras = declared.filter(
        (v) => !(required as readonly string[]).includes(v),
      );
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
    {@const content =
      (parsed.variants as Record<string, string | undefined>)[variant] ?? ""}
    <!-- Variant form as a rounded grey pill on the left (e.g. "One"), then the
         body field. The ICU `#` count renders inside the field as a green chip
         showing the example value (e.g. "#1"), like Tolgee's plural editor. -->
    <div class="flex items-center gap-2">
      <!-- Fixed width so every form pill is the same size and the variant inputs
           all start at the same left edge. -->
      <span
        class="w-14 shrink-0 rounded-full bg-bg-secondary px-1 py-1 text-center text-[11px] font-medium capitalize text-text-secondary"
      >
        {variant}
      </span>
      <div class="min-w-0 flex-1">
        <PluralVariantInput
          value={content}
          onChange={(next) => commitVariant(variant, next)}
          hashLabel={exampleValue !== undefined ? `#${exampleValue}` : "#"}
          {placeholder}
        />
      </div>
    </div>
  {/each}
</div>
