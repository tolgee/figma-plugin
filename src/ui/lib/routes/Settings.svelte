<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send } from "$ui/lib/bus";
  import { ICON } from "$shared/iconSizes";
  import { APP_VERSION, APP_RELEASED, FIGMA_PLUGIN_URL } from "$shared/version";
  import * as Tabs from "$ui/lib/components/ui/tabs";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import ExternalLinkIcon from "lucide-svelte/icons/external-link";
  import ViewHeader from "$ui/lib/components/domain/ViewHeader.svelte";
  import ViewFooter from "$ui/lib/components/domain/ViewFooter.svelte";
  import SettingsSectionConnection from "$ui/lib/components/domain/SettingsSectionConnection.svelte";
  import SettingsSectionProject from "$ui/lib/components/domain/SettingsSectionProject.svelte";
  import SettingsSectionKeys from "$ui/lib/components/domain/SettingsSectionKeys.svelte";
  import SettingsSectionSync from "$ui/lib/components/domain/SettingsSectionSync.svelte";
  import SettingsSectionPush from "$ui/lib/components/domain/SettingsSectionPush.svelte";

  const DEFAULT_API_URL = "https://app.tolgee.io";

  // Initial snapshot from the global app config. Subsequent external updates
  // are intentionally ignored so the user does not lose in-progress edits.
  //
  // Fields bound with bind:value to Input/Select must never be undefined:
  // Svelte 5 throws props_invalid_value when bind: passes undefined to a
  // $bindable prop that has a non-undefined default (e.g. $bindable("")).
  const cfg = appState.value.config ?? {};
  let form = $state<Partial<TolgeeConfig>>({
    ...cfg,
    apiUrl: cfg.apiUrl ?? DEFAULT_API_URL,
    apiKey: cfg.apiKey ?? "",
    namespace: cfg.namespace ?? "",
    language: cfg.language ?? "",
    ignorePrefix: cfg.ignorePrefix ?? "_",
  });

  const route = appState.value.route;
  let activeTab = $state(route.name === "settings" ? (route.tab ?? "project") : "project");

  function save(): void {
    send({ type: "save-config", config: form });
    appState.setConfig({ ...(appState.value.config ?? {}), ...form });
    appState.navigate({ name: "index" });
  }

  function cancel(): void {
    appState.navigate({ name: "index" });
  }

  function openPluginPage(): void {
    send({ type: "open-external", url: FIGMA_PLUGIN_URL });
  }
</script>

<div class="flex h-full flex-col">
  <!--
    Tabs.Root (bits-ui) renders as a plain <div>; making it `contents` (no
    box of its own) lets its children — the gradient wrapper below and the
    scrollable content area — participate directly in this outer flex
    column. This is what lets ViewHeader (outside the tabs) and Tabs.List
    (inside the tabs) share ONE continuous gradient instead of each having
    its own separate background — only Tabs.List keeps a border-bottom, as
    the one boundary line before the scrollable content.
  -->
  <Tabs.Root bind:value={activeTab} class="contents">
    <div class="shrink-0 bg-linear-to-b from-bg to-header-gradient-end">
      <ViewHeader title="Settings" onBack={cancel} background={false} />
      <!-- No grid/equal-width split here — Tabs.Trigger is already
           naturally sized (inline-flex + px-3), so plain flex keeps the
           tabs compact instead of stretching them to fill the full width
           of a wide plugin window. -->
      <Tabs.List class="border-b border-border px-1">
        <Tabs.Trigger value="project">Project</Tabs.Trigger>
        <Tabs.Trigger value="strings">Strings and Keys</Tabs.Trigger>
        <Tabs.Trigger value="upload">Upload options</Tabs.Trigger>
      </Tabs.List>
    </div>

    <div class="min-h-0 flex-1 overflow-auto p-3">
      <Tabs.Content value="project">
        <div class="space-y-6">
          <SettingsSectionConnection bind:form />
          {#if auth.value.authenticated}
            <!-- Language + Advanced only mean something once connected — before
                 that the pickers are empty and the feature notes are unknown.
                 Reveal them progressively, like the onboarding + the original. -->
            <SettingsSectionProject bind:form />
          {/if}
        </div>
      </Tabs.Content>
      <Tabs.Content value="strings">
        <div class="space-y-6">
          <SettingsSectionKeys bind:form />
          <SettingsSectionSync bind:form />
        </div>
      </Tabs.Content>
      <Tabs.Content value="upload">
        <SettingsSectionPush bind:form />
      </Tabs.Content>
    </div>
  </Tabs.Root>

  <ViewFooter onCancel={cancel} confirmLabel="Save" onConfirm={save}>
    {#snippet leftContent()}
      <!-- Quiet version tag in the action bar. Hover for the release date,
           click (the external-link icon hints it) to open the plugin's Figma
           Community page. -->
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <button
                {...props}
                type="button"
                onclick={openPluginPage}
                class="inline-flex items-center gap-1 leading-none text-[11px] text-text-secondary transition-colors hover:text-text"
              >
                v{APP_VERSION}
                <ExternalLinkIcon size={ICON.badge} />
              </button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content side="top" align="start">
            Tolgee for Figma · updated {APP_RELEASED} · open on Figma
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    {/snippet}
  </ViewFooter>
</div>
