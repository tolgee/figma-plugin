<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { send } from "$ui/lib/bus";
  import Button from "$ui/lib/components/ui/button.svelte";
  import * as Tabs from "$ui/lib/components/ui/tabs";
  import SettingsSectionConnection from "$ui/lib/components/domain/SettingsSectionConnection.svelte";
  import SettingsSectionProject from "$ui/lib/components/domain/SettingsSectionProject.svelte";
  import SettingsSectionSync from "$ui/lib/components/domain/SettingsSectionSync.svelte";
  import SettingsSectionAdvanced from "$ui/lib/components/domain/SettingsSectionAdvanced.svelte";

  const DEFAULT_API_URL = "https://app.tolgee.io";

  // Initial snapshot from the global app config. Subsequent external updates
  // are intentionally ignored so the user does not lose in-progress edits.
  let form = $state<Partial<TolgeeConfig>>({
    apiUrl: appState.value.config?.apiUrl ?? DEFAULT_API_URL,
    ...(appState.value.config ?? {}),
  });

  let activeTab = $state("connection");

  function save(): void {
    send({ type: "save-config", config: form });
    appState.setConfig({ ...(appState.value.config ?? {}), ...form });
    appState.navigate({ name: "index" });
  }

  function cancel(): void {
    appState.navigate({ name: "index" });
  }
</script>

<div class="flex h-full flex-col">
  <header
    class="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2"
  >
    <h1 class="text-sm font-semibold">Settings</h1>
    <button
      type="button"
      onclick={cancel}
      class="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
    >
      Close
    </button>
  </header>

  <Tabs.Root bind:value={activeTab} class="flex flex-1 flex-col">
    <Tabs.List
      class="grid grid-cols-4 border-b border-[var(--color-border)] px-1"
    >
      <Tabs.Trigger value="connection">Connection</Tabs.Trigger>
      <Tabs.Trigger value="project">Project</Tabs.Trigger>
      <Tabs.Trigger value="sync">Sync</Tabs.Trigger>
      <Tabs.Trigger value="advanced">Advanced</Tabs.Trigger>
    </Tabs.List>

    <div class="flex-1 overflow-auto p-3">
      <Tabs.Content value="connection">
        <SettingsSectionConnection bind:form />
      </Tabs.Content>
      <Tabs.Content value="project">
        <SettingsSectionProject bind:form />
      </Tabs.Content>
      <Tabs.Content value="sync">
        <SettingsSectionSync bind:form />
      </Tabs.Content>
      <Tabs.Content value="advanced">
        <SettingsSectionAdvanced bind:form />
      </Tabs.Content>
    </div>
  </Tabs.Root>

  <footer
    class="flex justify-end gap-2 border-t border-[var(--color-border)] p-2"
  >
    <Button variant="ghost" size="sm" onclick={cancel}>Cancel</Button>
    <Button size="sm" onclick={save}>Save</Button>
  </footer>
</div>
