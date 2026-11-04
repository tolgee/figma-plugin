<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send, nextCorrelationId } from "$ui/lib/bus";
  import { ICON } from "$shared/iconSizes";
  import { SearchInput, Button, Badge, EmptyState, IconButton } from "$ui/lib/components/ui";
  import ViewHeader from "$ui/lib/components/domain/ViewHeader.svelte";
  import Tolgee from "$ui/lib/components/icons/Tolgee.svelte";
  import {
    searchKeys,
    searchKeysByPhrase,
    connectInfoFromKey,
    type KeySearchResult,
  } from "$ui/lib/api/keys";
  import type { NodeInfo } from "$shared/types";
  import { textOfNode } from "$ui/lib/logic/pushDiff";
  import { disconnectedInfo } from "$ui/lib/logic/disconnect";
  import { isExactResult, rankKeySearch } from "$ui/lib/logic/keySearchRank";
  import { cn } from "$ui/lib/utils";
  import KeyRound from "lucide-svelte/icons/key-round";
  import ChevronLeft from "lucide-svelte/icons/chevron-left";
  import ChevronRight from "lucide-svelte/icons/chevron-right";

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

  const PAGE_SIZE = 20;
  // How many fuzzy suggestions to pull in next to the phrase matches. Tolgee
  // orders them worst-first, so this is a sample that gets re-ranked locally.
  const FUZZY_SIZE = 50;

  let query = $state("");
  /** Phrase + fuzzy results, merged and ranked best-first (`rankKeySearch`). */
  let results = $state<KeySearchResult[]>([]);
  /** More keys contain the phrase than were fetched — ask to narrow down. */
  let truncated = $state(false);
  let page = $state(0);
  let loading = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  // Each search gets a number; a slower, older response must not overwrite
  // the results of a newer query.
  let searchSeq = 0;
  let listEl = $state<HTMLDivElement | null>(null);

  function goToPage(p: number): void {
    page = Math.min(Math.max(0, p), pageCount - 1);
    if (listEl) listEl.scrollTop = 0;
  }
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
    const seq = ++searchSeq;
    timeoutId = setTimeout(async () => {
      const language = appState.value.config?.language;
      const branch = auth.value.branchingEnabled
        ? (appState.value.config?.branch ?? "")
        : "";
      // Two searches at once: PHRASE (every key that contains the text as one
      // piece — reliable for the exact string) and FUZZY (other word order,
      // typos, missing diacritics). Either may fail on its own; whatever
      // arrives is ranked together.
      const [phrase, fuzzy] = await Promise.allSettled([
        searchKeysByPhrase(client, q, {
          language,
          baseLanguage: auth.value.baseLanguage || undefined,
          branch,
        }),
        searchKeys(client, q, language, FUZZY_SIZE, branch),
      ]);
      if (seq !== searchSeq) return;
      const phraseResults = phrase.status === "fulfilled" ? phrase.value.results : [];
      results = rankKeySearch(
        [phraseResults, fuzzy.status === "fulfilled" ? fuzzy.value : []],
        q,
      );
      truncated =
        phrase.status === "fulfilled" && phrase.value.total > phraseResults.length;
      page = 0;
      loading = false;
    }, 300);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  });

  // Paging over the ranked list (already in memory — no request per page).
  const pageCount = $derived(Math.max(1, Math.ceil(results.length / PAGE_SIZE)));
  const pageResults = $derived(results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
  // Within the page: EXACT match(es) (the searched text equals a key's
  // translation / base text / name) under their own header, so "this exact
  // string already exists" is unmissable. Ranking puts them on page 1.
  const exactMatches = $derived(pageResults.filter((r) => isExactResult(r, query)));
  const otherMatches = $derived(pageResults.filter((r) => !isExactResult(r, query)));

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
        // Unlinks the key AND drops its formatting (ICU, plural, samples) —
        // see `disconnectedInfo`.
        info: disconnectedInfo(),
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
            {results.length}{truncated ? "+" : ""}
            {results.length === 1 && !truncated ? "match" : "matches"}, best first
          </p>
          {#if truncated}
            <p class="mt-0.5 text-[11px] text-text-secondary">
              Many strings contain this text — type more words to narrow it down.
            </p>
          {/if}
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
        <div class="flex-1 overflow-auto px-3" bind:this={listEl}>
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
        {#if pageCount > 1}
          <div
            class="flex items-center justify-center gap-2 border-t border-border px-3 py-1.5 text-[11px] text-text-secondary"
          >
            <IconButton
              aria-label="Previous page"
              disabled={page === 0}
              class="disabled:pointer-events-none disabled:opacity-40"
              onclick={() => goToPage(page - 1)}
            >
              <ChevronLeft size={ICON.inline} />
            </IconButton>
            <span>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, results.length)}
              of {results.length}{truncated ? "+" : ""}
            </span>
            <IconButton
              aria-label="Next page"
              disabled={page >= pageCount - 1}
              class="disabled:pointer-events-none disabled:opacity-40"
              onclick={() => goToPage(page + 1)}
            >
              <ChevronRight size={ICON.inline} />
            </IconButton>
          </div>
        {/if}
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
