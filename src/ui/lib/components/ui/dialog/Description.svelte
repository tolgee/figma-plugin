<script lang="ts">
  import type { Snippet } from "svelte";
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { cn } from "$ui/lib/utils";

  type Props = DialogPrimitive.DescriptionProps & { children?: Snippet };
  let { class: className, children, ...rest }: Props = $props();
</script>

<DialogPrimitive.Description
  {...rest}
  class={cn("text-xs text-text-secondary", className)}
>
  {@render children?.()}
</DialogPrimitive.Description>
