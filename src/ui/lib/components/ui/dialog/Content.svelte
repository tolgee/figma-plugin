<script lang="ts">
  import type { Snippet } from "svelte";
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { cn } from "$ui/lib/utils";
  import Overlay from "./Overlay.svelte";

  type Props = DialogPrimitive.ContentProps & {
    children?: Snippet;
    overlay?: boolean;
    portal?: boolean;
  };
  let {
    class: className,
    children,
    overlay = true,
    portal = true,
    ...rest
  }: Props = $props();
</script>

{#if portal}
  <DialogPrimitive.Portal>
    {#if overlay}<Overlay />{/if}
    <DialogPrimitive.Content
      {...rest}
      class={cn(
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md rounded-md border border-border bg-bg p-4 shadow-lg focus:outline-none",
        className,
      )}
    >
      {@render children?.()}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
{:else}
  {#if overlay}<Overlay />{/if}
  <DialogPrimitive.Content
    {...rest}
    class={cn(
      "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md rounded-md border border-border bg-bg p-4 shadow-lg focus:outline-none",
      className,
    )}
  >
    {@render children?.()}
  </DialogPrimitive.Content>
{/if}
