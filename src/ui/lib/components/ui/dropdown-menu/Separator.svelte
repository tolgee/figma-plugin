<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import { cn } from "$ui/lib/utils";

  type Props = DropdownMenuPrimitive.SeparatorProps;
  let { class: className, ...rest }: Props = $props();
</script>

<DropdownMenuPrimitive.Separator
  {...rest}
  class={cn("my-1 h-px bg-border", className)}
/>
