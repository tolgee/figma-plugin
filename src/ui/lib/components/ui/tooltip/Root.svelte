<script lang="ts">
  import { Tooltip as TooltipPrimitive } from "bits-ui";
  import { onTooltipDismiss } from "./dismiss";

  /**
   * `Tooltip.Root` with its open state controlled, so it can be force-closed
   * when the pointer leaves the plugin iframe — see `dismiss.ts` for why the
   * library can't do it on its own here.
   *
   * A caller that controls `open` itself still works: `bind:open` keeps the
   * two in sync, and the dismiss channel just writes `false` into it.
   */
  type Props = TooltipPrimitive.RootProps;
  let { open = $bindable(false), children, ...rest }: Props = $props();

  $effect(() =>
    onTooltipDismiss(() => {
      open = false;
    }),
  );
</script>

<TooltipPrimitive.Root bind:open {...rest}>
  {@render children?.()}
</TooltipPrimitive.Root>
