<script lang="ts">
  type Props = {
    loaded: number;
    total: number | null;
    label?: string;
  };

  let { loaded, total, label = "Loading translations" }: Props = $props();

  // Percentage is `null` when total is unknown — the bar then renders an
  // indeterminate animation instead of a fixed fill.
  const pct = $derived<number | null>(
    total !== null && total > 0
      ? Math.max(0, Math.min(100, Math.round((loaded / total) * 100)))
      : null,
  );
</script>

<div class="flex flex-col gap-1">
  <div
    class="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)]"
  >
    <span>{label}</span>
    <span>
      {#if total !== null}
        {loaded} / {total}
      {:else}
        Loading… {loaded} keys
      {/if}
    </span>
  </div>
  <div
    class="h-1.5 w-full overflow-hidden rounded bg-[var(--color-bg-secondary)]"
  >
    {#if pct !== null}
      <div
        class="h-full bg-[var(--color-bg-brand)] transition-[width] duration-150"
        style="width: {pct}%"
      ></div>
    {:else}
      <div class="pull-progress-indeterminate h-full bg-[var(--color-bg-brand)]"></div>
    {/if}
  </div>
</div>

<style>
  /*
   * Indeterminate animation: a 40%-wide bar slides across when the total is
   * unknown. Pure CSS so it doesn't depend on the tailwind plugin config.
   */
  .pull-progress-indeterminate {
    width: 40%;
    animation: pull-progress-slide 1.4s ease-in-out infinite;
  }

  @keyframes pull-progress-slide {
    0% {
      margin-left: -40%;
    }
    100% {
      margin-left: 100%;
    }
  }
</style>
