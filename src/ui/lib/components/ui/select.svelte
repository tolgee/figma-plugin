<script lang="ts">
  import { cn } from "$ui/lib/utils";
  import { ICON } from "$shared/iconSizes";
  import ChevronDown from "lucide-svelte/icons/chevron-down";

  type Option = { value: string; label: string };
  type Props = {
    value?: string;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    onChange?: (v: string) => void;
    class?: string;
    id?: string;
    /** Forwarded to the `<select>`. A disabled select showing a single fixed
     *  option (the branch pickers) has no visible label of its own, so the
     *  accessible name has to come from here. */
    "aria-label"?: string;
  };
  let {
    value = $bindable(""),
    options,
    placeholder,
    disabled,
    onChange,
    class: className,
    id,
    "aria-label": ariaLabel,
  }: Props = $props();
</script>

<div class={cn("relative inline-flex", className)}>
  <select
    {id}
    bind:value
    {disabled}
    aria-label={ariaLabel}
    onchange={(e) => onChange?.((e.currentTarget as HTMLSelectElement).value)}
    class={cn(
      "h-7 w-full appearance-none rounded border border-border bg-bg pl-2 pr-7 text-text text-xs transition-colors hover:border-text/30 focus:outline-none focus:border-border-brand disabled:opacity-50",
    )}
  >
    {#if placeholder && !options.some((o) => o.value === "")}
      <!-- Skip the placeholder when an explicit empty-value option exists, else
           the two `value=""` options collide and the disabled placeholder
           steals the empty value. -->
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as opt (opt.value)}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
  <!-- Custom chevron: the native one ignores `padding-right`, so we hide it
       (`appearance-none` above) and position our own. `right-2` controls the
       gap from the border; `pr-7` on the select keeps the label clear of it. -->
  <ChevronDown
    size={ICON.inline}
    class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-icon"
  />
</div>
