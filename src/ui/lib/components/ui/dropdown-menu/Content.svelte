<script lang="ts">
  import type { Snippet } from "svelte";
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import { cn } from "$ui/lib/utils";

  type Props = DropdownMenuPrimitive.ContentProps & { children?: Snippet };
  let { class: className, children, sideOffset = 4, ...rest }: Props = $props();
</script>

<DropdownMenuPrimitive.Portal>
  <DropdownMenuPrimitive.Content
    {sideOffset}
    {...rest}
    class={cn(
      "z-50 min-w-[9rem] rounded-md border border-border bg-bg p-1 shadow-md focus:outline-none",
      className,
    )}
  >
    {@render children?.()}
  </DropdownMenuPrimitive.Content>
</DropdownMenuPrimitive.Portal>
