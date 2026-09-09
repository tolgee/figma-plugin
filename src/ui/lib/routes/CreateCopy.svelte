<script lang="ts">
  import type { components } from "$ui/lib/api/schema.generated";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send, on, nextCorrelationId } from "$ui/lib/bus";
  import { createIdleTimeout } from "$ui/lib/busRequest";
  import { Card, CheckboxField, Label, Message, ProgressBar, Select } from "$ui/lib/components/ui";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import ViewHeader from "$ui/lib/components/domain/ViewHeader.svelte";
  import ViewFooter from "$ui/lib/components/domain/ViewFooter.svelte";
  import { fetchAllTranslations } from "$ui/lib/api/pull";
  import { applyCopyPages, type CopyTranslations } from "$ui/lib/logic/copyApply";
  import type { MainToUi } from "$shared/messages";
  import { nsKeyIndex } from "$ui/lib/logic/namespaces";

  type Mode = "keys" | "languages";
  type CreatedPages = NonNullable<
    Extract<MainToUi, { type: "create-copy-result" }>["pages"]
  >;
  type Stage = "idle" | "fetching" | "creating" | "done" | "error";
  type LanguageModel = components["schemas"]["LanguageModel"];

  // ---- Local state ----------------------------------------------------------

  let mode = $state<Mode>("keys");
  let selectedLangs = $state<string[]>([]);
  let stage = $state<Stage>("idle");
  let progress = $state<{
    current: number;
    total: number;
    phase: string;
  } | null>(null);
  let errorMsg = $state<string | null>(null);
  let availableLanguages = $state<LanguageModel[]>([]);
  let languagesLoaded = $state(false);

  // ---- Derived --------------------------------------------------------------

  const cfg = $derived(appState.value.config ?? {});
  // Only forward `branch` when the project has branching enabled — otherwise
  // Tolgee 400s the translations endpoint with feature_not_enabled_for_project.
  const branch = $derived(auth.value.branchingEnabled ? cfg.branch : undefined);

  // ---- Helpers --------------------------------------------------------------

  function toggleLang(code: string): void {
    selectedLangs = selectedLangs.includes(code)
      ? selectedLangs.filter((l) => l !== code)
      : [...selectedLangs, code];
  }

  function cancel(): void {
    appState.navigate({ name: "index" });
  }

  /**
   * Load the project's available languages from Tolgee. Only fetched once per
   * mount — switching modes shouldn't re-request.
   */
  async function ensureLanguagesLoaded(): Promise<void> {
    if (languagesLoaded) return;
    const client = auth.value.client;
    if (!client) return;

    try {
      const { data } = await client.GET("/v2/projects/languages", {
        params: { query: { size: 1000 } },
      });
      availableLanguages = data?._embedded?.languages ?? [];
      languagesLoaded = true;
    } catch {
      // Non-fatal: the picker simply stays empty. The Create button is gated
      // by `selectedLangs.length` so the user can't submit an empty payload.
      availableLanguages = [];
      languagesLoaded = true;
    }
  }

  // Trigger the languages fetch as soon as the user picks the languages mode.
  $effect(() => {
    if (mode === "languages") {
      void ensureLanguagesLoaded();
    }
  });

  /**
   * Build the per-language translations map. Keyed by `nsKeyIndex` so each
   * cloned node (which has a fresh ID) can be matched back to its Tolgee key +
   * namespace. Carries `isPlural` alongside the raw text — a per-KEY Tolgee
   * property, trusted over the copied node's own (possibly stale) flag. The
   * map stays HERE in the UI: the main thread only clones and returns the
   * clones' connected nodes; this side renders + applies the text (ICU
   * rendering needs `Intl`, which the main-thread sandbox doesn't have).
   */
  function buildTranslationsMap(
    keys: Awaited<ReturnType<typeof fetchAllTranslations>>,
    languages: string[],
  ): Record<string, CopyTranslations> {
    const map: Record<string, CopyTranslations> = {};
    for (const lang of languages) {
      const perLang: CopyTranslations = {};
      for (const k of keys) {
        const idx = nsKeyIndex(k.keyNamespace, k.keyName);
        const text = k.translations[lang]?.text;
        if (text) {
          perLang[idx] = { text, isPlural: k.isPlural };
        }
      }
      map[lang] = perLang;
    }
    return map;
  }

  // Idle timeout (not a wall-clock cap): large copies can legitimately take a
  // while, but each progress message resets the timer, so this only fires if
  // NOTHING has arrived for a full 5 minutes straight. 5 minutes (not 120s)
  // for the same reason as Push's screenshot capture: a single very large
  // page (thousands of nodes, or a pathologically huge frame within it) can
  // take a while between progress pings.
  const CREATE_COPY_TIMEOUT_MS = 5 * 60_000;

  /**
   * Drive a `create-copy` request through the bus. Returns when the main
   * thread emits a `create-copy-result` with the matching correlation ID, or
   * when no progress/result message has arrived for `CREATE_COPY_TIMEOUT_MS`
   * (resolved as a failure so callers don't need a separate catch path).
   */
  function dispatchCreate(payload: {
    correlationId: string;
    mode: Mode;
    languages?: string[];
  }): Promise<{
    ok: boolean;
    pages?: CreatedPages;
    error?: string;
    /** Layers a missing font prevented writing — counted in the completion
     *  notice so the copy isn't presented as complete when it isn't. */
    skippedMissingFont?: string[];
  }> {
    return new Promise((resolve) => {
      const cleanup = (): void => {
        offProgress();
        offResult();
        watchdog.clear();
      };
      const watchdog = createIdleTimeout(CREATE_COPY_TIMEOUT_MS, () => {
        cleanup();
        resolve({
          ok: false,
          error: "Timed out waiting for the copy to be created.",
        });
      });
      const offProgress = on("create-copy-progress", (m) => {
        if (m.correlationId !== payload.correlationId) return;
        watchdog.touch();
        progress = { current: m.current, total: m.total, phase: m.phase };
      });
      const offResult = on("create-copy-result", (m) => {
        if (m.correlationId !== payload.correlationId) return;
        cleanup();
        resolve({
          ok: m.ok,
          pages: m.pages,
          error: m.error,
          skippedMissingFont: m.skippedMissingFont,
        });
      });
      send({
        type: "create-copy",
        correlationId: payload.correlationId,
        mode: payload.mode,
        languages: payload.languages,
        // "keys" mode only (see UiToMain's doc) — the main thread can't read
        // this UI-side, API-derived flag itself, so it rides along here.
        namespacesEnabled: auth.value.namespacesEnabled,
      });
    });
  }

  async function start(): Promise<void> {
    errorMsg = null;

    if (mode === "keys") {
      stage = "creating";
      progress = { current: 0, total: 1, phase: "writing-keys" };
      const result = await dispatchCreate({
        correlationId: nextCorrelationId(),
        mode: "keys",
      });
      if (result.ok) {
        stage = "done";
        // A layer with a missing font keeps its ORIGINAL text instead of the
        // key label, which reads as the copy having quietly not worked there —
        // so say how many rather than letting it look complete.
        const skipped = result.skippedMissingFont?.length ?? 0;
        send({
          type: "notify",
          text:
            skipped > 0
              ? `Created keys page — ${skipped} layer(s) skipped (missing fonts).`
              : "Created keys page.",
        });
        appState.navigate({ name: "index" });
      } else {
        stage = "error";
        errorMsg = result.error ?? "Unknown error";
      }
      return;
    }

    // mode === "languages"
    const client = auth.value.client;
    if (!client) {
      stage = "error";
      errorMsg = "Not connected to Tolgee.";
      return;
    }
    if (selectedLangs.length === 0) return;

    stage = "fetching";
    progress = null;

    let translationsMap: Record<string, Record<string, { text: string; isPlural: boolean }>>;
    try {
      // All namespaces: the translations map is keyed by `nsKeyIndex` and the
      // main thread matches each cloned node by its own ns, so a page mixing
      // namespaces is copied correctly. (config.namespace is only a new-key
      // default, not a copy filter.)
      const keys = await fetchAllTranslations(client, {
        languages: selectedLangs,
        namespaces: undefined,
        branch: branch || undefined,
      });
      translationsMap = buildTranslationsMap(keys, selectedLangs);
    } catch (e) {
      stage = "error";
      errorMsg = e instanceof Error ? e.message : String(e);
      return;
    }

    stage = "creating";
    progress = {
      current: 0,
      total: selectedLangs.length * 100,
      phase: "cloning",
    };

    const result = await dispatchCreate({
      correlationId: nextCorrelationId(),
      mode: "languages",
      languages: selectedLangs,
    });
    if (!result.ok) {
      stage = "error";
      errorMsg = result.error ?? "Unknown error";
      return;
    }

    // The clones exist but hold the SOURCE page's text — render + write the
    // translations from here (the main thread can't: no `Intl` in its
    // sandbox). Same render + apply pipeline as the Download flow.
    progress = { current: 0, total: 0, phase: "writing" };
    const applied = await applyCopyPages(result.pages ?? [], translationsMap, (done, total) => {
      progress = { current: done, total, phase: "writing" };
    });
    if (applied.ok) {
      stage = "done";
      send({
        type: "notify",
        text: `Created ${selectedLangs.length} language page(s).`,
      });
      appState.navigate({ name: "index" });
    } else {
      stage = "error";
      errorMsg = applied.error ?? "Unknown error";
    }
  }

  // ---- UI flags -------------------------------------------------------------

  const isBusy = $derived(stage === "creating" || stage === "fetching");
  const canSubmit = $derived(
    !isBusy && (mode === "keys" || selectedLangs.length > 0),
  );
</script>

<div class="flex h-full flex-col">
  <ViewHeader title="Create copy" onBack={cancel}>
    {#snippet actions()}
      {#if branch}
        <!-- Read-only branch indicator (branching projects only): the copy is
             built from the document's configured branch. Informative, not a
             choice, so it lives in the header (disabled) instead of taking a
             body row; the tooltip points to where the branch IS changed. -->
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <span {...props} class="shrink-0">
                  <Select
                    value={branch}
                    options={[{ value: branch, label: branch }]}
                    disabled
                    aria-label="Branch this copy is created from"
                    class="min-w-[80px]"
                  />
                </span>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content
              side="bottom"
              align="end"
              class="max-w-[16rem] leading-snug"
            >
              Copies follow the branch set in Settings.
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      {/if}
    {/snippet}
  </ViewHeader>

  <div class="flex-1 overflow-auto p-3 space-y-3">
    {#if stage === "idle"}
      <Card>
        <Label>Mode</Label>
        <div class="mt-2 space-y-1.5">
          {#each [{ value: "keys", text: "Create page with key names" }, { value: "languages", text: "Create page per language" }] as option (option.value)}
            <label class="flex cursor-pointer items-center gap-2 text-xs">
              <input type="radio" bind:group={mode} value={option.value} class="sr-only" />
              <span
                class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border {mode ===
                option.value
                  ? 'border-checkbox'
                  : 'border-border'}"
              >
                {#if mode === option.value}
                  <span class="h-1.5 w-1.5 rounded-full bg-checkbox"></span>
                {/if}
              </span>
              {option.text}
            </label>
          {/each}
        </div>
      </Card>

      {#if mode === "languages"}
        <Card>
          <Label>Languages</Label>
          {#if !languagesLoaded}
            <p class="mt-2 text-[11px] text-text-secondary">
              Loading languages…
            </p>
          {:else if availableLanguages.length === 0}
            <p class="mt-2 text-[11px] text-text-secondary">
              No languages available.
            </p>
          {:else}
            <div class="mt-2 max-h-48 overflow-auto space-y-1">
              {#each availableLanguages as lang (lang.id)}
                <CheckboxField
                  label="{lang.name} ({lang.tag})"
                  checked={selectedLangs.includes(lang.tag)}
                  onChange={() => toggleLang(lang.tag)}
                />
              {/each}
            </div>
          {/if}
        </Card>
      {/if}
    {:else if stage === "fetching"}
      <Card>
        <ProgressBar loaded={0} total={null} label="Loading translations from Tolgee…" />
      </Card>
    {:else if stage === "creating"}
      <Card>
        <ProgressBar
          loaded={progress?.current ?? 0}
          total={progress && progress.total > 0 ? progress.total : null}
          label="Creating copy…"
        />
      </Card>
    {:else if stage === "error"}
      <Message variant="error">{errorMsg ?? "Something went wrong."}</Message>
    {/if}
  </div>

  <ViewFooter
    onCancel={cancel}
    confirmLabel="Create"
    onConfirm={start}
    confirmDisabled={!canSubmit}
  />
</div>
