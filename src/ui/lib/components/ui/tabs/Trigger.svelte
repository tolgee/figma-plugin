<script lang="ts">
  import type { Snippet } from "svelte";
  import { Tabs as TabsPrimitive } from "bits-ui";
  import { cn } from "$ui/lib/utils";

  type Props = TabsPrimitive.TriggerProps & { children?: Snippet };
  let { class: className, children, ...rest }: Props = $props();
</script>

<TabsPrimitive.Trigger
  {...rest}
  class={cn(
    "inline-flex items-center justify-center h-7 px-3 text-xs text-text-secondary border-b-2 border-transparent transition-colors hover:text-text data-[state=active]:text-text data-[state=active]:border-border-brand focus-visible:outline-none disabled:opacity-50",
    className,
  )}
>
  {@render children?.()}
</TabsPrimitive.Trigger>
