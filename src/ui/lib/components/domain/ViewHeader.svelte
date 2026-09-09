<script lang="ts">
  import type { Snippet } from "svelte";
  import { ICON } from "$shared/iconSizes";
  import IconButton from "$ui/lib/components/ui/iconButton.svelte";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";

  /**
   * Shared header for sub-views (Push, Pull, Settings, …).
   *
   * Every non-Index view navigates back the same way: a leading back arrow.
   * This replaces the old mix of trailing "Close"/"Cancel" text buttons so the
   * navigation pattern is consistent and doesn't compete with the bottom
   * action bar (Save/Cancel) some views have.
   */
  type Props = {
    title: string;
    /** Muted suffix after the title, e.g. a language tag — already parenthesised by the caller if desired. */
    subtitle?: string;
    onBack: () => void;
    /** Accessible label for the back button. */
    backLabel?: string;
    /** Optional right-aligned content (rarely needed). */
    actions?: Snippet;
    /**
     * Whether the header renders its own gradient background. Defaults to
     * `true` for the common case (a single header row with nothing below it
     * to merge with). Pass `false` when an outer wrapper already supplies a
     * shared background that this header should let show through — e.g.
     * Settings, where the header and the tab row beneath it need one
     * continuous gradient instead of two separate ones.
     */
    background?: boolean;
  };
  let {
    title,
    subtitle,
    onBack,
    backLabel = "Back",
    actions,
    background = true,
  }: Props = $props();
</script>

<header
  class="flex items-center gap-2 px-3 py-2 {background
    ? 'bg-linear-to-b from-bg to-header-gradient-end border-b border-border'
    : ''}"
>
  <IconButton size="md" class="-ml-1" onclick={onBack} aria-label={backLabel}>
    <ArrowLeft size={ICON.action} />
  </IconButton>
  <h1 class="flex-1 truncate text-sm font-semibold">
    {title}{#if subtitle}<span class="ml-1 font-normal text-text-secondary"
        >{subtitle}</span
      >{/if}
  </h1>
  {#if actions}
    <div class="flex shrink-0 items-center gap-1">{@render actions()}</div>
  {/if}
</header>
