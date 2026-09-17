<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send, nextCorrelationId } from "$ui/lib/bus";
  import { ICON } from "$shared/iconSizes";
  import { SearchInput, Button, Badge, EmptyState } from "$ui/lib/components/ui";
  import { createQuery } from "@tanstack/svelte-query";
  import ViewHeader from "$ui/lib/components/domain/ViewHeader.svelte";
  import Tolgee from "$ui/lib/components/icons/Tolgee.svelte";
  import {
    searchKeys,
    fetchProjectKeyCount,
    connectInfoFromKey,
    type KeySearchResult,
  } from "$ui/lib/api/keys";
  import type { NodeInfo } from "$shared/types";
  import { textOfNode } from "$ui/lib/logic/pushDiff";
  import { cn } from "$ui/lib/utils";
  import KeyRound from "lucide-svelte/icons/key-round";

  const route = $derived(appState.value.route);
  // Track the LIVE selection instead of the snapshot captured at navigate time:
  // show the fresh copy of the node we opened, and follow the canvas when it
  // narrows to a single other node (matching the original, which re-derived
  // from `selectedNodes`). Falls back to the opened node otherwise.
  const node = $derived.by<NodeInfo | null>(() => {
    if (route.name !== "connect") return null;
    const sel = appState.value.selectedNodes;
    const anchor = route.node;
    // `sel[0]` is guaranteed by the length check; the `?? anchor` only
    // satisfies `noUncheckedIndexedAccess` and never runs.
    return sel.find((n) => n.id === anchor.id) ?? (sel.length === 1 ? (sel[0] ?? anchor) : anchor);
  });
  // Bulk mode: connecting several (identical) strings at once. `targets` is the
  // full set the chosen key gets applied to — either the bulk list or just the
  // single node.
  const bulkNodes = $derived<NodeInfo[] | null>(
    route.name === "connect" ? (route.bulkNodes ?? null) : null,
  );
  const targets = $derived<NodeInfo[]>(
    bulkNodes && bulkNodes.length > 0 ? bulkNodes : node ? [node] : [],
  );
  const isBulk = $derived(targets.length > 1);

  let query = $state("");
  let results = $state<KeySearchResult[]>([]);
  let loading = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Total keys in the project, to frame the search count as "N of TOTAL keys
  // in Tolgee". Cached and best-effort — null when unavailable.
  const keyCountQuery = createQuery(() => ({
    queryKey: ["project-key-count"],
    queryFn: () => fetchProjectKeyCount(auth.value.client!),
    enabled: auth.value.authenticated,
    staleTime: 60 * 1000,
  }));
  const totalKeys = $derived(keyCountQuery.data ?? null);
  // Prefill the search with the layer's own text exactly once per node, so
  // similar keys surface immediately without the user typing anything.
  let prefilledForId = $state<string | null>(null);

  $effect(() => {
    const n = node;
    if (!n) {
      prefilledForId = null;
      return;
    }
    if (prefilledForId === n.id) return;
    prefilledForId = n.id;
    // Prefill with the AUTHORITATIVE text `textOfNode` picks: for a plural /
    // advanced string that's the ICU (`{count, plural, …}`, `<b>…`), which is
    // exactly what Tolgee stores as the key's source — so the exact match can
    // hit. A plain string still prefills with its rendered canvas text (no
    // change). The ICU is only in `translation`, so a node that hasn't stored
    // one falls back to `characters`.
    query = textOfNode(n) || n.key || "";
  });

  // Debounced search against the Tolgee project.
  $effect(() => {
    const q = query;
    if (timeoutId) clearTimeout(timeoutId);
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
          auth.value.branchingEnabled
            ? (appState.value.config?.branch ?? "")
            : "",
        );
      } catch {
        results = [];
      } finally {
        loading = false;
      }
    }, 300);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  });

  // Split results into an EXACT match (the searched text equals a key's
  // translation / base text / name) and the rest — exact always shown first,
  // so "this exact string already exists" is unmissable.
  const exactValue = $derived(query.trim().toLowerCase());
  function isExact(r: KeySearchResult): boolean {
    if (!exactValue) return false;
    return [r.translation, r.baseTranslation, r.name].some(
      (c) => (c ?? "").trim().toLowerCase() === exactValue,
    );
  }
  const exactMatches = $derived(results.filter(isExact));
  const otherMatches = $derived(results.filter((r) => !isExact(r)));

  function isConnectedKey(r: KeySearchResult): boolean {
    return (
      Boolean(node?.connected) &&
      r.name === node?.key &&
      (r.namespace ?? "") === (node?.ns ?? "")
    );
  }

  // Connect every target to the chosen key in a single batched message — works
  // for one node or a bulk selection of identical strings alike.
  function connectTo(r: KeySearchResult): void {
    if (targets.length === 0) return;
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: targets.map((n) => ({
        id: n.id,
        info: connectInfoFromKey(r, n, appState.value.config?.language ?? "en"),
      })),
    });
    appState.navigate({ name: "index" });
  }

  function disconnect(): void {
    if (targets.length === 0) return;
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: targets.map((n) => ({
        id: n.id,
        // "" (not undefined) to actually CLEAR the namespace — undefined is
        // dropped by the bus's JSON round-trip, leaving the old ns behind.
        info: { key: "", ns: "", connected: false },
      })),
    });
    appState.navigate({ name: "index" });
  }

  function cancel(): void {
    appState.navigate({ name: "index" });
  }
</script>

{#if !node}
  <div class="p-4 text-xs text-text-secondary">No node selected.</div>
{:else}
  <div class="flex h-full flex-col">
    <ViewHeader
      title={isBulk
        ? `Connect ${targets.length} strings to one key`
        : "Connect to existing key"}
      onBack={cancel}
    />

    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Full-width search, prefilled with the string's text. -->
      <div class="border-b border-border p-3">
        <SearchInput
          bind:value={query}
          placeholder="Search by string (key)…"
        />
        {#if query.trim() && !loading}
          <p class="mt-1.5 text-[11px] text-text-secondary">
            {#if totalKeys !== null}
              {results.length} of {totalKeys}
              {totalKeys === 1 ? "key" : "keys"} in Tolgee
            {:else}
              {results.length} {results.length === 1 ? "key" : "keys"}
            {/if}
          </p>
        {/if}
      </div>

      {#snippet resultRow(r: KeySearchResult)}
        {@const connected = isConnectedKey(r)}
        <li
          class="flex items-center gap-2 border-b border-dashed border-border py-2.5 last:border-b-0"
        >
          <div class="min-w-0 flex-1 space-y-1">
            <!-- Same layout as Index list rows: source string on top, then the
                 key (with key glyph) below. -->
            <div class="flex items-center gap-1.5">
              <span class="min-w-0 truncate text-xs text-text">
                {r.translation ?? r.baseTranslation ?? r.name}
              </span>
              {#if r.plural}
                <Badge>Plural</Badge>
              {/if}
            </div>
            <div class="flex items-center gap-1.5">
              <KeyRound
                size={ICON.inline}
                class={cn(
                  "shrink-0",
                  connected ? "text-secondary" : "text-icon-muted",
                )}
              />
              <span
                class={cn(
                  "min-w-0 truncate text-xs font-semibold",
                  connected ? "text-secondary" : "text-text",
                )}
              >
                {r.name}
              </span>
              {#if auth.value.namespacesEnabled}
                <!-- Show the key's namespace, incl. an explicit "<none>", only
                     when the project has namespaces enabled — display-only. -->
                <Badge>ns:{r.namespace || "<none>"}</Badge>
              {/if}
            </div>
          </div>
          {#if connected}
            <Button variant="outline" size="sm" onclick={disconnect}>
              Disconnect
            </Button>
          {:else}
            <!-- Enabled even when the node is already connected to another key,
                 so it can be re-pointed directly (the current key's row still
                 offers Disconnect). Matches the original plugin. -->
            <Button variant="outline" size="sm" onclick={() => connectTo(r)}>
              Connect
            </Button>
          {/if}
        </li>
      {/snippet}

      {#if results.length > 0}
        <!-- Results: exact match(es) first (the searched text already exists),
             then other fuzzy suggestions. Headers only when both groups exist. -->
        <div class="flex-1 overflow-auto px-3">
          {#if exactMatches.length > 0}
            <div
              class="px-0 pt-2 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
            >
              Exact match
            </div>
            <ul>
              {#each exactMatches as r (r.id)}{@render resultRow(r)}{/each}
            </ul>
          {/if}
          {#if otherMatches.length > 0}
            {#if exactMatches.length > 0}
              <div
                class="px-0 pt-3 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
              >
                Other suggestions
              </div>
            {/if}
            <ul>
              {#each otherMatches as r (r.id)}{@render resultRow(r)}{/each}
            </ul>
          {/if}
        </div>
      {:else if loading}
        <EmptyState icon={Tolgee} title="Searching…" />
      {:else if query.trim()}
        <!-- Grey Tolgee mark + plain-language, actionable copy. -->
        <EmptyState
          icon={Tolgee}
          title="No matching key in Tolgee"
          description="Searched key names and source text. Try another word."
        />
      {:else}
        <EmptyState
          icon={Tolgee}
          title="Search for an existing key"
          description="Type a string or key name."
        />
      {/if}
    </div>
  </div>
{/if}
