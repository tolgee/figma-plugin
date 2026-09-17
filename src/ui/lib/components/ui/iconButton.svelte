<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { cn } from "$ui/lib/utils";

  /**
   * Square icon-only action button with the one canonical hover: a subtle
   * background plus the icon turning brand-pink. Use this for every icon
   * action so they never drift. Forwards all native button props, so it works
   * directly as a Tooltip/DropdownMenu trigger child (`{...props}`).
   */
  type Size = "sm" | "md";
  type Props = HTMLButtonAttributes & {
    size?: Size;
    class?: string;
    children?: Snippet;
  };
  const SIZE_CLASSES: Record<Size, string> = {
    sm: "h-6 w-6",
    md: "h-7 w-7",
  };
  let {
    size = "sm",
    class: className,
    type = "button",
    children,
    ...rest
  }: Props = $props();
</script>

<button
  {...rest}
  {type}
  class={cn(
    "inline-flex shrink-0 items-center justify-center rounded text-text-secondary transition-colors hover:bg-(--figma-color-bg-hover) hover:text-text-brand",
    SIZE_CLASSES[size],
    className,
  )}
>
  {@render children?.()}
</button>
