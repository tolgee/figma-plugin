<script lang="ts">
  // A removable "active filter" pill for a list header. It IS a neutral `Badge`
  // (so size / colour / border / radius always match the other pills, e.g. the
  // plural + duplicate badges) plus a trailing ✕ to clear. Used for the local
  // view filters (the exact-key filter, exact-text filter, "hide connected", …).
  import type { Snippet } from "svelte";
  import { ICON } from "$shared/iconSizes";
  import X from "lucide-svelte/icons/x";
  import Badge from "./badge.svelte";

  type Props = {
    /** Remove this filter. */
    onclear: () => void;
    /** Accessible name for the ✕ (e.g. "Clear key filter"). */
    clearLabel?: string;
    children: Snippet;
  };
  let { onclear, clearLabel = "Remove filter", children }: Props = $props();
</script>

<Badge class="gap-1 pr-1">
  <span class="max-w-[12rem] truncate">{@render children()}</span>
  <button
    type="button"
    aria-label={clearLabel}
    class="shrink-0 rounded-full transition-opacity hover:opacity-70"
    onclick={onclear}
  >
    <X size={ICON.badge} />
  </button>
</Badge>
