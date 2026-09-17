<script lang="ts">
  import type { Snippet } from "svelte";
  import { Tabs as TabsPrimitive } from "bits-ui";
  import { cn } from "$ui/lib/utils";

  type Props = TabsPrimitive.ContentProps & { children?: Snippet };
  let { class: className, children, ...rest }: Props = $props();
</script>

<TabsPrimitive.Content
  {...rest}
  class={cn("mt-2 focus-visible:outline-none text-text", className)}
>
  {@render children?.()}
</TabsPrimitive.Content>
