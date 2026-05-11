<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
</script>

<div class="p-4">
  <h1 class="text-lg font-semibold">Index (TODO)</h1>
  <p class="text-text-secondary mt-2">Implementierung folgt in Phase X.</p>
  <p class="text-text-secondary mt-1 opacity-60">
    Route: {appState.value.route.name}
  </p>
</div>
