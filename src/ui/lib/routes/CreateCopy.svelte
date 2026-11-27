<script lang="ts">
  import type { components } from "$ui/lib/api/schema.generated";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send, on, nextCorrelationId } from "$ui/lib/bus";
  import { createIdleTimeout } from "$ui/lib/busRequest";
  import { Button, Card, CheckboxField, Label, Message, ProgressBar, Select } from "$ui/lib/components/ui";
  import * as Dialog from "$ui/lib/components/ui/dialog";
  import { requestCopyPreflight } from "$ui/lib/api/copyPreflight";
  import { copyMemoryWarning } from "$ui/lib/logic/copyGuard";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import ViewHeader from "$ui/lib/components/domain/ViewHeader.svelte";
  import ViewFooter from "$ui/lib/components/domain/ViewFooter.svelte";
  import {
    applyCopyPages,
    COPY_FETCH_TIMEOUT_MS,
    type CopyFetch,
    copySkippedSuffix,
    fetchCopyTranslations,
    topUpCopyTranslations,
    withTimeout,
  } from "$ui/lib/logic/copyApply";
  import { copyPhaseBar, copyPhaseLabel } from "$ui/lib/logic/copyPhase";
  import { fade } from "svelte/transition";
  import { requestPageConnectedKeys } from "$ui/lib/api/pageNodes";
  import type { MainToUi } from "$shared/messages";
  import { createPhaseTimer } from "$shared/perf";

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
  // Per-phase bar (see `copyPhaseBar`): each phase restarts its own bar.
  const setProgress = (p: { current: number; total: number; phase: string }): void => {
    progress = p;
  };
  const resetRun = (): void => {
    progress = null;
  };
  const bar = $derived(copyPhaseBar(progress));
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
        setProgress({ current: m.current, total: m.total, phase: m.phase });
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

  // ---- Memory guard ---------------------------------------------------------
  let memoryWarning = $state<string | null>(null);
  let warningAccepted = false;

  /** `true` = go ahead; `false` = the warning dialog is up (or sizing failed
   *  closed — then it proceeds, the guard must never block a copy by itself). */
  async function passesMemoryGuard(): Promise<boolean> {
    if (warningAccepted) return true;
    try {
      const size = await requestCopyPreflight();
      const warning = copyMemoryWarning({ ...size, recreate: false });
      if (!warning) return true;
      memoryWarning = warning;
      return false;
    } catch (e) {
      console.warn("[tolgee] copy preflight skipped:", e);
      return true;
    }
  }

  function continuePastWarning(): void {
    memoryWarning = null;
    warningAccepted = true;
    void start();
  }

  async function start(): Promise<void> {
    errorMsg = null;
    if (!(await passesMemoryGuard())) return;
    warningAccepted = false;

    if (mode === "keys") {
      stage = "creating";
      resetRun();
      // Neutral until main says what it is doing — "removing" is announced by
      // main ONLY when an old copy actually exists.
      setProgress({ current: 0, total: 0, phase: "preparing" });
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

    // Fetch FIRST, clone after: a failed fetch (network down, Tolgee's
    // translations rate limit) used to strand orphan source-language pages the
    // user had to hunt down by hand. The current page IS the page about to be
    // cloned, so its connected key names (same scan Download all runs) are
    // exactly the clone's — fetched by key names, same cheap path as Download,
    // never a project-wide pagination. Fails here → nothing was created yet.
    //
    // Only the key names are needed for this pre-fetch, not full node info —
    // `requestPageConnectedKeys` skips the per-node characters/ignore-filter
    // work `requestPageConnectedNodes` does, which on a large page doubled the
    // scan cost (the fresh clone gets scanned again regardless, once it
    // exists).
    const perf = createPhaseTimer();
    stage = "fetching";
    resetRun();
    setProgress({ current: 0, total: 0, phase: "fetching" });
    let fetched: CopyFetch;
    try {
      const pageKeys = await requestPageConnectedKeys();
      perf.mark("page keys", `${pageKeys.length} connected`);
      fetched = await withTimeout(
        fetchCopyTranslations(
          client,
          selectedLangs.map((lang) => ({ language: lang, nodes: pageKeys })),
          branch || undefined,
        ),
        COPY_FETCH_TIMEOUT_MS,
        "Timed out loading translations from Tolgee.",
      );
    } catch (e) {
      stage = "error";
      errorMsg = e instanceof Error ? e.message : String(e);
      return;
    }

    perf.mark("fetch translations");

    stage = "creating";
    // Neutral until main says what it is doing — "removing" is announced by
      // main ONLY when an old copy actually exists.
      setProgress({ current: 0, total: 0, phase: "preparing" });
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
    const pages = result.pages ?? [];
    perf.mark("clone + scan (main thread)");
    // Keys connected while the clone ran (rare) aren't in the pre-fetched map —
    // top them up best-effort; a miss just counts as "skipped" below.
    fetched = await topUpCopyTranslations(client, pages, fetched, branch || undefined);
    perf.mark("top-up fetch");

    // The clones hold the SOURCE page's text — render + write the
    // translations from here (the main thread can't: no `Intl` in its
    // sandbox). Same render + apply pipeline as the Download flow.
    stage = "creating";
    setProgress({ current: 0, total: 0, phase: "writing" });
    const applied = await applyCopyPages(pages, fetched.translations, (done, total) => {
      setProgress({ current: done, total, phase: "writing" });
    });
    if (applied.ok) {
      perf.mark("write texts", `${applied.skipped} skipped`);
      console.log(perf.summary(`create copy (${selectedLangs.length} language(s))`));
      stage = "done";
      send({
        type: "notify",
        text: `Created ${selectedLangs.length} language page(s).${copySkippedSuffix(applied.skipped)}`,
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

      <!-- The plugin can't measure Figma's per-file memory, but a copy is a
           full duplicate of the page — on a very large file a few copies hit
           Figma's memory limit (seen on the customer-sized test file: the
           third copy pushed it to "out of memory"). Say so up front. -->
      <p class="text-[11px] leading-snug text-text-secondary">
        A copy duplicates the whole page. Keep only the copies you need.
      </p>

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
    {:else if stage === "fetching" || stage === "creating"}
      <div in:fade={{ duration: 150 }}>
        <Card>
          <ProgressBar
            loaded={bar.loaded}
            total={bar.total}
            label={copyPhaseLabel(progress?.phase, "Creating copy…")}
            detail={bar.detail}
          />
        </Card>
      </div>
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

<!-- Memory guard (see `copyGuard.ts`): a very large page that already has
     copies in this file may push Figma over its per-file memory budget —
     which once put the test file into recovery mode mid-copy. Asked BEFORE
     anything is cloned; "Continue anyway" re-runs the action unguarded. -->
<Dialog.Root
  open={memoryWarning !== null}
  onOpenChange={(open) => {
    if (!open) memoryWarning = null;
  }}
>
  <Dialog.Content class="max-w-sm">
    <Dialog.Title class="text-sm font-semibold text-text">Large file</Dialog.Title>
    <p class="mt-2 whitespace-pre-line text-xs text-text-secondary">{memoryWarning}</p>
    <div class="mt-4 flex justify-end gap-2">
      <Button variant="outline" size="sm" onclick={() => (memoryWarning = null)}>Cancel</Button>
      <Button size="sm" onclick={continuePastWarning}>Create copy</Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
