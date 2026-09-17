<script lang="ts">
  // A small clickable status marker for list rows — a red (error-toned) icon
  // with a tooltip. Used for the row conflict flags (same-key `alert-triangle`,
  // manual-change `pen-off`) so they ALWAYS share colour, size and hover in one
  // place. Must sit inside a `Tooltip.Provider` (lists already wrap one). Render
  // the icon as the children at `ICON.marker`; `label` is the aria-label + the
  // tooltip text.
  import type { Snippet } from "svelte";
  import * as Tooltip from "./tooltip";
  import { cn } from "$ui/lib/utils";

  type Props = {
    label: string;
    onclick?: () => void;
    side?: "top" | "bottom" | "left" | "right";
    class?: string;
    children: Snippet;
  };
  let {
    label,
    onclick,
    side = "bottom",
    class: className,
    children,
  }: Props = $props();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        type="button"
        aria-label={label}
        {onclick}
        class={cn(
          "shrink-0 text-error transition-opacity hover:opacity-70",
          className,
        )}
      >
        {@render children()}
      </button>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Content {side} class="max-w-[15rem] leading-snug">
    {label}
  </Tooltip.Content>
</Tooltip.Root>
