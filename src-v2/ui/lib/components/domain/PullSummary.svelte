<script lang="ts">
  import Card from "$ui/lib/components/ui/card.svelte";

  type Props = {
    changedCount: number;
    missingCount: number;
    unchangedCount: number;
    language: string;
  };

  let { changedCount, missingCount, unchangedCount, language }: Props =
    $props();
</script>

<Card>
  <div class="text-xs font-semibold text-[var(--color-text)]">
    Pull summary ({language || "—"})
  </div>
  <ul class="mt-2 grid grid-cols-3 gap-2 text-center">
    <li
      class="rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2"
    >
      <div class="text-base font-semibold text-[var(--color-text)]">
        {changedCount}
      </div>
      <div class="text-[10px] text-[var(--color-text-secondary)]">
        Changed
      </div>
    </li>
    <li
      class="rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2"
    >
      <div class="text-base font-semibold text-[var(--color-text)]">
        {missingCount}
      </div>
      <div class="text-[10px] text-[var(--color-text-secondary)]">
        Missing
      </div>
    </li>
    <li
      class="rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2"
    >
      <div class="text-base font-semibold text-[var(--color-text)]">
        {unchangedCount}
      </div>
      <div class="text-[10px] text-[var(--color-text-secondary)]">
        Unchanged
      </div>
    </li>
  </ul>
</Card>
