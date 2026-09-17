<script lang="ts">
  // Visual checkbox box (16px) — the same border/background as `Input` so
  // checkboxes and fields read as one family. Purely presentational: wrap it in
  // a button (or a menu item) for interactivity. Supports `indeterminate` for
  // "some selected" master checkboxes.
  import Check from "lucide-svelte/icons/check";
  import { cn } from "$ui/lib/utils";

  type Props = {
    checked?: boolean;
    indeterminate?: boolean;
    class?: string;
  };

  let { checked = false, indeterminate = false, class: className }: Props =
    $props();
</script>

<span
  class={cn(
    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
    checked || indeterminate
      ? "border-transparent bg-checkbox text-bg"
      : "border-border bg-bg hover:border-text/30",
    className,
  )}
>
  {#if checked}
    <Check size={12} />
  {:else if indeterminate}
    <span class="h-0.5 w-2 rounded-full bg-bg"></span>
  {/if}
</span>
