<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import type { Route } from "$shared/types";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { requestPageConnectedNodes } from "$ui/lib/api/pageNodes";
  import { fetchBranches } from "$ui/lib/api/branches";
  import Header from "$ui/lib/components/domain/Header.svelte";
  import NodeList from "$ui/lib/components/domain/NodeList.svelte";
  import Button from "$ui/lib/components/ui/button.svelte";
  import UploadCloud from "lucide-svelte/icons/upload-cloud";
  import DownloadCloud from "lucide-svelte/icons/download-cloud";
  import Link2 from "lucide-svelte/icons/link-2";

  const selectedNodes = $derived(appState.value.selectedNodes);
  const hasSelection = $derived(selectedNodes.length > 0);

  // Fall back to every connected text node on the page when the user has not
  // selected anything. Cached so toggling selection in and out of Index
  // doesn't hit the main thread every time; gets evicted by Pull/Push when
  // they invalidate the same query key after applying changes.
  const pageNodesQuery = createQuery(() => ({
    queryKey: ["page-connected-nodes"],
    queryFn: () => requestPageConnectedNodes(),
    enabled: !hasSelection && auth.value.authenticated,
    staleTime: 5 * 1000,
  }));

  const branchesQuery = createQuery(() => ({
    queryKey: ["branches"],
    queryFn: () => fetchBranches(auth.value.client!),
    enabled: auth.value.authenticated && auth.value.branchingEnabled,
    staleTime: 30 * 1000,
  }));

  const nodesToShow = $derived(
    hasSelection ? selectedNodes : (pageNodesQuery.data ?? []),
  );

  const languageOptions = $derived(
    auth.value.languages.map((l) => ({ value: l.tag, label: l.name })),
  );
  const namespaceOptions = $derived(
    auth.value.namespaces.map((n) => ({ value: n.name, label: n.name })),
  );
  const branchOptions = $derived(
    (branchesQuery.data ?? []).map((b) => ({ value: b.name, label: b.name })),
  );

  function go(route: Route): void {
    appState.navigate(route);
  }
</script>

<div class="flex h-full flex-col">
  <Header
    languages={languageOptions}
    namespaces={namespaceOptions}
    branches={branchOptions}
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
