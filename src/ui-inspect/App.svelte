<script lang="ts">
  import { onMount } from "svelte";
  import { attachBus, on, send } from "$inspect/lib/bus";
  import {
    buildKeyDeepLink,
    buildProjectDashboardLink,
  } from "$inspect/lib/deeplink";
  import type { NodeInfo, TolgeeConfig } from "$shared/types";
  import Tag from "lucide-svelte/icons/tag";
  import Languages from "lucide-svelte/icons/languages";
  import ExternalLink from "lucide-svelte/icons/external-link";
  import Copy from "lucide-svelte/icons/copy";
  import Check from "lucide-svelte/icons/check";
  import MousePointer from "lucide-svelte/icons/mouse-pointer";
  import Plug from "lucide-svelte/icons/plug";

  // --- State ---------------------------------------------------------------
  let nodes = $state<NodeInfo[]>([]);
  let config = $state<Partial<TolgeeConfig> | null>(null);

  /**
   * Per-line copy confirmation. Maps a unique copy "slot" identifier
   * (`${nodeId}:key` or `${nodeId}:translation`) to a timeout token so the
   * "Copied!" affordance auto-clears after 1s. We track the id rather than a
   * boolean so concurrent clicks across different rows don't clobber each
   * other.
   */
  let copiedSlot = $state<string | null>(null);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  const TRANSLATION_TRUNCATE = 200;

  // --- Derived -------------------------------------------------------------
  /** Connection is "ready" once we have at minimum an API URL on file. */
  const hasConnection = $derived(Boolean(config?.apiUrl));
  /** Friendly display string for the language (page-scoped). */
  const language = $derived(config?.language ?? null);
  /**
   * Best-effort project label. Until we have a real project name persisted
   * (TODO below), fall back to "#<id>" when known so the header is still
   * informative.
   */
  const projectLabel = $derived(
    config?.projectId != null ? `Project #${config.projectId}` : null,
  );
  const projectLink = $derived(buildProjectDashboardLink(config));

  // --- Lifecycle -----------------------------------------------------------
  onMount(() => {
    attachBus();
    on("init", (msg) => {
      config = msg.config;
      nodes = msg.selectedNodes;
    });
    on("selection-changed", (msg) => {
      nodes = msg.nodes;
    });
    on("config-changed", (msg) => {
      config = msg.config;
    });
    on("page-changed", (msg) => {
      config = msg.config;
    });
    send({ type: "ui-ready" });

    return () => {
      if (copyTimer) clearTimeout(copyTimer);
    };
  });

  // --- Helpers -------------------------------------------------------------
  function fullKey(node: NodeInfo): string {
    return node.ns ? `${node.ns}.${node.key}` : node.key;
  }

  function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return text.slice(0, max) + "…";
  }

  function openExternal(url: string | null): void {
    if (!url) return;
    send({ type: "open-external", url });
  }

  function copy(slot: string, text: string): void {
    if (!text) return;
    void navigator.clipboard.writeText(text);
    copiedSlot = slot;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copiedSlot = null;
    }, 1000);
  }
</script>

<div class="flex h-full flex-col bg-bg text-text">
  <!-- ============================== Header ============================== -->
  <header
    class="flex items-center justify-between gap-2 border-b border-border bg-bg-secondary px-3 py-2"
  >
    <div class="flex items-center gap-2 min-w-0">
      <span
        class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-bg-brand text-text-onbrand text-[10px] font-semibold"
        aria-hidden="true"
      >
        T
      </span>
      <span class="font-semibold tracking-tight">Tolgee</span>
      {#if language}
        <span class="text-text-secondary" aria-hidden="true">·</span>
        <span class="text-text-secondary truncate" title={language}>
          {language}
        </span>
      {/if}
      {#if projectLabel}
        <span class="text-text-secondary" aria-hidden="true">·</span>
        <span class="text-text-secondary truncate" title={projectLabel}>
          {projectLabel}
        </span>
      {/if}
    </div>
  </header>

  <!-- ============================ Main content =========================== -->
  <main class="flex-1 overflow-y-auto">
    {#if !hasConnection}
      <!-- Empty state: no connection configured at all. -->
      <div
        class="flex h-full flex-col items-center justify-center gap-2 px-6 py-8 text-center"
      >
        <Plug
          size={28}
          class="text-icon-secondary"
          aria-hidden="true"
        />
        <p class="text-text-secondary">
          Connect this document in the design-mode plugin first.
        </p>
        <p class="text-text-secondary text-[10px]">
          Open the Tolgee plugin in Figma's design mode and run "Test
          Connection" in Settings.
        </p>
      </div>
    {:else if nodes.length === 0}
      <!-- Connected but nothing selected. -->
      <div
        class="flex h-full flex-col items-center justify-center gap-2 px-6 py-8 text-center"
      >
        <MousePointer
          size={28}
          class="text-icon-secondary"
          aria-hidden="true"
        />
        <p class="text-text-secondary">
          Select a text layer to inspect its Tolgee key.
        </p>
        {#if projectLink}
          <button
            type="button"
            class="mt-2 inline-flex items-center gap-1 text-text-brand hover:underline"
            onclick={() => openExternal(projectLink)}
          >
            Open project in Tolgee
            <ExternalLink size={11} aria-hidden="true" />
          </button>
        {/if}
      </div>
    {:else}
      <!-- One card per selected node. -->
      <ul class="space-y-2 p-3">
        {#each nodes as node (node.id)}
          {@const deeplink = buildKeyDeepLink(config, node)}
          {@const hasKey = Boolean(node.key)}
          {@const hasTranslation = Boolean(node.translation)}
          {@const keySlot = `${node.id}:key`}
          {@const translationSlot = `${node.id}:translation`}
          <li
            class="rounded-md border border-border bg-bg-secondary overflow-hidden"
          >
            <!-- Card head: key + namespace -->
            <div
              class="flex items-start gap-2 border-b border-border px-3 py-2"
            >
              <Tag
                size={12}
                class="mt-0.5 shrink-0 text-icon-secondary"
                aria-hidden="true"
              />
              <div class="min-w-0 flex-1">
                {#if hasKey}
                  {#if node.ns}
                    <div
                      class="text-[10px] uppercase tracking-wide text-text-secondary"
                      title={node.ns}
                    >
                      {node.ns}
                    </div>
                  {/if}
                  <div class="font-semibold text-text break-all">
                    {node.key}
                  </div>
                {:else}
                  <span class="italic text-text-secondary">(no key)</span>
                {/if}
              </div>
            </div>

            <!-- Card body: translation -->
            <div class="flex items-start gap-2 px-3 py-2">
              <Languages
                size={12}
                class="mt-0.5 shrink-0 text-icon-secondary"
                aria-hidden="true"
              />
              <div
                class="text-text-secondary whitespace-pre-wrap break-words flex-1"
              >
                {#if hasTranslation}
                  {truncate(node.translation, TRANSLATION_TRUNCATE)}
                {:else}
                  <span class="italic">(no translation)</span>
                {/if}
              </div>
            </div>

            <!-- Card actions -->
            <div
              class="flex flex-wrap items-center gap-1 border-t border-border bg-bg px-2 py-1"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded px-2 py-1 text-text-brand disabled:text-text-secondary disabled:cursor-not-allowed hover:bg-bg-secondary"
                disabled={!deeplink}
                onclick={() => openExternal(deeplink)}
              >
                <ExternalLink size={11} aria-hidden="true" />
                Open in Tolgee
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded px-2 py-1 disabled:text-text-secondary disabled:cursor-not-allowed hover:bg-bg-secondary"
                disabled={!hasKey}
                onclick={() => copy(keySlot, fullKey(node))}
                aria-label="Copy key"
              >
                {#if copiedSlot === keySlot}
                  <Check size={11} aria-hidden="true" />
                  Copied!
                {:else}
                  <Copy size={11} aria-hidden="true" />
                  Copy key
                {/if}
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded px-2 py-1 disabled:text-text-secondary disabled:cursor-not-allowed hover:bg-bg-secondary"
                disabled={!hasTranslation}
                onclick={() => copy(translationSlot, node.translation)}
                aria-label="Copy translation"
              >
                {#if copiedSlot === translationSlot}
                  <Check size={11} aria-hidden="true" />
                  Copied!
                {:else}
                  <Copy size={11} aria-hidden="true" />
                  Copy translation
                {/if}
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </main>

  <!-- ============================== Footer ============================== -->
  {#if projectLink}
    <footer
      class="flex items-center justify-end border-t border-border bg-bg-secondary px-3 py-2"
    >
      <button
        type="button"
        class="inline-flex items-center gap-1 text-text-brand hover:underline"
        onclick={() => openExternal(projectLink)}
      >
        Open project
        <ExternalLink size={11} aria-hidden="true" />
      </button>
    </footer>
  {/if}
</div>
