<script lang="ts">
  import { Input } from "$ui/lib/components/ui";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { searchKeys, type KeySearchResult } from "$ui/lib/api/keys";

  type Props = {
    onSelect: (key: string, ns: string | null) => void;
  };

  let { onSelect }: Props = $props();

  let query = $state("");
  let results = $state<KeySearchResult[]>([]);
  let loading = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    const q = query;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    const client = auth.value.client;
    if (!q.trim() || !client) {
      results = [];
      loading = false;
      return;
    }
    loading = true;
    timeoutId = setTimeout(async () => {
      try {
        results = await searchKeys(
          client,
          q,
          appState.value.config?.language,
          20,
        );
      } catch {
        results = [];
      } finally {
        loading = false;
      }
    }, 300);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  });
</script>

<div class="space-y-2">
  <Input
    bind:value={query}
    placeholder="Search existing keys…"
    data-cy="key-search-input"
  />
  {#if loading}
    <p class="text-xs text-[var(--color-text-secondary)]">Searching…</p>
  {:else if query.trim() && results.length === 0}
    <p class="text-xs text-[var(--color-text-secondary)]">No keys found.</p>
  {:else if results.length > 0}
    <ul
      class="border border-[var(--color-border)] rounded divide-y divide-[var(--color-border)] max-h-40 overflow-auto"
    >
      {#each results as r (r.id)}
        <li>
          <button
            type="button"
            class="w-full text-left px-2 py-1 hover:bg-[var(--figma-color-bg-hover)]"
            onclick={() => onSelect(r.name, r.namespace)}
          >
            <div class="text-xs font-medium">{r.name}</div>
            {#if r.namespace}
              <div class="text-[10px] text-[var(--color-text-secondary)]">
                {r.namespace}
              </div>
            {/if}
            {#if r.translation || r.baseTranslation}
              <div
                class="text-[10px] text-[var(--color-text-secondary)] truncate"
              >
                {r.translation ?? r.baseTranslation}
              </div>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
