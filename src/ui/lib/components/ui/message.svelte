<script lang="ts">
  import type {
    Component,
    ComponentType,
    Snippet,
    SvelteComponent,
  } from "svelte";
  import { ICON } from "$shared/iconSizes";
  import { cn } from "$ui/lib/utils";
  import AlertTriangle from "lucide-svelte/icons/alert-triangle";
  import CheckCircle2 from "lucide-svelte/icons/check-circle-2";
  import Info from "lucide-svelte/icons/info";
  import X from "lucide-svelte/icons/x";

  /**
   * Inline status message in the semantic palette colours (theme-aware via the
   * `--sem-*` vars). Colour + icon are driven by `variant`; the tint is mixed
   * from the same colour so it stays consistent across light/dark. Pass `icon`
   * to override the variant's default glyph (e.g. an info icon on a teal
   * `secondary` notice that isn't a success).
   *
   * Pass `onDismiss` to add a close button — the message itself has no
   * dismissed/visible state of its own, the caller owns that (e.g. clearing
   * whatever flag made it appear).
   */
  type Variant = "error" | "success" | "info" | "secondary" | "warning";
  // Accept both Svelte 5 components and the legacy class components lucide ships.
  type IconComponent =
    | Component<{ size?: number; class?: string }>
    | ComponentType<SvelteComponent<{ size?: number | string; class?: string }>>;
  type Props = {
    variant?: Variant;
    icon?: IconComponent;
    class?: string;
    children?: Snippet;
    onDismiss?: () => void;
  };
  let { variant = "info", icon, class: className, children, onDismiss }: Props = $props();

  const ICONS: Record<Variant, IconComponent> = {
    error: AlertTriangle,
    success: CheckCircle2,
    info: Info,
    secondary: CheckCircle2,
    warning: AlertTriangle,
  };
  const Icon = $derived(icon ?? ICONS[variant]);
</script>

<div
  class={cn("flex items-center gap-2 rounded-md border p-2 text-xs", className)}
  style={`color: var(--sem-${variant}-fg); border-color: color-mix(in srgb, var(--sem-${variant}) 45%, transparent); background-color: color-mix(in srgb, var(--sem-${variant}) 8%, transparent);`}
>
  <Icon size={ICON.inline} class="shrink-0" />
  <div class="min-w-0 flex-1">{@render children?.()}</div>
  {#if onDismiss}
    <button
      type="button"
      aria-label="Dismiss"
      class="shrink-0 opacity-70 hover:opacity-100"
      onclick={onDismiss}
    >
      <X size={ICON.inline} />
    </button>
  {/if}
</div>
