<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { nextCorrelationId, on, send } from "$ui/lib/bus";
  import { Button } from "$ui/lib/components/ui";
  import PullSummary from "$ui/lib/components/domain/PullSummary.svelte";
  import PullProgress from "$ui/lib/components/domain/PullProgress.svelte";
  import { fetchAllTranslations } from "$ui/lib/api/pull";
  import { requestPageConnectedNodes } from "$ui/lib/api/pageNodes";
  import { pullDiff, formatNodeText } from "$ui/lib/logic/pullDiff";

  type Diff = ReturnType<typeof pullDiff>;

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

  const namespace = $derived(appState.value.config?.namespace ?? "");
  // Only forward `branch` when branching is enabled; the API rejects with
  // feature_not_enabled_for_project otherwise.
  const branch = $derived(
    auth.value.branchingEnabled ? (appState.value.config?.branch ?? "") : "",
  );

  let progress = $state<{ loaded: number; total: number | null }>({
    loaded: 0,
    total: null,
  });
  let applying = $state(false);
  let applyError = $state<string | null>(null);
  let applyCorrelationId = $state<string | null>(null);

  const qc = useQueryClient();

  // Query 1: page-wide connected text nodes. Re-fetched when the user
  // navigates back into Pull, but cached across the conflict-resolution
  // round-trip so we don't bug the main thread for each render.
  const pageNodesQuery = createQuery(() => ({
    queryKey: ["page-connected-nodes"],
    queryFn: () => requestPageConnectedNodes(),
    enabled: Boolean(language) && auth.value.authenticated,
    staleTime: 5 * 1000,
  }));

  // Query 2: remote translations. Cached per (language, namespace, branch).
  // The signal propagates to fetch — switching language mid-load cancels the
  // in-flight request via openapi-fetch.
  const translationsQuery = createQuery(() => ({
    queryKey: ["translations", language, namespace, branch],
    queryFn: async ({ signal }) => {
      progress = { loaded: 0, total: null };
      const client = auth.value.client;
      if (!client) throw new Error("Not connected to Tolgee.");
      return fetchAllTranslations(client, {
        languages: [language],
        namespaces: namespace ? [namespace] : undefined,
        branch: branch || undefined,
        signal,
        onProgress: (loaded, total) => {
          progress = { loaded, total };
        },
      });
    },
    enabled: Boolean(language) && auth.value.authenticated,
    // Translations rarely change during a session and are expensive to fetch;
    // keep them fresh for 30s so toggling Pull off and back on is instant.
    staleTime: 30 * 1000,
  }));

  // Pure derivation: diff is a function of the two queries, so we never have
  // to imperatively recompute or worry about double-evaluation.
  const diff = $derived<Diff | null>(
    pageNodesQuery.data && translationsQuery.data
      ? pullDiff(pageNodesQuery.data, translationsQuery.data, language)
      : null,
  );

  type Stage = "loading" | "diff" | "applying" | "done" | "error";

  const stage = $derived<Stage>(
    applying
      ? "applying"
      : applyError ||
          (pageNodesQuery.error || translationsQuery.error)
        ? "error"
        : !language
          ? "error"
          : pageNodesQuery.isPending || translationsQuery.isPending
            ? "loading"
            : "diff",
  );

  const errorMessage = $derived(
    !language
      ? "No language selected."
      : !auth.value.client
        ? "Not connected to Tolgee."
        : applyError ??
          formatQueryError(translationsQuery.error) ??
          formatQueryError(pageNodesQuery.error) ??
          null,
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

  const pageNodes = $derived(pageNodesQuery.data ?? []);

  // Build the apply payload from the current diff. We format each node's text
  // up-front so the main thread never has to deal with ICU.
  function buildApplyUpdates(d: Diff): Array<{
    id: string;
    text: string;
    translation: string;
    isPlural: boolean;
  }> {
    const lang = language;
    return d.changedNodes.map(({ node, newText, isPlural }) => {
      const { text } = formatNodeText(node, newText, lang);
      return {
        id: node.id,
        text,
        translation: newText,
        isPlural,
      };
    });
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

    applying = true;
    applyError = null;
    const correlationId = nextCorrelationId();
    applyCorrelationId = correlationId;
    send({
      type: "apply-translations",
      correlationId,
      updates: buildApplyUpdates(d),
    });
  }

  // Listen for the apply result and finalize the workflow.
  $effect(() => {
    const off = on("apply-translations-result", (msg) => {
      if (msg.correlationId !== applyCorrelationId) return;
      applying = false;
      if (msg.ok) {
        send({
          type: "notify",
          text: `Pulled ${diff?.changedNodes.length ?? 0} translation(s) for ${language}.`,
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

  // Whether to warn the user that pull is page-wide. Only relevant when the
  // user actually picked a selection on the canvas — without a selection,
  // page-wide behaviour matches what they expect.
  const showPageWideHint = $derived(
    appState.value.hasUserSelection && pageNodes.length > 0,
  );

  // Cap the visible lists to keep the iframe responsive for large diffs.
  const VISIBLE_LIMIT = 50;
  const visibleChanged = $derived(diff?.changedNodes.slice(0, VISIBLE_LIMIT) ?? []);
  const hiddenChangedCount = $derived(
    Math.max(0, (diff?.changedNodes.length ?? 0) - VISIBLE_LIMIT),
  );
  const visibleMissing = $derived(diff?.missingKeys.slice(0, VISIBLE_LIMIT) ?? []);
  const hiddenMissingCount = $derived(
    Math.max(0, (diff?.missingKeys.length ?? 0) - VISIBLE_LIMIT),
  );

  function formatKeyLabel(ns: string | undefined, key: string): string {
    if (!key) return "(no key)";
    return ns ? `${ns}.${key}` : key;
  }
</script>

<div class="flex h-full flex-col">
  <header
    class="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2"
  >
    <h1 class="text-sm font-semibold">
      Pull translations
      <span class="text-[var(--color-text-secondary)] font-normal">
        ({language || "—"})
      </span>
    </h1>
    <button
      type="button"
      onclick={goBack}
      class="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
    >
      Cancel
    </button>
  </header>

  <div class="flex-1 overflow-auto p-3 space-y-3">
    {#if stage === "loading"}
      <PullProgress
        loaded={progress.loaded}
        total={progress.total}
        label="Loading translations from Tolgee"
      />
    {:else if stage === "error"}
      <div
        class="rounded border border-[var(--figma-color-border-danger)] bg-[var(--figma-color-bg-danger-tertiary)] p-2 text-xs text-[var(--figma-color-text-danger)]"
      >
        {errorMessage ?? "Something went wrong."}
      </div>
      <Button variant="secondary" onclick={retry}>Try again</Button>
    {:else if stage === "applying"}
      <PullProgress
        loaded={diff?.changedNodes.length ?? 0}
        total={diff?.changedNodes.length ?? null}
        label="Applying translations"
      />
    {:else if stage === "diff"}
      {#if diff}
        {#if showPageWideHint}
          <div
            class="rounded border border-[var(--figma-color-border-brand)] bg-[var(--figma-color-bg-brand-tertiary)] p-2 text-[11px] text-[var(--color-text)]"
            role="status"
          >
            Pull applies to every connected text on this page, not just your
            selection. All {pageNodes.length} layer{pageNodes.length === 1
              ? ""
              : "s"} will be set to <strong>{language}</strong>.
          </div>
        {/if}
        <PullSummary
          changedCount={diff.changedNodes.length}
          missingCount={diff.missingKeys.length}
          unchangedCount={diff.unchangedNodes.length}
          {language}
        />

        {#if diff.changedNodes.length === 0}
          <p class="text-xs text-[var(--color-text-secondary)]">
            Everything is up to date.
          </p>
        {:else}
          <div class="space-y-1">
            <div
              class="text-[11px] font-semibold text-[var(--color-text-secondary)]"
            >
              Changes to apply
            </div>
            <ul class="flex flex-col gap-1">
              {#each visibleChanged as change (change.node.id)}
                <li
                  class="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
                >
                  <div
                    class="truncate text-xs font-semibold text-[var(--color-text)]"
                    title={formatKeyLabel(change.node.ns, change.node.key)}
                  >
                    {formatKeyLabel(change.node.ns, change.node.key)}
                  </div>
                  <div
                    class="mt-1 text-[11px] text-[var(--color-text-secondary)] line-through"
                    title={change.node.translation || change.node.characters}
                  >
                    {change.node.translation || change.node.characters || "—"}
                  </div>
                  <div
                    class="text-[11px] text-[var(--color-text)]"
                    title={change.newText}
                  >
                    {change.newText}
                  </div>
                </li>
              {/each}
            </ul>
            {#if hiddenChangedCount > 0}
              <div
                class="text-[10px] text-[var(--color-text-secondary)] text-center"
              >
                + {hiddenChangedCount} more
              </div>
            {/if}
          </div>
        {/if}

        {#if diff.missingKeys.length > 0}
          <div class="space-y-1">
            <div
              class="text-[11px] font-semibold text-[var(--color-text-secondary)]"
            >
              Missing keys (not in Tolgee)
            </div>
            <ul
              class="flex flex-col gap-1 max-h-32 overflow-auto rounded border border-[var(--color-border)] p-1"
            >
              {#each visibleMissing as node (node.id)}
                <li
                  class="truncate px-1 py-0.5 text-[11px] text-[var(--color-text-secondary)]"
                  title={formatKeyLabel(node.ns, node.key)}
                >
                  {formatKeyLabel(node.ns, node.key)}
                </li>
              {/each}
            </ul>
            {#if hiddenMissingCount > 0}
              <div
                class="text-[10px] text-[var(--color-text-secondary)] text-center"
              >
                + {hiddenMissingCount} more
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    {/if}
  </div>

  <footer
    class="flex items-center justify-end gap-2 border-t border-[var(--color-border)] p-2"
  >
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
  </footer>
</div>
