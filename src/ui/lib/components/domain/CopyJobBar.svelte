<script lang="ts">
  // The route-independent progress card for a running copy job — see
  // `stores/copyJob.svelte.ts` for why it lives above the router.
  import { Card, ProgressBar } from "$ui/lib/components/ui";
  import { copyPhaseBar, copyPhaseLabel } from "$ui/lib/logic/copyPhase";
  import { copyJob } from "$ui/lib/stores/copyJob.svelte";
  import { fade } from "svelte/transition";

  const job = $derived(copyJob.value);
  const bar = $derived(copyPhaseBar(job));
</script>

{#if job}
  <div class="shrink-0 px-3 pt-3" in:fade={{ duration: 150 }}>
    <Card>
      <ProgressBar
        loaded={bar.loaded}
        total={bar.total}
        label={copyPhaseLabel(
          job.phase,
          job.kind === "update" ? "Updating changed frames…" : "Recreating copy…",
        )}
        detail={bar.detail}
      />
    </Card>
  </div>
{/if}
