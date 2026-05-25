<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { FrameScreenshot, NodeInfo, TolgeeConfig } from "$shared/types";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { nextCorrelationId, on, send } from "$ui/lib/bus";
  import { Button, Card } from "$ui/lib/components/ui";
  import {
    pushDiff,
    buildRemoteMapFromKeys,
    type PushDiff,
  } from "$ui/lib/logic/pushDiff";
  import type { SimpleImportConflictResult } from "$ui/lib/api/push";
  import { fetchRemoteKeys } from "$ui/lib/api/keysByName";
  import {
    applyConfiguredTags,
    canonicalKey,
    defaultResolutions,
    fetchCanonicalAfterPush,
    resolutionKey,
    submitPush,
    uploadScreenshots,
    type PushContext,
  } from "$ui/lib/logic/pushFlow";
  import PushConflictItem from "$ui/lib/components/domain/PushConflictItem.svelte";
  import type { PushConflictResolution } from "$ui/lib/logic/pushFlow";
  import PushProgress from "$ui/lib/components/domain/PushProgress.svelte";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import AlertTriangle from "lucide-svelte/icons/alert-triangle";

  type Stage = "idle" | "uploading" | "pushing" | "conflict" | "done" | "error";

  // ---- Local state -----------------------------------------------------------

  let stage = $state<Stage>("idle");
  let progress = $state<{
    current: number;
    total: number | null;
    message: string;
  }>({ current: 0, total: null, message: "" });
  let conflicts = $state<SimpleImportConflictResult[]>([]);
  let resolutions = $state<Record<string, PushConflictResolution>>({});
  let errorMessage = $state<string | null>(null);
  let pushedKeyCount = $state(0);

  // ---- Derived ---------------------------------------------------------------

  const cfg = $derived<Partial<TolgeeConfig>>(appState.value.config ?? {});
  const language = $derived(cfg.language ?? "");
  // Only attach `branch` when the project actually has branching enabled —
  // otherwise Tolgee rejects with feature_not_enabled_for_project.
  const branch = $derived(auth.value.branchingEnabled ? cfg.branch : undefined);
  const hasNamespacesEnabled = $derived(auth.value.namespacesEnabled);
  const updateScreenshots = $derived(cfg.updateScreenshots ?? true);
  const addTags = $derived(cfg.addTags ?? false);
  const configuredTags = $derived(cfg.tags ?? []);

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
    ],
    enabled:
      Boolean(auth.value.client) &&
      Boolean(language) &&
      connectedNodes.length > 0,
    staleTime: 5 * 1000,
    queryFn: async ({ signal }): Promise<PushDiff> => {
      const client = auth.value.client;
      if (!client) throw new Error("Not connected to Tolgee.");
      const filterKeyName = Array.from(
        new Set(connectedNodes.map((n) => n.key)),
      );
      const filterNamespace = hasNamespacesEnabled
        ? Array.from(new Set(connectedNodes.map((n) => n.ns ?? "")))
        : undefined;
      const remoteKeys = await fetchRemoteKeys(client, {
        filterKeyName,
        filterNamespace,
        language,
        branch: branch || undefined,
        signal,
      });
      const remoteMap = buildRemoteMapFromKeys(remoteKeys, language);
      return pushDiff(connectedNodes, remoteMap, {
        hasNamespacesEnabled,
        configuredTags,
      });
    },
  }));

  const diff = $derived(diffQuery.data ?? null);

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

  function captureScreenshots(nodeIds: string[]): Promise<FrameScreenshot[]> {
    return new Promise((resolve) => {
      if (nodeIds.length === 0) {
        resolve([]);
        return;
      }
      const correlationId = nextCorrelationId();
      const off = on("screenshots-result", (msg) => {
        if (msg.correlationId !== correlationId) return;
        off();
        resolve(msg.screenshots);
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
    pushedKeyCount = 0;
    const nodesToPush = nodesToPushFrom(diff);

    try {
      let screenshots: FrameScreenshot[] = [];
      let uploadedById = new Map<FrameScreenshot, number>();

      if (updateScreenshots && nodesToPush.length > 0) {
        stage = "uploading";
        progress = {
          current: 0,
          total: null,
          message: "Capturing screenshots…",
        };
        screenshots = await captureScreenshots(nodesToPush.map((n) => n.id));
        uploadedById = await uploadScreenshots(ctx, screenshots, (e) => {
          progress = e;
        });
      }

      stage = "pushing";
      progress = {
        current: 0,
        total: null,
        message: "Pushing translations…",
      };

      const result = await submitPush({
        ctx,
        nodes: nodesToPush,
        screenshots,
        uploadedImageIdByScreenshot: uploadedById,
        resolutionMode: "RECOMMENDED",
      });

      if (result.unresolvedConflicts.length > 0) {
        conflicts = result.unresolvedConflicts;
        resolutions = defaultResolutions(result.unresolvedConflicts);
        stage = "conflict";
        return;
      }

      await finishPush(ctx, nodesToPush);
    } catch (err) {
      handlePushError(err);
    }
  }

  async function applyResolutions(): Promise<void> {
    const ctx = buildContext();
    if (!ctx || !diff) return;
    errorMessage = null;

    const nodesByKey = new Map<string, NodeInfo>();
    for (const n of nodesToPushFrom(diff)) {
      nodesByKey.set(resolutionKey(n.key, n.ns), n);
    }

    const subset: NodeInfo[] = [];
    for (const c of conflicts) {
      const node = nodesByKey.get(resolutionKey(c.keyName, c.keyNamespace));
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
        resolutionFor: (k, ns) => resolutions[resolutionKey(k, ns)] ?? "KEEP",
      });

      conflicts = result.unresolvedConflicts;
      if (conflicts.length > 0) {
        resolutions = defaultResolutions(conflicts);
        stage = "conflict";
        return;
      }

      await finishPush(ctx, nodesToPushFrom(diff));
    } catch (err) {
      handlePushError(err);
    }
  }

  function handlePushError(err: unknown): void {
    errorMessage = (err as Error)?.message ?? "Push failed.";
    stage = "error";
    appState.setError({
      message: errorMessage,
      severity: "error",
    });
  }

  async function finishPush(
    ctx: PushContext,
    allNodes: NodeInfo[],
  ): Promise<void> {
    pushedKeyCount =
      (diff?.newKeys.length ?? 0) + (diff?.changedKeys.length ?? 0);

    // Best-effort: tag failures must not undo the push.
    if (addTags && configuredTags.length > 0) {
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
      nodes: allNodes.map((n) => {
        const remote = canonical?.get(canonicalKey(n));
        return {
          id: n.id,
          info: {
            connected: true,
            translation: remote?.translation ?? n.translation ?? n.characters,
            isPlural: remote?.isPlural ?? n.isPlural,
          },
        };
      }),
    });

    send({
      type: "notify",
      text: `Pushed ${pushedKeyCount} key(s) to Tolgee`,
    });
    // Drop the diff cache so the next visit recomputes against the new
    // canonical translations.
    void qc.invalidateQueries({ queryKey: ["push-diff"] });
    stage = "done";
  }

  function handleResolutionChange(
    keyName: string,
    ns: string | undefined,
    resolution: PushConflictResolution,
  ): void {
    resolutions = {
      ...resolutions,
      [resolutionKey(keyName, ns)]: resolution,
    };
  }

  // Lookup helpers used by the conflict UI to show both sides side-by-side.
  function figmaTextFor(c: SimpleImportConflictResult): string {
    const target = diff
      ? nodesToPushFrom(diff).find(
          (n) => n.key === c.keyName && (n.ns ?? "") === (c.keyNamespace ?? ""),
        )
      : undefined;
    return target ? target.translation || target.characters || "" : "";
  }

  function remoteTextFor(c: SimpleImportConflictResult): string {
    const changed = diff?.changedKeys.find(
      (x) =>
        x.node.key === c.keyName &&
        (x.node.ns ?? "") === (c.keyNamespace ?? ""),
    );
    return changed?.remoteText ?? "";
  }

  // Map diff-query error to the user-facing banner.
  $effect(() => {
    const err = diffQuery.error;
    if (err) {
      errorMessage = (err as Error)?.message ?? "Failed to compute diff.";
      stage = "error";
    }
  });
</script>

<div class="flex h-full flex-col">
  <header
    class="flex items-center justify-between border-b border-border px-3 py-2"
  >
    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick={backToIndex}
        class="text-text-secondary hover:text-text"
        aria-label="Back"
      >
        <ArrowLeft size={14} />
      </button>
      <h1 class="text-sm font-semibold">
        Push to Tolgee
        {#if language}
          <span class="text-xs font-normal text-text-secondary">
            ({language})
          </span>
        {/if}
      </h1>
    </div>
  </header>

  <div class="flex-1 overflow-auto p-3 space-y-3">
    {#if diffQuery.isPending}
      <Card>
        <p class="text-xs text-text-secondary">Computing changes…</p>
      </Card>
    {:else if stage === "error"}
      <div class="bg-red-100 text-red-900 p-2 text-sm rounded">
        {errorMessage ?? "An error occurred."}
      </div>
    {:else if stage === "done"}
      <Card>
        <p class="text-sm">
          Pushed {pushedKeyCount} key(s) to Tolgee.
        </p>
      </Card>
    {:else if stage === "uploading" || stage === "pushing"}
      <PushProgress
        current={progress.current}
        total={progress.total}
        message={progress.message}
      />
    {:else if stage === "conflict"}
      <Card>
        <div class="flex items-center gap-2 text-xs text-text">
          <AlertTriangle size={14} />
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
                resolutionKey(conflict.keyName, conflict.keyNamespace)
              ] ?? (conflict.isOverridable ? "OVERRIDE" : "KEEP")}
              onResolutionChange={handleResolutionChange}
            />
          {/each}
        </div>
      </Card>
    {:else if diff}
      {#if diff.conflictingNodes.length > 0}
        <div
          class="rounded-md border border-yellow-400/40 bg-yellow-100 p-2 text-xs text-yellow-900"
        >
          <div class="flex items-start gap-1.5">
            <AlertTriangle size={12} class="mt-0.5 shrink-0" />
            <div>
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
                    <span class="font-mono">
                      {group.ns ? `${group.ns}.${group.key}` : group.key}
                    </span>
                    <span class="opacity-70">
                      ({group.nodes.length} nodes)
                    </span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        </div>
      {/if}

      <Card>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <div class="text-lg font-semibold text-text-brand">
              {diff.newKeys.length}
            </div>
            <div class="text-[10px] text-text-secondary">New</div>
          </div>
          <div>
            <div class="text-lg font-semibold">
              {diff.changedKeys.length}
            </div>
            <div class="text-[10px] text-text-secondary">Changed</div>
          </div>
          <div>
            <div class="text-lg font-semibold text-text-secondary">
              {diff.unchangedKeys.length}
            </div>
            <div class="text-[10px] text-text-secondary">Unchanged</div>
          </div>
        </div>
      </Card>

      {#if diff.newKeys.length > 0}
        <section>
          <div
            class="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
          >
            New ({diff.newKeys.length})
          </div>
          <ul class="space-y-1">
            {#each diff.newKeys as node (node.id)}
              <li class="rounded border border-border bg-bg p-2">
                <div class="truncate text-xs font-mono">
                  {node.ns ? `${node.ns}.${node.key}` : node.key}
                </div>
                <div class="truncate text-[11px] text-text-secondary">
                  {node.translation || node.characters}
                </div>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if diff.changedKeys.length > 0}
        <section>
          <div
            class="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
          >
            Changed ({diff.changedKeys.length})
          </div>
          <ul class="space-y-1">
            {#each diff.changedKeys as entry (entry.node.id)}
              <li class="rounded border border-border bg-bg p-2">
                <div class="truncate text-xs font-mono">
                  {entry.node.ns
                    ? `${entry.node.ns}.${entry.node.key}`
                    : entry.node.key}
                </div>
                <div
                  class="truncate text-[11px] text-text-secondary line-through"
                  title={entry.remoteText}
                >
                  {entry.remoteText}
                </div>
                <div class="truncate text-[11px] text-text">
                  {entry.node.translation || entry.node.characters}
                </div>
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    {/if}
  </div>

  <footer class="flex justify-end gap-2 border-t border-border p-2">
    {#if stage === "conflict"}
      <Button variant="ghost" onclick={backToIndex}>Cancel</Button>
      <Button onclick={applyResolutions}>Apply resolutions</Button>
    {:else if stage === "done" || stage === "error"}
      <Button onclick={backToIndex}>OK</Button>
    {:else if stage === "idle" && diff}
      <Button variant="ghost" onclick={backToIndex}>Cancel</Button>
      <Button
        onclick={startPush}
        disabled={diff.newKeys.length === 0 && diff.changedKeys.length === 0}
      >
        Push to Tolgee
      </Button>
    {/if}
  </footer>
</div>
