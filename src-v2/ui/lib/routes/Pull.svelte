<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send, nextCorrelationId, on } from "$ui/lib/bus";
  import { Button } from "$ui/lib/components/ui";
  import PullSummary from "$ui/lib/components/domain/PullSummary.svelte";
  import PullProgress from "$ui/lib/components/domain/PullProgress.svelte";
  import { fetchAllTranslations, type PulledKey } from "$ui/lib/api/pull";
  import { pullDiff, formatNodeText } from "$ui/lib/logic/pullDiff";

  type Stage = "loading" | "diff" | "applying" | "done" | "error";

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

  let stage = $state<Stage>("loading");
  let progress = $state<{ loaded: number; total: number | null }>({
    loaded: 0,
    total: null,
  });
  let remoteKeys = $state<PulledKey[]>([]);
  let diff = $state<Diff | null>(null);
  let errorMessage = $state<string | null>(null);
  let applyCorrelationId = $state<string | null>(null);

  // Tracks the (language, branch, namespace) tuple we last fetched for so the
  // bootstrap effect doesn't re-fire on every selection update.
  let bootstrappedFor = $state<string | null>(null);

  // Recompute the diff whenever the selected nodes change after we have data.
  $effect(() => {
    if (stage !== "diff") return;
    const lang = language;
    if (!lang) return;
    diff = pullDiff(appState.value.selectedNodes, remoteKeys, lang);
  });

  $effect(() => {
    const lang = language;
    const cfg = appState.value.config;
    const ns = cfg?.namespace ?? "";
    // Only forward `branch` when branching is enabled; the API rejects with
    // feature_not_enabled_for_project otherwise.
    const branch = auth.value.branchingEnabled ? (cfg?.branch ?? "") : "";
    const key = `${lang}|${ns}|${branch}`;

    if (!lang) {
      stage = "error";
      errorMessage = "No language selected.";
      return;
    }
    if (!auth.value.client) {
      stage = "error";
      errorMessage = "Not connected to Tolgee.";
      return;
    }
    if (bootstrappedFor === key) return;
    bootstrappedFor = key;
    void loadAndDiff(lang, ns, branch);
  });

  async function loadAndDiff(
    lang: string,
    namespace: string,
    branch: string,
  ): Promise<void> {
    const client = auth.value.client;
    if (!client) return;

    stage = "loading";
    errorMessage = null;
    progress = { loaded: 0, total: null };

    try {
      const keys = await fetchAllTranslations(client, {
        languages: [lang],
        namespaces: [namespace],
        branch: branch || undefined,
        onProgress: (loaded, total) => {
          progress = { loaded, total };
        },
      });
      remoteKeys = keys;
      diff = pullDiff(appState.value.selectedNodes, keys, lang);
      stage = "diff";
    } catch (e) {
      stage = "error";
      if (e === "invalid_project_api_key") {
        errorMessage = "Invalid project API key.";
      } else if (e instanceof Error) {
        errorMessage = e.message;
      } else {
        errorMessage = `Cannot load translations. ${String(e)}`;
      }
    }
  }

  function goBack(): void {
    appState.navigate({ name: "index" });
  }

  function retry(): void {
    bootstrappedFor = null;
  }

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

    stage = "applying";
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
      if (msg.ok) {
        send({
          type: "notify",
          text: `Pulled ${diff?.changedNodes.length ?? 0} translation(s) for ${language}.`,
        });
        stage = "done";
        goBack();
      } else {
        stage = "error";
        errorMessage =
          msg.errors[0] ?? "Failed to apply translations to one or more nodes.";
      }
    });
    return off;
  });

  // Cap the visible list to keep the iframe responsive for large diffs.
  const VISIBLE_LIMIT = 50;
  const visibleChanged = $derived(diff?.changedNodes.slice(0, VISIBLE_LIMIT) ?? []);
  const hiddenChangedCount = $derived(
    Math.max(0, (diff?.changedNodes.length ?? 0) - VISIBLE_LIMIT),
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
    {:else if stage === "diff" || stage === "done"}
      {#if diff}
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
              {#each diff.missingKeys as node (node.id)}
                <li
                  class="truncate px-1 py-0.5 text-[11px] text-[var(--color-text-secondary)]"
                  title={formatKeyLabel(node.ns, node.key)}
                >
                  {formatKeyLabel(node.ns, node.key)}
                </li>
              {/each}
            </ul>
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
      <Button onclick={goBack}>OK</Button>
    {:else}
      <Button disabled>Apply</Button>
    {/if}
  </footer>
</div>
