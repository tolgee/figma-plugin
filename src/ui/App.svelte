<script lang="ts">
  import { onMount } from "svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { appState } from "./lib/stores/app.svelte";
  import { auth } from "./lib/stores/auth.svelte";
  import { queryClient } from "./lib/stores/query.svelte";
  import { attachBus, on, send } from "./lib/bus";
  import { flushNodeSaves } from "./lib/logic/saveQueue";
  import { validateApiKey } from "./lib/api/auth";
  import { createTolgeeClient } from "./lib/api/client";
  import { hydratePickers } from "./lib/api/pickers";
  import { decideAuthBootstrap } from "./lib/logic/authBootstrap";
  import ProjectMetaSync from "./lib/components/domain/ProjectMetaSync.svelte";
  import IndexView from "./lib/routes/Index.svelte";
  import PageSetup from "./lib/routes/PageSetup.svelte";
  import CopyView from "./lib/routes/CopyView.svelte";
  import Settings from "./lib/routes/Settings.svelte";
  import Push from "./lib/routes/Push.svelte";
  import Pull from "./lib/routes/Pull.svelte";
  import Onboarding from "./lib/routes/Onboarding.svelte";
  import Connect from "./lib/routes/Connect.svelte";
  import StringDetails from "./lib/routes/StringDetails.svelte";
  import CreateCopy from "./lib/routes/CreateCopy.svelte";
  import ErrorBanner from "./lib/components/domain/ErrorBanner.svelte";
  import ResizeHandle from "./lib/components/domain/ResizeHandle.svelte";
  import type { TolgeeConfig } from "$shared/types";

  // Validate the stored credentials silently on startup so the rest of the
  // app reflects "authenticated" state without forcing the user back to
  // Settings just to click Test Connection.
  let lastValidated: string | null = null;
  async function maybeBootstrapAuth(
    config: Partial<TolgeeConfig> | null,
  ): Promise<void> {
    const apiUrl = config?.apiUrl;
    const apiKey = config?.apiKey;
    if (!apiUrl || !apiKey) {
      // Config carries no credentials. Do NOT tear down an active session:
      // during onboarding (and Settings before Save) the user connects
      // manually, but the apiKey isn't persisted to the document config yet —
      // and `persist-project-id` echoes a config-changed WITHOUT it, which
      // used to clear the just-established auth. Disconnect and invalid-key
      // paths clear auth on their own, so nothing leaks by keeping it here.
      if (!auth.value.authenticated) lastValidated = null;
      return;
    }
    const fingerprint = `${apiUrl}::${apiKey}`;
    if (fingerprint === lastValidated) return;
    const result = await validateApiKey(apiUrl, apiKey);
    const decision = decideAuthBootstrap(result, auth.value.authenticated);
    if (decision.clearAuth) auth.clear();
    // Only remembered on a definitive outcome (success or a genuinely bad
    // key) — a soft failure (network blip, 5xx) leaves this `null` so the
    // next config-changed/page-changed event for the same credentials
    // retries instead of getting stuck.
    lastValidated = decision.rememberFingerprint ? fingerprint : null;
    if (!result.ok) return;
    const client = createTolgeeClient(apiUrl, apiKey);
    auth.setAuth({
      client,
      apiUrl,
      apiKey,
      projectId: result.projectId,
      scopes: result.scopes,
    });
    if (config?.projectId !== result.projectId) {
      send({ type: "persist-project-id", projectId: result.projectId });
    }
    // Project-level feature flags (branching, namespaces) are read — and kept
    // fresh across the session — by the `<ProjectMetaSync>` component (mounted
    // inside the QueryClientProvider below), which refetches on window focus so
    // toggling them in the Tolgee web app takes effect without reopening.
    //
    // Hydrate the language and namespace pickers so the header dropdowns are
    // populated for every route without each one re-fetching. Errors are
    // swallowed — the UI gracefully falls back to "current value only".
    void hydratePickers(client);
  }

  onMount(() => {
    attachBus();
    let initReceived = false;
    const unsubInit = on("init", (msg) => {
      // The `ui-ready` retry below can make `init` arrive more than once.
      // Bootstrap only on the first: a repeat init carries `selectedNodes: []`
      // and would otherwise wipe a selection the stream has already delivered.
      if (initReceived) return;
      initReceived = true;
      appState.setConfig(msg.config);
      appState.setSelection(msg.selectedNodes, msg.hasUserSelection);
      // Figma delivers `init` with NO nodes — they stream in right after
      // (selection-pending/-batch/-done). Show the scanning state now so the
      // Index doesn't flash an empty list before the first batch; the following
      // `selection-pending` upgrades it to the overlay immediately. The e2e
      // host, which puts the nodes IN the init, has a non-empty selection here
      // and skips this.
      if (msg.hasUserSelection && msg.selectedNodes.length === 0) {
        appState.setScanning();
      }
      appState.setEditorType(msg.editorType);
      appState.setPageName(msg.pageName);
      if (msg.initialRoute) {
        appState.navigate({ name: msg.initialRoute } as import("$shared/types").Route);
      }
      void maybeBootstrapAuth(msg.config);
    });
    const unsubPending = on("selection-pending", () => appState.setScanning());
    const unsubSel = on("selection-changed", (msg) =>
      appState.setSelection(msg.nodes, msg.hasUserSelection),
    );
    // Streamed variant — large scans arrive in batches so the list renders
    // long before the whole selection is processed (`selection-changed`
    // stays for non-streamed senders: init and the e2e host).
    const unsubBatch = on("selection-batch", (msg) =>
      appState.appendSelection(msg.nodes, msg.first),
    );
    const unsubDone = on("selection-done", (msg) =>
      appState.finalizeSelection(msg.hasUserSelection, msg.total),
    );
    const unsubCfg = on("config-changed", (msg) => {
      appState.setConfig(msg.config);
      void maybeBootstrapAuth(msg.config);
    });
    const unsubPage = on("page-changed", (msg) => {
      appState.setConfig(msg.config);
      appState.setPageName(msg.pageName);
      void maybeBootstrapAuth(msg.config);
    });
    // Writes no longer trigger a whole-selection re-scan on the main thread;
    // instead their results carry fresh snapshots of just the written nodes.
    // Patch them into the selection here so every write path (inline edits,
    // bulk actions, Pull, StringDetails) stays consistent for free.
    // Bulk-write progress for Index's top progress bar / busy action bar — no
    // correlationId pairing, see `nodes-set-progress` and `writeProgress`.
    const unsubWriteProgress = on("nodes-set-progress", (msg) =>
      appState.setWriteProgress(msg.done, msg.total),
    );
    const unsubNodesSet = on("nodes-set-result", (msg) => {
      appState.patchNodes(msg.nodes);
      appState.clearWriteProgress();
      // `nodes` only ever holds the writes that succeeded — a bulk action
      // over a large selection can partially fail (e.g. a node removed
      // mid-write) with no other signal to the user.
      if (!msg.ok) {
        send({ type: "notify", text: "Some strings failed to update.", error: true });
      }
    });
    const unsubApplied = on("apply-translations-result", (msg) => appState.patchNodes(msg.nodes));
    // A main-thread handler threw, so the response this request was waiting
    // for is never coming. The bulk-write bar is the one piece of global state
    // with no watchdog of its own — without this it would sit at its last
    // percentage forever, with the action bar disabled behind it.
    const unsubHandlerError = on("handler-error", (msg) => {
      console.error("[tolgee:ui] main handler failed for", msg.forType);
      appState.clearWriteProgress();
    });
    // Figma can tear the iframe down at any moment — persist any debounced
    // inline edits so the last ~300ms of typing isn't silently lost.
    const flushOnHide = () => flushNodeSaves();
    window.addEventListener("pagehide", flushOnHide);
    // Retry sending ui-ready until the host acknowledges with init.
    // Guards against the race where the host's listener isn't registered yet.
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRetry = () => {
      retryTimer = setTimeout(() => {
        if (!initReceived) {
          send({ type: "ui-ready" });
          scheduleRetry();
        }
      }, 400);
    };
    send({ type: "ui-ready" });
    scheduleRetry();
    return () => {
      clearTimeout(retryTimer);
      unsubInit();
      unsubPending();
      unsubSel();
      unsubBatch();
      unsubDone();
      unsubCfg();
      unsubPage();
      unsubWriteProgress();
      unsubNodesSet();
      unsubApplied();
      unsubHandlerError();
      window.removeEventListener("pagehide", flushOnHide);
    };
  });

</script>

<QueryClientProvider client={queryClient}>
  <!-- Markup-less: keeps the project feature flags fresh (needs the query
       context this provider supplies). -->
  <ProjectMetaSync />
  <div class="relative flex flex-col h-screen text-text">
    {#if appState.value.errorBanner}
      <ErrorBanner banner={appState.value.errorBanner} />
    {/if}
    <main class="flex-1 overflow-auto">
      {#if appState.value.route.name === "settings"}
        <!-- Settings is always reachable, even before the page is set up. -->
        <Settings />
      {:else if appState.value.config?.pageCopy}
        <!-- Copy pages bypass the PageSetup gate — they are always ready. -->
        <CopyView />
      {:else if appState.value.config != null && !appState.value.config.documentInfo}
        <!-- First-run gate: a document that hasn't been set up yet gets the
             guided onboarding wizard instead of the Index "Sign in" state.
             Gated on config != null so a configured (returning) document never
             flashes onboarding before `init` arrives. Save stamps documentInfo,
             so this won't fire again. Mirrors production's forceSettings. -->
        <Onboarding />
      {:else if !appState.value.config?.pageInfo && appState.value.config?.documentInfo}
        <!-- PageSetup gate: document is configured but page is not. -->
        <PageSetup />
      {:else if appState.value.route.name === "index"}
        <IndexView />
      {:else if appState.value.route.name === "pageSetup"}
        <PageSetup />
      {:else if appState.value.route.name === "copyView"}
        <CopyView />
      {:else if appState.value.route.name === "push"}
        <Push />
      {:else if appState.value.route.name === "pull"}
        <Pull />
      {:else if appState.value.route.name === "connect"}
        <Connect />
      {:else if appState.value.route.name === "stringDetails"}
        <StringDetails />
      {:else if appState.value.route.name === "createCopy"}
        <CreateCopy />
      {/if}
    </main>
    {#if appState.value.editorType !== "dev"}
      <!-- Matches production: no resize affordance in the Dev-Mode panel. -->
      <ResizeHandle />
    {/if}
  </div>
</QueryClientProvider>
