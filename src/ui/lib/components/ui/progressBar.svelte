<script lang="ts">
  import { cn } from "$ui/lib/utils";
  import { computeProgressPercent, formatProgressCount } from "$ui/lib/logic/progress";

  /**
   * Canonical progress bar used across the plugin — bulk writes over a
   * selection (`nodes-set-progress`), batched key lookups for the Push diff
   * (`fetchRemoteKeys`'s `onProgress`), the Pull page-scan/apply/download
   * flows, and CreateCopy's fetch stage. Two modes:
   *  - DETERMINATE: `total` is a known positive number — renders a real
   *    percentage fill.
   *  - INDETERMINATE: `total` is `null` (or `0`) — the size isn't known yet
   *    (e.g. a page scan or translations fetch before the first batch
   *    resolves), so a ~40%-wide bar slides across instead of showing a
   *    fake/empty fill. This consolidates what used to be two near-identical
   *    copies of the same sliding-bar CSS in `PullProgress`/`PushProgress`.
   */
  type Props = {
    loaded: number;
    total: number | null;
    /** Optional label row above the bar (e.g. "Computing changes…"). Omit
        for a bare bar with no text — used at the top of Index, where the
        bulk action bar below already communicates what's happening. */
    label?: string;
    class?: string;
  };

  let { loaded, total, label, class: className }: Props = $props();

  // `null` when the total is unknown (or zero) — the bar then renders the
  // indeterminate sliding animation instead of a fixed-width fill.
  const pct = $derived<number | null>(computeProgressPercent(loaded, total));
  // `null` while the total is unknown — the counter is omitted rather than
  // rendered as a meaningless "0 / …".
  const count = $derived<string | null>(formatProgressCount(loaded, total));
</script>

<div class={cn("flex flex-col gap-1", className)}>
  {#if label}
    <div
      class="flex items-center justify-between text-[10px] text-text-secondary"
    >
      <span>{label}</span>
      {#if count}<span>{count}</span>{/if}
    </div>
  {/if}
  <div
    class="h-[5px] w-full overflow-hidden rounded-full bg-bg-secondary"
    role="progressbar"
    aria-valuenow={loaded}
    aria-valuemin={0}
    aria-valuemax={total ?? undefined}
  >
    {#if pct !== null}
      <div
        class="h-full bg-bg-brand transition-[width] duration-200 ease-out"
        style="width: {pct}%"
      ></div>
    {:else}
      <div class="progress-bar-indeterminate h-full bg-bg-brand"></div>
    {/if}
  </div>
</div>

<style>
  /*
   * Indeterminate animation: a 40%-wide bar slides across when the total is
   * unknown. Pure CSS so it doesn't depend on the tailwind plugin config.
   * This is the single shared definition — previously duplicated almost
   * identically between `PullProgress` and `PushProgress`.
   */
  .progress-bar-indeterminate {
    width: 40%;
    animation: progress-bar-slide 1.4s ease-in-out infinite;
  }

  @keyframes progress-bar-slide {
    0% {
      margin-left: -40%;
    }
    100% {
      margin-left: 100%;
    }
  }
</style>
