<script lang="ts">
  import Button from "$ui/lib/components/ui/button.svelte";

  type Props = {
    current: number;
    total: number;
    message?: string;
    /** Cancel button hook. Disabled until cancellation is implemented. */
    onCancel?: () => void;
  };

  let { current, total, message, onCancel }: Props = $props();

  const percent = $derived(total > 0 ? Math.min(100, (current / total) * 100) : 0);
</script>

<div class="flex flex-col gap-2 rounded-md border border-[var(--color-border)] p-3">
  <div class="flex items-center justify-between gap-2">
    <span class="text-xs text-[var(--color-text)]">
      {message ?? "Working…"}
    </span>
    <span class="text-[10px] text-[var(--color-text-secondary)]">
      {current} / {total}
    </span>
  </div>

  <div
    class="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-secondary)]"
    role="progressbar"
    aria-valuenow={current}
    aria-valuemin={0}
    aria-valuemax={total}
  >
    <div
      class="h-full bg-[var(--color-bg-brand)] transition-all duration-150"
      style="width: {percent}%"
    ></div>
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
