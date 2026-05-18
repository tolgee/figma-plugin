<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { cn } from "$ui/lib/utils";

  type Props = HTMLInputAttributes & { class?: string };
  let { class: className, value = $bindable(""), ...rest }: Props = $props();
</script>

<input
  bind:value
  {...rest}
  class={cn(
    "h-7 px-2 rounded border border-border bg-bg text-text text-xs focus:outline-none focus:border-border-brand placeholder:text-text-secondary",
    className,
  )}
/>
