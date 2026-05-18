<script lang="ts">
  import Button from "$ui/lib/components/ui/button.svelte";

  type Props = {
    current: number;
    total: number | null;
    message?: string;
    /** Cancel button hook. Disabled until cancellation is implemented. */
    onCancel?: () => void;
  };

  let { current, total, message, onCancel }: Props = $props();

  const percent = $derived<number | null>(
    total !== null && total > 0 ? Math.min(100, (current / total) * 100) : null,
  );
</script>

<div class="flex flex-col gap-2 rounded-md border border-border p-3">
  <div class="flex items-center justify-between gap-2">
    <span class="text-xs text-text">
      {message ?? "Working…"}
    </span>
    <span class="text-[10px] text-text-secondary">
      {#if total !== null}
        {current} / {total}
      {/if}
    </span>
  </div>

  <div
    class="h-1.5 w-full overflow-hidden rounded-full bg-bg-secondary"
    role="progressbar"
    aria-valuenow={current}
    aria-valuemin={0}
    aria-valuemax={total ?? undefined}
  >
    {#if percent !== null}
      <div
        class="h-full bg-bg-brand transition-all duration-150"
        style="width: {percent}%"
      ></div>
    {:else}
      <div class="push-progress-indeterminate h-full bg-bg-brand"></div>
    {/if}
  </div>

  <div class="flex justify-end">
    <Button
      variant="ghost"
      size="sm"
      onclick={onCancel}
      disabled={!onCancel}
      aria-label="Cancel"
    >
      Cancel
    </Button>
  </div>
</div>

<style>
  .push-progress-indeterminate {
    width: 40%;
    animation: push-progress-slide 1.4s ease-in-out infinite;
  }

  @keyframes push-progress-slide {
    0% {
      margin-left: -40%;
    }
    100% {
      margin-left: 100%;
    }
  }
</style>
