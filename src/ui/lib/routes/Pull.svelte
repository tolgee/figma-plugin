<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { nextCorrelationId, on, send } from "$ui/lib/bus";
  import { createIdleTimeout, type RequestWatchdog } from "$ui/lib/busRequest";
  import { Button, ProgressBar } from "$ui/lib/components/ui";
  import ViewHeader from "$ui/lib/components/domain/ViewHeader.svelte";
  import ViewFooter from "$ui/lib/components/domain/ViewFooter.svelte";
  import PullSummary from "$ui/lib/components/domain/PullSummary.svelte";
  import { fetchAllTranslations } from "$ui/lib/api/pull";
  import { requestPageConnectedNodes } from "$ui/lib/api/pageNodes";
  import { pullDiff, buildApplyUpdates, skippedRenderMessage } from "$ui/lib/logic/pullDiff";
  import { namespacedKeyLabel } from "$ui/lib/logic/namespaces";
  import { settleQuery, type QueryOutcome } from "$ui/lib/logic/queryResult";

  type Diff = ReturnType<typeof pullDiff>;
  type PageNodes = Awaited<ReturnType<typeof requestPageConnectedNodes>>;
  type Translations = Awaited<ReturnType<typeof fetchAllTranslations>>;

  // Derive the requested language from the current route. We fall back to the
  // config language so the route still works when navigated to without `lang`
  // (defensive — `appState.navigate` always provides it today).
  const route = $derived(appState.value.route);
  const language = $derived<string>(
    route.name === "pull"
      ? (route as { name: "pull"; lang: string }).lang ||
          (appState.value.config?.language ?? "")
      : (appState.value.config?.language ?? ""),
  );

  // Only forward `branch` when branching is enabled; the API rejects with
  // feature_not_enabled_for_project otherwise.
  const branch = $derived(
    auth.value.branchingEnabled ? (appState.value.config?.branch ?? "") : "",
  );

  let progress = $state<{ loaded: number; total: number | null }>({
    loaded: 0,
    total: null,
  });
  // Progress for the page-wide connected-nodes scan (query 1). Only populated
  // when the main thread actually sends `page-connected-nodes-progress`
  // (pages with >100 connected nodes) — see `pageNodes.ts`.
  let pageScanProgress = $state<{ done: number; total: number } | null>(null);
  let applying = $state(false);
  let applyError = $state<string | null>(null);
  let applyCorrelationId = $state<string | null>(null);
  // Progress for an in-flight `apply-translations` write. Seeded with the
  // known total as soon as the write starts (unlike `pageScanProgress`, which
  // starts `null` because the total isn't known until the scan begins) so the
  // bar shows `0/total` immediately instead of a misleading `N/N`.
  let applyProgress = $state<{ done: number; total: number } | null>(null);
  let pendingApplyCount = 0;
  let pendingSkippedCount = 0;
  // Not `$state` — it's a plain plumbing handle, never read from the
  // template. The main thread reports progress via
  // `apply-translations-progress` for large writes (>100 nodes — see
  // `selection.ts`), and each message touches this watchdog, so it's a TRUE
  // idle timeout now: a big-but-alive write keeps resetting the clock. 5
  // minutes (not 30s) because each update is a real canvas mutation (font
  // load + relayout) and a large diff can cover thousands of nodes.
  let applyWatchdog: RequestWatchdog | null = null;
  const APPLY_TRANSLATIONS_TIMEOUT_MS = 5 * 60_000;

  const qc = useQueryClient();

  // SCOPE — matches the original plugin: pull the user's SELECTION when there
  // is one (so changing the language affects ONLY the selected screen/frame),
  // and fall back to the whole page only when nothing is selected. `getConnected
  // Nodes({ ignoreSelection: false })` did exactly this: `selection.length > 0 ?
  // currentPage.selection : currentPage.children`.
  const hasSelection = $derived(appState.value.hasUserSelection);
  // The already-scanned selection, narrowed to connected keys — no main-thread
  // round-trip needed, unlike the page scan.
  const selectionNodes = $derived(
    appState.value.selectedNodes.filter((n) => n.connected && n.key),
  );

  // Query 1: page-wide connected text nodes. Re-fetched when the user
  // navigates back into Pull, but cached across the conflict-resolution
  // round-trip so we don't bug the main thread for each render.
  // Both queries resolve with an OUTCOME instead of rejecting — see
  // `settleQuery`: the svelte-query runes adapter doesn't reliably surface a
  // query's terminal error, which used to hang the Pull loader forever on any
  // API failure. The view derives its error/diff state from `.data` below.
  const pageNodesQuery = createQuery(() => ({
    queryKey: ["page-connected-nodes"],
    queryFn: (): Promise<QueryOutcome<PageNodes>> =>
      settleQuery(
        () => {
          pageScanProgress = null;
          return requestPageConnectedNodes(undefined, (done, total) => {
            pageScanProgress = { done, total };
          });
        },
        { toMessage: (err) => formatQueryError(err) ?? "Cannot scan the page." },
      ),
    // Only scan the whole page when nothing is selected — with a selection the
    // scope is `selectionNodes`, already in hand.
    enabled: Boolean(language) && auth.value.authenticated && !hasSelection,
    staleTime: 5 * 1000,
  }));

  // Unwrapped page nodes ([] on failure, so downstream deriveds stay array-shaped).
  const pageNodesOutcome = $derived(pageNodesQuery.data ?? null);
  const pageNodes = $derived(pageNodesOutcome?.ok ? pageNodesOutcome.value : []);

  // The connected nodes this pull acts on: the selection, or the whole page.
  const scopeNodes = $derived(hasSelection ? selectionNodes : pageNodes);
  // Ready to diff: the selection is always ready; the page scan must have run.
  const scopeReady = $derived(hasSelection ? true : (pageNodesOutcome?.ok ?? false));

  // The scope's connected key names — query 2 filters the server fetch down to
  // exactly these instead of paginating the whole project. Sorted + joined
  // into a stable string so svelte-query's cache key doesn't churn on every
  // re-render (same trick as Push.svelte's `keyFilterCacheKey`).
  const connectedKeyNames = $derived(
    Array.from(
      new Set(
        scopeNodes
          .map((n) => n.key)
          .filter((k): k is string => Boolean(k)),
      ),
    ).sort(),
  );
  const keyFilterCacheKey = $derived(connectedKeyNames.join(","));

  // Query 2: remote translations, filtered to the page's connected keys.
  // Cached per (language, branch, key set). The signal propagates to fetch —
  // switching language mid-load cancels the in-flight request via
  // openapi-fetch. Depends on query 1's result (`pageNodesQuery.data`) being
  // ready — trading the old "both queries run in parallel" for "only fetch
  // the keys we actually need", which matters far more on large projects
  // (was: full project pagination regardless of how few keys the page uses).
  //
  // No `namespaces`/`filterNamespace` needed: each node is matched to its
  // remote key by its OWN `ns` in `pullDiff`, and the key-name filter already
  // scopes the fetch tightly.
  const translationsQuery = createQuery(() => ({
    queryKey: ["translations", language, branch, keyFilterCacheKey],
    queryFn: ({ signal }): Promise<QueryOutcome<Translations>> =>
      settleQuery(
        () => {
          progress = { loaded: 0, total: null };
          const client = auth.value.client;
          if (!client) throw new Error("Not connected to Tolgee.");
          return fetchAllTranslations(client, {
            languages: [language],
            branch: branch || undefined,
            keyNames: connectedKeyNames,
            signal,
            onProgress: (loaded, total) => {
              progress = { loaded, total };
            },
          });
        },
        { signal, toMessage: (err) => formatQueryError(err) ?? "Cannot load translations." },
      ),
    // Gated on the scope being READY — with a selection that's immediate; with
    // none, the page scan must have succeeded first (its error wins the stage).
    enabled: Boolean(language) && auth.value.authenticated && scopeReady,
    // Translations rarely change during a session and are expensive to fetch;
    // keep them fresh for 30s so toggling Pull off and back on is instant.
    staleTime: 30 * 1000,
  }));

  const translationsOutcome = $derived(translationsQuery.data ?? null);

  // Pure derivation: diff over the SCOPE (selection or page) + remote translations.
  const diff = $derived<Diff | null>(
    scopeReady && translationsOutcome?.ok
      ? pullDiff(
          scopeNodes,
          translationsOutcome.value,
          language,
          auth.value.namespacesEnabled,
        )
      : null,
  );

  // A load failure from either query, surfaced from `.data` (not the adapter's
  // `.error`). The page-scan error only counts when we actually scan (no
  // selection); it runs first, so it takes precedence.
  const loadError = $derived<string | null>(
    (!hasSelection && pageNodesOutcome && !pageNodesOutcome.ok
      ? pageNodesOutcome.error
      : null) ??
      (translationsOutcome && !translationsOutcome.ok
        ? translationsOutcome.error
        : null),
  );

  type Stage = "loading" | "diff" | "applying" | "done" | "error";

  const stage = $derived<Stage>(
    applying
      ? "applying"
      : applyError || loadError
        ? "error"
        : !language
          ? "error"
          : (!hasSelection && pageNodesQuery.isPending) || translationsQuery.isPending
            ? "loading"
            : "diff",
  );

  const errorMessage = $derived(
    !language
      ? "No language selected."
      : !auth.value.client
        ? "Not connected to Tolgee."
        : (applyError ?? loadError ?? null),
  );

  function formatQueryError(err: unknown): string | null {
    if (!err) return null;
    if (err === "invalid_project_api_key") return "Invalid project API key.";
    if (err instanceof Error) return err.message;
    return `Cannot load translations. ${String(err)}`;
  }

  function goBack(): void {
    appState.navigate({ name: "index" });
  }

  /**
   * Confirm the currently selected language even when there are no changes
   * to apply (e.g. user switched to a language that only has missing keys).
   * Persists the language exactly like applyChanges() would, then exits.
   */
  function confirmLanguageAndExit(): void {
    const savedLanguage = appState.value.config?.language ?? "";
    if (language && language !== savedLanguage) {
      send({ type: "set-language", language });
    }
    goBack();
  }

  function retry(): void {
    applyError = null;
    void qc.invalidateQueries({ queryKey: ["page-connected-nodes"] });
    void qc.invalidateQueries({ queryKey: ["translations"] });
  }

  function applyChanges(): void {
    const d = diff;
    if (!d) return;
    // The Pull view is also the language preview surface: navigating here
    // from the header Select doesn't persist the picked language yet. We
    // only commit it now, on Apply, so cancelling preserves the previous
    // saved language. Skip the round-trip when the language hasn't changed.
    const savedLanguage = appState.value.config?.language ?? "";
    if (language && language !== savedLanguage) {
      send({ type: "set-language", language });
    }
    if (d.changedNodes.length === 0) {
      goBack();
      return;
    }

    // Nodes whose ICU won't render are held back rather than written: sending
    // them would rewrite the canvas text they already have while recording the
    // remote translation as applied, which makes them look up to date forever
    // (see `buildApplyUpdates`).
    const { updates, skipped } = buildApplyUpdates(d.changedNodes, language);
    if (updates.length === 0) {
      // Everything failed to render — report that instead of a hollow success.
      applyError = skippedRenderMessage(skipped);
      return;
    }
    pendingApplyCount = updates.length;
    pendingSkippedCount = skipped.length;

    applying = true;
    applyError = null;
    applyProgress = { done: 0, total: updates.length };
    const correlationId = nextCorrelationId();
    applyCorrelationId = correlationId;
    // Defensive: a previous request should already have cleared its own
    // watchdog (success or timeout), but never leave two timers armed.
    applyWatchdog?.clear();
    applyWatchdog = createIdleTimeout(APPLY_TRANSLATIONS_TIMEOUT_MS, () => {
      applying = false;
      applyError = "Timed out waiting for the translations to apply.";
      applyProgress = null;
      // Invalidate the correlation id so that if a stale response for THIS
      // request does eventually arrive, the effect below ignores it instead
      // of resurrecting now-unrelated UI state.
      applyCorrelationId = null;
      applyWatchdog = null;
    });
    send({ type: "apply-translations", correlationId, updates });
  }

  // Live progress for an in-flight apply — same correlationId guard as the
  // result listener below, so a stale/superseded request's progress can never
  // resurrect UI state after it's been abandoned.
  $effect(() => {
    const off = on("apply-translations-progress", (msg) => {
      if (msg.correlationId !== applyCorrelationId) return;
      applyWatchdog?.touch();
      applyProgress = { done: msg.done, total: msg.total };
    });
    return off;
  });

  // Listen for the apply result and finalize the workflow.
  $effect(() => {
    const off = on("apply-translations-result", (msg) => {
      if (msg.correlationId !== applyCorrelationId) return;
      applyWatchdog?.clear();
      applyWatchdog = null;
      applying = false;
      applyProgress = null;
      if (msg.ok) {
        send({
          type: "notify",
          text: `Downloaded ${pendingApplyCount} translation(s) for ${language}.${
            pendingSkippedCount > 0
              ? ` ${pendingSkippedCount} skipped — could not be rendered.`
              : ""
          }`,
        });
        // Drop cached page nodes so a follow-up Pull starts from the
        // post-apply state instead of the pre-apply snapshot.
        void qc.invalidateQueries({ queryKey: ["page-connected-nodes"] });
        goBack();
      } else {
        applyError =
          msg.errors[0] ?? "Failed to apply translations to one or more nodes.";
      }
    });
    return off;
  });

  // Cap the visible lists to keep the iframe responsive for large diffs.
  const VISIBLE_LIMIT = 50;
  const visibleChanged = $derived(
    diff?.changedNodes.slice(0, VISIBLE_LIMIT) ?? [],
  );
  const hiddenChangedCount = $derived(
    Math.max(0, (diff?.changedNodes.length ?? 0) - VISIBLE_LIMIT),
  );
  const visibleMissing = $derived(
    diff?.missingKeys.slice(0, VISIBLE_LIMIT) ?? [],
  );
  const hiddenMissingCount = $derived(
    Math.max(0, (diff?.missingKeys.length ?? 0) - VISIBLE_LIMIT),
  );

  function formatKeyLabel(ns: string | undefined, key: string): string {
    if (!key) return "(no key)";
    return namespacedKeyLabel(ns, key, auth.value.namespacesEnabled);
  }
</script>

<div class="flex h-full flex-col">
  <ViewHeader
    title="Download to Figma"
    subtitle={`(${language || "—"})`}
    onBack={goBack}
  />

  <div class="flex-1 overflow-auto p-3 space-y-3">
    {#if stage === "loading"}
      {#if pageNodesQuery.isPending}
        <ProgressBar
          loaded={pageScanProgress?.done ?? 0}
          total={pageScanProgress?.total ?? null}
          label="Scanning page for connected keys…"
        />
      {:else}
        <ProgressBar
          loaded={progress.loaded}
          total={progress.total}
          label="Loading translations from Tolgee"
        />
      {/if}
    {:else if stage === "error"}
      <div
        class="rounded border border-(--figma-color-border-danger) bg-(--figma-color-bg-danger-tertiary) p-2 text-xs text-(--figma-color-text-danger)"
      >
        {errorMessage ?? "Something went wrong."}
      </div>
      <Button variant="secondary" onclick={retry}>Try again</Button>
    {:else if stage === "applying"}
      <ProgressBar
        loaded={applyProgress?.done ?? 0}
        total={applyProgress?.total ?? diff?.changedNodes.length ?? null}
        label="Applying translations"
      />
    {:else if stage === "diff"}
      {#if diff}
        <PullSummary
          changedCount={diff.changedNodes.length}
          missingCount={diff.missingKeys.length}
          unchangedCount={diff.unchangedNodes.length}
          {language}
        />

        {#if diff.changedNodes.length === 0}
          <p class="text-xs text-text-secondary">Everything is up to date.</p>
        {:else}
          <div class="space-y-1">
            <div class="text-[11px] font-semibold text-text-secondary">
              Changes to apply
            </div>
            <ul class="flex flex-col gap-1">
              {#each visibleChanged as change (change.node.id)}
                <li class="rounded border border-border bg-bg p-2">
                  <div
                    class="truncate text-xs font-semibold text-text"
                    title={formatKeyLabel(change.node.ns, change.node.key)}
                  >
                    {formatKeyLabel(change.node.ns, change.node.key)}
                  </div>
                  <div
                    class="mt-1 text-[11px] text-text-secondary line-through"
                    title={change.node.translation || change.node.characters}
                  >
                    {change.node.translation || change.node.characters || "—"}
                  </div>
                  <div class="text-[11px] text-text" title={change.newText}>
                    {change.newText}
                  </div>
                </li>
              {/each}
            </ul>
            {#if hiddenChangedCount > 0}
              <div class="text-[10px] text-text-secondary text-center">
                + {hiddenChangedCount} more
              </div>
            {/if}
          </div>
        {/if}

        {#if diff.missingKeys.length > 0}
          <div class="space-y-1">
            <div class="text-[11px] font-semibold text-text-secondary">
              Missing keys (not in Tolgee)
            </div>
            <ul
              class="flex flex-col gap-1 max-h-32 overflow-auto rounded border border-border p-1"
            >
              {#each visibleMissing as node (node.id)}
                <li
                  class="truncate px-1 py-0.5 text-[11px] text-text-secondary"
                  title={formatKeyLabel(node.ns, node.key)}
                >
                  {formatKeyLabel(node.ns, node.key)}
                </li>
              {/each}
            </ul>
            {#if hiddenMissingCount > 0}
              <div class="text-[10px] text-text-secondary text-center">
                + {hiddenMissingCount} more
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    {/if}
  </div>

  <ViewFooter>
    <Button variant="ghost" onclick={goBack}>Cancel</Button>
    {#if stage === "diff" && diff && diff.changedNodes.length > 0}
      <Button onclick={applyChanges}>
        Apply ({diff.changedNodes.length})
      </Button>
    {:else if stage === "diff" && diff && diff.changedNodes.length === 0}
      <Button onclick={confirmLanguageAndExit}>OK</Button>
    {:else}
      <Button disabled>Apply</Button>
    {/if}
  </ViewFooter>
</div>
