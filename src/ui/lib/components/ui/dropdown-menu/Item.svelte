<script lang="ts">
  import type { Snippet } from "svelte";
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import { cn } from "$ui/lib/utils";

  type Props = DropdownMenuPrimitive.ItemProps & { children?: Snippet };
  let { class: className, children, ...rest }: Props = $props();
</script>

<DropdownMenuPrimitive.Item
  {...rest}
  class={cn(
    "flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-xs text-text outline-none hover:bg-(--figma-color-bg-hover) data-[highlighted]:bg-(--figma-color-bg-hover) data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    className,
  )}
>
  {@render children?.()}
</DropdownMenuPrimitive.Item>
