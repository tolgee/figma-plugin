<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$ui/lib/utils";

  // Tiny status pill (plural, connected, …). `brand` uses the Tolgee tint;
  // `neutral` is a muted gray.
  type Variant = "neutral" | "brand";
  type Props = { variant?: Variant; class?: string; children?: Snippet };
  let { variant = "neutral", class: className, children }: Props = $props();

  const VARIANT_CLASSES: Record<Variant, string> = {
    neutral: "border-border bg-bg-secondary text-text-secondary",
    brand:
      "border-transparent bg-(--figma-color-bg-brand-tertiary) text-text-brand",
  };
</script>

<span
  class={cn(
    "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
    VARIANT_CLASSES[variant],
    className,
  )}
>
  {@render children?.()}
</span>
