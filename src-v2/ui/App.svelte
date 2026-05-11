<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "./lib/stores/app.svelte";
  import { attachBus, on, send } from "./lib/bus";
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

  onMount(() => {
    attachBus();
    const unsubInit = on("init", (msg) => {
      appState.setConfig(msg.config);
      appState.setSelection(msg.selectedNodes);
      appState.setEditorType(msg.editorType);
    });
    const unsubSel = on("selection-changed", (msg) =>
      appState.setSelection(msg.nodes),
    );
    const unsubCfg = on("config-changed", (msg) =>
      appState.setConfig(msg.config),
    );
    const unsubPage = on("page-changed", (msg) =>
      appState.setConfig(msg.config),
    );
    const unsubCmd = on("command", (_msg) => {
      // TODO: route commands (open / toggle-annotations / refresh-annotations / open-on-node)
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

<div class="flex flex-col h-screen text-text">
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
</div>
