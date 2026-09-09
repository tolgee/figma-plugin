<script lang="ts">
  // The canonical "icon action with a tooltip": collapses the repeated
  // Tooltip.Root → Trigger → {#snippet child({ props })} → IconButton →
  // Tooltip.Content boilerplate into one element. Must sit inside a
  // Tooltip.Provider (lists/views already wrap one). `label` doubles as the
  // aria-label and the tooltip text unless `tooltip` overrides it.
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import * as Tooltip from "./tooltip";
  import IconButton from "./iconButton.svelte";

  type Props = HTMLButtonAttributes & {
    label: string;
    tooltip?: string;
    side?: "top" | "bottom" | "left" | "right";
    size?: "sm" | "md";
    class?: string;
    children?: Snippet;
  };
  let {
    label,
    tooltip,
    side = "bottom",
    size = "sm",
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <IconButton
        {...props}
        {...rest}
        {size}
        aria-label={label}
        class={className}
      >
        {@render children?.()}
      </IconButton>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Content {side}>{tooltip ?? label}</Tooltip.Content>
</Tooltip.Root>
