<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { cn } from "$ui/lib/utils";

  type Props = HTMLInputAttributes & { class?: string };
  let {
    class: className,
    value = $bindable(""),
    onchange,
    ...rest
  }: Props = $props();
</script>

<input
  bind:value
  {...rest}
  {onchange}
  class={cn(
    "h-7 px-2 rounded border border-border bg-bg text-text text-xs transition-colors hover:border-text/30 focus:outline-none focus:border-border-brand placeholder:text-text-secondary/60",
    className,
  )}
/>
