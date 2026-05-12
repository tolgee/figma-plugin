<script lang="ts">
  import type {
    FrameScreenshot,
    NodeInfo,
    TolgeeConfig,
  } from "$shared/types";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send, on, nextCorrelationId } from "$ui/lib/bus";
  import { Button, Card } from "$ui/lib/components/ui";
  import {
    pushDiff,
    buildRemoteMapFromKeys,
    type PushDiff,
  } from "$ui/lib/logic/pushDiff";
  import {
    pushKeys,
    type SingleStepImportResolvableItemRequest,
    type SimpleImportConflictResult,
  } from "$ui/lib/api/push";
  import { uploadScreenshot } from "$ui/lib/api/screenshots";
  import { applyTags } from "$ui/lib/api/tags";
  import PushConflictItem, {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  } from "$ui/lib/components/domain/PushConflictItem.svelte";
  import type { PushConflictResolution } from "$ui/lib/components/domain/PushConflictItem.svelte";
  import PushProgress from "$ui/lib/components/domain/PushProgress.svelte";
  import type { components } from "$ui/lib/api/schema.generated";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import AlertTriangle from "lucide-svelte/icons/alert-triangle";

  type Stage =
    | "idle"
    | "diff"
    | "uploading"
    | "pushing"
    | "conflict"
    | "done"
    | "error";

  type KeyScreenshotDto = components["schemas"]["KeyScreenshotDto"];

  // ---- Local state -----------------------------------------------------------

  let stage = $state<Stage>("idle");
  let progress = $state<{ current: number; total: number; message: string }>(
    { current: 0, total: 0, message: "" },
  );
  let conflicts = $state<SimpleImportConflictResult[]>([]);
  let resolutions = $state<Record<string, PushConflictResolution>>({});
  let diff = $state<PushDiff | null>(null);
  let errorMessage = $state<string | null>(null);
  let pushedKeyCount = $state(0);

  // ---- Derived ---------------------------------------------------------------

  const cfg = $derived<Partial<TolgeeConfig>>(appState.value.config ?? {});
  const language = $derived(cfg.language ?? "");
  const namespace = $derived(cfg.namespace ?? "");
  // Only attach `branch` to API calls when the project actually has branching
  // enabled — otherwise Tolgee rejects with feature_not_enabled_for_project.
  const branch = $derived(
    auth.value.branchingEnabled ? cfg.branch : undefined,
  );
  const hasNamespacesEnabled = $derived(Boolean(cfg.namespace !== undefined));
  const updateScreenshots = $derived(cfg.updateScreenshots ?? true);
  const addTags = $derived(cfg.addTags ?? false);
  const configuredTags = $derived(cfg.tags ?? []);

  const selectedNodes = $derived<NodeInfo[]>(appState.value.selectedNodes);

  // Only nodes that have a key are pushable; reused across the lifecycle.
  const connectedNodes = $derived(
    selectedNodes.filter((n) => n.key && n.key.trim().length > 0),
  );

  // ---- Helpers ---------------------------------------------------------------

  function backToIndex(): void {
    appState.navigate({ name: "index" });
  }

  function resolutionKey(
    keyName: string,
    keyNamespace: string | undefined,
  ): string {
    return `${keyNamespace ?? ""}|${keyName}`;
  }

  function setDefaultResolutionsFor(
    list: SimpleImportConflictResult[],
  ): void {
    const next: Record<string, PushConflictResolution> = {};
    for (const c of list) {
      const k = resolutionKey(c.keyName, c.keyNamespace);
      next[k] = c.isOverridable ? "OVERRIDE" : "KEEP";
    }
    resolutions = next;
  }

  // ---- Initial diff ----------------------------------------------------------

  async function loadDiff(): Promise<void> {
    const client = auth.value.client;
    if (!client) {
      errorMessage = "Not connected to Tolgee.";
      stage = "error";
      return;
    }
    if (!language) {
      errorMessage = "No language configured.";
      stage = "error";
      return;
    }
    stage = "diff";
    errorMessage = null;
    try {
      // Pull a single batch of translations covering only the keys we have on
      // hand. The legacy plugin paginated; we limit by `filterKeyName` so a
      // single page is usually enough.
      const filterKeyName = Array.from(
        new Set(connectedNodes.map((n) => n.key)),
      );

      // When namespaces are off, omit the filter entirely so the API doesn't
      // accidentally constrain to "default ns only".
      const filterNamespace = hasNamespacesEnabled
        ? Array.from(
            new Set(connectedNodes.map((n) => n.ns ?? "")),
          )
        : undefined;

      const remoteKeys =
        filterKeyName.length > 0
          ? await fetchRemoteKeys({
              filterKeyName,
              filterNamespace,
            })
          : [];

      const remoteMap = buildRemoteMapFromKeys(remoteKeys, language);
      diff = pushDiff(connectedNodes, remoteMap, {
        hasNamespacesEnabled,
        configuredTags,
      });
      stage = "idle";
    } catch (err) {
      errorMessage = (err as Error)?.message ?? "Failed to compute diff.";
      stage = "error";
    }
  }

  /** Stable lookup key combining namespace and key name. */
  function canonicalKey(n: NodeInfo): string {
    return `${n.ns ?? ""}|${n.key}`;
  }

  /**
   * After a successful push, pull the same keys back from Tolgee in the
   * project's canonical form (post-suffix-extraction etc.) so we can store
   * the exact translation Tolgee owns. The next diff then has a like-for-like
   * comparison source.
   */
  async function fetchCanonicalAfterPush(
    nodes: NodeInfo[],
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    const keysToFetch = new Set(nodes.map((n) => n.key).filter(Boolean));
    if (keysToFetch.size === 0) return result;

    const filterNamespace = hasNamespacesEnabled
      ? Array.from(new Set(nodes.map((n) => n.ns ?? "")))
      : undefined;

    const fetched = await fetchRemoteKeys({
      filterKeyName: Array.from(keysToFetch),
      filterNamespace,
    });
    for (const k of fetched) {
      const text = k.translations?.[language]?.text;
      if (typeof text !== "string") continue;
      result.set(`${k.keyNamespace ?? ""}|${k.keyName}`, text);
    }
    return result;
  }

  async function fetchRemoteKeys(opts: {
    filterKeyName: string[];
    filterNamespace?: string[];
  }): Promise<
    Array<{
      keyName: string;
      keyNamespace?: string;
      keyIsPlural?: boolean;
      keyTags?: Array<{ name: string }>;
      translations?: Record<string, { text?: string } | undefined>;
    }>
  > {
    const client = auth.value.client;
    if (!client) return [];

    const { data, error } = await client.GET("/v2/projects/translations", {
      params: {
        query: {
          languages: language ? [language] : undefined,
          filterKeyName: opts.filterKeyName,
          filterNamespace: opts.filterNamespace,
          size: 1000,
          branch: branch || undefined,
        },
      },
    });
    if (error || !data) return [];

    // Response shape: `_embedded.keys` (newer) or `pagedModel._embedded.keys`.
    // TODO: tighten when schema refined.
    const raw = data as {
      _embedded?: { keys?: unknown[] };
      pagedModel?: { _embedded?: { keys?: unknown[] } };
    };
    const keysRaw =
      raw._embedded?.keys ?? raw.pagedModel?._embedded?.keys ?? [];

    return keysRaw as Array<{
      keyName: string;
      keyNamespace?: string;
      keyIsPlural?: boolean;
      keyTags?: Array<{ name: string }>;
      translations?: Record<string, { text?: string } | undefined>;
    }>;
  }

  $effect(() => {
    // Recompute on mount / when the input shape changes meaningfully. Use a
    // primitive dependency so Svelte's $effect doesn't loop on array identity.
    void selectedNodes.length;
    void language;
    void namespace;
    void branch;
    loadDiff();
  });

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

  /**
   * Build the `screenshots` array of the import payload for one local node.
   * Each screenshot's `keys` may reference multiple Figma layers; we keep
   * only those that match the (key, ns) we are pushing and record their
   * positions.
   */
  function mapScreenshotsForNode(
    node: NodeInfo,
    screenshots: FrameScreenshot[],
    uploadedImageIdByScreenshot: Map<FrameScreenshot, number>,
  ): KeyScreenshotDto[] {
    const out: KeyScreenshotDto[] = [];
    for (const screenshot of screenshots) {
      const positions = screenshot.keys
        .filter((k) => k.key === node.key && (k.ns ?? "") === (node.ns ?? ""))
        .map((k) => ({ x: k.x, y: k.y, width: k.width, height: k.height }));
      if (positions.length === 0) continue;
      const uploadedImageId = uploadedImageIdByScreenshot.get(screenshot);
      if (uploadedImageId === undefined) continue;
      out.push({
        text: node.translation || node.characters,
        uploadedImageId,
        positions,
      });
    }
    return out;
  }

  function buildPayload(opts: {
    nodes: NodeInfo[];
    screenshots: FrameScreenshot[];
    uploadedImageIdByScreenshot: Map<FrameScreenshot, number>;
    resolutionFor?: (
      key: string,
      ns: string | undefined,
    ) => PushConflictResolution | undefined;
  }): SingleStepImportResolvableItemRequest[] {
    const { nodes, screenshots, uploadedImageIdByScreenshot, resolutionFor } =
      opts;

    return nodes.map((node) => {
      const resolution = resolutionFor?.(node.key, node.ns);
      const text = node.translation || node.characters || "";
      const screenshotsForNode = mapScreenshotsForNode(
        node,
        screenshots,
        uploadedImageIdByScreenshot,
      );

      // `KEEP` -> omit translations (only updates screenshots/tags).
      const translations =
        resolution === "KEEP"
          ? {}
          : {
              [language]: {
                text,
                resolution: "OVERRIDE" as const,
              },
            };

      return {
        name: node.key,
        namespace: hasNamespacesEnabled ? node.ns || undefined : undefined,
        screenshots: screenshotsForNode,
        translations,
      } satisfies SingleStepImportResolvableItemRequest;
    });
  }

  async function startPush(): Promise<void> {
    const client = auth.value.client;
    if (!client) {
      errorMessage = "Not connected to Tolgee.";
      stage = "error";
      return;
    }
    if (!diff) return;

    errorMessage = null;
    pushedKeyCount = 0;

    // The keys we will actually submit: new + changed + unchanged (unchanged
    // entries carry screenshot updates only).
    const nodesToPush: NodeInfo[] = [
      ...diff.newKeys,
      ...diff.changedKeys.map((c) => c.node),
      ...diff.unchangedKeys,
    ];

    try {
      // 1. Screenshot capture
      let screenshots: FrameScreenshot[] = [];
      const uploadedById = new Map<FrameScreenshot, number>();

      if (updateScreenshots && nodesToPush.length > 0) {
        stage = "uploading";
        progress = {
          current: 0,
          total: nodesToPush.length,
          message: "Capturing screenshots…",
        };
        screenshots = await captureScreenshots(nodesToPush.map((n) => n.id));

        // 2. Upload screenshots
        progress = {
          current: 0,
          total: screenshots.length,
          message: "Uploading screenshots…",
        };
        for (let i = 0; i < screenshots.length; i++) {
          const screenshot = screenshots[i];
          if (!screenshot) continue;
          const uploaded = await uploadScreenshot(
            auth.value.apiUrl,
            auth.value.apiKey,
            screenshot.image,
            { location: `figma-${screenshot.info.id}` },
          );
          uploadedById.set(screenshot, uploaded.id);
          progress = {
            current: i + 1,
            total: screenshots.length,
            message: "Uploading screenshots…",
          };
        }
      }

      // 3. Build and submit the push payload
      stage = "pushing";
      progress = {
        current: 0,
        total: nodesToPush.length,
        message: "Pushing translations…",
      };

      const payload = buildPayload({
        nodes: nodesToPush,
        screenshots,
        uploadedImageIdByScreenshot: uploadedById,
      });

      const result = await pushKeys(client, payload, {
        branch: branch || undefined,
        resolutionMode: "RECOMMENDED",
        errorOnUnresolvedConflict: false,
      });

      if (result.unresolvedConflicts.length > 0) {
        conflicts = result.unresolvedConflicts;
        setDefaultResolutionsFor(result.unresolvedConflicts);
        stage = "conflict";
        return;
      }

      await finishPush(nodesToPush);
    } catch (err) {
      errorMessage = (err as Error)?.message ?? "Push failed.";
      stage = "error";
      appState.setError({
        message: errorMessage,
        severity: "error",
      });
    }
  }

  async function applyResolutions(): Promise<void> {
    const client = auth.value.client;
    if (!client || !diff) return;
    errorMessage = null;

    const nodesByKey = new Map<string, NodeInfo>();
    for (const n of [
      ...diff.newKeys,
      ...diff.changedKeys.map((c) => c.node),
      ...diff.unchangedKeys,
    ]) {
      nodesByKey.set(resolutionKey(n.key, n.ns), n);
    }

    // Only re-submit the conflicting keys, with the user's chosen resolutions.
    const subset: NodeInfo[] = [];
    for (const c of conflicts) {
      const node = nodesByKey.get(resolutionKey(c.keyName, c.keyNamespace));
      if (node) subset.push(node);
    }

    try {
      stage = "pushing";
      progress = {
        current: 0,
        total: subset.length,
        message: "Re-submitting with resolutions…",
      };

      const payload = buildPayload({
        nodes: subset,
        screenshots: [],
        uploadedImageIdByScreenshot: new Map(),
        resolutionFor: (k, ns) =>
          resolutions[resolutionKey(k, ns)] ?? "KEEP",
      });

      const result = await pushKeys(client, payload, {
        branch: branch || undefined,
        resolutionMode: "FORCE_OVERRIDE",
        errorOnUnresolvedConflict: false,
      });

      // Any conflicts still unresolved on re-submit are surfaced to the user
      // verbatim — they are typically server-side permission failures.
      conflicts = result.unresolvedConflicts;
      if (conflicts.length > 0) {
        setDefaultResolutionsFor(conflicts);
        stage = "conflict";
        return;
      }

      const merged = [
        ...diff.newKeys,
        ...diff.changedKeys.map((c) => c.node),
        ...diff.unchangedKeys,
      ];
      await finishPush(merged);
    } catch (err) {
      errorMessage = (err as Error)?.message ?? "Push failed.";
      stage = "error";
      appState.setError({
        message: errorMessage,
        severity: "error",
      });
    }
  }

  async function finishPush(allNodes: NodeInfo[]): Promise<void> {
    const client = auth.value.client;
    if (!client) return;

    pushedKeyCount =
      (diff?.newKeys.length ?? 0) + (diff?.changedKeys.length ?? 0);

    // Apply tags as a best-effort step — failures here don't undo the push.
    if (addTags && configuredTags.length > 0) {
      try {
        await applyTags(
          client,
          configuredTags,
          allNodes.map((n) => ({
            name: n.key,
            namespace: hasNamespacesEnabled ? n.ns || undefined : undefined,
          })),
          branch || undefined,
        );
      } catch (err) {
        appState.setError({
          message: `Translations were pushed, but tag update failed: ${
            (err as Error)?.message ?? "unknown error"
          }`,
          severity: "warning",
        });
      }
    }

    // Re-fetch the keys we just pushed so we know the exact translation
    // strings Tolgee stored — those are what the next diff will compare
    // against. If we cache our outgoing form instead, Tolgee's canonical
    // rewrites (e.g. extracting a shared suffix out of plural variants) will
    // show as spurious "changed" diffs forever. Best-effort: on fetch
    // failure we fall back to the locally-pushed text.
    const canonical = await fetchCanonicalAfterPush(allNodes).catch(() => null);
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: allNodes.map((n) => {
        const remote = canonical?.get(canonicalKey(n));
        return {
          id: n.id,
          info: {
            connected: true,
            translation: remote ?? n.translation ?? n.characters,
          },
        };
      }),
    });

    send({
      type: "notify",
      text: `Pushed ${pushedKeyCount} key(s) to Tolgee`,
    });
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
      ? [
          ...diff.newKeys,
          ...diff.changedKeys.map((x) => x.node),
          ...diff.unchangedKeys,
        ].find(
          (n) =>
            n.key === c.keyName && (n.ns ?? "") === (c.keyNamespace ?? ""),
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
</script>

<div class="flex h-full flex-col">
  <header
    class="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2"
  >
    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick={backToIndex}
        class="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        aria-label="Back"
      >
        <ArrowLeft size={14} />
      </button>
      <h1 class="text-sm font-semibold">
        Push to Tolgee
        {#if language}
          <span class="text-xs font-normal text-[var(--color-text-secondary)]">
            ({language})
          </span>
        {/if}
      </h1>
    </div>
  </header>

  <div class="flex-1 overflow-auto p-3 space-y-3">
    {#if stage === "diff"}
      <Card>
        <p class="text-xs text-[var(--color-text-secondary)]">
          Computing changes…
        </p>
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
        <div class="flex items-center gap-2 text-xs text-[var(--color-text)]">
          <AlertTriangle size={14} />
          <span class="font-medium">
            {conflicts.length} unresolved conflict(s)
          </span>
        </div>
        <p class="mt-1 text-[11px] text-[var(--color-text-secondary)]">
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
            <AlertTriangle size={12} class="mt-0.5 flex-shrink-0" />
            <div>
              <div class="font-semibold">
                {diff.conflictingNodes.length} key(s) reuse the same name
                with different text in Figma.
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
            <div class="text-lg font-semibold text-[var(--color-text-brand)]">
              {diff.newKeys.length}
            </div>
            <div class="text-[10px] text-[var(--color-text-secondary)]">
              New
            </div>
          </div>
          <div>
            <div class="text-lg font-semibold">
              {diff.changedKeys.length}
            </div>
            <div class="text-[10px] text-[var(--color-text-secondary)]">
              Changed
            </div>
          </div>
          <div>
            <div
              class="text-lg font-semibold text-[var(--color-text-secondary)]"
            >
              {diff.unchangedKeys.length}
            </div>
            <div class="text-[10px] text-[var(--color-text-secondary)]">
              Unchanged
            </div>
          </div>
        </div>
      </Card>

      {#if diff.newKeys.length > 0}
        <section>
          <div
            class="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]"
          >
            New ({diff.newKeys.length})
          </div>
          <ul class="space-y-1">
            {#each diff.newKeys as node (node.id)}
              <li
                class="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
              >
                <div class="truncate text-xs font-mono">
                  {node.ns ? `${node.ns}.${node.key}` : node.key}
                </div>
                <div
                  class="truncate text-[11px] text-[var(--color-text-secondary)]"
                >
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
            class="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]"
          >
            Changed ({diff.changedKeys.length})
          </div>
          <ul class="space-y-1">
            {#each diff.changedKeys as entry (entry.node.id)}
              <li
                class="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
              >
                <div class="truncate text-xs font-mono">
                  {entry.node.ns
                    ? `${entry.node.ns}.${entry.node.key}`
                    : entry.node.key}
                </div>
                <div
                  class="truncate text-[11px] text-[var(--color-text-secondary)] line-through"
                  title={entry.remoteText}
                >
                  {entry.remoteText}
                </div>
                <div class="truncate text-[11px] text-[var(--color-text)]">
                  {entry.node.translation || entry.node.characters}
                </div>
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    {/if}
  </div>

  <footer
    class="flex justify-end gap-2 border-t border-[var(--color-border)] p-2"
  >
    {#if stage === "conflict"}
      <Button variant="ghost" onclick={backToIndex}>Cancel</Button>
      <Button onclick={applyResolutions}>Apply resolutions</Button>
    {:else if stage === "done" || stage === "error"}
      <Button onclick={backToIndex}>OK</Button>
    {:else if stage === "idle" && diff}
      <Button variant="ghost" onclick={backToIndex}>Cancel</Button>
      <Button
        onclick={startPush}
        disabled={diff.newKeys.length === 0 &&
          diff.changedKeys.length === 0 &&
          diff.unchangedKeys.length === 0}
      >
        Push to Tolgee
      </Button>
    {/if}
  </footer>
</div>
