<script lang="ts">
  // A labelled checkbox row: a left-aligned checkbox + label, clickable as one.
  // Checkbox-on-left (vs a right-side switch) keeps the OFF state clearly
  // visible and matches the filter dropdown's ignore options, so the same
  // settings read the same everywhere. Optional `trailing` content renders after
  // the label OUTSIDE the toggle button (for an inline input, an (i) hint, …) so
  // interacting with it doesn't flip the checkbox.
  import type { Snippet } from "svelte";
  import Checkbox from "./checkbox.svelte";
  import { cn } from "$ui/lib/utils";

  type Props = {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
    class?: string;
    trailing?: Snippet;
    disabled?: boolean;
  };

  let {
    checked,
    onChange,
    label,
    class: className,
    trailing,
    disabled = false,
  }: Props = $props();
</script>

<div class={cn("flex items-center gap-2", className)}>
  <button
    type="button"
    {disabled}
    class={cn(
      "flex shrink-0 items-center gap-2 text-left",
      disabled && "cursor-not-allowed opacity-50",
    )}
    onclick={() => onChange(!checked)}
  >
    <Checkbox {checked} />
    <span class="text-xs text-text">{label}</span>
  </button>
  {#if trailing}
    {@render trailing()}
  {/if}
</div>
