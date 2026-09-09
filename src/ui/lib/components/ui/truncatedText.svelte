<script lang="ts">
  // DS truncation pattern: one-line text that ellipsizes when it overflows its
  // container, with a styled tooltip showing the FULL text on hover — but only
  // when it's actually clipped (no tooltip for text that already fits). Pass
  // `onclick` to render it as a link/button (e.g. the project link); otherwise
  // it's plain text. Self-contained (bundles its own Tooltip.Provider) so it
  // works anywhere without setup. Put it in a `min-w-0` flex parent so it can
  // shrink and truncate.
  import * as Tooltip from "./tooltip";
  import { cn } from "$ui/lib/utils";

  type Props = {
    text: string;
    onclick?: () => void;
    class?: string;
    side?: "top" | "bottom" | "left" | "right";
  };
  let { text, onclick, class: className, side = "top" }: Props = $props();

  let el = $state<HTMLElement>();
  let open = $state(false);

  // Gate the tooltip on real overflow: bits-ui asks to open on hover, we only
  // allow it when the text is clipped (scrollWidth > clientWidth).
  function handleOpenChange(v: boolean): void {
    open = v && !!el && el.scrollWidth > el.clientWidth;
  }
</script>

<Tooltip.Provider delayDuration={300}>
  <Tooltip.Root {open} onOpenChange={handleOpenChange}>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        {#if onclick}
          <button
            {...props}
            bind:this={el}
            type="button"
            {onclick}
            class={cn(
              "block min-w-0 max-w-full truncate text-left",
              className,
            )}
          >
            {text}
          </button>
        {:else}
          <span
            {...props}
            bind:this={el}
            class={cn("block min-w-0 max-w-full truncate", className)}
          >
            {text}
          </span>
        {/if}
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content {side} class="max-w-[16rem] break-words">
      {text}
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
