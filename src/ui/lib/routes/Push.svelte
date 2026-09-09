<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { FrameScreenshot, NodeInfo, TolgeeConfig } from "$shared/types";
  import { ICON } from "$shared/iconSizes";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { nextCorrelationId, on, send } from "$ui/lib/bus";
  import { createIdleTimeout } from "$ui/lib/busRequest";
  import { Button, Card, Message, ProgressBar, Stat } from "$ui/lib/components/ui";
  import Badge from "$ui/lib/components/ui/badge.svelte";
  import CheckboxField from "$ui/lib/components/ui/checkboxField.svelte";
  import {
    pushDiff,
    buildRemoteMapFromKeys,
    droppedConflictNodeIds,
    textOfNode,
    type PushDiff,
  } from "$ui/lib/logic/pushDiff";
  import type { SimpleImportConflictResult } from "$ui/lib/api/push";
  import { fetchRemoteKeys } from "$ui/lib/api/keysByName";
  import { refreshNamespaces } from "$ui/lib/api/pickers";
  import {
    applyConfiguredTags,
    buildConnectBackUpdates,
    defaultResolutions,
    fetchCanonicalAfterPush,
    resolutionKey,
    submitBigMeta,
    submitPush,
    uploadScreenshots,
    type PushContext,
  } from "$ui/lib/logic/pushFlow";
  import { settleQuery, type QueryOutcome } from "$ui/lib/logic/queryResult";
  import PushConflictItem from "$ui/lib/components/domain/PushConflictItem.svelte";
  import type { PushConflictResolution } from "$ui/lib/logic/pushFlow";
  import ViewHeader from "$ui/lib/components/domain/ViewHeader.svelte";
  import ViewFooter from "$ui/lib/components/domain/ViewFooter.svelte";
  import AlertTriangle from "lucide-svelte/icons/alert-triangle";

  type Stage = "idle" | "uploading" | "pushing" | "conflict" | "done" | "error";

  // ---- Local state -----------------------------------------------------------

  let stage = $state<Stage>("idle");
  let progress = $state<{
    current: number;
    total: number | null;
    message: string;
  }>({ current: 0, total: null, message: "" });
  // Progress for the diff-computation stage (`diffQuery`'s `fetchRemoteKeys`
  // call) — `total` is the key count known up front, `done` is the
  // cumulative count of names whose batch has resolved. Reset to `null`
  // whenever the query isn't pending, so it never lingers into the next
  // stage (see the `$effect` below).
  let diffProgress = $state<{ done: number; total: number } | null>(null);
  let conflicts = $state<SimpleImportConflictResult[]>([]);
  // Snapshot of the reactive inputs, captured the moment the user clicks
  // Upload. Everything past the first await — including the conflict dialog
  // and its re-submit — MUST read from this, never from the live `diff` /
  // `connectedNodes`: App's global selection listener keeps updating them
  // while screenshots upload, and a mid-push selection change would swap the
  // diff under us and corrupt the final connect-back write (marking
  // never-pushed nodes as connected). No clearing needed: every reader is
  // only reachable inside a push `startPush` began, and `startPush` always
  // re-captures first.
  let pushInputs: {
    diff: PushDiff;
    connectedNodes: NodeInfo[];
    // Screenshots captured for THIS push, kept on the snapshot so `finishPush`
    // can register their big-meta once — on the direct AND the conflict-
    // resolution path alike (they're uploaded in `startPush`, before any
    // conflict detour). Empty when screenshots are off / none apply.
    screenshots: FrameScreenshot[];
  } | null = null;
  let resolutions = $state<Record<string, PushConflictResolution>>({});
  let errorMessage = $state<string | null>(null);
  let pushedKeyCount = $state(0);
  // Frames whose export failed main-side during this push — reported alongside
  // the uploaded count so a partial capture isn't presented as a complete one.
  let failedScreenshotCount = $state(0);
  // Split + screenshot counts for the success summary, captured at finishPush.
  let pushedNewCount = $state(0);
  let pushedChangedCount = $state(0);
  let pushedScreenshotCount = $state(0);
  // Per-push screenshot toggle (default from settings, like the old plugin).
  // When checked the push uploads screenshots; it also keeps the Upload button
  // active when there are only screenshots to send (no text changes).
  // (Named `includeScreenshots` to avoid colliding with the imported
  // `uploadScreenshots` push-flow helper.)
  let includeScreenshots = $state(
    appState.value.config?.updateScreenshots ?? true,
  );

  // Section refs so the New/Changed stats can scroll their lists into view.
  let newSection = $state<HTMLElement>();
  let changedSection = $state<HTMLElement>();

  function scrollTo(el: HTMLElement | undefined): void {
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---- Derived ---------------------------------------------------------------

  const cfg = $derived<Partial<TolgeeConfig>>(appState.value.config ?? {});
  const language = $derived(cfg.language ?? "");
  // Only attach `branch` when the project actually has branching enabled —
  // otherwise Tolgee rejects with feature_not_enabled_for_project.
  const branch = $derived(auth.value.branchingEnabled ? cfg.branch : undefined);
  const hasNamespacesEnabled = $derived(auth.value.namespacesEnabled);
  const addTags = $derived(cfg.addTags ?? false);
  // Gated on `addTags`, because the diff and the write must ask and answer the
  // SAME question. `isChanged` reports a key as changed when the remote is
  // missing one of these tags; the push only applies them when the toggle is
  // on. Reading `cfg.tags` unconditionally meant that turning the toggle OFF
  // while tags were still configured left every key permanently "changed" —
  // the diff kept demanding tags the push would never send.
  const configuredTags = $derived(addTags ? (cfg.tags ?? []) : []);
  // Part of the diff cache key: the diff's ANSWER depends on these, so a
  // settings change has to produce a different key or svelte-query keeps
  // serving the result computed under the old tag settings.
  const tagsCacheKey = $derived(configuredTags.join(","));

  const selectedNodes = $derived<NodeInfo[]>(appState.value.selectedNodes);
  const connectedNodes = $derived(
    selectedNodes.filter((n) => n.key && n.key.trim().length > 0),
  );

  // Stable cache-key inputs for the diff query. We feed a sorted, joined
  // string instead of arrays so reference identity doesn't churn on re-renders
  // and svelte-query can dedupe correctly.
  const keyFilterCacheKey = $derived(
    Array.from(new Set(connectedNodes.map((n) => n.key)))
      .sort()
      .join(","),
  );
  const nsFilterCacheKey = $derived(
    hasNamespacesEnabled
      ? Array.from(new Set(connectedNodes.map((n) => n.ns ?? "")))
          .sort()
          .join(",")
      : "",
  );

  const qc = useQueryClient();

  /**
   * Diff query. Cached by (language, branch, key set, namespace set).
   * Selection-change re-runs hit the cache instantly; switching language
   * mid-load cancels the previous fetch through the AbortSignal.
   */
  const diffQuery = createQuery(() => ({
    queryKey: [
      "push-diff",
      language,
      branch ?? "",
      keyFilterCacheKey,
      nsFilterCacheKey,
      tagsCacheKey,
    ],
    enabled:
      Boolean(auth.value.client) &&
      Boolean(language) &&
      connectedNodes.length > 0,
    staleTime: 5 * 1000,
    // Resolves with an outcome instead of rejecting — see `settleQuery`: the
    // svelte-query runes adapter doesn't reliably surface a query's terminal
    // error, which used to hang "Computing changes…" forever on any API
    // failure. The view reads the error off `diffQuery.data` below.
    queryFn: ({ signal }): Promise<QueryOutcome<PushDiff>> =>
      settleQuery(
        async () => {
          const client = auth.value.client;
          if (!client) throw new Error("Not connected to Tolgee.");
          const filterKeyName = Array.from(
            new Set(connectedNodes.map((n) => n.key)),
          );
          const filterNamespace = hasNamespacesEnabled
            ? Array.from(new Set(connectedNodes.map((n) => n.ns ?? "")))
            : undefined;
          // `total` is known immediately (the name count) — seed it before the
          // first batch even resolves so the bar reads "0 / N" from the start
          // instead of flashing blank.
          diffProgress = { done: 0, total: filterKeyName.length };
          const remoteKeys = await fetchRemoteKeys(
            client,
            {
              filterKeyName,
              filterNamespace,
              language,
              branch: branch || undefined,
              signal,
            },
            (done, total) => {
              diffProgress = { done, total };
            },
          );
          const remoteMap = buildRemoteMapFromKeys(remoteKeys, language);
          return pushDiff(connectedNodes, remoteMap, {
            hasNamespacesEnabled,
            configuredTags,
          });
        },
        {
          signal,
          toMessage: (err) => (err as Error)?.message ?? "Failed to compute diff.",
        },
      ),
  }));

  const diffOutcome = $derived(diffQuery.data ?? null);
  const diff = $derived(diffOutcome?.ok ? diffOutcome.value : null);
  // Diff-load failure, surfaced from `.data` (not the adapter's `.error`).
  const diffLoadError = $derived(
    diffOutcome && !diffOutcome.ok ? diffOutcome.error : null,
  );

  const noTextChanges = $derived(
    (diff?.newKeys.length ?? 0) === 0 && (diff?.changedKeys.length ?? 0) === 0,
  );
  // Any keys at all (incl. unchanged) → screenshots can be uploaded for them, so
  // the "Upload screenshots" toggle is offered.
  const hasAnyKeys = $derived(
    (diff?.newKeys.length ?? 0) +
      (diff?.changedKeys.length ?? 0) +
      (diff?.unchangedKeys.length ?? 0) >
      0,
  );
  // Even with no text changes, screenshots can still be (re)uploaded for the
  // existing keys, matching the old plugin. This keeps the Upload button active
  // in that case (the push already includes unchangedKeys + their screenshots).
  const screenshotOnlyUpload = $derived(
    noTextChanges &&
      includeScreenshots &&
      (diff?.unchangedKeys.length ?? 0) > 0,
  );

  // One-line summary for the success ("done") state. Splits new vs updated so
  // the user sees what actually changed, and reports screenshots separately —
  // a screenshot-only upload pushes 0 keys, so "Uploaded 0 key(s)" alone read
  // as a no-op even though frames were sent.
  const doneSummary = $derived.by(() => {
    const parts: string[] = [];
    if (pushedNewCount > 0 && pushedChangedCount > 0) {
      parts.push(
        `Uploaded ${pushedNewCount} new and ${pushedChangedCount} updated key(s) to Tolgee.`,
      );
    } else if (pushedNewCount > 0) {
      parts.push(`Uploaded ${pushedNewCount} new key(s) to Tolgee.`);
    } else if (pushedChangedCount > 0) {
      parts.push(`Updated ${pushedChangedCount} key(s) in Tolgee.`);
    }
    if (pushedScreenshotCount > 0) {
      parts.push(
        failedScreenshotCount > 0
          ? `${pushedScreenshotCount} screenshot(s) uploaded, ${failedScreenshotCount} failed to capture.`
          : `${pushedScreenshotCount} screenshot(s) uploaded.`,
      );
    }
    if (parts.length === 0) parts.push("Upload complete.");
    return parts.join(" ");
  });

  function buildContext(): PushContext | null {
    const client = auth.value.client;
    if (!client) return null;
    return {
      client,
      apiUrl: auth.value.apiUrl,
      apiKey: auth.value.apiKey,
      language,
      branch: branch || undefined,
      hasNamespacesEnabled,
    };
  }

  function backToIndex(): void {
    appState.navigate({ name: "index" });
  }

  // ---- Screenshot capture (UI -> main via bus) ------------------------------

  // Idle timeout (not a wall-clock cap): large exports can legitimately take
  // a while, but each frame that streams in resets the timer, so this only
  // fires if NOTHING has arrived for a full 5 minutes straight. 5 minutes
  // (not 120s) because a single pathologically large frame — e.g. a
  // design-system wall spanning tens of thousands of layers, which testing
  // on this project has actually hit — can itself take a while to export,
  // with no intermediate progress message during that one export.
  const SCREENSHOTS_TIMEOUT_MS = 5 * 60_000;

  function captureScreenshots(nodeIds: string[]): Promise<FrameScreenshot[]> {
    return new Promise((resolve, reject) => {
      if (nodeIds.length === 0) {
        resolve([]);
        return;
      }
      const correlationId = nextCorrelationId();
      // Frames stream in one message each (main-side memory + serialization
      // stay bounded); `screenshots-done` closes the stream.
      const collected: FrameScreenshot[] = [];
      const cleanup = (): void => {
        offFrame();
        offDone();
        watchdog.clear();
      };
      const watchdog = createIdleTimeout(SCREENSHOTS_TIMEOUT_MS, () => {
        cleanup();
        reject(new Error("Timed out waiting for screenshots to be captured."));
      });
      const offFrame = on("screenshot-frame", (msg) => {
        if (msg.correlationId !== correlationId) return;
        watchdog.touch();
        collected.push(msg.screenshot);
      });
      const offDone = on("screenshots-done", (msg) => {
        if (msg.correlationId !== correlationId) return;
        cleanup();
        // A frame whose export threw is skipped main-side. Remember how many,
        // so the summary can say so instead of presenting the reduced count as
        // the whole set.
        failedScreenshotCount = msg.failed;
        resolve(collected);
      });
      send({ type: "request-screenshots", correlationId, nodeIds });
    });
  }

  // ---- Push flow -------------------------------------------------------------

  function nodesToPushFrom(d: PushDiff): NodeInfo[] {
    return [
      ...d.newKeys,
      ...d.changedKeys.map((c) => c.node),
      ...d.unchangedKeys,
    ];
  }

  async function startPush(): Promise<void> {
    const ctx = buildContext();
    if (!ctx) {
      errorMessage = "Not connected to Tolgee.";
      stage = "error";
      return;
    }
    if (!diff) return;
    if (!language) {
      errorMessage = "No language configured.";
      stage = "error";
      return;
    }

    errorMessage = null;
    // Fresh per push — a previous run's failures must not surface in this
    // run's summary (this run may not capture screenshots at all).
    failedScreenshotCount = 0;
    pushedKeyCount = 0;
    const snapshot = { diff, connectedNodes, screenshots: [] as FrameScreenshot[] };
    pushInputs = snapshot;
    const nodesToPush = nodesToPushFrom(snapshot.diff);
    // Screenshots cover EVERY layer of each pushed key (all frames it appears
    // on), not just the deduped representative — so a key reused across frames
    // keeps full screenshot coverage, like the original plugin. Scoped to the
    // pushed keys so we never export a frame that only holds keys we're not
    // pushing (no wasted exports). `mapScreenshotsForNode` attaches them by key.
    //
    // BUT drop the same-key conflict LOSERS: a layer that lost its key never
    // connects (see `buildConnectBackUpdates`), so it must not be captured or
    // boxed on that key's screenshot either — otherwise the key's screenshot
    // shows a box around text that isn't actually linked to it.
    const droppedConflictIds = droppedConflictNodeIds(snapshot.diff);
    const pushedKeys = new Set(
      nodesToPush.map((n) => resolutionKey(n.key, n.ns, hasNamespacesEnabled)),
    );
    const screenshotNodes = snapshot.connectedNodes.filter(
      (n) =>
        !droppedConflictIds.has(n.id) &&
        pushedKeys.has(resolutionKey(n.key, n.ns, hasNamespacesEnabled)),
    );

    try {
      let screenshots: FrameScreenshot[] = [];
      let uploadedById = new Map<FrameScreenshot, number>();

      if (includeScreenshots && screenshotNodes.length > 0) {
        stage = "uploading";
        progress = {
          current: 0,
          total: null,
          message: "Capturing screenshots…",
        };
        screenshots = await captureScreenshots(screenshotNodes.map((n) => n.id));
        uploadedById = await uploadScreenshots(ctx, screenshots, (e) => {
          progress = e;
        });
        // Keep them on the snapshot so `finishPush` can register their big-meta
        // even when the push detours through the conflict dialog.
        snapshot.screenshots = screenshots;
      }

      stage = "pushing";
      progress = {
        current: 0,
        total: null,
        // One request, so there is no sub-progress to report — the count goes
        // in the label, where it is information rather than a fake tally.
        message: `Uploading ${nodesToPush.length} ${
          nodesToPush.length === 1 ? "translation" : "translations"
        }…`,
      };

      const result = await submitPush({
        ctx,
        nodes: nodesToPush,
        screenshots,
        uploadedImageIdByScreenshot: uploadedById,
        resolutionMode: "RECOMMENDED",
        // Unchanged keys ride along only to carry screenshots — never re-push
        // (override) their untouched translation. Matches the original plugin.
        unchangedNodeIds: new Set(snapshot.diff.unchangedKeys.map((n) => n.id)),
      });

      if (result.unresolvedConflicts.length > 0) {
        conflicts = result.unresolvedConflicts;
        resolutions = defaultResolutions(result.unresolvedConflicts, hasNamespacesEnabled);
        stage = "conflict";
        return;
      }

      await finishPush(ctx, nodesToPush, snapshot);
    } catch (err) {
      handlePushError(err);
    }
  }

  async function applyResolutions(): Promise<void> {
    const ctx = buildContext();
    // The conflict dialog belongs to the push that opened it — resolve
    // against THAT push's snapshot (the live diff may have moved on, or be
    // null, if the selection changed while the dialog was open).
    const snapshot = pushInputs;
    if (!ctx || !snapshot) return;
    errorMessage = null;

    const nodesByKey = new Map<string, NodeInfo>();
    for (const n of nodesToPushFrom(snapshot.diff)) {
      nodesByKey.set(resolutionKey(n.key, n.ns, hasNamespacesEnabled), n);
    }

    const subset: NodeInfo[] = [];
    for (const c of conflicts) {
      const node = nodesByKey.get(
        resolutionKey(c.keyName, c.keyNamespace, hasNamespacesEnabled),
      );
      if (node) subset.push(node);
    }

    try {
      stage = "pushing";
      progress = {
        current: 0,
        total: null,
        message: "Re-submitting with resolutions…",
      };

      const result = await submitPush({
        ctx,
        nodes: subset,
        screenshots: [],
        uploadedImageIdByScreenshot: new Map(),
        resolutionMode: "FORCE_OVERRIDE",
        resolutionFor: (k, ns) =>
          resolutions[resolutionKey(k, ns, hasNamespacesEnabled)] ?? "KEEP",
      });

      conflicts = result.unresolvedConflicts;
      if (conflicts.length > 0) {
        resolutions = defaultResolutions(conflicts, hasNamespacesEnabled);
        stage = "conflict";
        return;
      }

      await finishPush(ctx, nodesToPushFrom(snapshot.diff), snapshot);
    } catch (err) {
      handlePushError(err);
    }
  }

  function handlePushError(err: unknown): void {
    errorMessage = (err as Error)?.message ?? "Upload failed.";
    stage = "error";
    appState.setError({
      message: errorMessage,
      severity: "error",
    });
  }

  async function finishPush(
    ctx: PushContext,
    allNodes: NodeInfo[],
    snapshot: { diff: PushDiff; connectedNodes: NodeInfo[]; screenshots: FrameScreenshot[] },
  ): Promise<void> {
    pushedNewCount = snapshot.diff.newKeys.length;
    pushedChangedCount = snapshot.diff.changedKeys.length;
    pushedKeyCount = pushedNewCount + pushedChangedCount;
    // Frame screenshots captured + uploaded for this push (0 when the toggle is
    // off or nothing applied). Capture and upload happen back-to-back in
    // `startPush`, so a partial upload throws to the error stage — at `done`
    // every captured frame is on Tolgee.
    pushedScreenshotCount = snapshot.screenshots.length;

    // Register screenshot key-context ("related keys in order") for in-context
    // suggestions. Here — the single completion point — so it fires ONCE on
    // both the direct push and the conflict-resolution re-submit (it used to
    // sit only on the no-conflict branch, so a push that hit the conflict
    // dialog uploaded its screenshots but never registered their big-meta).
    // Best-effort: `submitBigMeta` swallows failures and never blocks the push.
    if (snapshot.screenshots.length > 0) {
      await submitBigMeta(ctx, snapshot.screenshots);
    }

    // Best-effort: tag failures must not undo the push.
    if (configuredTags.length > 0) {
      try {
        await applyConfiguredTags({
          ctx,
          tags: configuredTags,
          nodes: allNodes,
        });
      } catch (err) {
        appState.setError({
          message: `Translations were pushed, but tag update failed: ${
            (err as Error)?.message ?? "unknown error"
          }`,
          severity: "warning",
        });
      }
    }

    const canonical = await fetchCanonicalAfterPush(ctx, allNodes).catch(
      () => null,
    );

    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: buildConnectBackUpdates(
        snapshot.diff,
        snapshot.connectedNodes,
        canonical,
        hasNamespacesEnabled,
      ),
    });

    send({
      type: "notify",
      text: `Uploaded ${pushedKeyCount} key(s) to Tolgee`,
    });
    // Drop every cache whose ANSWER this push just changed. Keeping only the
    // diff here meant a user who uploaded a missing translation and went
    // straight to "Download to Figma" was served the translations fetched
    // BEFORE the upload — so the string they had just pushed still showed as
    // missing (reported live).
    //   push-diff               — recompute against the new canonical values
    //   translations            — Pull/CopyView read these to build the download
    //   page-connected-nodes    — connect-back just linked nodes to keys
    //   connected-keys-existence— keys created by this push are no longer missing
    for (const queryKey of [
      ["push-diff"],
      ["translations"],
      ["page-connected-nodes"],
      ["connected-keys-existence"],
    ]) {
      void qc.invalidateQueries({ queryKey });
    }
    // Re-pull the project's namespaces: this push may have created a brand-new
    // one server-side, and the namespace picker (Index rows / bulk "Set
    // namespace") must offer it even when no selected node carries it.
    // Best-effort — never blocks the done state.
    if (hasNamespacesEnabled) void refreshNamespaces(ctx.client);
    stage = "done";
  }

  function handleResolutionChange(
    keyName: string,
    ns: string | undefined,
    resolution: PushConflictResolution,
  ): void {
    resolutions = {
      ...resolutions,
      [resolutionKey(keyName, ns, hasNamespacesEnabled)]: resolution,
    };
  }

  // Lookup helpers used by the conflict UI to show both sides side-by-side.
  // The conflicts belong to the in-flight push, so they read its snapshot —
  // the live `diff` may already describe a different selection (or be null).
  function figmaTextFor(c: SimpleImportConflictResult): string {
    const d = pushInputs?.diff ?? diff;
    const target = d
      ? nodesToPushFrom(d).find(
          (n) => n.key === c.keyName && (n.ns ?? "") === (c.keyNamespace ?? ""),
        )
      : undefined;
    return target ? target.translation || target.characters || "" : "";
  }

  function remoteTextFor(c: SimpleImportConflictResult): string {
    const d = pushInputs?.diff ?? diff;
    const changed = d?.changedKeys.find(
      (x) =>
        x.node.key === c.keyName &&
        (x.node.ns ?? "") === (c.keyNamespace ?? ""),
    );
    return changed?.remoteText ?? "";
  }

  // The diff-computation progress bar only means something while the query
  // is actually in flight — clear it the moment it settles (success or
  // error) so it doesn't linger once the diff card / error banner replaces
  // the "Computing changes…" state.
  $effect(() => {
    if (!diffQuery.isPending) {
      diffProgress = null;
    }
  });
</script>

<div class="flex h-full flex-col">
  <ViewHeader
    title="Upload to Tolgee"
    subtitle={language ? `(${language})` : undefined}
    onBack={backToIndex}
  />

  <div class="flex-1 overflow-auto p-3 space-y-3">
    {#if connectedNodes.length === 0}
      <!-- Nothing to upload: the selection has no strings connected to a Tolgee
           key (empty frame, all-ignored, or unconnected texts). The diff query
           is gated OFF in that case, and a disabled query reports `isPending`,
           so without this branch the "Computing changes…" card below would spin
           forever. Must stay FIRST so it wins over that pending state. -->
      <Message variant="info">No connected strings to upload.</Message>
    {:else if diffQuery.isPending}
      <Card>
        <ProgressBar
          loaded={diffProgress?.done ?? 0}
          total={diffProgress?.total ?? null}
          label="Computing changes…"
        />
      </Card>
    {:else if diffLoadError}
      <Message variant="error">{diffLoadError}</Message>
    {:else if stage === "error"}
      <Message variant="error">{errorMessage ?? "An error occurred."}</Message>
    {:else if stage === "done"}
      <Message variant="success">{doneSummary}</Message>
    {:else if stage === "uploading" || stage === "pushing"}
      <div class="flex flex-col gap-2 rounded-md border border-border p-3">
        <ProgressBar
          loaded={progress.current}
          total={progress.total}
          label={progress.message || "Working…"}
        />
        <div class="flex justify-end">
          <Button variant="ghost" size="sm" disabled aria-label="Cancel">
            Cancel
          </Button>
        </div>
      </div>
    {:else if stage === "conflict"}
      <Card>
        <div class="flex items-center gap-2 text-xs text-text">
          <AlertTriangle size={ICON.inline} />
          <span class="font-medium">
            {conflicts.length} unresolved conflict(s)
          </span>
        </div>
        <p class="mt-1 text-[11px] text-text-secondary">
          Pick a resolution for each conflict and re-submit.
        </p>
        <div class="mt-2">
          {#each conflicts as conflict (conflict.keyName + (conflict.keyNamespace ?? "") + conflict.language)}
            <PushConflictItem
              keyName={conflict.keyName}
              keyNamespace={conflict.keyNamespace}
              language={conflict.language}
              figmaText={figmaTextFor(conflict)}
              remoteText={remoteTextFor(conflict)}
              isOverridable={conflict.isOverridable}
              resolution={resolutions[
                resolutionKey(conflict.keyName, conflict.keyNamespace, hasNamespacesEnabled)
              ] ?? (conflict.isOverridable ? "OVERRIDE" : "KEEP")}
              onResolutionChange={handleResolutionChange}
            />
          {/each}
        </div>
      </Card>
    {:else if diff}
      {#if diff.conflictingNodes.length > 0}
        <Message variant="warning">
          <div class="font-semibold">
            {diff.conflictingNodes.length} key(s) reuse the same name with different
            text in Figma.
          </div>
          <p class="opacity-80">
            Only the first occurrence will be pushed for each. Update or
            disconnect the duplicates to clear this warning.
          </p>
          <ul class="mt-1 list-disc pl-4">
            {#each diff.conflictingNodes as group (group.key + (group.ns ?? ""))}
              <li>
                <span class="font-mono">{group.key}</span>
                {#if hasNamespacesEnabled}
                  <span class="opacity-70">ns:{group.ns || "<none>"}</span>
                {/if}
                <span class="opacity-70">
                  ({group.nodes.length} nodes)
                </span>
              </li>
            {/each}
          </ul>
        </Message>
      {/if}

      {#if diff.missingKeys.length > 0}
        <Message variant="error" class="items-start! gap-2">
          <div class="flex flex-col gap-1">
            <div class="font-semibold">
              {diff.missingKeys.length} connected key(s) no longer exist in Tolgee.
            </div>
            <p class="opacity-80">
              They were deleted on the platform, so they'll be skipped (not
              re-created). Reconnect them to an existing key or remove the layer.
            </p>
            <ul class="mt-1 list-disc pl-4">
              {#each diff.missingKeys as n (n.id)}
                <li>
                  <span class="font-mono">{n.key}</span>
                  {#if hasNamespacesEnabled}
                    <span class="opacity-70">ns:{n.ns || "<none>"}</span>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        </Message>
      {/if}

      <Card class="border-0 bg-bg-secondary">
        <div class="grid grid-cols-3 gap-2">
          <!-- New / Changed scroll to their lists when there's something there;
               Unchanged has no list, so it stays static. -->
          <Stat
            value={diff.newKeys.length}
            label="New"
            tone="secondary"
            onclick={diff.newKeys.length > 0
              ? () => scrollTo(newSection)
              : undefined}
          />
          <Stat
            value={diff.changedKeys.length}
            label="Changed"
            tone="brand"
            onclick={diff.changedKeys.length > 0
              ? () => scrollTo(changedSection)
              : undefined}
          />
          <Stat
            value={diff.unchangedKeys.length}
            label="Unchanged"
            tone="muted"
          />
        </div>
      </Card>

      {#if hasAnyKeys}
        <!-- Per-push screenshot toggle in a card so it stays visible — when
             there are no text changes it's the ONLY action, so it must stand out
             (the Upload button stays active while it's on). -->
        <div class="rounded-md border border-border bg-bg-secondary px-3 py-2.5">
          <CheckboxField
            label="Upload screenshots"
            checked={includeScreenshots}
            onChange={(v) => (includeScreenshots = v)}
          />
          {#if noTextChanges && includeScreenshots}
            <p class="mt-1 pl-6 text-[11px] text-text-secondary">
              No text changes — screenshots will still be uploaded for
              {diff.unchangedKeys.length}
              {diff.unchangedKeys.length === 1 ? "key" : "keys"}.
            </p>
          {/if}
        </div>
      {/if}

      {#if noTextChanges && !screenshotOnlyUpload}
        <p class="text-center text-xs text-text-secondary">
          No changes to upload.
        </p>
      {/if}

      {#if diff.newKeys.length > 0}
        <section bind:this={newSection} class="scroll-mt-2">
          <div
            class="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
          >
            New ({diff.newKeys.length})
          </div>
          <ul class="space-y-1">
            {#each diff.newKeys as node (node.id)}
              <li class="rounded border border-border bg-bg p-2">
                <div class="flex items-center gap-1.5">
                  <span class="min-w-0 truncate text-xs font-mono">{node.key}</span>
                  {#if hasNamespacesEnabled}
                    <Badge>ns:{node.ns || "<none>"}</Badge>
                  {/if}
                </div>
                <div class="truncate text-[11px] text-text-secondary">
                  {textOfNode(node)}
                </div>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if diff.changedKeys.length > 0}
        <section bind:this={changedSection} class="scroll-mt-2">
          <div
            class="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
          >
            Changed ({diff.changedKeys.length})
          </div>
          <ul class="space-y-1">
            {#each diff.changedKeys as entry (entry.node.id)}
              <li class="rounded border border-border bg-bg p-2">
                <div class="flex items-center gap-1.5">
                  <span class="min-w-0 truncate text-xs font-mono">
                    {entry.node.key}
                  </span>
                  {#if hasNamespacesEnabled}
                    <Badge>ns:{entry.node.ns || "<none>"}</Badge>
                  {/if}
                </div>
                {#if entry.reason === "text"}
                  <div
                    class="truncate text-[11px] text-text-secondary line-through"
                    title={entry.remoteText}
                  >
                    {entry.remoteText}
                  </div>
                  <div class="truncate text-[11px] text-text">
                    {textOfNode(entry.node)}
                  </div>
                {:else}
                  <!-- The text is IDENTICAL on both sides here — rendering the
                       usual strike-through diff would show the same string
                       twice and read as a bug. Say what actually changes. -->
                  <div class="truncate text-[11px] text-text-secondary">
                    {entry.reason === "tags"
                      ? "Text unchanged — the configured tag will be added."
                      : "Text unchanged — the plural setting will be updated."}
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    {/if}
  </div>

  <ViewFooter>
    {#if stage === "conflict"}
      <Button variant="ghost" onclick={backToIndex}>Cancel</Button>
      <Button onclick={applyResolutions}>Apply resolutions</Button>
    {:else if stage === "done" || stage === "error"}
      <Button onclick={backToIndex}>OK</Button>
    {:else if stage === "idle" && diff}
      <Button variant="ghost" onclick={backToIndex}>Cancel</Button>
      <Button onclick={startPush} disabled={noTextChanges && !screenshotOnlyUpload}>
        Upload to Tolgee
      </Button>
    {/if}
  </ViewFooter>
</div>
