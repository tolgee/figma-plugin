<script lang="ts">
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { queryClient } from "$ui/lib/stores/query.svelte";
  import { appState } from "$ui/lib/stores/app.svelte";
  import type { Route } from "$shared/types";
  import {
    seedMockData,
    sampleNode,
    samplePluralNode,
    showSampleSelection,
    showEmptySelection,
    showNoSelection,
    showSimpleProject,
    showBranchingProject,
    showStaleBranchProject,
  } from "./mock";

  import Index from "$ui/lib/routes/Index.svelte";
  import Push from "$ui/lib/routes/Push.svelte";
  import Pull from "$ui/lib/routes/Pull.svelte";
  import Settings from "$ui/lib/routes/Settings.svelte";
  import Connect from "$ui/lib/routes/Connect.svelte";
  import StringDetails from "$ui/lib/routes/StringDetails.svelte";
  import PageSetup from "$ui/lib/routes/PageSetup.svelte";
  import CopyView from "$ui/lib/routes/CopyView.svelte";
  import CreateCopy from "$ui/lib/routes/CreateCopy.svelte";
  import ResizeHandle from "$ui/lib/components/domain/ResizeHandle.svelte";

  seedMockData();

  // Frame dimensions — roughly the real Tolgee plugin window; adjustable so we
  // can see how layouts reflow at different sizes.
  let width = $state(500);
  let height = $state(600);

  const route = $derived(appState.value.route);

  // Primary routes shown as tabs.
  const routes: { label: string; name: Route["name"]; go: () => void }[] = [
    { label: "Index", name: "index", go: () => appState.navigate({ name: "index" }) },
    { label: "Push", name: "push", go: () => appState.navigate({ name: "push" }) },
    { label: "Pull", name: "pull", go: () => appState.navigate({ name: "pull", lang: "en" }) },
    { label: "Settings", name: "settings", go: () => appState.navigate({ name: "settings" }) },
    { label: "Connect", name: "connect", go: () => appState.navigate({ name: "connect", node: sampleNode }) },
    { label: "String details", name: "stringDetails", go: () => appState.navigate({ name: "stringDetails", node: sampleNode }) },
    { label: "Page setup", name: "pageSetup", go: () => appState.navigate({ name: "pageSetup" }) },
    { label: "Copy view", name: "copyView", go: () => { appState.setConfig({ ...(appState.value.config ?? {}), pageCopy: true }); appState.navigate({ name: "copyView" }); } },
    { label: "Create copy", name: "createCopy", go: () => appState.navigate({ name: "createCopy" }) },
  ];

  // Project-feature scenarios — orthogonal to the route: flip branching /
  // namespaces so the branch picker, ns badges, stale-branch banner and copy
  // branch indicators are visible (none show under the default simple project).
  let activeFeature = $state<string>("simple");
  const features: { id: string; label: string; setup: () => void }[] = [
    { id: "simple", label: "Simple (no branch/ns)", setup: showSimpleProject },
    { id: "branching", label: "Branching + namespaces", setup: showBranchingProject },
    { id: "stale", label: "Stale branch", setup: showStaleBranchProject },
  ];
  function pickFeature(f: (typeof features)[number]): void {
    f.setup();
    activeFeature = f.id;
  }

  // Empty-state scenarios for Index: each flips the selection store into a
  // given state, then shows Index so the matching empty state renders.
  let activeScenario = $state<string | null>(null);
  // The plural VARIANT of String details lives on the same `stringDetails`
  // route as the plain one, so the route name alone can't tell them apart —
  // track it explicitly so only the right control highlights.
  let pluralVariant = $state(false);

  const scenarios: { id: string; label: string; setup: () => void }[] = [
    { id: "sample", label: "With strings", setup: showSampleSelection },
    { id: "empty-sel", label: "Selection · all ignored", setup: showEmptySelection },
    { id: "no-sel", label: "Nothing selected", setup: showNoSelection },
  ];
  function runScenario(s: (typeof scenarios)[number]): void {
    s.setup();
    activeScenario = s.id;
    pluralVariant = false;
    appState.navigate({ name: "index" });
  }
  function pickRoute(p: (typeof routes)[number]): void {
    activeScenario = null;
    pluralVariant = false;
    p.go();
  }
  function pickPluralDetails(): void {
    activeScenario = null;
    pluralVariant = true;
    appState.navigate({ name: "stringDetails", node: samplePluralNode });
  }

  // A tab is active when its route matches — except String details, which is
  // active only when the plain (non-plural) variant is showing.
  function routeActive(p: (typeof routes)[number]): boolean {
    if (activeScenario) return false;
    if (p.name === "stringDetails") {
      return route.name === "stringDetails" && !pluralVariant;
    }
    return route.name === p.name;
  }
  const pluralActive = $derived(
    !activeScenario && route.name === "stringDetails" && pluralVariant,
  );
</script>

<div class="space-y-4">
  <!-- Screen picker — primary routes as tabs -->
  <div class="flex flex-wrap items-center gap-1 border-b border-border">
    {#each routes as p (p.label)}
      {@const active = routeActive(p)}
      <button
        type="button"
        onclick={() => pickRoute(p)}
        class="-mb-px h-8 border-b-2 px-3 text-xs transition-colors"
        class:border-border-brand={active}
        class:font-medium={active}
        class:text-text={active}
        class:border-transparent={!active}
        class:text-text-secondary={!active}
        class:hover:text-text={!active}
      >
        {p.label}
      </button>
    {/each}
  </div>

  <!-- String details variants (same route, picked separately) -->
  <div class="flex flex-wrap items-center gap-1.5">
    <span class="text-xs text-text-secondary">Variant:</span>
    <button
      type="button"
      onclick={pickPluralDetails}
      class="h-7 rounded border px-3 text-xs transition-colors"
      class:bg-bg-brand={pluralActive}
      class:text-text-onbrand={pluralActive}
      class:border-border-brand={pluralActive}
      class:border-border={!pluralActive}
      class:text-text-secondary={!pluralActive}
      class:hover:text-text={!pluralActive}
    >
      String details (plural)
    </button>
  </div>

  <!-- Index empty states -->
  <div class="flex flex-wrap items-center gap-1.5">
    <span class="text-xs text-text-secondary">Empty states:</span>
    {#each scenarios as s (s.id)}
      <button
        type="button"
        onclick={() => runScenario(s)}
        class="h-7 rounded border px-3 text-xs transition-colors"
        class:bg-bg-brand={activeScenario === s.id}
        class:text-text-onbrand={activeScenario === s.id}
        class:border-border-brand={activeScenario === s.id}
        class:border-border={activeScenario !== s.id}
        class:text-text-secondary={activeScenario !== s.id}
        class:hover:text-text={activeScenario !== s.id}
      >
        {s.label}
      </button>
    {/each}
  </div>

  <!-- Project-feature scenarios (branching / namespaces) -->
  <div class="flex flex-wrap items-center gap-1.5">
    <span class="text-xs text-text-secondary">Project:</span>
    {#each features as f (f.id)}
      <button
        type="button"
        onclick={() => pickFeature(f)}
        class="h-7 rounded border px-3 text-xs transition-colors"
        class:bg-bg-brand={activeFeature === f.id}
        class:text-text-onbrand={activeFeature === f.id}
        class:border-border-brand={activeFeature === f.id}
        class:border-border={activeFeature !== f.id}
        class:text-text-secondary={activeFeature !== f.id}
        class:hover:text-text={activeFeature !== f.id}
      >
        {f.label}
      </button>
    {/each}
  </div>

  <!-- Frame size controls -->
  <div class="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
    <label class="flex items-center gap-2">
      Width
      <input type="range" min="320" max="720" bind:value={width} />
      <span class="w-9 tabular-nums text-text">{width}px</span>
    </label>
    <label class="flex items-center gap-2">
      Height
      <input type="range" min="360" max="800" bind:value={height} />
      <span class="w-9 tabular-nums text-text">{height}px</span>
    </label>
  </div>

  <!-- The plugin window frame -->
  <div
    class="overflow-hidden rounded-lg border border-border bg-bg shadow-xl"
    style={`width:${width}px;height:${height}px`}
  >
    <QueryClientProvider client={queryClient}>
      <div class="relative flex h-full flex-col text-text">
        <svelte:boundary>
          {#if route.name === "index"}
            <Index />
          {:else if route.name === "push"}
            <Push />
          {:else if route.name === "pull"}
            <Pull />
          {:else if route.name === "settings"}
            <Settings />
          {:else if route.name === "connect"}
            <Connect />
          {:else if route.name === "stringDetails"}
            <StringDetails />
          {:else if route.name === "pageSetup"}
            <PageSetup />
          {:else if route.name === "copyView"}
            <CopyView />
          {:else if route.name === "createCopy"}
            <CreateCopy />
          {:else}
            <Index />
          {/if}

          {#snippet failed(error, reset)}
            <div class="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
              <p class="text-xs text-text">
                This screen needs a bit more mock data to render fully.
              </p>
              <p class="text-[10px] text-text-secondary break-all max-w-[80%]">
                {error instanceof Error ? error.message : String(error)}
              </p>
              <button
                type="button"
                onclick={reset}
                class="h-7 rounded border border-border px-3 text-xs text-text hover:bg-bg-secondary"
              >
                Retry
              </button>
            </div>
          {/snippet}
        </svelte:boundary>
        <ResizeHandle />
      </div>
    </QueryClientProvider>
  </div>

  <p class="text-[11px] text-text-secondary">
    Tip: this is the <em>real</em> plugin UI wired to mock data. Clicking
    Push/Pull/Settings inside the frame navigates for real. Screens that fetch
    from Tolgee show their empty/error state (no backend here).
  </p>
</div>
