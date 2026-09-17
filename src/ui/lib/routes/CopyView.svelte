<script lang="ts">
  import { ICON } from "$shared/iconSizes";
  import type { NodeInfo } from "$shared/types";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { nextCorrelationId, on, send } from "$ui/lib/bus";
  import { createIdleTimeout, type RequestWatchdog } from "$ui/lib/busRequest";
  import { Badge, Button, EmptyState, Message, ProgressBar, Select } from "$ui/lib/components/ui";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import TooltipIconButton from "$ui/lib/components/ui/tooltipIconButton.svelte";
  import { fetchAllTranslations } from "$ui/lib/api/pull";
  import { resolveCopyLanguage } from "$ui/lib/logic/copyLanguage";
  import { requestPageConnectedNodes } from "$ui/lib/api/pageNodes";
  import { pullDiff, buildApplyUpdates, skippedRenderMessage } from "$ui/lib/logic/pullDiff";
  import {
    finishCopyRecreate,
    isCopyRecreateInFlight,
    type CopyTranslations,
  } from "$ui/lib/logic/copyApply";
  import { namespacedKeyLabel, nsKeyIndex } from "$ui/lib/logic/namespaces";
  import { hasRichFormat } from "$ui/lib/logic/icuParams";
  import { computeVirtualWindow } from "$ui/lib/logic/virtualWindow";
  import Target from "lucide-svelte/icons/target";
  import Download from "lucide-svelte/icons/download";
  import Group from "lucide-svelte/icons/group";
  import KeyRound from "lucide-svelte/icons/key-round";
  import Info from "lucide-svelte/icons/info";

  /**
   * Read-only view for a page the plugin itself generated as a copy (via
   * "Create page" in Index) — matches production's `CopyView`: no editing,
   * just a Download/Download all action to refresh the copy's strings from
   * the latest Tolgee translations, and a plain list of the current
   * selection so the user can jump back to a layer on canvas. `App.svelte`
   * routes here whenever `config.pageCopy` is set, regardless of the active
   * route, so there's no "back" affordance — same as production.
   */

  // The copy's language, resolved most-reliable first (see `resolveCopyLanguage`):
  // the "…- cs" page-name suffix → the immutable `copyLanguage` marker → the
  // selectable `language` as a last resort.
  //
  // The NAME comes first, not the marker. A copy made by the published plugin
  // has no marker at all — `copyPage.ts` stores only `{pageCopy, pageInfo,
  // language}`, and that `language` is the repointable one — so its name is the
  // only stable signal it leaves. The name is also self-healing: a copy whose
  // marker was poisoned to the main language before that bug was fixed
  // recovers as soon as its name is read, which marker-first would never do.
  //
  // `language` last is why the bug existed at all: it shares the page scope and
  // can get repointed to the main/default, which made Recreate/Download revert
  // a `cs` copy to `en`. Undefined ⇒ a "keys" copy (shows Tolgee keys, never a
  // Download button — matching production).
  const language = $derived(
    resolveCopyLanguage(
      appState.value.config,
      appState.value.pageName,
      new Set(auth.value.languages.map((l) => l.tag)),
    ),
  );
  const selectedNodes = $derived(appState.value.selectedNodes);
  const hasUserSelection = $derived(appState.value.hasUserSelection);

  const branch = $derived(
    auth.value.branchingEnabled ? (appState.value.config?.branch ?? "") : "",
  );

  type Stage = "idle" | "pulling" | "applying" | "error" | "recreating";
  let stage = $state<Stage>("idle");
  let errorMessage = $state<string | null>(null);
  // Which action landed in "error" — so "Try again" retries the right one.
  let lastFailedAction = $state<"download" | "recreate">("download");
  let fetchProgress = $state<{ loaded: number; total: number | null }>({
    loaded: 0,
    total: null,
  });
  let pageScanProgress = $state<{ done: number; total: number } | null>(null);
  let applyProgress = $state<{ done: number; total: number } | null>(null);
  let applyCorrelationId = $state<string | null>(null);
  // Not `$state` — plain plumbing handle, mirrors Pull.svelte's watchdog.
  let applyWatchdog: RequestWatchdog | null = null;
  const APPLY_TRANSLATIONS_TIMEOUT_MS = 5 * 60_000;

  // Structural drift between this copy and its SOURCE page: the source
  // gained or lost connected strings since the copy was made. Download can't
  // fix either — it only refreshes text on strings the copy already tracks.
  // `false` until checked, or when there's nothing recorded to compare
  // against (older copy, or one made by production). Exact counts aren't
  // worth surfacing — the user can't act on "3 added" any differently than
  // on "something changed", and computing them costs nothing extra on the
  // main-thread side (same two full-page scans either way), so this is a
  // pure UI-side simplification, not a performance change.
  let staleness = $state(false);
  let stalenessCorrelationId: string | null = null;

  // Progress of an in-flight recreate. The completion itself (result handling,
  // watchdog, apply) lives OUTSIDE this component in `finishCopyRecreate` —
  // recreating deletes this very page, so this component unmounts mid-flight
  // and anything registered here would die with it (see copyApply.ts).
  let recreateProgress = $state<{ current: number; total: number } | null>(null);

  /** "Download all" with nothing selected, "Download" over the current
   *  selection — mirrors production's Pull/Pull all split, just renamed to
   *  match the "Download to Figma" wording already used by Pull.svelte and
   *  Index's SyncButton elsewhere in this app. While a selection scan is
   *  still streaming in (large selections, see `appState.scanning`), say so
   *  instead of silently disabling — clicking mid-scan would download
   *  whatever fraction of the selection had arrived so far, which is exactly
   *  why the button is disabled then too (see the header below). */
  const downloadButtonLabel = $derived(
    appState.value.scanning ? "Scanning…" : hasUserSelection ? "Download" : "Download all",
  );

  // Dev Mode: both of this view's actions (Download → apply-translations,
  // Recreate copy → create-copy) are canvas-classed and hard-blocked by the
  // bus guard — showing their buttons would only ever produce the error
  // toast. The staleness BANNER stays visible (knowing the copy is outdated
  // is useful read-only information); only the remedies are hidden.
  const isDev = $derived(appState.value.editorType === "dev");

  // Recreate needs the recorded source page — copies made before sourcePageId
  // tracking (older builds / production) can't be recreated, so their header
  // button and banner action would be dead clicks.
  const canRecreate = $derived(Boolean(appState.value.config?.sourcePageId));

  // Persists across the "toast disappears" problem: once a download
  // finishes, this stays on screen as a dismissable success message — the
  // user gets to see what actually happened instead of relying on a fleeting
  // notification. Cleared by the selection-change watch below, or manually
  // via the message's own close button.
  let lastResult = $state<{ count: number; skipped: number } | null>(null);
  // Count of nodes an in-flight apply is updating — captured at send time so
  // the result handler can report it once `applyProgress` is cleared.
  let pendingApplyCount = 0;
  let pendingSkippedCount = 0;

  const lastResultText = $derived.by(() => {
    if (!lastResult) return null;
    const skipped =
      lastResult.skipped > 0
        ? ` ${lastResult.skipped} skipped — could not be rendered.`
        : "";
    if (lastResult.count === 0) return `No changes found.${skipped}`;
    const noun = lastResult.count === 1 ? "string" : "strings";
    return `Downloaded ${lastResult.count} ${noun}.${skipped}`;
  });

  // Not `$state` — plain closure memory for the selection-change watch below,
  // compared by VALUE (not by the `selectedNodes` array's reference) so a
  // content-only patch (e.g. `apply-translations-result` rewriting the just-
  // downloaded nodes' `characters` in place) doesn't look like a selection
  // change and wipe out the success message we just showed for it.
  let lastSelectionSignature: string | null = null;

  // Any ACTUAL selection change — a different set of node ids, a flip of
  // `hasUserSelection`, or switching to a different copy page — means the
  // success message and the view below it describe a selection that's no
  // longer current. Clearing `lastResult` here both dismisses the banner and
  // lets the view re-render from the fresh selection (the with/without-
  // selection branches below no longer gate on `lastResult` at all).
  $effect(() => {
    const signature = `${appState.value.pageName}|${hasUserSelection}|${selectedNodes.map((n) => n.id).join(",")}`;
    if (lastSelectionSignature !== null && signature !== lastSelectionSignature) {
      lastResult = null;
    }
    lastSelectionSignature = signature;
  });

  /** "N strings" (+ "(M connected)" when not all of them are) — the raw
   *  count of whatever's being looked at, plus how many of those are
   *  actually connected (a prefilled-but-never-pushed key still shows up in
   *  a selection/page scan, but Download silently skips it — the connected
   *  count is what Download will actually act on). */
  function formatCountLine(total: number, connected: number): string {
    const base = `${total} ${total === 1 ? "string" : "strings"}`;
    return connected < total ? `${base} (${connected} connected)` : base;
  }

  const countRowText = $derived(
    formatCountLine(
      selectedNodes.length,
      selectedNodes.filter((n) => n.connected).length,
    ),
  );

  function formatKeyLabel(node: NodeInfo): string {
    return namespacedKeyLabel(node.ns, node.key, auth.value.namespacesEnabled);
  }

  function showOnCanvas(id: string): void {
    send({ type: "scroll-to-node", id });
  }

  async function pull(): Promise<void> {
    const lang = language;
    if (!lang) return;
    lastFailedAction = "download";
    const client = auth.value.client;
    if (!client) {
      stage = "error";
      errorMessage = "Not connected to Tolgee.";
      return;
    }

    stage = "pulling";
    errorMessage = null;
    pageScanProgress = null;
    fetchProgress = { loaded: 0, total: null };

    try {
      // "Download all" has no eager page-wide scan to reuse (removed — it
      // cost a full scan just to show a count nobody could act on), so this
      // is always a fresh scan on click.
      const targetNodes: NodeInfo[] = hasUserSelection
        ? selectedNodes
        : await requestPageConnectedNodes(undefined, (done, total) => {
            pageScanProgress = { done, total };
          });

      // Filtered to exactly `targetNodes`' connected keys (no `namespaces` —
      // each node is matched to its remote key by its OWN `ns`, same
      // reasoning as the main Pull view) instead of paginating the whole
      // project, same fix as Pull.svelte.
      const keyNames = Array.from(
        new Set(targetNodes.map((n) => n.key).filter((k): k is string => Boolean(k))),
      );
      const remoteKeys = await fetchAllTranslations(client, {
        languages: [lang],
        branch: branch || undefined,
        keyNames,
        onProgress: (loaded, total) => {
          fetchProgress = { loaded, total };
        },
      });

      const diff = pullDiff(
        targetNodes,
        remoteKeys,
        lang,
        auth.value.namespacesEnabled,
      );
      if (diff.changedNodes.length === 0) {
        stage = "idle";
        // Just describes THIS check's result — Tolgee can change again a
        // second later, so this is never phrased as an ongoing guarantee.
        lastResult = { count: 0, skipped: 0 };
        send({ type: "notify", text: "No changes found." });
        return;
      }

      applyChanges(diff.changedNodes, lang);
    } catch (err) {
      stage = "error";
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  function applyChanges(
    changedNodes: ReturnType<typeof pullDiff>["changedNodes"],
    lang: string,
  ): void {
    // Nodes whose ICU won't render are held back rather than written: sending
    // them would rewrite the canvas text they already have while recording the
    // remote translation as applied, which makes them look up to date forever
    // (see `buildApplyUpdates`).
    const { updates, skipped } = buildApplyUpdates(changedNodes, lang);
    if (updates.length === 0) {
      // Everything failed to render — report that instead of a hollow success.
      stage = "error";
      errorMessage = skippedRenderMessage(skipped);
      return;
    }

    stage = "applying";
    applyProgress = { done: 0, total: updates.length };
    pendingApplyCount = updates.length;
    pendingSkippedCount = skipped.length;
    const correlationId = nextCorrelationId();
    applyCorrelationId = correlationId;
    applyWatchdog?.clear();
    applyWatchdog = createIdleTimeout(APPLY_TRANSLATIONS_TIMEOUT_MS, () => {
      stage = "error";
      errorMessage = "Timed out waiting for the translations to apply.";
      applyProgress = null;
      applyCorrelationId = null;
      applyWatchdog = null;
    });

    send({ type: "apply-translations", correlationId, updates });
  }

  $effect(() => {
    const off = on("apply-translations-progress", (msg) => {
      if (msg.correlationId !== applyCorrelationId) return;
      applyWatchdog?.touch();
      applyProgress = { done: msg.done, total: msg.total };
    });
    return off;
  });

  $effect(() => {
    const off = on("apply-translations-result", (msg) => {
      if (msg.correlationId !== applyCorrelationId) return;
      applyWatchdog?.clear();
      applyWatchdog = null;
      applyProgress = null;
      if (msg.ok) {
        stage = "idle";
        lastResult = { count: pendingApplyCount, skipped: pendingSkippedCount };
        const noun = pendingApplyCount === 1 ? "string" : "strings";
        const skippedNote =
          pendingSkippedCount > 0 ? ` ${pendingSkippedCount} skipped.` : "";
        send({
          type: "notify",
          text: `Downloaded ${pendingApplyCount} ${noun} to Figma.${skippedNote}`,
        });
      } else {
        stage = "error";
        errorMessage = msg.errors[0] ?? "Failed to apply translations to one or more nodes.";
      }
    });
    return off;
  });

  // Re-checks whenever the current page changes (reading `pageName` gives
  // Svelte a dependency to track) — this component stays mounted across
  // page switches, so a one-shot effect would only ever check the FIRST
  // copy page the user opened.
  $effect(() => {
    void appState.value.pageName;
    const correlationId = nextCorrelationId();
    stalenessCorrelationId = correlationId;
    staleness = false;
    send({ type: "request-copy-staleness", correlationId });
  });

  $effect(() => {
    const off = on("copy-staleness-result", (msg) => {
      if (msg.correlationId !== stalenessCorrelationId) return;
      if (!msg.ok && msg.error) {
        // A skipped check is expected for copies made before sourcePageId
        // tracking existed, but it must never be INVISIBLE — diagnosing
        // "the banner never shows" blind cost a full report round-trip once.
        console.warn("[tolgee] copy staleness check skipped:", msg.error);
      }
      const added = msg.missingCount ?? 0;
      const removed = msg.removedCount ?? 0;
      staleness = msg.ok && added + removed > 0;
    });
    return off;
  });

  /**
   * Re-clones this copy from its recorded source page (same underlying
   * `create-copy` mode the "Create page" flow already uses) so it picks up
   * any keys connected on the original since this copy was made — Download
   * alone can never discover those, it only refreshes text for keys the copy
   * already tracks.
   */
  async function recreateCopy(): Promise<void> {
    const sourcePageId = appState.value.config?.sourcePageId;
    if (!sourcePageId) return;
    // The in-flight check has to live outside this component: recreating
    // unmounts it, so a second click lands on a FRESH instance whose own
    // `stage` says "idle". Starting a second run would delete the page the
    // first one is still writing into.
    if (isCopyRecreateInFlight()) return;

    lastFailedAction = "recreate";
    stage = "recreating";
    errorMessage = null;
    recreateProgress = null;
    const correlationId = nextCorrelationId();

    // Registers the MODULE-scoped continuation (result wait + watchdog + apply)
    // BEFORE the create-copy message goes out. It must not live in this
    // component: recreating removes this very page, main switches to the source
    // page (not a copy), App routes away and this instance unmounts — an
    // instance-held handler died there, so the fetched language was never
    // applied and the "recreated" page silently kept the source-language text.
    // The callbacks below just drive this instance's UI while it's still alive.
    const startJob = (translations: Record<string, CopyTranslations> | null): void => {
      finishCopyRecreate({
        correlationId,
        translations,
        onProgress: (current, total) => {
          recreateProgress = { current, total };
        },
        onDone: (result) => {
          recreateProgress = null;
          if (!result.ok) {
            stage = "error";
            errorMessage = result.error ?? "Failed to recreate the copy.";
            return;
          }
          stage = "idle";
          staleness = false;
          // The main thread switched `figma.currentPage` to the fresh
          // replacement — App.svelte's `currentpagechange` listener re-syncs
          // config/selection for it automatically.
        },
      });
    };

    try {
      if (!language) {
        startJob(null);
        send({
          type: "create-copy",
          correlationId,
          mode: "keys",
          sourcePageId,
          namespacesEnabled: auth.value.namespacesEnabled,
        });
        return;
      }
      const client = auth.value.client;
      if (!client) {
        stage = "error";
        errorMessage = "Not connected to Tolgee.";
        return;
      }
      const keys = await fetchAllTranslations(client, {
        languages: [language],
        namespaces: undefined,
        branch: branch || undefined,
      });
      const translationsForLang: CopyTranslations = {};
      for (const k of keys) {
        const idx = nsKeyIndex(k.keyNamespace, k.keyName);
        const text = k.translations[language]?.text;
        if (text) translationsForLang[idx] = { text, isPlural: k.isPlural };
      }
      startJob({ [language]: translationsForLang });
      send({
        type: "create-copy",
        correlationId,
        mode: "languages",
        languages: [language],
        sourcePageId,
      });
    } catch (err) {
      stage = "error";
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  // ---- Chrome/list split & windowing ----------------------------------------
  // Chrome (staleness banner, progress/error/success messages, count row)
  // stays fixed above; the selection list gets its OWN scroll region so a huge
  // manual selection doesn't have to share scroll math with everything above
  // it — same split Index/NodeList already uses, not just a perf tweak.
  const chromeVisible = $derived(
    stage !== "idle" || Boolean(staleness) || lastResult !== null || selectedNodes.length > 0,
  );

  // Same threshold/overscan as NodeList.svelte, for consistency — this list's
  // rows are lighter (no inputs/menu, just one icon button), so windowing
  // matters less per-row, but a large MANUAL selection on a copy page is the
  // same class of "thousands of rows" risk Index already solved.
  const LIST_VIRTUALIZE_FROM = 60;
  const LIST_OVERSCAN = 6;
  const LIST_FALLBACK_ROW_PX = 60;

  let listViewport = $state<HTMLElement | null>(null);
  let listScrollTop = $state(0);
  let listViewportHeight = $state(0);
  let listRowHeight = $state(LIST_FALLBACK_ROW_PX);

  const listVirtual = $derived(selectedNodes.length >= LIST_VIRTUALIZE_FROM);
  const listWindow = $derived(
    computeVirtualWindow(
      selectedNodes.length,
      listScrollTop,
      listViewportHeight,
      listRowHeight,
      LIST_OVERSCAN,
    ),
  );
  const visibleSelectedNodes = $derived(
    listVirtual ? selectedNodes.slice(listWindow.start, listWindow.end) : selectedNodes,
  );

  // Measures the AVERAGE rendered row height whenever the visible window
  // changes, same reasoning as NodeList.svelte: connected vs "Not connected"
  // rows differ by a line, so a single-row sample would oscillate as the
  // window's first row flips type. 2px tolerance keeps this from looping.
  $effect(() => {
    void visibleSelectedNodes;
    if (!listVirtual || !listViewport) return;
    const list = listViewport.querySelector("ul");
    const count = list?.children.length ?? 0;
    if (!list || count === 0) return;
    const measured = list.getBoundingClientRect().height / count;
    if (measured > 0 && Math.abs(measured - listRowHeight) > 2) listRowHeight = measured;
  });
</script>

<div class="flex h-full flex-col">
  <Tooltip.Provider delayDuration={200}>
    <header
      class="flex items-center justify-between gap-2 bg-linear-to-b from-bg to-header-gradient-end border-b border-border px-3 py-2"
    >
      <h1 class="flex h-7 min-w-0 flex-1 items-center gap-1.5 truncate text-sm font-semibold">
        <span class="truncate">{appState.value.pageName} (copy)</span>
        {#if !language}
          <TooltipIconButton
            label="About this page"
            tooltip="Shows Tolgee keys. Doesn't sync back."
            class="text-text-secondary"
          >
            <Info size={ICON.inline} />
          </TooltipIconButton>
        {/if}
      </h1>
      {#if branch}
        <!-- Read-only branch indicator (branching projects only). Copies always
             follow the document's configured branch; changing it per copy would
             desync the copy from the main page, so the picker is disabled here
             and the tooltip points to where it IS changed. -->
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <span {...props} class="shrink-0">
                <Select
                  value={branch}
                  options={[{ value: branch, label: branch }]}
                  disabled
                  aria-label="Branch this copy downloads from"
                  class="min-w-[80px]"
                />
              </span>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom" align="end" class="max-w-[16rem] leading-snug">
            Copies follow the branch set in Settings.
          </Tooltip.Content>
        </Tooltip.Root>
      {/if}
      {#if language && !isDev}
        <Button
          size="sm"
          disabled={stage === "pulling" ||
            stage === "applying" ||
            stage === "recreating" ||
            appState.value.scanning}
          onclick={pull}
        >
          {downloadButtonLabel}
        </Button>
      {:else if !language && !isDev && canRecreate}
        <!-- KEYS copy: there's nothing to "download" (the key labels come from
             the clone's own frozen pluginData, not Tolgee), so the header
             action is Recreate — the only true way to refresh the labels after
             connections/renames on the source page. Permanently available, not
             just via the staleness banner: connection changes the check can't
             see (e.g. copies without full history) still deserve a manual
             refresh. Hidden without a recorded sourcePageId (pre-tracking
             copies can't recreate) and in Dev Mode (canvas write). -->
        <Button
          size="sm"
          disabled={stage === "recreating"}
          onclick={recreateCopy}
        >
          Recreate copy
        </Button>
      {/if}
    </header>

    <div class="flex flex-1 flex-col overflow-hidden">
      {#if chromeVisible}
        <!-- Fixed above the list (own scroll region below) — a staleness
             banner or count row shouldn't scroll out of view just because
             the selection below it is long. -->
        <div class="flex shrink-0 flex-col gap-3 p-3">
          {#if staleness && stage !== "recreating"}
            <!-- The source page gained connections since this copy was made —
                 Download can't discover those on its own (it only refreshes text
                 for keys the copy already tracks), so recreating is the only fix.
                 The BANNER stays in Dev Mode (it's useful to know the copy is
                 outdated), but the Recreate button — a canvas write blocked in
                 Dev — is hidden: Dev shows the copy read-only, no action it
                 can't perform. -->
            <Message variant="info" class="items-start">
              <div class="space-y-1.5">
                <p>The original page changed since this copy was made.</p>
                {#if !isDev}
                  <Button
                    size="sm"
                    variant="outline"
                    class="bg-bg!"
                    disabled={stage === "pulling" || stage === "applying"}
                    onclick={recreateCopy}
                  >
                    Recreate copy
                  </Button>
                {/if}
              </div>
            </Message>
          {/if}

          {#if stage === "pulling"}
            {#if hasUserSelection}
              <ProgressBar
                loaded={fetchProgress.loaded}
                total={fetchProgress.total}
                label="Loading translations from Tolgee"
              />
            {:else if pageScanProgress}
              <ProgressBar
                loaded={pageScanProgress.done}
                total={pageScanProgress.total}
                label="Scanning page for connected keys…"
              />
            {:else}
              <ProgressBar
                loaded={fetchProgress.loaded}
                total={fetchProgress.total}
                label="Loading translations from Tolgee"
              />
            {/if}
          {:else if stage === "applying"}
            <ProgressBar
              loaded={applyProgress?.done ?? 0}
              total={applyProgress?.total ?? null}
              label="Applying translations"
            />
          {:else if stage === "recreating"}
            <ProgressBar
              loaded={recreateProgress?.current ?? 0}
              total={recreateProgress?.total ?? null}
              label="Recreating copy…"
            />
          {:else if stage === "error"}
            <Message variant="error">{errorMessage ?? "Something went wrong."}</Message>
            <Button
              variant="secondary"
              disabled={lastFailedAction === "download" && appState.value.scanning}
              onclick={lastFailedAction === "recreate" ? recreateCopy : pull}
            >
              Try again
            </Button>
          {:else if lastResult}
            <Message variant="success" onDismiss={() => (lastResult = null)}>{lastResultText}</Message>
          {/if}

          {#if (stage === "idle" || stage === "error") && selectedNodes.length > 0}
            <!-- Count row mirrors Index's (no select-all checkbox — nothing here
                 is bulk-actionable). -->
            <div class="text-xs text-text-secondary">{countRowText}</div>
          {/if}
        </div>
      {/if}

      {#if stage === "idle" || stage === "error"}
        {#if selectedNodes.length === 0}
          <div class="flex flex-1 flex-col overflow-auto px-3 pb-3">
            {#if language && isDev}
              <!-- Download is hidden in Dev Mode — don't instruct an action
                   that doesn't exist there; selecting still lists strings. -->
              <EmptyState icon={Group} title="Select a string or frame" />
            {:else if language}
              <EmptyState
                icon={Download}
                title="Download strings to Figma."
                description="All, or just the selected frames."
              />
            {:else}
              <EmptyState
                icon={KeyRound}
                title="Select a string or frame"
                description="Shows its key below."
              />
            {/if}
          </div>
        {:else}
          <!-- Own scroll region, windowed above LIST_VIRTUALIZE_FROM rows (see
               script) — mirrors NodeList.svelte's split so a huge manual
               selection doesn't mount hundreds of rows at once. -->
          <div
            bind:this={listViewport}
            bind:clientHeight={listViewportHeight}
            onscroll={() => (listScrollTop = listViewport?.scrollTop ?? 0)}
            class="flex-1 min-h-0 overflow-auto px-3 pb-3"
          >
            {#if listWindow.padTop > 0}
              <div style="height: {listWindow.padTop}px" aria-hidden="true"></div>
            {/if}
            <!-- Mirrors NodeListItem's read-only half (string + Plural/Formatted
                 badges, key glyph below) — same visual language as the main
                 Index list, minus anything editable (this view never writes).
                 Unconnected nodes are listed too, with "Not connected" instead
                 of a key — hiding them read as if the selection were smaller
                 than it is. -->
            <ul>
              {#each visibleSelectedNodes as node (node.id)}
                <li
                  class="flex items-start gap-1.5 border-b border-dashed border-border py-2.5 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <div class="min-w-0 flex-1 space-y-1.5">
                    <div class="flex items-center gap-1.5">
                      <span class="min-w-0 truncate text-xs text-text" title={node.characters}>
                        {node.characters || "(empty)"}
                      </span>
                      {#if node.connected}
                        {#if node.isPlural}<Badge>Plural</Badge>{/if}
                        {#if hasRichFormat(node)}<Badge>Formatted</Badge>{/if}
                      {/if}
                    </div>
                    <div class="flex items-center gap-1.5">
                      {#if node.connected}
                        <KeyRound size={ICON.inline} class="shrink-0 text-text-secondary" />
                        <span class="min-w-0 truncate text-xs font-semibold text-text-secondary">
                          {formatKeyLabel(node)}
                        </span>
                      {:else}
                        <span class="text-xs italic text-text-secondary">Not connected</span>
                      {/if}
                    </div>
                  </div>
                  <TooltipIconButton label="Move to string" onclick={() => showOnCanvas(node.id)}>
                    <Target size={ICON.inline} />
                  </TooltipIconButton>
                </li>
              {/each}
            </ul>
            {#if listWindow.padBottom > 0}
              <div style="height: {listWindow.padBottom}px" aria-hidden="true"></div>
            {/if}
          </div>
        {/if}
      {/if}
    </div>
  </Tooltip.Provider>
</div>
