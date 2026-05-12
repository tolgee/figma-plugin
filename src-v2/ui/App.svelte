<script lang="ts">
  import { onMount } from "svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { appState } from "./lib/stores/app.svelte";
  import { auth } from "./lib/stores/auth.svelte";
  import { queryClient } from "./lib/stores/query.svelte";
  import { attachBus, on, send } from "./lib/bus";
  import { validateApiKey } from "./lib/api/auth";
  import { createTolgeeClient } from "./lib/api/client";
  import { getProjectMeta } from "./lib/api/projectMeta";
  import IndexView from "./lib/routes/Index.svelte";
  import PageSetup from "./lib/routes/PageSetup.svelte";
  import CopyView from "./lib/routes/CopyView.svelte";
  import Settings from "./lib/routes/Settings.svelte";
  import Push from "./lib/routes/Push.svelte";
  import Pull from "./lib/routes/Pull.svelte";
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
      if (auth.value.authenticated) auth.clear();
      lastValidated = null;
      return;
    }
    const fingerprint = `${apiUrl}::${apiKey}`;
    if (fingerprint === lastValidated) return;
    lastValidated = fingerprint;
    const result = await validateApiKey(apiUrl, apiKey);
    if (!result.ok) {
      if (auth.value.authenticated) auth.clear();
      return;
    }
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
    // Hydrate project-level feature flags (branching, namespaces) so push /
    // pull can decide whether to send `branch` and how to surface namespaces.
    try {
      const meta = await getProjectMeta(apiUrl, apiKey, result.projectId);
      auth.setProjectFeatures({
        branchingEnabled: meta.branchingEnabled,
        namespacesEnabled: meta.namespacesFeaturesEnabled,
      });
    } catch {
      auth.setProjectFeatures({
        branchingEnabled: false,
        namespacesEnabled: false,
      });
    }
    // Hydrate the language and namespace pickers so the header dropdowns are
    // populated for every route without each one re-fetching. Errors are
    // swallowed — the UI gracefully falls back to "current value only".
    void hydratePickers(client);
  }

  async function hydratePickers(
    client: ReturnType<typeof createTolgeeClient>,
  ): Promise<void> {
    try {
      const { data } = await client.GET("/v2/projects/languages", {
        params: { query: { size: 1000 } },
      });
      const raw = data as {
        _embedded?: { languages?: Array<{ tag?: string; name?: string }> };
      };
      const list = raw._embedded?.languages ?? [];
      auth.setLanguages(
        list
          .filter((l): l is { tag: string; name?: string } => Boolean(l.tag))
          .map((l) => ({ tag: l.tag, name: l.name ?? l.tag })),
      );
    } catch {
      auth.setLanguages([]);
    }
    try {
      const { data } = await client.GET("/v2/projects/used-namespaces", {});
      const raw = data as {
        _embedded?: { namespaces?: Array<{ name?: string }> };
      };
      const list = raw._embedded?.namespaces ?? [];
      auth.setNamespaces(
        list
          .filter((n): n is { name: string } => Boolean(n.name))
          .map((n) => ({ name: n.name })),
      );
    } catch {
      auth.setNamespaces([]);
    }
  }

  onMount(() => {
    attachBus();
    const unsubInit = on("init", (msg) => {
      appState.setConfig(msg.config);
      appState.setSelection(msg.selectedNodes, msg.hasUserSelection);
      appState.setEditorType(msg.editorType);
      void maybeBootstrapAuth(msg.config);
    });
    const unsubSel = on("selection-changed", (msg) =>
      appState.setSelection(msg.nodes, msg.hasUserSelection),
    );
    const unsubCfg = on("config-changed", (msg) => {
      appState.setConfig(msg.config);
      void maybeBootstrapAuth(msg.config);
    });
    const unsubPage = on("page-changed", (msg) => {
      appState.setConfig(msg.config);
      void maybeBootstrapAuth(msg.config);
    });
    const unsubCmd = on("command", (_msg) => {
      // TODO: route commands (open / open-on-node)
    });
    send({ type: "ui-ready" });
    return () => {
      unsubInit();
      unsubSel();
      unsubCfg();
      unsubPage();
      unsubCmd();
    };
  });
</script>

<QueryClientProvider client={queryClient}>
  <div class="relative flex flex-col h-screen text-text">
    {#if appState.value.errorBanner}
      <ErrorBanner banner={appState.value.errorBanner} />
    {/if}
    <main class="flex-1 overflow-auto">
      {#if appState.value.route.name === "settings"}
        <!-- Settings is always reachable, even before page is set up. -->
        <Settings />
      {:else if !appState.value.config?.pageInfo && appState.value.config?.documentInfo}
        <!-- PageSetup gate per Phase 4: document is configured but page is not. -->
        <PageSetup />
      {:else if appState.value.config?.pageCopy}
        <CopyView />
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
    <ResizeHandle />
  </div>
</QueryClientProvider>
