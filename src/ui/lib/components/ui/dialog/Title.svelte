<script lang="ts">
  import type { Snippet } from "svelte";
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { cn } from "$ui/lib/utils";

  type Props = DialogPrimitive.TitleProps & { children?: Snippet };
  let { class: className, children, ...rest }: Props = $props();
</script>

<DialogPrimitive.Title
  {...rest}
  class={cn("text-sm font-semibold text-text", className)}
>
  {@render children?.()}
</DialogPrimitive.Title>
