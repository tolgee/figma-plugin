<script lang="ts">
  import type { Route } from "$shared/types";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import Header from "$ui/lib/components/domain/Header.svelte";
  import NodeList from "$ui/lib/components/domain/NodeList.svelte";
  import Button from "$ui/lib/components/ui/button.svelte";
  import UploadCloud from "lucide-svelte/icons/upload-cloud";
  import DownloadCloud from "lucide-svelte/icons/download-cloud";
  import Link2 from "lucide-svelte/icons/link-2";

  const selectedNodes = $derived(appState.value.selectedNodes);
  const hasSelection = $derived(selectedNodes.length > 0);
  // TODO: Phase 4.5 — load all connected page nodes via bus.
  const nodesToShow = $derived(hasSelection ? selectedNodes : []);

  const languageOptions = $derived(
    auth.value.languages.map((l) => ({ value: l.tag, label: l.name })),
  );
  const namespaceOptions = $derived(
    auth.value.namespaces.map((n) => ({ value: n.name, label: n.name })),
  );

  function go(route: Route): void {
    appState.navigate(route);
  }
</script>

<div class="flex h-full flex-col">
  <Header
    languages={languageOptions}
    namespaces={namespaceOptions}
    branchingEnabled={auth.value.branchingEnabled}
  />

  {#if !auth.value.authenticated}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center"
    >
      <p class="text-sm">Sign in to connect this document with Tolgee.</p>
      <Button onclick={() => go({ name: "settings" })}>Open Settings</Button>
    </div>
  {:else}
    <div
      class="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-secondary)]"
    >
      <span>
        {hasSelection
          ? `${selectedNodes.length} selected`
          : `${nodesToShow.length} on this page`}
      </span>
    </div>
    <div class="flex-1 overflow-auto px-3 py-2">
      <NodeList
        nodes={nodesToShow}
        emptyText={hasSelection
          ? "No text in selection"
          : "No connected nodes on this page"}
      />
    </div>
    <div
      class="flex flex-col gap-2 border-t border-[var(--color-border)] p-2"
    >
      <div class="grid grid-cols-2 gap-2">
        <Button variant="secondary" onclick={() => go({ name: "push" })}>
          <UploadCloud size={12} /> Push
        </Button>
        <Button
          variant="secondary"
          onclick={() =>
            go({
              name: "pull",
              lang: appState.value.config?.language ?? "",
            })}
        >
          <DownloadCloud size={12} /> Pull
        </Button>
      </div>
      {#if selectedNodes.length === 1 && selectedNodes[0]}
        {@const node = selectedNodes[0]}
        <Button variant="ghost" onclick={() => go({ name: "connect", node })}>
          <Link2 size={12} /> Connect to existing key
        </Button>
      {/if}
    </div>
  {/if}
</div>
