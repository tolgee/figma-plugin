<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { Button, Card } from "$ui/lib/components/ui";
  import Info from "lucide-svelte/icons/info";

  const language = $derived(appState.value.config?.language);
</script>

<div class="flex h-full flex-col">
  <header
    class="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2"
  >
    <h1 class="text-sm font-semibold">Copy page</h1>
  </header>

  <div class="flex-1 overflow-auto p-3 space-y-3">
    <div
      class="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"
    >
      <Info size={14} />
      <span>
        This page is a generated copy and won't be synchronised with Tolgee.
      </span>
    </div>

    <Card>
      <p class="text-xs">
        {#if language}
          Showing translations for <span class="font-mono">{language}</span>.
        {:else}
          Showing Tolgee keys instead of translated text.
        {/if}
      </p>
      <p
        class="mt-1 text-[11px] text-[var(--color-text-secondary)]"
      >
        To make changes, switch to the original page or create a new copy.
      </p>
    </Card>
  </div>

  <footer
    class="flex justify-end gap-2 border-t border-[var(--color-border)] p-2"
  >
    <Button variant="ghost" onclick={() => appState.navigate({ name: "settings" })}>
      Open settings
    </Button>
  </footer>
</div>
